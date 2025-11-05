const redis = require('./redis');
const config = require('./config');
const { getPolicyFor } = require('./policies');

// Lua token bucket script
// KEYS[1] = key
// ARGV: capacity, refill_per_sec, now_ms, requested
const LUA_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_per_sec = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1])
local ts = tonumber(data[2])
if tokens == nil then
  tokens = capacity
  ts = now_ms
end

local delta = math.max(0, now_ms - ts) / 1000.0
tokens = math.min(capacity, tokens + delta * refill_per_sec)
local allowed = 0
if tokens >= requested then
  tokens = tokens - requested
  allowed = 1
end
local ttl = math.ceil((capacity / math.max(refill_per_sec, 0.0000001)))
local reset_seconds = 0
if allowed == 0 then
  local needed = requested - tokens
  reset_seconds = math.ceil(needed / math.max(refill_per_sec, 0.0000001))
end

redis.call('HMSET', key, 'tokens', tokens, 'ts', now_ms)
redis.call('EXPIRE', key, ttl)
return {allowed, math.floor(tokens), reset_seconds}
`;

let scriptSha = null;

async function ensureScriptLoaded() {
  if (scriptSha) return scriptSha;
  scriptSha = await redis.script('LOAD', LUA_SCRIPT);
  return scriptSha;
}

function computeRates(policy) {
  const capacity = policy.burstCapacity;
  const refillPerSec = policy.limitPerMinute / 60;
  return { capacity, refillPerSec };
}

function buildKey(route, id) {
  return `${config.redisNamespace}:{${route}}:${id}`;
}

function deriveIdentity(req) {
  const apiKey = req.header('x-api-key');
  const user = req.user; // from auth middleware
  if (user && user.sub) return { id: `user:${user.sub}`, tier: user.tier || 'standard' };
  if (apiKey) return { id: `api:${apiKey}`, tier: 'standard' };
  const ip = (req.ip || req.connection?.remoteAddress || 'unknown').replace(/[^0-9a-fA-F:.]/g, '');
  return { id: `ip:${ip}`, tier: 'standard' };
}

function setHeaders(res, limit, remaining, resetSeconds, throttled) {
  res.set('X-RateLimit-Limit', String(limit));
  res.set('X-RateLimit-Remaining', String(Math.max(0, remaining)));
  res.set('X-RateLimit-Reset', String(resetSeconds));
  if (throttled) res.set('Retry-After', String(Math.max(1, resetSeconds)));
}

async function checkAndConsume(route, id, policy) {
  const { capacity, refillPerSec } = computeRates(policy);
  const nowMs = Date.now();
  const sha = await ensureScriptLoaded();
  const key = buildKey(route, id);
  const requested = 1;
  try {
    const res = await redis.evalsha(sha, 1, key, capacity, refillPerSec, nowMs, requested);
    const allowed = res[0] === 1;
    const remaining = res[1];
    const resetSeconds = res[2];
    return { allowed, remaining, resetSeconds, limit: policy.limitPerMinute };
  } catch (err) {
    // Fail-open: allow request on Redis errors but mark headers conservatively
    return { allowed: true, remaining: capacity - 1, resetSeconds: 0, limit: policy.limitPerMinute, error: err };
  }
}

function rateLimitMiddleware(route, overridePolicy) {
  return async function rateLimitHandler(req, res, next) {
    const identity = deriveIdentity(req);
    const effectivePolicy = overridePolicy || getPolicyFor({ route, tier: identity.tier });
    const result = await checkAndConsume(route, identity.id, effectivePolicy);
    setHeaders(res, effectivePolicy.limitPerMinute, result.remaining, result.resetSeconds, !result.allowed);
    if (!result.allowed) {
      return res.status(429).json({ error: 'Too Many Requests' });
    }
    return next();
  };
}

module.exports = {
  rateLimitMiddleware,
  deriveIdentity,
  checkAndConsume,
};



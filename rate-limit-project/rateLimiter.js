const IORedis = require('ioredis');

function createRateLimiter({ redisUrl, default: defaultConfig = {}, sampleSaveRate = 0.1, saveEvent } = {}) {
  let redis;
  const useInMemory = process.env.NODE_ENV === 'test' || process.env.NO_REDIS === '1' || !redisUrl;
  if (useInMemory) {
    // Simple in-memory store for tests / when Redis unavailable
    const store = new Map();
    redis = {
      async consume_token(key, capacity, refill_per_ms, now, requested) {
        const entry = store.get(key) || { tokens: Number(capacity), last: now };
        let tokens = Number(entry.tokens);
        const last = Number(entry.last || now);
        const delta = Math.max(0, now - last);
        const refill = delta * Number(refill_per_ms);
        tokens = Math.min(Number(capacity), tokens + refill);
        if (tokens >= requested) {
          tokens = tokens - requested;
          store.set(key, { tokens, last: now });
          const remaining = Math.floor(tokens);
          return [1, remaining, Number(capacity)];
        } else {
          const remaining = Math.floor(tokens);
          const needed = requested - tokens;
          const retry_after_ms = refill_per_ms > 0 ? Math.ceil(needed / refill_per_ms) : 60000;
          return [0, remaining, Number(capacity), retry_after_ms];
        }
      },
    };
  } else {
    redis = new IORedis(redisUrl, {
      // let ioredis handle reconnection, but ensure errors are logged
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
    });

    // Avoid process crash on Redis errors by logging them
    redis.on('error', (err) => {
      if (process.env.NODE_ENV === 'test') return; // silence in test
      console.error('[ioredis] error event:', err && err.message ? err.message : err);
    });
    redis.on('connect', () => {
      if (process.env.NODE_ENV === 'test') return;
      console.info('[ioredis] connected to', redisUrl);
    });
  }

  // Token-bucket Lua script: KEYS[1] = key
  // ARGV: capacity, refill_per_ms, now_ms, requested
  const lua = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_per_ms = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last')
local tokens = tonumber(data[1])
local last = tonumber(data[2])
if tokens == nil then tokens = capacity end
if last == nil then last = now end
local delta = math.max(0, now - last)
local refill = delta * refill_per_ms
tokens = math.min(capacity, tokens + refill)
if tokens >= requested then
  tokens = tokens - requested
  redis.call('HMSET', key, 'tokens', tostring(tokens), 'last', tostring(now))
  redis.call('PEXPIRE', key, 86400000) -- 1 day
  local remaining = math.floor(tokens)
  return {1, remaining, capacity}
else
  local remaining = math.floor(tokens)
  local needed = requested - tokens
  local retry_after_ms = 0
  if refill_per_ms > 0 then
    retry_after_ms = math.ceil(needed / refill_per_ms)
  else
    retry_after_ms = 60000
  end
  return {0, remaining, capacity, retry_after_ms}
end
`;

  // Define command only if redis is real
  if (redis.defineCommand) {
    redis.defineCommand('consume_token', { numberOfKeys: 1, lua });
  }

  // in-memory route config
  const routeConfig = new Map();

  function getConfig() {
    return {
      default: defaultConfig,
      routes: Array.from(routeConfig.entries()).map(([k, v]) => ({ route: k, ...v })),
    };
  }

  function setRouteLimit(route, cfg) {
    routeConfig.set(route, cfg);
    // Optionally publish to Redis so other nodes pick up hot-reload (not implemented yet)
  }

  async function checkAndConsume({ key, route, requested = 1 }) {
    const cfg = routeConfig.get(route) || defaultConfig;
    const capacity = Number(cfg.capacity || defaultConfig.capacity || 100);
    const windowSec = Number(cfg.windowSec || defaultConfig.windowSec || 60);
    const refill_per_ms = (capacity / (windowSec * 1000));
    const now = Date.now();

    // Call lua script
    const res = await redis.consume_token(key, capacity, refill_per_ms, now, requested);
    // res: {allowed (1/0), remaining, capacity, [retry_after_ms]}
    const allowed = Number(res[0]) === 1;
    const remaining = Number(res[1]);
    const limit = Number(res[2]);
    const retryAfterMs = res[3] ? Number(res[3]) : 0;

    // compute reset: time until bucket will be full (approx)
    let resetMs = 0;
    if (refill_per_ms > 0) {
      resetMs = Math.ceil((limit - remaining) / refill_per_ms);
    }

    return { allowed, remaining, limit, retryAfterMs, resetMs };
  }

  function middlewareFactory({ route, identify } = {}) {
    if (!route) route = 'default';
    return async function (req, res, next) {
      try {
        const idObj = identify ? identify(req) : { id: req.ip };
        const identity = idObj && idObj.id ? idObj.id : req.ip;
        const key = `${route}:${identity}`;
        const result = await checkAndConsume({ key, route, requested: 1 });

        // Set headers
        res.setHeader('X-RateLimit-Limit', result.limit);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', Math.floor((Date.now() + result.resetMs) / 1000));

        if (!result.allowed) {
          res.setHeader('Retry-After', Math.ceil(result.retryAfterMs / 1000));
          // sample save
          if (saveEvent && Math.random() < sampleSaveRate) {
            try {
              saveEvent({ route, key: identity, remaining: result.remaining, limit: result.limit, retryAfterMs: result.retryAfterMs, timestamp: new Date() }).catch(() => {});
            } catch (e) {
              // ignore
            }
          }
          return res.status(429).json({ message: 'Too Many Requests' });
        }

        next();
      } catch (err) {
        // On error, be forgiving: allow request (fail-open) but log the error
        console.error('Rate limiter error:', err);
        next();
      }
    };
  }

  return {
    middleware: middlewareFactory,
    getConfig,
    setRouteLimit,
    _redis: redis,
  };
}

module.exports = createRateLimiter;

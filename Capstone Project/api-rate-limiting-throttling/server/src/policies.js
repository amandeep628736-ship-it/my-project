const config = require('./config');
const redis = require('./redis');
const logger = require('./logger');

const CHANNEL = 'rate_policies_broadcast';
const POLICIES_HASH = 'rate:policies';

let inMemoryPolicies = {
  global: {
    limitPerMinute: config.defaults.limitPerMinute,
    burstCapacity: config.defaults.burstCapacity,
  },
  byRoute: {
    '/api/heavy': {
      limitPerMinute: config.heavy.limitPerMinute,
      burstCapacity: config.heavy.burstCapacity,
    },
  },
  byTier: {
    admin: { limitPerMinute: 1000, burstCapacity: 1200 },
    standard: { limitPerMinute: config.defaults.limitPerMinute, burstCapacity: config.defaults.burstCapacity },
  },
  exemptions: [],
};

function getPolicyFor({ route, tier }) {
  const routePolicy = inMemoryPolicies.byRoute[route];
  const tierPolicy = tier ? inMemoryPolicies.byTier[tier] : undefined;
  const chosen = tierPolicy || routePolicy || inMemoryPolicies.global;
  return chosen;
}

async function loadPoliciesFromRedis() {
  try {
    const raw = await redis.hgetall(POLICIES_HASH);
    if (raw && Object.keys(raw).length > 0) {
      const parsed = JSON.parse(raw.current || '{}');
      if (parsed && parsed.global) {
        inMemoryPolicies = parsed;
        logger.info({ msg: 'policies_loaded' });
      }
    }
  } catch (err) {
    logger.warn({ msg: 'policies_load_failed', err });
  }
}

async function savePoliciesToRedis(policies) {
  await redis.hset(POLICIES_HASH, 'current', JSON.stringify(policies));
  await redis.publish(CHANNEL, 'reload');
}

function getPolicies() {
  return inMemoryPolicies;
}

function setPolicies(p) {
  inMemoryPolicies = p;
}

function subscribeReload() {
  const sub = redis.duplicate();
  sub.subscribe(CHANNEL, (err) => {
    if (err) logger.error({ msg: 'policy_subscribe_error', err });
  });
  sub.on('message', async () => {
    await loadPoliciesFromRedis();
    logger.info({ msg: 'policies_reloaded' });
  });
}

module.exports = {
  getPolicyFor,
  getPolicies,
  setPolicies,
  loadPoliciesFromRedis,
  savePoliciesToRedis,
  subscribeReload,
};



const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');
const logger = require('./logger');
const redis = require('./redis');
const { parseJwt } = require('./auth');
const { rateLimitMiddleware, deriveIdentity, checkAndConsume } = require('./rateLimiter');
const { initMongo, recordThrottleEvent } = require('./audit');
const { loadPoliciesFromRedis, subscribeReload, getPolicyFor } = require('./policies');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(pinoHttp({ logger, genReqId: (req) => req.headers['x-correlation-id'] || uuidv4() }));
app.use(parseJwt);

// Metrics: lightweight counters
const metrics = {
  allows: 0,
  denies: 0,
};

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Demo APIs
app.get('/api/resource', rateLimitMiddleware('/api/resource'), async (req, res) => {
  res.json({ message: 'OK: resource', time: new Date().toISOString() });
});

app.get('/api/heavy', rateLimitMiddleware('/api/heavy'), async (req, res) => {
  // simulate work
  await new Promise((r) => setTimeout(r, 50));
  res.json({ message: 'OK: heavy', time: new Date().toISOString() });
});

// Introspect remaining quota for current identity
app.get('/api/me/quota', async (req, res) => {
  const identity = deriveIdentity(req);
  const policy = getPolicyFor({ route: '/api/resource', tier: identity.tier });
  const result = await checkAndConsume('/api/resource', identity.id, policy);
  res.set('X-RateLimit-Limit', String(policy.limitPerMinute));
  res.set('X-RateLimit-Remaining', String(result.remaining));
  res.set('X-RateLimit-Reset', String(result.resetSeconds));
  res.json({ id: identity.id, remaining: result.remaining, resetSeconds: result.resetSeconds, limit: policy.limitPerMinute });
});

// Rate limit error hook to record audit samples (middleware layer already prevents pass-through)
app.use(async (err, req, res, next) => {
  if (res.headersSent) return next(err);
  return next(err);
});

// Admin routes
app.use('/admin', require('./admin'));

async function start() {
  await initMongo();
  await loadPoliciesFromRedis();
  subscribeReload();

  // Observe throttle events: wrap res.status for 429 sampling
  app.use((req, res, next) => {
    const originalStatus = res.status.bind(res);
    res.status = (code) => {
      if (code === 429) {
        const identity = deriveIdentity(req);
        recordThrottleEvent({
          route: req.path,
          id: identity.id,
          headers: {
            limit: res.getHeader('X-RateLimit-Limit'),
            remaining: res.getHeader('X-RateLimit-Remaining'),
            reset: res.getHeader('X-RateLimit-Reset'),
          },
        });
      }
      return originalStatus(code);
    };
    next();
  });

  app.listen(config.port, () => {
    logger.info({ msg: 'server_started', port: config.port });
  });
}

start().catch((err) => {
  logger.error({ msg: 'server_start_failed', err });
  process.exit(1);
});



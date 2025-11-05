const dotenv = require('dotenv');
dotenv.config();

const numberFromEnv = (name, def) => {
  const v = process.env[name];
  if (v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

module.exports = {
  port: numberFromEnv('PORT', 4000),
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisNamespace: process.env.REDIS_NAMESPACE || 'rate',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rate_limits',
  mongoAuditSampleRate: Math.min(1, Math.max(0, Number(process.env.MONGO_AUDIT_SAMPLE_RATE || '0.25'))),
  jwtAudience: process.env.JWT_AUDIENCE || undefined,
  jwtIssuer: process.env.JWT_ISSUER || undefined,
  adminToken: process.env.ADMIN_TOKEN || undefined,
  logLevel: process.env.LOG_LEVEL || 'info',
  defaults: {
    limitPerMinute: numberFromEnv('DEFAULT_LIMIT_PER_MINUTE', 100),
    burstCapacity: numberFromEnv('DEFAULT_BURST_CAPACITY', 120),
  },
  heavy: {
    limitPerMinute: numberFromEnv('HEAVY_LIMIT_PER_MINUTE', 20),
    burstCapacity: numberFromEnv('HEAVY_BURST_CAPACITY', 30),
  },
};



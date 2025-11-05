const Redis = require('ioredis');
const config = require('./config');
const logger = require('./logger');

const redis = new Redis(config.redisUrl, {
  lazyConnect: false,
  enableOfflineQueue: true,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => logger.info({ msg: 'redis_connect' }));
redis.on('error', (err) => logger.error({ msg: 'redis_error', err }));
redis.on('reconnecting', () => logger.warn({ msg: 'redis_reconnecting' }));

module.exports = redis;



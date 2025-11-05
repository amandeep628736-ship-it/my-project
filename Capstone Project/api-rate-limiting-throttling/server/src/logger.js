const pino = require('pino');
const config = require('./config');

const logger = pino({
  level: config.logLevel,
  base: undefined,
  redact: ['req.headers.authorization', 'req.headers["x-api-key"]'],
});

module.exports = logger;



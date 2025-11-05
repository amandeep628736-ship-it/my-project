const { MongoClient } = require('mongodb');
const config = require('./config');
const logger = require('./logger');

let client;
let collection;

async function initMongo() {
  try {
    client = new MongoClient(config.mongoUri, { maxPoolSize: 10 });
    await client.connect();
    const db = client.db();
    collection = db.collection('throttle_events');
    await collection.createIndex({ key: 1, ts: -1 });
    logger.info({ msg: 'mongo_connected' });
  } catch (err) {
    logger.error({ msg: 'mongo_connect_error', err });
  }
}

function shouldSample() {
  return Math.random() < config.mongoAuditSampleRate;
}

async function recordThrottleEvent(event) {
  if (!collection) return;
  if (!shouldSample()) return;
  try {
    await collection.insertOne({ ...event, ts: new Date() });
  } catch (err) {
    logger.warn({ msg: 'mongo_insert_failed', err });
  }
}

module.exports = { initMongo, recordThrottleEvent };



const mongoose = require('mongoose');

const throttleSchema = new mongoose.Schema({
  route: String,
  key: String,
  userId: String,
  ip: String,
  remaining: Number,
  limit: Number,
  retryAfterMs: Number,
  timestamp: { type: Date, default: Date.now },
});

const ThrottleEvent = mongoose.model('ThrottleEvent', throttleSchema);

async function connectMongo() {
  const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/rate_limit_db';
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
}

async function saveThrottleEvent(event) {
  try {
    const doc = new ThrottleEvent({
      route: event.route,
      key: event.key,
      userId: event.userId,
      ip: event.ip,
      remaining: event.remaining,
      limit: event.limit,
      retryAfterMs: event.retryAfterMs,
      timestamp: event.timestamp || new Date(),
    });
    await doc.save();
  } catch (e) {
    console.error('Failed to save throttle event', e);
  }
}

module.exports = { connectMongo, saveThrottleEvent, ThrottleEvent };

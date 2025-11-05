require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimitFactory = require('./rateLimiter');
const { connectMongo, saveThrottleEvent } = require('./mongo');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Basic identity resolver: prefer JWT 'sub', then x-api-key, then IP
function identify(req) {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
      if (payload && payload.sub) return { id: payload.sub, type: 'user' };
    } catch (e) {
      // invalid token -> fallthrough to other identifiers
    }
  }
  if (req.headers['x-api-key']) return { id: req.headers['x-api-key'], type: 'api-key' };
  return { id: req.ip, type: 'ip' };
}

// Connect to Mongo (for sampled audit storage)
connectMongo().catch(err => console.error('Mongo connect failed:', err));

// Create a rate limiter instance with defaults. You can override per-route.
const rateLimiter = rateLimitFactory({
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  default: {
    capacity: Number(process.env.RL_CAPACITY) || 100, // burst allowed
    windowSec: Number(process.env.RL_WINDOW_SEC) || 60, // refill window
  },
  sampleSaveRate: Number(process.env.SAMPLE_RATE) || 0.1, // 10% of throttle events saved
  saveEvent: saveThrottleEvent,
});

// Simple login route for testing (returns JWT)
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'user1' && password === 'password123') {
    const token = jwt.sign({ sub: 'user1', role: 'standard' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1h' });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Public route with rate limiting
app.get('/public', rateLimiter.middleware({ route: 'public', identify }), (req, res) => {
  res.status(200).json({ message: 'Public route OK' });
});

// Protected route (also rate-limited)
app.get('/protected', rateLimiter.middleware({ route: 'protected', identify }), (req, res) => {
  res.status(200).json({ message: 'Protected route OK' });
});

// Admin endpoints to inspect/update limits (basic, no auth here; add auth in prod)
app.get('/admin/limits', (req, res) => {
  res.json(rateLimiter.getConfig());
});

app.post('/admin/limits', (req, res) => {
  const { route, capacity, windowSec } = req.body || {};
  if (!route || !capacity) return res.status(400).json({ message: 'route and capacity required' });
  rateLimiter.setRouteLimit(route, { capacity: Number(capacity), windowSec: Number(windowSec) || undefined });
  return res.json({ ok: true });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

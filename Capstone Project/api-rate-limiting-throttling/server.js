// server.js
const express = require('express');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const app = express();
const port = 3000;

// Create a simple rate limiter (10 requests per minute per IP)
const rateLimiter = new RateLimiterMemory({
  points: 10, // number of requests
  duration: 60, // per 60 seconds (1 minute)
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).send('Too Many Requests');
  }
});

app.get('/', (req, res) => {
  res.send('Hello! This API is rate-limited.');
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

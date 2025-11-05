# Rate Limit Project

This project demonstrates a Redis-backed, token-bucket rate limiter for an Express app with sampled throttle events stored in MongoDB, plus a simple client to exercise endpoints.

What is included

- Backend: `server.js`, `rateLimiter.js`, `mongo.js`
- Static client: `client/index.html` to call endpoints and display rate-limit headers
- Example env: `.env.example`
- Tests: simple integration test using `supertest` and `jest`

Quick start (local)

1. Copy `.env.example` to `.env` and adjust values.
2. Start Redis and MongoDB locally (or point `REDIS_URL` and `MONGO_URL` to hosted instances).
3. Install dependencies and start the server:

```powershell
cd C:\Users\yadav\workspace\my-project\rate-limit-project
npm install
npm run start
```

4. Open the client in a browser: `file://.../rate-limit-project/client/index.html` and click the buttons to call endpoints.

Notes
- If Redis is unavailable, the limiter fails open (allows requests) but still logs errors. This keeps the app resilient in degraded mode.
- Admin endpoints are available at `/admin/limits` to inspect and change per-route limits (no auth in this demo).

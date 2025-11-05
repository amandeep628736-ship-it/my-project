const request = require('supertest');
const app = require('../server');

describe('Basic API', () => {
  test('GET /public returns 200 and rate-limit headers', async () => {
    const res = await request(app).get('/public');
    expect(res.status).toBe(200);
    expect(res.headers['x-ratelimit-limit']).toBeDefined();
    expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    expect(res.headers['x-ratelimit-reset']).toBeDefined();
  });

  test('GET /protected returns 200 (no auth) but still headers exist', async () => {
    const res = await request(app).get('/protected');
    // In this demo protected route does not enforce auth; it only demonstrates rate limiting
    expect(res.status).toBe(200);
    expect(res.headers['x-ratelimit-limit']).toBeDefined();
  });
});

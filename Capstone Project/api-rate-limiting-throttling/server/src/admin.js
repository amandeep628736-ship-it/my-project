const express = require('express');
const { requireAdmin } = require('./auth');
const { getPolicies, setPolicies, savePoliciesToRedis } = require('./policies');

const router = express.Router();

router.get('/policies', requireAdmin, (req, res) => {
  res.json(getPolicies());
});

router.post('/policies', requireAdmin, async (req, res) => {
  const body = req.body || {};
  if (!body.global || !body.byRoute || !body.byTier) {
    return res.status(400).json({ error: 'Invalid policies' });
  }
  setPolicies(body);
  await savePoliciesToRedis(body);
  return res.json({ ok: true });
});

module.exports = router;



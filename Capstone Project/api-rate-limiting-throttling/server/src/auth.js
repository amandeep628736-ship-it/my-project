const jwt = require('jsonwebtoken');
const config = require('./config');

function parseJwt(req, res, next) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.decode(token) || {};
    // Optional: If audience/issuer provided, verify signature/claims with a public key in real deployments.
    req.user = { sub: decoded.sub, tier: decoded.tier || 'standard' };
  } catch (_) {
    // ignore invalid tokens; remain anonymous
  }
  return next();
}

function requireAdmin(req, res, next) {
  const tok = req.header('x-admin-token');
  if (!config.adminToken || tok !== config.adminToken) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

module.exports = { parseJwt, requireAdmin };



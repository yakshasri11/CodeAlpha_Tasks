const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'synvora_2026_secret';
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token.' });
  try { req.user = jwt.verify(auth.slice(7), SECRET); next(); }
  catch(e) { res.status(401).json({ error: 'Invalid token.' }); }
}
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try { req.user = jwt.verify(auth.slice(7), SECRET); } catch(e) {}
  }
  next();
}
module.exports = { authenticate, optionalAuth };

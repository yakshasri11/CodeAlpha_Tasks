const r = require('express').Router();
const { authenticate } = require('../middleware/auth');
const c = require('../controllers/authController');
r.post('/register', c.register);
r.post('/login', c.login);
r.get('/me', authenticate, c.me);
r.post('/logout', c.logout);
module.exports = r;

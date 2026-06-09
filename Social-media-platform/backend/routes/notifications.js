const r = require('express').Router();
const { authenticate } = require('../middleware/auth');
const c = require('../controllers/notificationController');
r.get('/', authenticate, c.getNotifications);
r.put('/:id/read', authenticate, c.markRead);
r.put('/all/read', authenticate, c.markRead);
module.exports = r;

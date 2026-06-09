const r = require('express').Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/messageController');
r.get('/', authenticate, c.getConversations);
r.get('/:otherId', authenticate, c.getMessages);
r.post('/', authenticate, upload.single('media'), c.sendMessage);
module.exports = r;

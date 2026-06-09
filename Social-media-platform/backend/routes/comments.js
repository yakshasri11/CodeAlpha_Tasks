const r = require('express').Router();
const { authenticate } = require('../middleware/auth');
const c = require('../controllers/commentController');
r.get('/:postId', c.getComments);
r.post('/', authenticate, c.addComment);
r.delete('/:id', authenticate, c.deleteComment);
r.post('/:id/like', authenticate, c.toggleLike);
module.exports = r;

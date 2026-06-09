const r = require('express').Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/storyController');
r.get('/', optionalAuth, c.getStories);
r.post('/', authenticate, upload.single('media'), c.createStory);
r.post('/:id/view', authenticate, c.viewStory);
r.delete('/:id', authenticate, c.deleteStory);
module.exports = r;

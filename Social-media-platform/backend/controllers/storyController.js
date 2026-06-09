const { run, get, query } = require('../config/database');
async function createStory(req, res) {
  try {
    const { text_content } = req.body;
    let media_url='', media_type='text';
    if (req.file) {
      media_type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      media_url = `/uploads/${req.file.filename}`;
    }
    const expires_at = new Date(Date.now() + 86400000).toISOString();
    const r = run('INSERT INTO stories(user_id,media_url,media_type,text_content,expires_at) VALUES(?,?,?,?,?)', [req.user.id,media_url,media_type,text_content||'',expires_at]);
    const story = get('SELECT s.*,u.username,u.fullname,u.profile_image FROM stories s JOIN users u ON u.id=s.user_id WHERE s.id=?', [r.lastID]);
    res.status(201).json({ story });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
async function getStories(req, res) {
  try {
    const uid = req.user?.id || 0;
    const stories = query(`SELECT s.*,u.username,u.fullname,u.profile_image,
      (SELECT COUNT(*) FROM story_views WHERE story_id=s.id) as view_count,
      CASE WHEN sv.id IS NOT NULL THEN 1 ELSE 0 END as is_viewed
      FROM stories s JOIN users u ON u.id=s.user_id
      LEFT JOIN story_views sv ON sv.story_id=s.id AND sv.viewer_id=?
      WHERE datetime(s.expires_at) > datetime('now')
        AND (s.user_id=? OR u.is_private=0 OR s.user_id IN (SELECT following_id FROM followers WHERE follower_id=?))
      ORDER BY s.user_id=? DESC, s.created_at DESC`, [uid,uid,uid,uid]);
    const grouped = {};
    stories.forEach(s => {
      if (!grouped[s.user_id]) grouped[s.user_id] = { user:{id:s.user_id,username:s.username,fullname:s.fullname,profile_image:s.profile_image}, stories:[], has_unviewed:false };
      grouped[s.user_id].stories.push(s);
      if (!s.is_viewed) grouped[s.user_id].has_unviewed = true;
    });
    res.json({ story_groups: Object.values(grouped) });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
async function viewStory(req, res) {
  try {
    try { run('INSERT OR IGNORE INTO story_views(story_id,viewer_id) VALUES(?,?)', [req.params.id, req.user.id]); } catch(e) {}
    res.json({ view_count: get('SELECT COUNT(*) as c FROM story_views WHERE story_id=?', [req.params.id]).c });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
async function deleteStory(req, res) {
  try {
    const s = get('SELECT * FROM stories WHERE id=?', [req.params.id]);
    if (!s || s.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    run('DELETE FROM stories WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
module.exports = { createStory, getStories, viewStory, deleteStory };

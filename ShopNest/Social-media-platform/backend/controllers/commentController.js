const { run, get, query } = require('../config/database');
async function getComments(req, res) {
  try {
    const comments = query(`SELECT c.*,u.username,u.fullname,u.profile_image FROM comments c JOIN users u ON u.id=c.user_id WHERE c.post_id=? ORDER BY c.created_at ASC`, [req.params.postId]);
    res.json({ comments });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
async function addComment(req, res) {
  try {
    const { post_id, content, parent_id } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required.' });
    const post = get('SELECT id,user_id FROM posts WHERE id=?', [post_id]);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    const r = run('INSERT INTO comments(user_id,post_id,parent_id,content) VALUES(?,?,?,?)', [req.user.id, post_id, parent_id||null, content.trim()]);
    if (post.user_id !== req.user.id) run('INSERT INTO notifications(user_id,actor_id,type,post_id,comment_id) VALUES(?,?,?,?,?)', [post.user_id, req.user.id, 'comment', post_id, r.lastID]);
    const comment = get('SELECT c.*,u.username,u.fullname,u.profile_image FROM comments c JOIN users u ON u.id=c.user_id WHERE c.id=?', [r.lastID]);
    res.status(201).json({ comment });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
async function deleteComment(req, res) {
  try {
    const c = get('SELECT * FROM comments WHERE id=?', [req.params.id]);
    if (!c) return res.status(404).json({ error: 'Not found.' });
    if (c.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    run('DELETE FROM comments WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
async function toggleLike(req, res) {
  try {
    const existing = get('SELECT id FROM comment_likes WHERE user_id=? AND comment_id=?', [req.user.id, req.params.id]);
    if (existing) run('DELETE FROM comment_likes WHERE user_id=? AND comment_id=?', [req.user.id, req.params.id]);
    else run('INSERT INTO comment_likes(user_id,comment_id) VALUES(?,?)', [req.user.id, req.params.id]);
    res.json({ liked: !existing });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
module.exports = { getComments, addComment, deleteComment, toggleLike };

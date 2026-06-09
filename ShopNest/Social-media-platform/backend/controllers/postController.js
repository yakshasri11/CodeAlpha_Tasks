const { run, get, query } = require('../config/database');
const extractTags = c => (c.match(/#\w+/g)||[]).join(',');

const postSelect = (cuid) => `SELECT p.*,u.username,u.fullname,u.profile_image,
  (SELECT COUNT(*) FROM likes WHERE post_id=p.id) as like_count,
  (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count,
  (SELECT COUNT(*) FROM post_views WHERE post_id=p.id) as view_count,
  CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
  CASE WHEN sp.id IS NOT NULL THEN 1 ELSE 0 END as is_saved
  FROM posts p JOIN users u ON u.id=p.user_id
  LEFT JOIN likes l ON l.post_id=p.id AND l.user_id=${cuid}
  LEFT JOIN saved_posts sp ON sp.post_id=p.id AND sp.user_id=${cuid}`;

async function createPost(req, res) {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required.' });
    let image='', video='';
    if (req.file) {
      if (req.file.mimetype.startsWith('video/')) video = `/uploads/${req.file.filename}`;
      else image = `/uploads/${req.file.filename}`;
    }
    const r = run('INSERT INTO posts(user_id,content,image,video,hashtags) VALUES(?,?,?,?,?)', [req.user.id,content.trim(),image,video,extractTags(content)]);
    const post = get(`${postSelect(req.user.id)} WHERE p.id=?`, [r.lastID]);
    res.status(201).json({ post });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Server error.' }); }
}

async function getPosts(req, res) {
  try {
    const { page=1, limit=10, sort='latest', feed='all', hashtag='' } = req.query;
    const cuid = req.user?.id || 0;
    const offset = (page-1)*limit;
    let where = 'WHERE p.is_archived=0';
    if (feed==='following' && cuid) where += ` AND p.user_id IN (SELECT following_id FROM followers WHERE follower_id=${cuid})`;
    if (hashtag) where += ` AND p.hashtags LIKE '%${hashtag.replace(/'/g,"''")}%'`;
    const order = sort==='popular' ? 'like_count DESC, p.created_at DESC' : 'p.created_at DESC';
    const posts = query(`${postSelect(cuid)} ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, [parseInt(limit), parseInt(offset)]);
    res.json({ posts, hasMore: posts.length===parseInt(limit) });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function getPostById(req, res) {
  try {
    const cuid = req.user?.id || 0;
    const post = get(`${postSelect(cuid)} WHERE p.id=?`, [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Not found.' });
    if (cuid) try { run('INSERT OR IGNORE INTO post_views(user_id,post_id) VALUES(?,?)', [cuid, req.params.id]); } catch(e) {}
    res.json({ post });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function getUserPosts(req, res) {
  try {
    const cuid = req.user?.id || 0;
    const { archived=0 } = req.query;
    const posts = query(`${postSelect(cuid)} WHERE p.user_id=? AND p.is_archived=? ORDER BY p.is_pinned DESC, p.created_at DESC`, [req.params.userId, parseInt(archived)]);
    res.json({ posts });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function updatePost(req, res) {
  try {
    const post = get('SELECT * FROM posts WHERE id=?', [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Not found.' });
    if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    const content = req.body.content || post.content;
    run('UPDATE posts SET content=?,hashtags=?,updated_at=CURRENT_TIMESTAMP WHERE id=?', [content, extractTags(content), req.params.id]);
    res.json({ message: 'Updated.' });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function deletePost(req, res) {
  try {
    const post = get('SELECT * FROM posts WHERE id=?', [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Not found.' });
    if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    run('DELETE FROM posts WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function archivePost(req, res) {
  try {
    const post = get('SELECT * FROM posts WHERE id=?', [req.params.id]);
    if (!post || post.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    const newState = post.is_archived ? 0 : 1;
    run('UPDATE posts SET is_archived=? WHERE id=?', [newState, req.params.id]);
    res.json({ is_archived: newState });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function likePost(req, res) {
  try {
    const pid = parseInt(req.params.id), uid = req.user.id;
    const post = get('SELECT id,user_id FROM posts WHERE id=?', [pid]);
    if (!post) return res.status(404).json({ error: 'Not found.' });
    if (get('SELECT id FROM likes WHERE user_id=? AND post_id=?', [uid, pid])) return res.status(400).json({ error: 'Already liked.' });
    run('INSERT INTO likes(user_id,post_id) VALUES(?,?)', [uid, pid]);
    if (post.user_id !== uid) run('INSERT INTO notifications(user_id,actor_id,type,post_id) VALUES(?,?,?,?)', [post.user_id, uid, 'like', pid]);
    res.json({ like_count: get('SELECT COUNT(*) as c FROM likes WHERE post_id=?', [pid]).c });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function unlikePost(req, res) {
  try {
    run('DELETE FROM likes WHERE user_id=? AND post_id=?', [req.user.id, parseInt(req.params.id)]);
    res.json({ like_count: get('SELECT COUNT(*) as c FROM likes WHERE post_id=?', [req.params.id]).c });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function savePost(req, res) {
  try {
    const pid = parseInt(req.params.id), uid = req.user.id;
    if (get('SELECT id FROM saved_posts WHERE user_id=? AND post_id=?', [uid, pid])) {
      run('DELETE FROM saved_posts WHERE user_id=? AND post_id=?', [uid, pid]);
      return res.json({ saved: false });
    }
    run('INSERT INTO saved_posts(user_id,post_id) VALUES(?,?)', [uid, pid]);
    res.json({ saved: true });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function getSavedPosts(req, res) {
  try {
    const cuid = req.user.id;
    const posts = query(`SELECT p.*,u.username,u.fullname,u.profile_image,
      (SELECT COUNT(*) FROM likes WHERE post_id=p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count,
      (SELECT COUNT(*) FROM post_views WHERE post_id=p.id) as view_count,
      CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END as is_liked, 1 as is_saved
      FROM saved_posts sp JOIN posts p ON p.id=sp.post_id JOIN users u ON u.id=p.user_id
      LEFT JOIN likes l ON l.post_id=p.id AND l.user_id=?
      WHERE sp.user_id=? ORDER BY sp.created_at DESC`, [cuid, cuid]);
    res.json({ posts });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function recordView(req, res) {
  try {
    try { run('INSERT OR IGNORE INTO post_views(user_id,post_id) VALUES(?,?)', [req.user.id, req.params.id]); } catch(e) {}
    res.json({ view_count: get('SELECT COUNT(*) as c FROM post_views WHERE post_id=?', [req.params.id]).c });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function getTrending(req, res) {
  try {
    const rows = query(`SELECT hashtags FROM posts WHERE hashtags!='' AND is_archived=0`);
    const map = {};
    rows.forEach(r => (r.hashtags||'').split(',').filter(Boolean).forEach(t => { map[t]=(map[t]||0)+1; }));
    const trending = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([tag,count])=>({tag,count}));
    res.json({ trending });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

module.exports = { createPost, getPosts, getPostById, getUserPosts, updatePost, deletePost, archivePost, likePost, unlikePost, savePost, getSavedPosts, recordView, getTrending };

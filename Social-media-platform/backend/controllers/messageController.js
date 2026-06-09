const { run, get, query } = require('../config/database');
async function getConversations(req, res) {
  try {
    const uid = req.user.id;
    const convos = query(`SELECT DISTINCT CASE WHEN sender_id=? THEN receiver_id ELSE sender_id END as other_id, MAX(created_at) as t
      FROM messages WHERE sender_id=? OR receiver_id=? GROUP BY other_id ORDER BY t DESC`, [uid,uid,uid]);
    const result = [];
    for (const c of convos) {
      const user = get('SELECT id,username,fullname,profile_image FROM users WHERE id=?', [c.other_id]);
      const last = get('SELECT * FROM messages WHERE ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)) ORDER BY created_at DESC LIMIT 1', [uid,c.other_id,c.other_id,uid]);
      const unread = get('SELECT COUNT(*) as c FROM messages WHERE sender_id=? AND receiver_id=? AND is_read=0', [c.other_id, uid]);
      if (user) result.push({ user, last_message: last, unread_count: unread.c });
    }
    res.json({ conversations: result });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
async function getMessages(req, res) {
  try {
    const uid = req.user.id, oid = req.params.otherId;
    const msgs = query(`SELECT m.*,u.username,u.fullname,u.profile_image FROM messages m JOIN users u ON u.id=m.sender_id
      WHERE (m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?) ORDER BY m.created_at ASC`, [uid,oid,oid,uid]);
    run('UPDATE messages SET is_read=1 WHERE sender_id=? AND receiver_id=?', [oid, uid]);
    res.json({ messages: msgs });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
async function sendMessage(req, res) {
  try {
    const { receiver_id, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required.' });
    let media_url = '';
    if (req.file) media_url = `/uploads/${req.file.filename}`;
    const r = run('INSERT INTO messages(sender_id,receiver_id,content,media_url) VALUES(?,?,?,?)', [req.user.id, receiver_id, content.trim(), media_url]);
    const msg = get(`SELECT m.*,u.username,u.fullname,u.profile_image FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.id=?`, [r.lastID]);
    res.status(201).json({ message: msg });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
module.exports = { getConversations, getMessages, sendMessage };

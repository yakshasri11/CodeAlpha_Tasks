const { run, get, query } = require('../config/database');
async function getNotifications(req, res) {
  try {
    const notifs = query(`SELECT n.*,u.username as actor_username,u.fullname as actor_name,u.profile_image as actor_pic
      FROM notifications n JOIN users u ON u.id=n.actor_id WHERE n.user_id=? ORDER BY n.created_at DESC LIMIT 50`, [req.user.id]);
    const unread = get('SELECT COUNT(*) as c FROM notifications WHERE user_id=? AND is_read=0', [req.user.id]);
    res.json({ notifications: notifs, unread_count: unread.c });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
async function markRead(req, res) {
  try {
    const { id } = req.params;
    if (id === 'all') run('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]);
    else run('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [id, req.user.id]);
    res.json({ message: 'Done.' });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}
module.exports = { getNotifications, markRead };

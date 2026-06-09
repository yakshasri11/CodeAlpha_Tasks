const bcrypt = require('bcryptjs');
const { run, get, query } = require('../config/database');

async function getUser(req, res) {
  try {
    const { id } = req.params;
    const cuid = req.user?.id || 0;
    const user = get(`SELECT u.id,u.username,u.fullname,u.bio,u.profile_image,u.cover_image,u.profile_theme,u.vibe_status,u.is_private,u.created_at,
      (SELECT COUNT(*) FROM followers WHERE following_id=u.id) as follower_count,
      (SELECT COUNT(*) FROM followers WHERE follower_id=u.id) as following_count,
      (SELECT COUNT(*) FROM posts WHERE user_id=u.id AND is_archived=0) as post_count,
      CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_following
      FROM users u LEFT JOIN followers f ON f.follower_id=? AND f.following_id=u.id
      WHERE u.id=? OR u.username=?`, [cuid, id, id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function listUsers(req, res) {
  try {
    const { search = '' } = req.query;
    const cuid = req.user?.id || 0;
    const users = query(`SELECT u.id,u.username,u.fullname,u.bio,u.profile_image,
      CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_following
      FROM users u LEFT JOIN followers f ON f.follower_id=? AND f.following_id=u.id
      WHERE u.id!=? AND (u.fullname LIKE ? OR u.username LIKE ?) LIMIT 20`,
      [cuid, cuid, `%${search}%`, `%${search}%`]);
    res.json({ users });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    if (parseInt(id) !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    const user = get('SELECT * FROM users WHERE id=?', [id]);
    if (!user) return res.status(404).json({ error: 'Not found.' });
    const { fullname, bio, current_password, new_password, profile_theme, vibe_status, is_private, username } = req.body;
    let profile_image = user.profile_image;
    let cover_image = user.cover_image;
    if (req.files?.profile_image?.[0]) profile_image = `/uploads/${req.files.profile_image[0].filename}`;
    if (req.files?.cover_image?.[0]) cover_image = `/uploads/${req.files.cover_image[0].filename}`;
    if (req.file) profile_image = `/uploads/${req.file.filename}`;
    if (new_password) {
      if (!current_password) return res.status(400).json({ error: 'Current password required.' });
      if (!await bcrypt.compare(current_password, user.password)) return res.status(400).json({ error: 'Wrong password.' });
      run('UPDATE users SET password=? WHERE id=?', [await bcrypt.hash(new_password, 10), id]);
    }
    // Handle username change
    let newUsername = user.username;
    if (username && username.toLowerCase() !== user.username) {
      const unClean = username.toLowerCase().replace(/[^a-z0-9_.]/g, '');
      if (!/^[a-z0-9_.]{3,30}$/.test(unClean)) return res.status(400).json({ error: 'Invalid username format.' });
      const existing = get('SELECT id FROM users WHERE username=? AND id!=?', [unClean, id]);
      if (existing) return res.status(409).json({ error: 'Username already taken.' });
      newUsername = unClean;
    }
    run('UPDATE users SET fullname=?,bio=?,profile_image=?,cover_image=?,profile_theme=?,vibe_status=?,is_private=?,username=? WHERE id=?',
      [fullname||user.fullname, bio??user.bio, profile_image, cover_image||user.cover_image, profile_theme||user.profile_theme, vibe_status??user.vibe_status, is_private!==undefined?parseInt(is_private):user.is_private, newUsername, id]);
    const updated = get('SELECT id,username,fullname,email,bio,profile_image,cover_image,profile_theme,vibe_status,is_private,created_at FROM users WHERE id=?', [id]);
    res.json({ user: updated });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Server error.' }); }
}

async function followUser(req, res) {
  try {
    const tid = parseInt(req.params.id), uid = req.user.id;
    if (tid === uid) return res.status(400).json({ error: 'Cannot follow yourself.' });
    if (get('SELECT id FROM followers WHERE follower_id=? AND following_id=?', [uid, tid])) return res.status(400).json({ error: 'Already following.' });
    run('INSERT INTO followers(follower_id,following_id) VALUES(?,?)', [uid, tid]);
    run('INSERT INTO notifications(user_id,actor_id,type) VALUES(?,?,?)', [tid, uid, 'follow']);
    res.json({ message: 'Followed!' });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function unfollowUser(req, res) {
  try {
    run('DELETE FROM followers WHERE follower_id=? AND following_id=?', [req.user.id, parseInt(req.params.id)]);
    res.json({ message: 'Unfollowed.' });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function getFollowers(req, res) {
  try {
    const followers = query(`SELECT u.id,u.username,u.fullname,u.profile_image FROM followers f JOIN users u ON u.id=f.follower_id WHERE f.following_id=?`, [req.params.id]);
    res.json({ followers });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function getFollowing(req, res) {
  try {
    const following = query(`SELECT u.id,u.username,u.fullname,u.profile_image FROM followers f JOIN users u ON u.id=f.following_id WHERE f.follower_id=?`, [req.params.id]);
    res.json({ following });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function getSuggestions(req, res) {
  try {
    const uid = req.user?.id || 0;
    const users = query(`SELECT u.id,u.username,u.fullname,u.bio,u.profile_image FROM users u
      WHERE u.id!=? AND u.id NOT IN (SELECT following_id FROM followers WHERE follower_id=?) LIMIT 6`, [uid, uid]);
    res.json({ users });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

module.exports = { getUser, listUsers, updateUser, followUser, unfollowUser, getFollowers, getFollowing, getSuggestions };

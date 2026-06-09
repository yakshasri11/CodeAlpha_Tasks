const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get } = require('../config/database');
const SECRET = process.env.JWT_SECRET || 'synvora_2026_secret';

async function register(req, res) {
  try {
    const { fullname, username, email, password } = req.body;
    if (!fullname||!username||!email||!password) return res.status(400).json({ error: 'All fields required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password min 6 chars.' });
    if (get('SELECT id FROM users WHERE email=? OR username=?', [email, username.toLowerCase()])) return res.status(409).json({ error: 'Email or username already taken.' });
    const hashed = await bcrypt.hash(password, 10);
    const r = run('INSERT INTO users (fullname,username,email,password) VALUES(?,?,?,?)', [fullname, username.toLowerCase(), email, hashed]);
    const user = get('SELECT id,username,fullname,email,bio,profile_image,cover_image,profile_theme FROM users WHERE id=?', [r.lastID]);
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Server error.' }); }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier||!password) return res.status(400).json({ error: 'Credentials required.' });
    const user = get('SELECT * FROM users WHERE email=? OR username=?', [identifier, identifier.toLowerCase()]);
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid credentials.' });
    const { password: _, ...safe } = user;
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: safe });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function me(req, res) {
  try {
    const user = get('SELECT id,username,fullname,email,bio,profile_image,cover_image,profile_theme,vibe_status,is_private,created_at FROM users WHERE id=?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
}

async function logout(req, res) { res.json({ message: 'Logged out.' }); }
module.exports = { register, login, me, logout };

/**
 * MeetSpace — Node.js / Express Backend
 * Handles meeting storage, user sessions, and serves the frontend.
 * Run: node server.js  (or: nodemon server.js)
 */

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 8000;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());

// Serve the frontend from /client
app.use(express.static(path.join(__dirname, '../client')));

// ─── In-Memory Meeting Store ───────────────────────────────────
// In production: replace with MongoDB / PostgreSQL
const meetings = new Map();    // meetId → { pass, hostName, createdAt }
const users    = new Map();    // email  → { name, email, passwordHash, role }

// Auto-clean meetings older than 24 hours
setInterval(() => {
  const now = Date.now();
  for (const [id, m] of meetings.entries()) {
    if (now - m.createdAt > 86400000) meetings.delete(id);
  }
}, 60 * 60 * 1000);

// ─── API ROUTES ────────────────────────────────────────────────

/**
 * POST /api/meetings
 * Host creates a new meeting → returns meetId + password
 */
app.post('/api/meetings', (req, res) => {
  const { hostName } = req.body;
  if (!hostName) return res.status(400).json({ error: 'hostName is required' });

  const meetId  = 'MTG-' + uuidv4().replace(/-/g,'').slice(0,6).toUpperCase();
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let pass = '';
  for (let i = 0; i < 3; i++) pass += letters[Math.floor(Math.random() * letters.length)];
  pass += '-' + (100 + Math.floor(Math.random() * 900));

  meetings.set(meetId, { pass, hostName, createdAt: Date.now() });
  console.log(`[MEETING CREATED] ${meetId} by ${hostName}`);

  res.json({ meetId, pass, hostName });
});

/**
 * POST /api/meetings/:id/validate
 * Joiner validates meeting ID + password before connecting
 */
app.post('/api/meetings/:id/validate', (req, res) => {
  const meetId = req.params.id.toUpperCase();
  const { pass } = req.body;

  const meeting = meetings.get(meetId);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  if (meeting.pass.toUpperCase() !== (pass || '').toUpperCase())
    return res.status(401).json({ error: 'Incorrect password' });

  res.json({ valid: true, hostName: meeting.hostName });
});

/**
 * DELETE /api/meetings/:id
 * Host ends the meeting
 */
app.delete('/api/meetings/:id', (req, res) => {
  const meetId = req.params.id.toUpperCase();
  if (meetings.delete(meetId)) {
    console.log(`[MEETING ENDED] ${meetId}`);
    return res.json({ deleted: true });
  }
  res.status(404).json({ error: 'Meeting not found' });
});

/**
 * GET /api/meetings/:id
 * Check if a meeting is active
 */
app.get('/api/meetings/:id', (req, res) => {
  const meetId = req.params.id.toUpperCase();
  const meeting = meetings.get(meetId);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  res.json({ meetId, hostName: meeting.hostName, active: true });
});

// ─── User Auth Routes (Simple JWT-less session for demo) ───────

/**
 * POST /api/auth/register
 */
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' });
  if (users.has(email))
    return res.status(409).json({ error: 'Email already registered' });

  const id = uuidv4();
  users.set(email, { id, name, email, password, role: 'user', createdAt: Date.now() });
  res.json({ success: true, user: { id, name, email, role: 'user' } });
});

/**
 * POST /api/auth/login
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const u = users.get(email);
  if (!u || u.password !== password)
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ success: true, user: { id: u.id, name: u.name, email, role: u.role } });
});

// ─── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MeetSpace API',
    activeMeetings: meetings.size,
    uptime: process.uptime().toFixed(0) + 's'
  });
});

// ─── Catch-all: serve frontend ─────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ─── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  MeetSpace server running at http://localhost:${PORT}`);
  console.log(`   Frontend : http://localhost:${PORT}`);
  console.log(`   API      : http://localhost:${PORT}/api/health\n`);
});
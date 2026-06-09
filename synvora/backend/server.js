require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const net = require('net');
const { getDb, query, get } = require('./config/database');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/posts',         require('./routes/posts'));
app.use('/api/comments',      require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/stories',       require('./routes/stories'));

// ── Live app context for Akaza ──
function getAppContext() {
  try {
    const stats = get(`SELECT
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM posts WHERE is_archived=0) as posts,
      (SELECT COUNT(*) FROM likes) as likes,
      (SELECT COUNT(*) FROM comments) as comments`);
    const recent = query(`SELECT p.content, u.username,
      (SELECT COUNT(*) FROM likes WHERE post_id=p.id) as lk
      FROM posts p JOIN users u ON u.id=p.user_id
      WHERE p.is_archived=0 ORDER BY p.created_at DESC LIMIT 3`);
    const tagRows = query(`SELECT hashtags FROM posts WHERE hashtags!='' AND is_archived=0`);
    const tagMap = {};
    tagRows.forEach(r => (r.hashtags||'').split(',').filter(Boolean).forEach(t => { tagMap[t]=(tagMap[t]||0)+1; }));
    const tags = Object.entries(tagMap).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([t,c])=>`${t}(${c})`).join(', ');
    return `Synvora stats: ${stats?.users||0} users, ${stats?.posts||0} posts, ${stats?.likes||0} likes. Trending: ${tags||'none'}. Recent: ${recent.map(p=>`"${p.content?.slice(0,40)}..." @${p.username}`).join(' | ')}`;
  } catch(e) { return ''; }
}

// ── Smart offline fallbacks ──
function offlineReply(last) {
  const l = (last||'').toLowerCase().trim();
  if (l.match(/^(hi|hey|hello|sup|yo|hii|hai|helo)/)) return "Hey! I'm Akaza, your Synvora companion. What's on your mind?";
  if (l.match(/how are you|how r u|wassup|what.?s up/)) return "Doing great, always! ⚡ What can I help you with today?";
  if (l.match(/help|what can you|what do you do/)) return "I can help with post ideas, captions, hashtags, coding tips, motivation, and just chatting! Add an API key (see README) for full AI power 🚀";
  if (l.match(/post|idea|caption|content/)) return "Post idea: share something real — a lesson you learned, a behind-the-scenes moment, or just your current vibe 📸 What's your niche?";
  if (l.match(/code|coding|programming|bug|error|javascript|python/)) return "Happy to help debug! Paste your code or describe the issue and I'll do my best ⚡";
  if (l.match(/motivat|sad|stress|tired|feel|depress/)) return "You've got this 💪 Every big thing starts with one small step. What are you working on? Let's figure it out together ⚡";
  if (l.match(/thank|thanks|thx|ty/)) return "Anytime! That's what I'm here for ⚡";
  if (l.match(/who are you|what are you|akaza/)) return "I'm Akaza ⚡ — the AI companion built into Synvora. Ask me anything: post ideas, life advice, coding help, or just chat!";
  if (l.match(/feature|how to|how do i/)) return "Synvora features: create posts with photos/filters, share 24hr stories, follow creators, chat with anyone, and explore trending content 🚀 What do you want to try?";
  return "Interesting! Tell me more — I'm in limited mode right now (check README to set up full AI), but I'm still here for you ⚡";
}

// ── Akaza endpoint — supports Anthropic, Gemini, Ollama, offline ──
app.post('/api/akaza', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.json({ reply: "Hey! Send me a message ⚡" });

    const filtered = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: String(m.content || '') }))
      .slice(-10);

    if (!filtered.length) return res.json({ reply: "What's up? ⚡" });
    const lastMsg = filtered[filtered.length-1]?.content || '';
    const ctx = getAppContext();

    const SYSTEM = `You are Akaza ⚡, the AI companion inside Synvora social media. You're casual, warm, witty — like a smart friend. Keep replies to 2-4 sentences unless asked for more. Use emojis naturally. Help with: chat, post ideas, captions, hashtags, coding, motivation, app questions. Never be robotic. Context: ${ctx}`;

    // ── Try Anthropic ──
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 400, system: SYSTEM, messages: filtered })
        });
        if (r.ok) {
          const d = await r.json();
          const reply = d.content?.[0]?.text;
          if (reply) return res.json({ reply });
        }
      } catch(e) { console.error('Anthropic error:', e.message); }
    }

    // ── Try Gemini ──
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiMsgs = filtered.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: geminiMsgs, generationConfig: { maxOutputTokens: 400 } })
        });
        if (r.ok) {
          const d = await r.json();
          const reply = d.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return res.json({ reply: reply.trim() });
        }
      } catch(e) { console.error('Gemini error:', e.message); }
    }

    // ── Try Ollama (local) ──
    if (process.env.OLLAMA_URL) {
      try {
        const model = process.env.OLLAMA_MODEL || 'llama3.2';
        const ollamaMsgs = [{ role: 'system', content: SYSTEM }, ...filtered];
        const r = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: ollamaMsgs, stream: false }),
          signal: AbortSignal.timeout(15000)
        });
        if (r.ok) {
          const d = await r.json();
          const reply = d.message?.content;
          if (reply) return res.json({ reply: reply.trim() });
        }
      } catch(e) { console.error('Ollama error:', e.message); }
    }

    // ── Offline fallback ──
    return res.json({ reply: offlineReply(lastMsg) });

  } catch(e) {
    console.error('Akaza error:', e.message);
    res.json({ reply: "Connection hiccup — try again ⚡" });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Synvora' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: err.message }); });

// ── Port auto-selection ──
function isPortFree(port) {
  return new Promise(resolve => {
    const t = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => { t.close(); resolve(true); })
      .listen(port, '0.0.0.0');
  });
}

async function startServer() {
  await getDb();
  for (const port of [parseInt(process.env.PORT)||3001, 3000, 3002, 3003, 8080]) {
    if (isNaN(port)) continue;
    if (await isPortFree(port)) {
      app.listen(port, () => {
        console.log(`\n⚡ Synvora → http://localhost:${port}`);
        console.log(`   Login: synvora@gmail.com / password123\n`);
      });
      return;
    }
    console.log(`   Port ${port} in use, trying next...`);
  }
  console.error('\n❌ All ports busy. Run: taskkill /F /IM node.exe (Windows) or killall node (Mac/Linux)\n');
  process.exit(1);
}

startServer().catch(e => { console.error(e); process.exit(1); });

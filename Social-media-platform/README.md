<div align="center">

# ⚡ Synvora

**A full-stack social media platform — built to connect, create, and inspire.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sql.js.org)
[![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla%20JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-06b6d4?style=flat-square)](LICENSE)

> *Where creativity and connection live together.*

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Folder Structure](#-folder-structure)
5. [Installation & Setup](#-installation--setup)
6. [Environment Variables](#-environment-variables)
7. [Authentication](#-authentication)
8. [Profile System](#-profile-system)
9. [Stories & Close Friends](#-stories--close-friends)
10. [Settings](#-settings)
11. [API Reference](#-api-reference)
12. [Deployment](#-deployment)
13. [Contributing](#-contributing)
14. [Future Updates](#-future-updates)
15. [License](#-license)

---

## 🌐 Project Overview

Synvora is a **production-ready, full-stack social media web application** built as a zero-dependency Single Page App (SPA). It combines rich media posting, ephemeral stories, direct messaging, AI chat assistance, and a deep-space dark UI — all served from a `index.html` with a Node.js + Express backend.

**Why Synvora?**
- Demonstrates complete full-stack JavaScript architecture without any frontend framework
- REST API design with JWT authentication, file uploads, and real-time polling
- Multi-provider AI integration (Google Gemini, Ollama, offline fallback)
- Production-ready code structure with clean separation of concerns

---

## ✨ Features

### 🏠 Feed & Posts
- Create text and image posts with `#hashtag` support
- Like, comment, save, archive, and delete posts
- Feed filters: **All** · **Following** · **Trending**
- Sort by: **Latest** or **Top** (most liked)
- Infinite scroll with skeleton loaders
- Explore page with hashtag and user search

### 📸 Stories
- 24-hour ephemeral stories (image or text)
- Audience selector: **🌍 Public** or **⭐ Close Friends**
- Animated gradient ring on unviewed stories
- Green star ring for Close Friends stories
- Story viewer with progress bar and auto-advance
- View tracking per user

### 👤 Profile System
- Full-bleed cover photo with click-to-upload
- 96px circular avatar with accent ring
- Bio, vibe status, joined date (IST)
- Posts · Followers · Following stats with drill-down modals
- **Posts / Saved / Archive** tab grid
- Masonry grid for image posts; card list for text posts

### ✏️ Edit Profile
- Update full name, bio, vibe status
- Change **username (User ID)** — restricted to once every **15 days**
- Upload avatar and cover photo
- Change password (with current password verification)
- Changes save immediately and refresh the profile

### 💬 Chat & Messaging
- One-on-one direct messages
- Conversation list with last message preview
- User search to start new conversations
- **Akaza AI** built into the chat tab

### 🤖 Akaza AI
- Context-aware AI with live platform data (trending hashtags, post counts)
- Provider cascade: **Google Gemini** → **Ollama** → **Offline fallback**
- Handles: post ideas, captions, coding help, motivation, platform navigation

### ⭐ Close Friends
- Add/remove followers and following to a personal Close Friends list
- List persisted to localStorage per user account
- Close Friends stories only visible to people on the list
- ⭐ star badge on story bubbles and in the story viewer

### 🔔 Notifications
- Like, comment, follow, and mention notifications
- Unread badge with 30-second polling
- Activity feed in Settings showing all interactions
- Mark all as read

### ⚙️ Settings (Centered Modal)
- **Account Center** — Profile & Details, Password & Security, Your Information
- **Preferences** — Saved Posts, Dark Mode toggle, Archive, Activity feed
- **Privacy** — Private Account toggle, Close Friends manager
- **Legal & Support** — Terms, Privacy Policy, Community Guidelines, AI Policy
- **Contact Support** — Live chat UI with support bot
- Smooth scale-in animation with backdrop blur

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS (ES2022) | Zero-framework SPA |
| Fonts | Syne + Inter (Google Fonts) | Premium typography |
| Backend | Node.js 18+ + Express 4 | HTTP server and API |
| Database | sql.js (SQLite WASM) | Embedded, zero-config DB |
| Auth | jsonwebtoken + bcryptjs | JWT auth + password hashing |
| Uploads | multer | Multipart image upload |
| Config | dotenv | Environment variables |
| AI | Anthropic / Gemini / Ollama | Akaza AI chat |

---

## 📁 Folder Structure

```
Synvora/
├── backend/
│   ├── config/
│   │   ├── database.js          # SQLite schema (sql.js WASM)
│   │   └── seed.js              # Demo data: 15 users, 20 posts, stories
│   ├── controllers/
│   │   ├── authController.js    # register, login, logout, /me
│   │   ├── userController.js    # profile CRUD, follow, username change
│   │   ├── postController.js    # feed, create, like, save, archive
│   │   ├── commentController.js # comment CRUD
│   │   ├── messageController.js # DM conversations + messages
│   │   ├── storyController.js   # story create, list, view tracking
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   └── upload.js            # multer config
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   ├── messages.js
│   │   ├── stories.js
│   │   └── notifications.js
│   ├── uploads/                 # Uploaded media files
│   ├── package.json
│   └── server.js                # Express app + Akaza AI endpoint
├── frontend/
│   └── index.html               # Complete SPA (HTML + CSS + JS)
├── start.sh                     # One-command launch script
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** → [nodejs.org](https://nodejs.org)
- No database installation needed — SQLite runs embedded

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/synvora.git
cd synvora
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Create Environment File

```bash
# backend/.env
cp .env.example .env   # or create manually:
```

```env
JWT_SECRET=synvora_2026_secret
PORT=3001

# Optional — pick ONE AI provider:
# GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxx
# OLLAMA_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.2
```

### 4. Seed Demo Data

```bash
node config/seed.js
```

Creates 15 demo users, 20 posts, stories, follows, messages.

### 5. Start the Server

```bash
node server.js
# or from project root:
bash start.sh
```

### 6. Open in Browser

```
http://localhost:3001
```

> Port auto-selects: **3001 → 3000 → 3002 → 3003 → 8080**

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | ✅ | `synvora_2026_secret` | JWT signing secret — change in production |
| `PORT` | ❌ | `3001` | Server port |
| `GEMINI_API_KEY` | ❌ | — | Akaza AI via Gemini (free tier) |
| `OLLAMA_URL` | ❌ | — | Akaza AI via local Ollama |
| `OLLAMA_MODEL` | ❌ | `llama3.2` | Ollama model name |

**Important:** Always change `JWT_SECRET` before deploying to production.

---

## 🔐 Authentication

Synvora uses **stateless JWT authentication**:

- Tokens are signed with `JWT_SECRET` and expire after **7 days**
- The token is stored in `localStorage` as `sv_token`
- Every protected API call sends `Authorization: Bearer <token>`
- The `auth` middleware on the backend verifies and decodes the token

### Demo Credentials

All demo accounts use password: `password123`

| Name | Email | Username |
|---|---|---|
| Priya Sharma | priya@gmail.com | priya_s |
| Arjun Patel | arjun@gmail.com | arjun_p |
| Sarah Chen | sarah@gmail.com | sarah_c |
| Synvora Admin | synvora@gmail.com | synvora |

---

## 👤 Profile System

The profile page is a **full-screen Instagram-inspired layout**:

| Element | Details |
|---|---|
| Cover photo | Full-bleed banner; click to upload; gradient fallback |
| Avatar | 96px circle; overlaps cover; click to upload in Edit Profile |
| Username change | Allowed once every **15 days** (tracked in localStorage) |
| Stats | Posts · Followers · Following — click to see list |
| Tabs | Posts · Saved · Archive |
| Grid | 3-column masonry for images; card list for text-only posts |

---

## 📸 Stories & Close Friends

### Story Types

| Type | Visibility | Ring Color |
|---|---|---|
| 🌍 Public | All users | Purple gradient |
| ⭐ Close Friends | Only CF list members | Green (#22c55e) |

### Creating a Story
1. Tap **+** in the stories row
2. Add a photo/video or write text
3. Select audience: **Public** or **⭐ Close Friends**
4. Tap **Share ⚡**

### Managing Close Friends
1. Go to **Settings → Close Friends**
2. The list shows all your followers and following
3. Tap **Add** / **✓ Added** to toggle
4. Search by name or username
5. CF list is saved immediately to `localStorage`

---

## ⚙️ Settings

Settings opens as a **centered modal** with smooth spring animation:

| Section | Features |
|---|---|
| Account Center | Edit profile details, change password, view your information |
| Preferences | Saved posts, dark/light mode toggle, archive, activity log |
| Privacy | Private account toggle, Close Friends manager |
| Legal & Support | Terms, Privacy Policy, Community Guidelines, AI Policy |
| Contact Support | In-app chat with support bot |
| Account | Log out |

---

## 📡 API Reference

All protected endpoints require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in → returns JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/:id` | Get profile + follow status |
| PUT | `/api/users/:id` | Update profile (multipart) + username |
| GET | `/api/users/search?q=` | Search users |
| POST | `/api/users/:id/follow` | Follow |
| DELETE | `/api/users/:id/unfollow` | Unfollow |
| GET | `/api/users/:id/followers` | Followers list |
| GET | `/api/users/:id/following` | Following list |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts/feed` | Paginated feed (filter + sort) |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/user/:id` | User posts (`?archived=1` for archive) |
| GET | `/api/posts/saved` | Saved posts |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/save` | Toggle save |
| PUT | `/api/posts/:id/archive` | Archive/unarchive |
| DELETE | `/api/posts/:id` | Delete |

### Messages, Stories, Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/conversations` | DM list |
| GET | `/api/messages/:userId` | Thread with user |
| POST | `/api/messages` | Send message |
| GET | `/api/stories` | All story groups (24hr) |
| POST | `/api/stories` | Create story |
| POST | `/api/stories/:id/view` | Mark viewed |
| GET | `/api/notifications` | List + unread count |
| PUT | `/api/notifications/read` | Mark all read |
| POST | `/api/akaza` | Chat with Akaza AI |

---

## 🌍 Deployment

### Deploy to Railway / Render / Fly.io

```bash
# Set environment variables in your platform dashboard:
JWT_SECRET=<your-strong-secret>
GEMINI_API_KEY=<optional>
NODE_ENV=production
```

```bash
# Start command:
node backend/server.js
```

### Deploy to VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and install
git clone https://github.com/yourusername/synvora.git
cd synvora/backend && npm install
node config/seed.js

# Run with PM2
npm install -g pm2
pm2 start server.js --name synvora
pm2 startup && pm2 save
```

### Nginx Reverse Proxy (optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

```bash
# Fork the repository, then:
git clone https://github.com/username/synvora.git
cd synvora/backend
npm install
node config/seed.js
node server.js
```

### Guidelines

- **Frontend changes** go in `frontend/index.html` — CSS in `<style>`, JS in `<script>`
- **Backend changes** follow the controller → route pattern
- **Schema changes** go in `config/database.js`; update `config/seed.js` too
- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`
- Test on Chrome and mobile viewport (≤430px) before opening a PR

### Pull Request Checklist
- [ ] `node config/seed.js && node server.js` runs without errors
- [ ] No console errors on Chrome/Firefox
- [ ] Tested on mobile viewport
- [ ] Existing features unaffected
- [ ] Code matches existing vanilla JS style (no frameworks)

---

## 🗺 Future Updates

| Priority | Feature |
|---|---|
| 🔥 High | WebSocket real-time chat (replace polling) |
| 🔥 High | Push notifications via Web Push API |
| 🟡 Medium | Video stories with MediaRecorder API |
| 🟡 Medium | Post reactions (❤️ 😂 😮 😢 👏) |
| 🟡 Medium | OAuth sign-in (Google / GitHub) |
| 🟢 Low | Progressive Web App (offline + install prompt) |
| 🟢 Low | Post scheduling (draft + publish-later) |
| 🟢 Low | Analytics dashboard (reach, follower growth) |
| 🟢 Low | Location-tagged posts with explore map |
| 🟢 Low | AI content moderation (spam / hate detection) |

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License — Copyright (c) 2026 Synvora

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

Built with ⚡ and 💜

**Synvora — Connect with your universe.**

</div>

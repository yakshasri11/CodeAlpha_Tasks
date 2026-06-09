# 🎥 MeetSpace

A browser-based, peer-to-peer video conferencing app. No downloads, no sign-up walls — just create a meeting and share the link.

---

## ✨ Features

- 📹 **P2P Video & Audio** — powered by WebRTC via PeerJS
- 💬 **In-call Chat** — real-time messaging with file sharing
- 🖥️ **Screen Sharing** — present anything directly from your browser
- ✍️ **Collaborative Whiteboard** — draw and sync in real time
- 🎉 **Emoji Reactions** — live floating reactions (including a 🦀 that crawls across the screen)
- ✋ **Raise Hand** — notify the host without interrupting
- 🔐 **Lobby System** — host admits or denies participants before they join
- 🛡️ **Host Moderation** — co-admin roles, kick controls, password-protected rooms
- ⚙️ **Settings Modal** — switch camera/mic devices mid-call
- 🎨 **Adaptive Dark UI** — video grid adjusts from 1 to 5+ participants

---

## 🛠️ Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | HTML, CSS, Vanilla JS, PeerJS     |
| Backend  | Node.js, Express.js               |
| Utilities| UUID, CORS, Body-Parser, Nodemon  |

---

## 🚀 Installation

**Prerequisites:** Node.js v16+

```bash
# 1. Clone the repository
git clone https://github.com/your-username/meetspace.git
cd meetspace

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

> Use `npm run dev` to start with auto-reload via Nodemon.

---

## 📖 Usage

1. Open the app and log in (or use Google sign-in).
2. Choose **Host a Meeting** or **Join a Meeting**.
3. **Host** — a unique Meeting ID and password are generated automatically. Share them with participants.
4. **Join** — enter the Meeting ID and password to request access.
5. The host admits participants from the lobby, and the call begins.

---

## 📁 Folder Structure

```
meetspace/
├── client/
│   └── index.html        # Entire frontend (single file)
├── server/
│   └── server.js         # Express backend & API routes
├── package.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push and open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

> Built with ❤️ during a CodeAlpha internship.

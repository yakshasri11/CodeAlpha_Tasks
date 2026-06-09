const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dir = path.join(__dirname, '../uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(file.originalname))
});
const fileFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/.test(path.extname(file.originalname).toLowerCase());
  cb(null, ok);
};
module.exports = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

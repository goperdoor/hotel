import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { uploadBuffer } from '../utils/cloudinary.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

router.post('/', auth(['owner','admin']), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await uploadBuffer(req.file.buffer);
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    console.error('Upload error', e);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;

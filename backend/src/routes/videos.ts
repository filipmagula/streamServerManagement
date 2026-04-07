import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config';
import db from '../db';
import { Video } from '../types';

const router = Router();

// Configure multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(config.videoDir)) {
      fs.mkdirSync(config.videoDir, { recursive: true });
    }
    cb(null, config.videoDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage });

// GET all videos
router.get('/', (req, res) => {
  const videos = db.prepare('SELECT * FROM videos ORDER BY created_at DESC').all();
  res.json(videos);
});

// POST register existing file or URL
router.post('/register', async (req, res) => {
  const { name, source_path } = req.body;
  if (!name || !source_path) return res.status(400).json({ error: 'Missing name or source_path' });

  try {
    const duration = await getDuration(source_path);
    const id = uuidv4();
    db.prepare('INSERT INTO videos (id, name, source_path, duration_seconds) VALUES (?, ?, ?, ?)')
      .run(id, name, source_path, duration);
    
    res.json({ id, name, source_path, duration_seconds: duration });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to probe video: ' + e.message });
  }
});

// POST upload file
router.post('/upload', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { name } = req.body;
  const source_path = req.file.path;

  try {
    const duration = await getDuration(source_path);
    const id = uuidv4();
    db.prepare('INSERT INTO videos (id, name, source_path, duration_seconds) VALUES (?, ?, ?, ?)')
      .run(id, name || req.file.originalname, source_path, duration);
    
    res.json({ id, name: name || req.file.originalname, source_path, duration_seconds: duration });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to probe video: ' + e.message });
  }
});

// DELETE video
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(id) as Video;
  
  if (video && fs.existsSync(video.source_path) && video.source_path.startsWith(config.videoDir)) {
    try { fs.unlinkSync(video.source_path); } catch (e) {}
  }

  db.prepare('DELETE FROM videos WHERE id = ?').run(id);
  res.status(204).end();
});

function getDuration(sourcePath: string): Promise<number | null> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(sourcePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration || null);
    });
  });
}

export default router;

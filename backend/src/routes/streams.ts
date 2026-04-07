import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { streamService } from '../services/streamService';
import { Stream } from '../types';

const router = Router();

// GET all streams
router.get('/', (req, res) => {
  const streams = streamService.getAllStreams();
  res.json(streams);
});

// POST create new stream placeholder
router.post('/', (req, res) => {
  const { rtsp_path, loop } = req.body;
  if (!rtsp_path) return res.status(400).json({ error: 'Missing rtsp_path' });

  const id = uuidv4();
  db.prepare('INSERT INTO streams (id, rtsp_path, loop, state) VALUES (?, ?, ?, ?)')
    .run(id, rtsp_path, loop ? 1 : 0, 'idle');
  
  res.json({ id, rtsp_path, loop: !!loop, state: 'idle' });
});

// POST start stream
router.post('/:id/start', async (req, res) => {
  const { id } = req.params;
  const { videoId, loop } = req.body;
  
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  try {
    await streamService.startStream(id, videoId, { loop });
    res.json({ status: 'started' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST stop stream
router.post('/:id/stop', async (req, res) => {
  const { id } = req.params;
  try {
    await streamService.stopStream(id);
    res.json({ status: 'stopped' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH update loop
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { loop } = req.body;
  
  if (loop !== undefined) {
    db.prepare('UPDATE streams SET loop = ? WHERE id = ?').run(loop ? 1 : 0, id);
  }
  
  res.json({ id, loop });
});

// DELETE stream
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await streamService.stopStream(id);
  db.prepare('DELETE FROM streams WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;

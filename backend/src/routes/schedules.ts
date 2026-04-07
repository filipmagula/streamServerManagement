import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { schedulerService } from '../services/scheduler';
import { Schedule } from '../types';

const router = Router();

// GET all schedules
router.get('/', (req, res) => {
  const schedules = db.prepare('SELECT * FROM schedules ORDER BY start_at ASC').all();
  res.json(schedules);
});

// POST Create schedule
router.post('/', (req, res) => {
  const { stream_id, video_id, start_at, end_at, loop } = req.body;
  
  if (!stream_id || !video_id || !start_at || !end_at) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = uuidv4();
  const schedule: Schedule = {
    id,
    stream_id,
    video_id,
    start_at,
    end_at,
    loop: loop ? 1 : 0,
    active: 1
  };

  db.prepare(`
    INSERT INTO schedules (id, stream_id, video_id, start_at, end_at, loop, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, stream_id, video_id, start_at, end_at, schedule.loop, schedule.active);

  schedulerService.schedule(schedule);
  res.json(schedule);
});

// PATCH update schedule
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id) as Schedule;
  if (!existing) return res.status(404).json({ error: 'Schedule not found' });

  const updated = { ...existing, ...updates };
  
  db.prepare(`
    UPDATE schedules 
    SET stream_id = ?, video_id = ?, start_at = ?, end_at = ?, loop = ?, active = ?
    WHERE id = ?
  `).run(
    updated.stream_id, 
    updated.video_id, 
    updated.start_at, 
    updated.end_at, 
    updated.loop, 
    updated.active, 
    id
  );

  schedulerService.updateSchedule(updated);
  res.json(updated);
});

// DELETE schedule
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  schedulerService.unschedule(id);
  db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;

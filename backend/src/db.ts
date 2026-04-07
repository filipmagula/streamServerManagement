import Database from 'better-sqlite3';
import { config } from './config';
import fs from 'fs';
import path from 'path';

// Ensure directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');

// Migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_path TEXT NOT NULL,
    duration_seconds REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS streams (
    id TEXT PRIMARY KEY,
    video_id TEXT,
    rtsp_path TEXT NOT NULL,
    loop INTEGER DEFAULT 1,
    state TEXT DEFAULT 'idle',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(video_id) REFERENCES videos(id)
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    stream_id TEXT,
    video_id TEXT,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    loop INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(stream_id) REFERENCES streams(id),
    FOREIGN KEY(video_id) REFERENCES videos(id)
  );
`);


export default db;

import db from '../db';
import { ffmpegManager } from './ffmpegManager';
import { mqttService } from '../mqtt';
import { Video, Stream } from '../types';

class StreamService {
  async startStream(streamId: string, videoId: string, options: { loop?: boolean } = {}) {
    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId) as Video;
    if (!video) throw new Error('Video not found');

    const stream = db.prepare('SELECT * FROM streams WHERE id = ?').get(streamId) as Stream;
    if (!stream) throw new Error('Stream not found');

    const loop = options.loop !== undefined ? options.loop : !!stream.loop;

    // Stop existing if any
    ffmpegManager.stop(streamId);

    // Start FFmpeg
    ffmpegManager.start(
      streamId,
      videoId,
      video.source_path,
      stream.rtsp_path,
      loop
    );

    // Update DB
    db.prepare('UPDATE streams SET video_id = ?, state = ?, loop = ? WHERE id = ?')
      .run(videoId, 'active', loop ? 1 : 0, streamId);
  }

  async stopStream(streamId: string) {
    ffmpegManager.stop(streamId);
    db.prepare('UPDATE streams SET state = ?, video_id = NULL WHERE id = ?')
      .run('idle', streamId);
  }

  handleMqttCommands() {
    mqttService.onCommand((topic, payload) => {
      // topic: environ/video/{id}/command
      const parts = topic.split('/');
      const streamId = parts[2];
      const { action, videoId, loop } = payload;

      try {
        switch (action) {
          case 'START':
            if (videoId) this.startStream(streamId, videoId, { loop });
            break;
          case 'STOP':
            this.stopStream(streamId);
            break;
          case 'SWITCH':
            if (videoId) this.startStream(streamId, videoId, { loop });
            break;
          default:
            console.warn(`Unknown MQTT action: ${action}`);
        }
      } catch (e: any) {
        console.error(`Error handling MQTT command for ${streamId}:`, e.message);
        mqttService.publishStatus(streamId, { state: 'error', error: e.message });
      }
    });
  }

  getAllStreams() {
    const streams = db.prepare(`
      SELECT s.*, v.name as video_name 
      FROM streams s 
      LEFT JOIN videos v ON s.video_id = v.id
    `).all() as (Stream & { video_name?: string })[];
    
    return streams.map(s => ({
      ...s,
      active: ffmpegManager.isRunning(s.id)
    }));
  }
}

export const streamService = new StreamService();

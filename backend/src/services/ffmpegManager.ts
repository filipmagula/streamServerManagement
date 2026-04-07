import ffmpeg from 'fluent-ffmpeg';
import { mqttService } from '../mqtt';
import { config } from '../config';
import { ProgressData } from '../types';

interface ManagedProcess {
  command: ffmpeg.FfmpegCommand;
  streamId: string;
  videoId: string;
  inputPath: string;
  rtspPath: string;
  loop: boolean;
}

class FfmpegManager {
  private processes: Map<string, ManagedProcess> = new Map();

  start(streamId: string, videoId: string, inputPath: string, rtspPath: string, loop: boolean) {
    if (this.processes.has(streamId)) {
      this.stop(streamId);
    }

    const fullRtspUrl = `${config.rtspServer}/${rtspPath}`;
    
    const command = ffmpeg(inputPath)
      .inputOptions(loop ? ['-stream_loop', '-1', '-re'] : ['-re'])
      .outputOptions([
        '-c:v libx264',
        '-preset superfast',
        '-tune zerolatency',
        '-crf 18',
        '-g 20',
        '-keyint_min 20',
        '-sc_threshold 0',
        '-bf 0',
        '-pix_fmt yuv420p',
        '-maxrate 2M',
        '-bufsize 4M',
        '-c:a aac',
        '-b:a 128k',
        '-ar 44100',
        '-f rtsp',
        '-rtsp_transport tcp'
      ])
      .output(fullRtspUrl);

    command.on('start', (commandLine) => {
      console.log(`FFmpeg started for ${streamId}: ${commandLine}`);
      mqttService.publishStatus(streamId, { state: 'active', videoId });
    });

    command.on('progress', (progress: ProgressData) => {
      mqttService.publishStatus(streamId, { 
        state: 'active', 
        videoId,
        position: progress.timemark,
        percent: progress.percent,
        fps: progress.currentFps
      });
    });

    command.on('error', (err, stdout, stderr) => {
      if (!err.message.includes('SIGKILL') && !err.message.includes('ffmpeg exited with code 1')) {
        console.error(`FFmpeg error for ${streamId}:`, err.message);
        mqttService.publishStatus(streamId, { state: 'error', error: err.message });
      }
      this.processes.delete(streamId);
    });

    command.on('end', () => {
      console.log(`FFmpeg ended for ${streamId}`);
      if (!loop) {
        mqttService.publishStatus(streamId, { state: 'idle', videoId: null });
        this.processes.delete(streamId);
      }
    });

    command.run();

    this.processes.set(streamId, {
      command,
      streamId,
      videoId,
      inputPath,
      rtspPath,
      loop
    });
  }

  stop(streamId: string) {
    const managed = this.processes.get(streamId);
    if (managed) {
      managed.command.kill('SIGKILL');
      this.processes.delete(streamId);
      mqttService.publishStatus(streamId, { state: 'idle', videoId: null });
    }
  }

  isRunning(streamId: string): boolean {
    return this.processes.has(streamId);
  }

  killAll() {
    for (const streamId of this.processes.keys()) {
      this.stop(streamId);
    }
  }
}

export const ffmpegManager = new FfmpegManager();

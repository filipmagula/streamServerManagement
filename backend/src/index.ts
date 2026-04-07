import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { mqttService } from './mqtt';
import { streamService } from './services/streamService';
import { schedulerService } from './services/scheduler';
import videoRoutes from './routes/videos';
import streamRoutes from './routes/streams';
import scheduleRoutes from './routes/schedules';
import { ffmpegManager } from './services/ffmpegManager';

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // For development and RTSP/WebRTC embedding
}));
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Routes
app.use('/api/videos', videoRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const start = async () => {
  try {
    // Initialize services
    mqttService.connect();
    streamService.handleMqttCommands();
    await schedulerService.init();

    app.listen(config.port, () => {
      console.log(`Backend server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Cleaning up...');
  ffmpegManager.killAll();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Cleaning up...');
  ffmpegManager.killAll();
  process.exit(0);
});

start();

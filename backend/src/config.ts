export const config = {
  port: process.env.PORT || 3000,
  mqttUrl: process.env.MQTT_URL || 'mqtt://localhost:1883',
  rtspServer: process.env.RTSP_SERVER || 'rtsp://localhost:8554',
  videoDir: process.env.VIDEO_DIR || './videos',
  dbPath: process.env.DB_PATH || '/app/data/database.sqlite',
  thumbnailDir: process.env.THUMBNAIL_DIR || '/app/data/thumbnails',
};

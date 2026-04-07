export interface Video {
  id: string;
  name: string;
  source_path: string;
  duration_seconds: number | null;
  created_at: string;
}

export interface Stream {
  id: string;
  video_id: string | null;
  video_name?: string; // Added to fix build error
  rtsp_path: string;
  loop: number;
  state: 'idle' | 'active' | 'error' | 'scheduled';
  active: boolean; // Computed or from backend
  position?: string;
  percent?: number;
  fps?: number;
  bitrate?: number; // Added to fix build error
}

export interface Schedule {
  id: string;
  stream_id: string;
  video_id: string;
  start_at: string;
  end_at: string;
  loop: number;
  active: number;
}

export interface MqttMessage {
  topic: string;
  payload: any;
  timestamp: number;
}

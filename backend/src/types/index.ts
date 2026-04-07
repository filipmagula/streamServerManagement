export interface Video {
  id: string;
  name: string;
  source_path: string;
  duration_seconds: number | null;
  created_at?: string;
}

export interface Stream {
  id: string;
  video_id: string | null;
  rtsp_path: string;
  loop: number; // 0 or 1
  state: 'idle' | 'active' | 'error' | 'scheduled';
  created_at?: string;
}

export interface Schedule {
  id: string;
  stream_id: string;
  video_id: string;
  start_at: string;
  end_at: string;
  loop: number;
  active: number;
  created_at?: string;
}

export interface ProgressData {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent?: number;
}

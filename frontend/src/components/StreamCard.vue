<script setup lang="ts">
import { computed } from 'vue'
import type { Stream } from '@/types'
import { useStreamsStore } from '@/stores/streams'

const props = defineProps<{
  stream: Stream
}>()

const streamsStore = useStreamsStore()

const thumbnailUrl = computed(() => {
  if (!props.stream.video_id) return null
  return `/api/videos/${props.stream.video_id}/thumbnail?t=${Date.now()}` // Add timestamp to prevent caching if video changes
})

const stateLabel = computed(() => {
  return props.stream.state.charAt(0).toUpperCase() + props.stream.state.slice(1)
})

const stateClass = computed(() => {
  return {
    'status-active': props.stream.state === 'active',
    'status-idle': props.stream.state === 'idle',
    'status-error': props.stream.state === 'error'
  }
})

const toggleLoop = () => {
  streamsStore.updateLoop(props.stream.id, props.stream.loop === 0)
}
</script>

<template>
  <div class="stream-card horizontal glass-card" :class="{ 'card-active': stream.state === 'active' }">
    <div class="card-image">
      <img v-if="thumbnailUrl" :src="thumbnailUrl" :alt="stream.video_name" class="thumbnail" />
      <div v-else class="thumbnail-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
          <line x1="7" y1="2" x2="7" y2="22"></line>
          <line x1="17" y1="2" x2="17" y2="22"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line>
        </svg>
      </div>
      <div class="state-overlay" :class="stateClass">
        <span v-if="stream.state === 'active'" class="state-dot"></span>
        {{ stateLabel }}
      </div>
      <div v-if="stream.fps" class="fps-overlay">{{ typeof stream.fps === 'number' ? stream.fps.toFixed(1) : stream.fps }} FPS</div>
    </div>

    <div class="card-content">
      <div class="card-header">
        <div class="meta">
          <div class="meta-tags">
            <span class="video-label">{{ stream.video_name || 'No Video' }}</span>
            <span v-if="stream.bitrate" class="bitrate-badge">{{ stream.bitrate }} Kbps</span>
          </div>
          <h3>{{ stream.rtsp_path }}</h3>
        </div>
        <div class="actions">
          <button v-if="stream.state === 'active'" class="btn-icon stop-btn" title="Stop Stream" @click="streamsStore.stopStream(stream.id)">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"></rect>
            </svg>
          </button>
          <button class="btn-icon" :class="{ 'active-loop': stream.loop === 1 }" @click="toggleLoop" title="Toggle Loop">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="progress-info">
          <div class="progress-text">
            <span>{{ stream.position || '00:00:00' }}</span>
            <span>{{ typeof stream.percent === 'number' ? stream.percent.toFixed(1) : (stream.percent || 0) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (stream.percent || 0) + '%' }"></div>
          </div>
        </div>
        
        <div class="url-container">
          <span class="url-label">RTSP URL</span>
          <code class="rtsp-url">rtsp://mediamtx:8554/{{ stream.rtsp_path }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stream-card {
  display: flex;
  gap: 0;
  padding: 0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
  min-height: 200px;
}

.stream-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-primary);
}

.card-active {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 1px var(--accent-primary), var(--shadow);
}

.card-image {
  position: relative;
  flex: 0 1 220px;
  min-width: 140px;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.stream-card:hover .thumbnail {
  transform: scale(1.05);
}

.thumbnail-placeholder {
  color: #4b5563;
  width: 48px;
  height: 48px;
  opacity: 0.3;
}

.state-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  backdrop-filter: blur(8px);
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white !important;
  z-index: 2;
}

.state-overlay.status-active {
  background: rgba(16, 185, 129, 0.85); /* Success Green */
}

.state-overlay.status-idle {
  background: rgba(107, 114, 128, 0.8); /* Muted Gray */
}

.state-overlay.status-error {
  background: rgba(239, 68, 68, 0.85); /* Error Red */
}

.state-dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: pulse-white 1.5s infinite;
}

.fps-overlay {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

@keyframes pulse-white {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}

.card-content {
  flex: 1 1 200px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: white;
  min-width: 0; /* Critical for flex items with text overflow */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-tags {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.video-label {
  font-size: 0.625rem;
  font-weight: 800;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: block;
}

.meta h3 {
  margin-bottom: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bitrate-badge {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
  background: var(--bg-deep);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.status-active { color: var(--success); background: #f0fdf4; border: 1px solid #dcfce7; }
.status-idle { color: var(--text-muted); background: var(--bg-deep); border: 1px solid var(--border); }
.status-error { color: var(--error); background: #fef2f2; border: 1px solid #fee2e2; }

.dot { width: 6px; height: 6px; border-radius: 50%; }
.dot-online { 
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.btn-icon {
  background: white;
  border: 1px solid var(--border);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.btn-icon:hover { 
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--accent-soft);
}

.stop-btn {
  background: #fef2f2;
  border-color: #fee2e2;
  color: var(--error);
}

.stop-btn:hover {
  background: var(--error);
  color: white;
  border-color: var(--error);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.active-loop { 
  border-color: var(--accent-primary); 
  background: var(--accent-soft);
  color: var(--accent-primary);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
}

.progress-bar {
  height: 6px;
  background: var(--bg-deep);
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-primary);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 100px;
}

.url-container {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.url-label {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rtsp-url {
  font-size: 0.75rem;
  color: var(--accent-primary);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--accent-soft);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.rtsp-url:hover {
  border-color: var(--accent-primary);
  background: white;
}

@media (max-width: 800px) {
  .stream-card {
    flex-direction: column;
  }
  .card-image {
    width: 100%;
    height: 180px;
  }
}
</style>

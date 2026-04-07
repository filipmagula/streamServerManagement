<script setup lang="ts">
import { computed } from 'vue'
import type { Stream } from '@/types'
import { useStreamsStore } from '@/stores/streams'

const props = defineProps<{
  stream: Stream
}>()

const streamsStore = useStreamsStore()

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
  <div class="stream-card glass-card">
    <div class="card-header">
      <div class="meta">
        <h3>{{ stream.rtsp_path }}</h3>
        <span class="badge" :class="stateClass">
          <div v-if="stream.state === 'active'" class="dot dot-online"></div>
          {{ stateLabel }}
        </span>
      </div>
      <div class="actions">
        <button v-if="stream.state === 'active'" class="btn-icon" @click="streamsStore.stopStream(stream.id)">
          ⏹️
        </button>
        <button class="btn-icon" :class="{ 'active-loop': stream.loop === 1 }" @click="toggleLoop" title="Toggle Loop">
          🔁
        </button>
      </div>
    </div>

    <div class="card-body">
      <div class="progress-info">
        <div class="progress-text">
          <span>{{ stream.position || '00:00:00' }}</span>
          <span v-if="stream.fps" class="fps">{{ stream.fps }} FPS</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (stream.percent || 0) + '%' }"></div>
        </div>
      </div>
      
      <div class="preview-placeholder">
        <p v-if="stream.state !== 'active'">Stream offline</p>
        <div v-else class="preview-active">
          <!-- Small live snapshot or WebRTC preview could go here -->
          <div class="preview-overlay">
            <span>LIVE</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <code class="rtsp-url">rtsp://mediamtx:8554/{{ stream.rtsp_path }}</code>
    </div>
  </div>
</template>

<style scoped>
.stream-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.meta h3 {
  margin-bottom: 0.25rem;
  font-size: 1.125rem;
  font-weight: 700;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.625rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  background: #f1f5f9;
}

.status-active { color: #065f46; background: #d1fae5; }
.status-idle { color: #475569; background: #f1f5f9; }
.status-error { color: #991b1b; background: #fee2e2; }

.dot { width: 6px; height: 6px; border-radius: 50%; }
.dot-online { background: #10b981; }

.actions {
  display: flex;
  gap: 0.375rem;
}

.btn-icon {
  background: white;
  border: 1px solid var(--border);
  padding: 0.375rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-size: 1.125rem;
  line-height: 1;
}

.btn-icon:hover { 
  background: var(--bg-deep); 
  border-color: #cbd5e1;
}

.active-loop { 
  border-color: var(--accent-primary); 
  background: #eff6ff !important;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
}

.fps { 
  color: var(--accent-primary);
  font-weight: 700;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-primary);
  transition: width 0.3s ease;
}

.preview-placeholder {
  height: 200px;
  background: #f1f5f9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.preview-active {
  width: 100%;
  height: 100%;
  background: #000;
}

.preview-overlay {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: var(--error);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.625rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.rtsp-url {
  font-size: 0.6875rem;
  color: var(--text-muted);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #f8fafc;
  padding: 0.375rem;
  border-radius: 4px;
}
</style>

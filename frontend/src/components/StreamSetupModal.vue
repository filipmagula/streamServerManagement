<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useVideosStore } from '@/stores/videos'

const props = defineProps<{
  show: boolean
  defaultPath: string
  title: string
  initialVideoId?: string
}>()

const emit = defineEmits<{
  (e: 'confirm', data: { videoId: string, path: string, loop: boolean }): void
  (e: 'close'): void
}>()

const videosStore = useVideosStore()
const videoId = ref('')
const path = ref('')
const loop = ref(true)

onMounted(() => {
  path.value = props.defaultPath
  if (props.initialVideoId) {
    videoId.value = props.initialVideoId
  }
  videosStore.fetchVideos()
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    path.value = props.defaultPath
    videoId.value = props.initialVideoId || ''
  }
})

const handleConfirm = () => {
  if (path.value.trim() && videoId.value) {
    emit('confirm', { videoId: videoId.value, path: path.value, loop: loop.value })
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content glass-card">
        <header class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div class="modal-body">
          <div class="form-group">
            <label>Select Video</label>
            <select v-model="videoId" class="select-input">
              <option value="" disabled>Choose a video from library...</option>
              <option v-for="video in videosStore.videos" :key="video.id" :value="video.id">
                {{ video.name }}
              </option>
            </select>
            <p v-if="videosStore.videos.length === 0" class="help-text error">No videos found. Upload a video first.</p>
          </div>

          <div class="form-group">
            <label>RTSP Path Name</label>
            <div class="input-wrapper">
              <span class="prefix">rtsp://server/</span>
              <input 
                v-model="path" 
                type="text" 
                placeholder="e.g. stream1" 
                @keyup.enter="handleConfirm"
                autofocus
              />
            </div>
            <p class="help-text">This will be the endpoint for your RTSP stream.</p>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <div class="checkbox-wrapper">
                <input v-model="loop" type="checkbox" />
                <span class="checkbox-custom"></span>
              </div>
              <div class="label-text">
                <span class="primary-label">Loop automatically</span>
                <span class="secondary-label">Restart the video when it reaches the end.</span>
              </div>
            </label>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn btn-ghost" @click="emit('close')">Cancel</button>
          <button class="btn btn-primary" @click="handleConfirm" :disabled="!path.trim() || !videoId">
             <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <polygon points="5 3 19 12 5 21 5 3"></polygon>
             </svg>
             Start Broadcast
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: white;
  padding: 0;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  background: var(--bg-deep);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 800;
}

.close-btn {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  width: 32px;
  height: 32px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #fee2e2;
  color: var(--error);
  border-color: #fecaca;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: white;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.prefix {
  padding: 0 1rem;
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  border-right: 1px solid var(--border);
  background: var(--bg-deep);
  height: 44px;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: white;
  font-size: 0.875rem;
  color: var(--text-main);
  outline: none;
  height: 44px;
  font-weight: 600;
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding-left: 0.25rem;
}

.help-text.error {
  color: var(--error);
}

.select-input {
  padding: 0.75rem 1rem;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 0.875rem;
  font-weight: 600;
  width: 100%;
  transition: all 0.2s ease;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.25rem;
}

.select-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px var(--accent-soft);
  background-color: white;
}

.checkbox-group {
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  padding: 1rem;
  background: var(--bg-deep);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.checkbox-label:hover {
  border-color: var(--accent-primary);
}

.checkbox-wrapper {
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.checkbox-wrapper input {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: absolute;
  z-index: 2;
}

.checkbox-custom {
  position: absolute;
  top: 0;
  left: 0;
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border: 2px solid var(--border);
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkbox-wrapper input:checked + .checkbox-custom {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  transform: scale(1.05);
}

.checkbox-wrapper input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 0.45rem;
  top: 0.15rem;
  width: 0.35rem;
  height: 0.7rem;
  border: solid white;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg);
}

.label-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.primary-label {
  font-size: 0.875rem;
  font-weight: 800;
  color: var(--text-main);
}

.secondary-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  background: var(--bg-deep);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--border);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}
</style>

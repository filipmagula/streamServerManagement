<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVideosStore } from '@/stores/videos'
import { useStreamsStore } from '@/stores/streams'
import StreamSetupModal from '@/components/StreamSetupModal.vue'
import type { Video } from '@/types'

const videosStore = useVideosStore()
const streamsStore = useStreamsStore()
const router = useRouter()

const showUpload = ref(false)
const uploadName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const rtspPath = ref('')
const selectedVideoId = ref('')

const showStreamSetup = ref(false)
const setupStreamVideo = ref<Video | null>(null)
const setupError = ref('')

onMounted(async () => {
  await videosStore.fetchVideos()
  await streamsStore.fetchStreams()
})

const handleUpload = async () => {
  if (fileInput.value?.files?.[0]) {
    await videosStore.uploadVideo(fileInput.value.files[0], uploadName.value)
    showUpload.value = false
    uploadName.value = ''
  }
}

const openStreamSetup = (video: Video) => {
  setupStreamVideo.value = video
  showStreamSetup.value = true
  setupError.value = ''
}

const confirmStreamSetup = async (data: { path: string, loop: boolean }) => {
  if (!setupStreamVideo.value) return
  
  try {
    let stream = streamsStore.streams.find(s => s.rtsp_path === data.path)
    
    if (!stream) {
      stream = await streamsStore.createStream(data.path, data.loop)
    }
    
    if (!stream) {
      throw new Error('Could not create or find stream')
    }
    
    // Start the stream
    await streamsStore.startStream(stream.id, setupStreamVideo.value.id, data.loop)
    
    showStreamSetup.value = false
    router.push('/dashboard')
  } catch (e: any) {
    setupError.value = e.message
  }
}

const formatDuration = (seconds: number | null) => {
  if (!seconds) return '--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
</script>

<template>
  <div class="library">
    <header class="header">
      <div>
        <h1 class="text-main">Video Library</h1>
        <p class="text-muted">Manage your source media and start broadcasts.</p>
      </div>
      <button class="btn btn-primary" @click="showUpload = !showUpload">
        {{ showUpload ? 'Cancel' : '➕ Add Video' }}
      </button>
    </header>

    <div v-if="showUpload" class="upload-panel glass-card">
      <h3>Upload Video</h3>
      <div class="form-group">
        <label>Display Name</label>
        <input v-model="uploadName" type="text" placeholder="e.g. Cinematic Loop" />
      </div>
      <div class="form-group">
        <label>File</label>
        <input ref="fileInput" type="file" accept="video/*" class="file-input" />
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" @click="handleUpload" :disabled="videosStore.loading">
          {{ videosStore.loading ? 'Uploading...' : 'Upload' }}
        </button>
      </div>
    </div>

    <div class="video-list glass-card">
      <div v-if="videosStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Refreshing library...</p>
      </div>
      <table v-else-if="videosStore.videos.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Path</th>
            <th>Duration</th>
            <th>Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="video in videosStore.videos" :key="video.id">
            <td><strong>{{ video.name }}</strong></td>
            <td><code class="path-code">{{ video.source_path }}</code></td>
            <td>{{ formatDuration(video.duration_seconds) }}</td>
            <td class="text-muted">{{ new Date(video.created_at).toLocaleDateString() }}</td>
            <td class="actions">
              <button class="btn-action" @click="openStreamSetup(video)" title="Quick Steam">🚀</button>
              <button class="btn-action btn-danger" @click="videosStore.deleteVideo(video.id)" title="Delete">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-list">
        <p>Your library is empty. Upload a video to get started.</p>
      </div>
    </div>

    <StreamSetupModal 
      :show="showStreamSetup"
      :default-path="streamsStore.streams[0]?.rtsp_path || 'stream1'"
      title="Start New Broadcast"
      @close="showStreamSetup = false"
      @confirm="confirmStreamSetup"
    />
    
    <div v-if="setupError" class="error-toast glass-card">
      <span>⚠️ {{ setupError }}</span>
      <button @click="setupError = ''">&times;</button>
    </div>
  </div>
</template>

<style scoped>
.library {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-panel {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-group input {
  padding: 0.625rem 0.75rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-main);
  font-size: 0.875rem;
  transition: all 0.1s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.file-input {
  padding: 0.5rem 0 !important;
  border: none !important;
  background: transparent !important;
}

.video-list {
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 0.875rem 1.5rem;
  background: #f8fafc;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

td {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
  font-size: 0.875rem;
  color: var(--text-main);
}

.path-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--accent-primary);
  background: #eff6ff;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: white;
  border: 1px solid var(--border);
  padding: 0.375rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-size: 1rem;
}

.btn-action:hover {
  background: var(--bg-deep);
  border-color: #cbd5e1;
}

.btn-danger:hover { 
  background: #fff1f2; 
  border-color: #fecaca;
  color: var(--error);
}

.empty-list, .loading-state {
  padding: 4rem;
  text-align: center;
  color: var(--text-muted);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--bg-deep);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  background: white;
  border-left: 4px solid var(--error);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2000;
  box-shadow: var(--shadow);
}

.error-toast button {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
}
</style>

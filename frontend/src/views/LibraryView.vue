<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVideosStore } from '@/stores/videos'
import { useStreamsStore } from '@/stores/streams'
import { useSearchStore } from '@/stores/search'
import StreamSetupModal from '@/components/StreamSetupModal.vue'
import type { Video } from '@/types'

const videosStore = useVideosStore()
const streamsStore = useStreamsStore()
const searchStore = useSearchStore()
const router = useRouter()

const showUpload = ref(false)
const uploadName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedVideoId = ref('')

const showStreamSetup = ref(false)
const setupStreamVideo = ref<Video | null>(null)
const setupError = ref('')

const filteredVideos = computed(() => {
  if (!searchStore.query) return videosStore.videos
  const q = searchStore.query.toLowerCase()
  return videosStore.videos.filter(v => 
    v.name.toLowerCase().includes(q) || 
    v.source_path.toLowerCase().includes(q)
  )
})

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

const openStreamSetup = (video?: Video) => {
  setupStreamVideo.value = video || null
  showStreamSetup.value = true
  setupError.value = ''
}

const confirmStreamSetup = async (data: { videoId: string, path: string, loop: boolean }) => {
  try {
    let stream = streamsStore.streams.find(s => s.rtsp_path === data.path)
    
    if (!stream) {
      stream = await streamsStore.createStream(data.path, data.loop)
    }
    
    if (!stream) {
      throw new Error('Could not create or find stream')
    }
    
    // Start the stream
    await streamsStore.startStream(stream.id, data.videoId, data.loop)
    
    showStreamSetup.value = false
    router.push('/')
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
      <div class="header-actions">
        <button class="btn btn-secondary" @click="openStreamSetup()">
          <svg style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Add Stream
        </button>
        <button class="btn btn-primary" @click="showUpload = !showUpload">
          <svg v-if="!showUpload" style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span v-else>&times;</span>
          {{ showUpload ? 'Cancel' : 'Add Video' }}
        </button>
      </div>
    </header>

    <Transition name="fade">
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
            <template v-if="videosStore.loading">
              <div class="spinner-sm"></div>
              Uploading...
            </template>
            <template v-else>
              Upload
            </template>
          </button>
        </div>
      </div>
    </Transition>

    <div class="video-list glass-card">
      <div v-if="videosStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Refreshing library...</p>
      </div>
      <div v-else-if="filteredVideos.length > 0" class="table-container">
        <table>
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
            <tr v-for="video in filteredVideos" :key="video.id">
              <td>
                <div class="video-name">
                  <div class="video-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                      <line x1="7" y1="2" x2="7" y2="22"></line>
                      <line x1="17" y1="2" x2="17" y2="22"></line>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <line x1="2" y1="7" x2="7" y2="7"></line>
                      <line x1="2" y1="17" x2="7" y2="17"></line>
                      <line x1="17" y1="17" x2="22" y2="17"></line>
                      <line x1="17" y1="7" x2="22" y2="7"></line>
                    </svg>
                  </div>
                  <strong>{{ video.name }}</strong>
                </div>
              </td>
              <td><code class="path-code">{{ video.source_path }}</code></td>
              <td>{{ formatDuration(video.duration_seconds) }}</td>
              <td class="text-muted">{{ new Date(video.created_at).toLocaleDateString() }}</td>
              <td class="actions">
                <button class="btn-action btn-danger" @click="videosStore.deleteVideo(video.id)" title="Delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-list">
        <svg style="width:64px;height:64px;opacity:0.2;margin-bottom:1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          <line x1="12" y1="11" x2="12" y2="17"></line>
          <line x1="9" y1="14" x2="15" y2="14"></line>
        </svg>
        <p v-if="searchStore.query">No videos matching "{{ searchStore.query }}"</p>
        <p v-else>Your library is empty. Upload a video to get started.</p>
      </div>
    </div>

    <StreamSetupModal 
      :show="showStreamSetup"
      :default-path="streamsStore.streams[0]?.rtsp_path || 'stream1'"
      title="Start New Broadcast"
      @close="showStreamSetup = false"
      @confirm="confirmStreamSetup"
      :initial-video-id="setupStreamVideo?.id"
    />
    
    <div v-if="setupError" class="error-toast glass-card">
      <div class="error-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ setupError }}</span>
      </div>
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.upload-panel {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 500px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input {
  padding: 0.75rem;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: white;
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.file-input {
  padding: 0.5rem 0 !important;
  border: none !important;
  background: transparent !important;
}

.video-list {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 1rem 1.5rem;
  background: var(--accent-soft);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border);
  font-size: 0.875rem;
  color: var(--text-main);
}

.video-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.video-icon {
  width: 32px;
  height: 32px;
  background: var(--accent-soft);
  color: var(--accent-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
}

.path-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--accent-secondary);
  background: var(--bg-deep);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action {
  width: 36px;
  height: 36px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
  padding: 8px;
}

.btn-action svg {
  width: 100%;
  height: 100%;
}

.btn-action:hover {
  background: var(--accent-soft);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.btn-action.btn-danger:hover { 
  background: #fff1f2; 
  border-color: var(--error);
  color: var(--error);
}

.empty-list, .loading-state {
  padding: 5rem;
  text-align: center;
  color: var(--text-muted);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--accent-soft);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1.25rem 1.5rem;
  background: white;
  border-left: 4px solid var(--error);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 2000;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-md);
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--text-main);
}

.error-content svg {
  width: 20px;
  height: 20px;
}

.error-toast button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
}
</style>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useStreamsStore } from '@/stores/streams'
import { useMqttStore } from '@/stores/mqtt'
import { useSearchStore } from '@/stores/search'
import StreamCard from '@/components/StreamCard.vue'

const streamsStore = useStreamsStore()
const mqttStore = useMqttStore()
const searchStore = useSearchStore()

const filteredStreams = computed(() => {
  if (!searchStore.query) return streamsStore.streams
  const q = searchStore.query.toLowerCase()
  return streamsStore.streams.filter(s => 
    s.rtsp_path.toLowerCase().includes(q) || 
    s.video_name?.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  await streamsStore.fetchStreams()
  
  // Listen for real-time updates from MQTT
  if (mqttStore.client) {
    mqttStore.client.on('message', (topic, payload) => {
      if (topic.includes('/status')) {
        const parts = topic.split('/')
        const streamId = parts[2]
        const data = JSON.parse(payload.toString())
        streamsStore.updateStreamStateFromMqtt(data, streamId)
      }
    })
  }
})
</script>

<template>
  <div class="dashboard">
    <header class="header">
      <div>
        <h1 class="text-main">Stream Dashboard</h1>
        <p class="text-muted">Monitor and control your live streams in real-time.</p>
      </div>
      <button class="btn btn-primary" @click="streamsStore.fetchStreams">
        <svg style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        Refresh
      </button>
    </header>

    <div v-if="streamsStore.loading" class="loader">
      <div class="spinner"></div>
      <p>Loading streams...</p>
    </div>
    
    <div v-else class="stream-grid">
      <StreamCard 
        v-for="stream in filteredStreams" 
        :key="stream.id" 
        :stream="stream" 
      />
      
      <div v-if="filteredStreams.length === 0" class="empty-state glass-card">
        <svg style="width:48px;height:48px;opacity:0.3;margin-bottom:1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p v-if="searchStore.query">No streams matching "{{ searchStore.query }}"</p>
        <p v-else>No streams configured. Head to the Video Library to start one.</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stream-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1550px) {
  .stream-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1000px) {
  .stream-grid {
    grid-template-columns: 1fr;
  }
}

.empty-state {
  grid-column: 1 / -1;
  padding: 4rem;
  text-align: center;
  color: var(--text-muted);
  border: 2px dashed var(--border);
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: var(--text-muted);
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--accent-soft);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

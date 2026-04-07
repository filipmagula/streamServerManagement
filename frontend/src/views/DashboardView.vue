<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useStreamsStore } from '@/stores/streams'
import { useMqttStore } from '@/stores/mqtt'
import StreamCard from '@/components/StreamCard.vue'
import MqttConsole from '@/components/MqttConsole.vue'

const streamsStore = useStreamsStore()
const mqttStore = useMqttStore()

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
        🔄 Refresh
      </button>
    </header>

    <div v-if="streamsStore.loading" class="loader">Loading streams...</div>
    
    <div v-else class="stream-grid">
      <StreamCard 
        v-for="stream in streamsStore.streams" 
        :key="stream.id" 
        :stream="stream" 
      />
      
      <div v-if="streamsStore.streams.length === 0" class="empty-state glass-card">
        <p>No streams configured. Head to the Video Library to start one.</p>
      </div>
    </div>

    <MqttConsole />
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.stream-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 5rem;
  text-align: center;
  color: var(--text-muted);
  border-style: dashed;
  background: transparent;
}

.loader {
  text-align: center;
  padding: 5rem;
  color: var(--text-muted);
  font-weight: 500;
}
</style>

<script setup lang="ts">
import { ref, onUpdated, nextTick } from 'vue'
import { useMqttStore } from '@/stores/mqtt'

const mqttStore = useMqttStore()
const isExpanded = ref(false)
const consoleEl = ref<HTMLElement | null>(null)

onUpdated(() => {
  if (isExpanded.value && consoleEl.value) {
    nextTick(() => {
      consoleEl.value!.scrollTop = consoleEl.value!.scrollHeight
    })
  }
})

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString()
}

const getTopicColor = (topic: string) => {
  if (topic.includes('/status')) return '#10b981'
  if (topic.includes('/command')) return '#00d4ff'
  if (topic.includes('/config')) return '#f59e0b'
  return '#94a3b8'
}
</script>

<template>
  <div class="mqtt-console glass-card" :class="{ expanded: isExpanded }">
    <div class="console-header" @click="isExpanded = !isExpanded">
      <div class="title">
        <span class="icon">📟</span>
        <span>MQTT Console</span>
        <span class="count">{{ mqttStore.messages.length }} messages</span>
      </div>
      <button class="toggle-btn">{{ isExpanded ? '▼' : '▲' }}</button>
    </div>

    <div v-if="isExpanded" ref="consoleEl" class="console-body">
      <div v-for="(msg, i) in mqttStore.messages" :key="i" class="log-entry">
        <span class="time">[{{ formatTime(msg.timestamp) }}]</span>
        <span class="topic" :style="{ color: getTopicColor(msg.topic) }">{{ msg.topic }}</span>
        <pre class="payload">{{ JSON.stringify(msg.payload, null, 2) }}</pre>
      </div>
      <div v-if="mqttStore.messages.length === 0" class="empty-log">
        Waiting for messages...
      </div>
    </div>
  </div>
</template>

<style scoped>
.mqtt-console {
  position: fixed;
  bottom: 0;
  left: 260px; /* Offset for sidebar */
  right: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: none;
  border-left: none;
  border-right: none;
  border-radius: 0;
  background: white;
  border-top: 1px solid var(--border);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.mqtt-console.expanded {
  height: 400px;
}

.console-header {
  padding: 0.625rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #f8fafc;
  user-select: none;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-main);
}

.count {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-weight: 500;
  background: #e2e8f0;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  margin-left: 0.5rem;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.console-body {
  height: calc(100% - 38px);
  padding: 0;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
}

.log-entry {
  padding: 0.5rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time { 
  color: #94a3b8; 
  font-weight: 500;
  font-size: 0.6875rem;
}

.topic { 
  font-weight: 700; 
  font-size: 0.75rem;
}

.payload { 
  margin: 0;
  padding: 0.5rem 0.75rem; 
  color: #334155;
  white-space: pre-wrap; 
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #f1f5f9;
}

.empty-log {
  padding: 4rem;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
}
</style>

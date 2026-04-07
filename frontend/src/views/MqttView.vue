<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useMqttStore } from '@/stores/mqtt'

const mqttStore = useMqttStore()

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const getTopicBadgeColor = (topic: string) => {
  if (topic.includes('/status')) return 'status-badge'
  if (topic.includes('/command')) return 'command-badge'
  if (topic.includes('/config')) return 'config-badge'
  return 'default-badge'
}

const formatPayload = (payload: any) => {
  if (typeof payload !== 'object' || payload === null) return payload
  
  // If it's an object, return it as it is for the template to handle
  return payload
}

const isObject = (val: any) => {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

const formatValue = (val: any) => {
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val : val.toFixed(1)
  }
  if (typeof val === 'object' && val !== null) {
    return JSON.stringify(val)
  }
  return val
}

onMounted(() => {
  if (!mqttStore.connected) {
    mqttStore.connect()
  }
})
</script>

<template>
  <div class="mqtt-view">
    <header class="view-header glass-card">
      <div class="header-content">
        <div class="title-area">
          <div class="icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
          </div>
          <div>
            <h1>MQTT Console</h1>
            <p class="text-muted">Real-time message traffic for stream control and status monitoring.</p>
          </div>
        </div>
        
        <div class="header-actions">
          <div class="status-indicator" :class="{ 'connected': mqttStore.connected }">
            <div class="dot"></div>
            <span>{{ mqttStore.connected ? 'Connected' : 'Disconnected' }}</span>
          </div>
          <button class="btn btn-ghost" @click="mqttStore.clearMessages" :disabled="mqttStore.messages.length === 0">
            <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear Log
          </button>
        </div>
      </div>
    </header>

    <div class="console-container glass-card">
      <div class="table-wrapper">
        <table class="mqtt-table">
          <thead>
            <tr>
              <th class="col-time">Time</th>
              <th class="col-topic">Topic</th>
              <th class="col-payload">Payload</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(msg, i) in mqttStore.messages" :key="i" class="log-row">
              <td class="col-time">{{ formatTime(msg.timestamp) }}</td>
              <td class="col-topic">
                <span class="topic-badge" :class="getTopicBadgeColor(msg.topic)">
                  {{ msg.topic }}
                </span>
              </td>
              <td class="col-payload">
                <div v-if="isObject(msg.payload)" class="payload-grid">
                  <div v-for="(val, key) in msg.payload" :key="key" class="payload-item">
                    <span class="key">{{ key }}:</span>
                    <span class="val">{{ formatValue(val) }}</span>
                  </div>
                </div>
                <div v-else class="payload-raw">
                  {{ msg.payload }}
                </div>
              </td>
            </tr>
            <tr v-if="mqttStore.messages.length === 0">
              <td colspan="3" class="empty-row">
                <div class="empty-state">
                  <div class="spinner-pulse"></div>
                  <span>Awaiting incoming MQTT messages...</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mqtt-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
}

.view-header {
  padding: 1.5rem;
  overflow: hidden;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-box {
  width: 48px;
  height: 48px;
  background: var(--accent-soft);
  color: var(--accent-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box svg {
  width: 24px;
  height: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-deep);
  padding: 0.5rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
}

.status-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.status-indicator.connected {
  color: var(--success);
}

.status-indicator.connected .dot {
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
}

.console-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  padding: 0;
  overflow: hidden;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
}

.mqtt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.mqtt-table th {
  position: sticky;
  top: 0;
  background: var(--bg-deep);
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  z-index: 10;
  border-bottom: 1px solid var(--border);
}

.log-row {
  border-bottom: 1px solid var(--border);
  transition: background 0.15s ease;
}

.log-row:hover {
  background: var(--bg-deep);
}

.mqtt-table td {
  padding: 1rem 1.5rem;
  vertical-align: top;
}

.col-time {
  width: 100px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
  font-weight: 500;
}

.col-topic {
  width: 300px;
}

.topic-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge { background: #ecfdf5; color: #059669; }
.command-badge { background: #eef2ff; color: #4f46e5; }
.config-badge { background: #fffbeb; color: #d97706; }
.default-badge { background: #f3f4f6; color: #6b7280; }

.col-payload {
  color: var(--text-main);
}

.payload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
}

.payload-item {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-deep);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8125rem;
}

.payload-item .key {
  font-weight: 700;
  color: var(--text-muted);
}

.payload-item .val {
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent-primary);
}

.payload-raw {
  font-family: 'JetBrains Mono', monospace;
  word-break: break-all;
}

.empty-row {
  padding: 8rem 0;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  color: var(--text-muted);
  font-weight: 600;
}

.spinner-pulse {
  width: 48px;
  height: 48px;
  background: var(--accent-primary);
  border-radius: 50%;
  opacity: 0.1;
  animation: pulse-out 2s infinite ease-in-out;
}

@keyframes pulse-out {
  0% { transform: scale(0.5); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

@media (max-width: 900px) {
  .col-topic { width: 200px; }
  .mqtt-table { font-size: 0.75rem; }
}
</style>

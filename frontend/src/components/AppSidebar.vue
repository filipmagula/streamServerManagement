<script setup lang="ts">
import { useMqttStore } from '@/stores/mqtt'
import { computed } from 'vue'

const mqttStore = useMqttStore()
const isConnected = computed(() => mqttStore.connected)
</script>

<template>
<aside class="sidebar">
    <div class="brand">
      <div class="logo-icon"></div>
      <h2 class="text-main">StreamManager</h2>
    </div>

    <nav class="nav">
      <router-link to="/" class="nav-item" active-class="active">
        <span class="icon">📊</span> Dashboard
      </router-link>
      <router-link to="/library" class="nav-item" active-class="active">
        <span class="icon">📚</span> Video Library
      </router-link>
      <router-link to="/schedule" class="nav-item" active-class="active">
        <span class="icon">📅</span> Scheduler
      </router-link>
    </nav>

    <div class="status-footer">
      <div class="status-indicator">
        <div class="dot" :class="{ 'dot-online': isConnected }"></div>
        <span>{{ isConnected ? 'Broker Online' : 'Broker Offline' }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: white;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  z-index: 100;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}

.logo-icon {
  width: 28px;
  height: 28px;
  background: var(--accent-primary);
  border-radius: 6px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  text-decoration: none;
  color: var(--text-muted);
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.1s ease;
}

.nav-item:hover {
  color: var(--text-main);
  background: var(--bg-deep);
}

.nav-item.active {
  color: var(--accent-primary);
  background: #eff6ff;
}

.icon {
  font-size: 1.125rem;
}

.status-footer {
  margin-top: auto;
  padding: 1rem 0.5rem 0;
  border-top: 1px solid var(--border);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--text-muted);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
}

.dot-online {
  background: var(--success);
}
</style>

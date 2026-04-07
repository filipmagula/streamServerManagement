<script setup lang="ts">
import { useMqttStore } from '@/stores/mqtt'
import { computed } from 'vue'

const props = defineProps<{
  isCollapsed: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const mqttStore = useMqttStore()
const isConnected = computed(() => mqttStore.connected)
</script>

<template>
<aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-brand">
      <div class="logo-icon">
        <svg viewBox="0 0 80 80" fill="none" stroke-linejoin="round" stroke-width="4">
          <path fill="white" stroke="white" stroke-linecap="square" d="M46.901 38.257c1.36.765 1.36 2.721 0 3.486l-9.92 5.58C35.646 48.074 34 47.11 34 45.58V34.42c0-1.53 1.647-2.493 2.98-1.744z"/>
          <path stroke="white" stroke-linecap="round" d="M17.373 62.627a32 32 0 0 1 0-45.254m45.254 45.254a32 32 0 0 0 0-45.254M25.858 54.142a20 20 0 0 1 0-28.284m28.284 28.284a20 20 0 0 0 0-28.284"/>
        </svg>
      </div>
      <h1 v-if="!isCollapsed" class="brand-name">Streamy</h1>
    </div>

    <div class="sidebar-header">
      <button class="toggle-btn" @click="emit('toggle')" :title="isCollapsed ? 'Expand' : 'Collapse'">
        <svg v-if="isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="13 17 18 12 13 7"></polyline>
          <polyline points="6 17 11 12 6 7"></polyline>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="11 17 6 12 11 7"></polyline>
          <polyline points="18 17 13 12 18 7"></polyline>
        </svg>
      </button>
    </div>

    <nav class="nav">
      <router-link to="/" class="nav-item" active-class="active" title="Dashboard">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </span>
        <span v-if="!isCollapsed" class="label">Dashboard</span>
      </router-link>

      <router-link to="/library" class="nav-item" active-class="active" title="Video Library">
        <span class="icon">
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
        </span>
        <span v-if="!isCollapsed" class="label">Video Library</span>
      </router-link>

      <router-link to="/schedule" class="nav-item" active-class="active" title="Schedule">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </span>
        <span v-if="!isCollapsed" class="label">Scheduler</span>
      </router-link>

      <router-link to="/mqtt" class="nav-item" active-class="active" title="MQTT Console">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
        </span>
        <span v-if="!isCollapsed" class="label">MQTT Console</span>
      </router-link>
    </nav>

    <div class="status-footer" :class="{ 'center': isCollapsed }">
      <div class="status-indicator">
        <div class="dot" :class="{ 'dot-online': isConnected }" :title="isConnected ? 'Online' : 'Offline'"></div>
        <span v-if="!isCollapsed" class="status-text">{{ isConnected ? 'Online' : 'Offline' }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: white;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.75rem;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
  transition: all 0.3s ease;
}

.sidebar.collapsed .sidebar-brand {
  justify-content: center;
  margin-bottom: 2rem;
  padding: 0;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--accent-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-main);
  margin: 0;
  white-space: nowrap;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: var(--bg-deep);
  color: var(--accent-primary);
}

.toggle-btn svg {
  width: 20px;
  height: 20px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  text-decoration: none;
  color: var(--text-muted);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--text-main);
  background: var(--accent-soft);
}

.nav-item.active {
  color: var(--accent-primary);
  background: var(--accent-soft);
  position: relative;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  width: 4px;
  background: var(--accent-primary);
  border-radius: 0 4px 4px 0;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem 0;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.icon svg {
  width: 20px;
  height: 20px;
}

.status-footer {
  margin-top: auto;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}

.status-footer.center {
  display: flex;
  justify-content: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
}

.dot-online {
  background: var(--success);
  box-shadow: 0 0 10px var(--success);
}

.status-text {
  letter-spacing: 0.05em;
}
</style>

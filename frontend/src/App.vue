<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMqttStore } from './stores/mqtt'
import AppSidebar from './components/AppSidebar.vue'
import AppTopbar from './components/AppTopbar.vue'

const mqttStore = useMqttStore()
const router = useRouter()
const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

onMounted(() => {
  mqttStore.connect()
})
</script>

<template>
  <div class="app-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <AppSidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    
    <div class="main-wrapper">
      <AppTopbar />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-deep);
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style>

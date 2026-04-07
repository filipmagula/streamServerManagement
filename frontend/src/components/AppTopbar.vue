<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { ref } from 'vue'

const searchStore = useSearchStore()
const searchQuery = ref(searchStore.query)

const handleSearch = () => {
  searchStore.setQuery(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchStore.clearQuery()
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <!-- Brand has been moved to sidebar -->
    </div>

    <div class="topbar-center">
      <div class="search-container">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Type here to search..." 
          @input="handleSearch"
        >
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">×</button>
      </div>
    </div>

    <div class="topbar-right">
      <button class="icon-btn" title="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      </button>
      <button class="icon-btn" title="Messages">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 64px;
  background: var(--accent-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 1000;
  box-shadow: var(--shadow);
}

.topbar-left {
  display: flex;
  align-items: center;
  min-width: 100px;
}

.topbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 600px;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

.search-container input {
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-container input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-container input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
}

.clear-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.6;
}

.clear-btn:hover {
  opacity: 1;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 100px;
  justify-content: flex-end;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn svg {
  width: 20px;
  height: 20px;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  show: boolean
  defaultPath: string
  title: string
}>()

const emit = defineEmits<{
  (e: 'confirm', data: { path: string, loop: boolean }): void
  (e: 'close'): void
}>()

const path = ref('')
const loop = ref(true)

onMounted(() => {
  path.value = props.defaultPath
})

const handleConfirm = () => {
  if (path.value.trim()) {
    emit('confirm', { path: path.value, loop: loop.value })
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content glass-card">
        <header class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="emit('close')">&times;</button>
        </header>

        <div class="modal-body">
          <div class="form-group">
            <label>RTSP Path Name</label>
            <div class="input-wrapper">
              <span class="prefix">rtsp://server/</span>
              <input 
                v-model="path" 
                type="text" 
                placeholder="e.g. stream1" 
                @keyup.enter="handleConfirm"
                autofocus
              />
            </div>
            <p class="help-text">This will be the endpoint for your RTSP stream.</p>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <div class="checkbox-wrapper">
                <input v-model="loop" type="checkbox" />
                <span class="checkbox-custom"></span>
              </div>
              <div class="label-text">
                <strong>Loop automatically</strong>
                <span>Restart the video when it reaches the end.</span>
              </div>
            </label>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn btn-ghost" @click="emit('close')">Cancel</button>
          <button class="btn btn-primary" @click="handleConfirm" :disabled="!path.trim()">
             🚀 Start Broadcast
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: white;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-deep);
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.prefix {
  padding: 0 0.75rem;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.875rem;
  border-right: 1px solid var(--border);
  background: #f1f5f9;
}

.input-wrapper input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: white;
  font-size: 0.875rem;
  color: var(--text-main);
  outline: none;
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.checkbox-group {
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
}

.checkbox-wrapper {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.checkbox-wrapper input {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: absolute;
}

.checkbox-custom {
  position: absolute;
  top: 0;
  left: 0;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-wrapper input:checked + .checkbox-custom {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.checkbox-wrapper input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 0.4rem;
  top: 0.15rem;
  width: 0.3rem;
  height: 0.6rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.label-text {
  display: flex;
  flex-direction: column;
}

.label-text strong {
  font-size: 0.875rem;
  color: var(--text-main);
}

.label-text span {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  background: var(--bg-deep);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--border);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(10px);
}
</style>

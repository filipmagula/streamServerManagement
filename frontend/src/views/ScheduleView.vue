<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSchedulesStore } from '@/stores/schedules'
import { useVideosStore } from '@/stores/videos'
import { useStreamsStore } from '@/stores/streams'

const schedulesStore = useSchedulesStore()
const videosStore = useVideosStore()
const streamsStore = useStreamsStore()

const showForm = ref(false)
const formData = ref({
  stream_id: '',
  video_id: '',
  start_at: '',
  end_at: '',
  loop: true
})

onMounted(async () => {
  await schedulesStore.fetchSchedules()
  await videosStore.fetchVideos()
  await streamsStore.fetchStreams()
})

const submitSchedule = async () => {
  await schedulesStore.createSchedule({
    ...formData.value,
    loop: formData.value.loop ? 1 : 0
  })
  showForm.value = false
  // Reset form
  formData.value = { stream_id: '', video_id: '', start_at: '', end_at: '', loop: true }
}

const getStatusLabel = (startAt: string, endAt: string, active: number) => {
  if (!active) return 'Disabled'
  const now = new Date()
  const start = new Date(startAt)
  const end = new Date(endAt)
  if (now < start) return 'Upcoming'
  if (now >= start && now <= end) return 'Running'
  return 'Ended'
}
</script>

<template>
  <div class="schedule">
    <header class="header">
      <div>
        <h1 class="text-main">Automated Schedules</h1>
        <p class="text-muted">Plan your broadcasts ahead of time.</p>
      </div>
      <button class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '➕ New Schedule' }}
      </button>
    </header>

    <div v-if="showForm" class="schedule-panel glass-card">
      <h3>Add Schedule</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Target Stream</label>
          <select v-model="formData.stream_id">
            <option v-for="s in streamsStore.streams" :key="s.id" :value="s.id">{{ s.rtsp_path }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Video to Play</label>
          <select v-model="formData.video_id">
            <option v-for="v in videosStore.videos" :key="v.id" :value="v.id">{{ v.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Start Time</label>
          <input v-model="formData.start_at" type="datetime-local" />
        </div>
        <div class="form-group">
          <label>End Time</label>
          <input v-model="formData.end_at" type="datetime-local" />
        </div>
        <div class="form-group checkbox">
          <input id="loop-check" v-model="formData.loop" type="checkbox" />
          <label for="loop-check">Loop playback</label>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" @click="submitSchedule">Save Schedule</button>
      </div>
    </div>

    <div class="schedule-list glass-card">
      <table v-if="schedulesStore.schedules.length > 0">
        <thead>
          <tr>
            <th>Status</th>
            <th>Stream</th>
            <th>Video</th>
            <th>Time Range</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in schedulesStore.schedules" :key="s.id">
            <td>
              <span class="status-badge" :class="getStatusLabel(s.start_at, s.end_at, s.active).toLowerCase()">
                {{ getStatusLabel(s.start_at, s.end_at, s.active) }}
              </span>
            </td>
            <td>{{ streamsStore.streams.find(st => st.id === s.stream_id)?.rtsp_path || 'Unknown' }}</td>
            <td>{{ videosStore.videos.find(v => v.id === s.video_id)?.name || 'Unknown' }}</td>
            <td>
              <div class="time-range">
                <span>{{ new Date(s.start_at).toLocaleString() }}</span>
                <span class="arrow">→</span>
                <span>{{ new Date(s.end_at).toLocaleString() }}</span>
              </div>
            </td>
            <td class="actions">
              <button class="btn-action" @click="schedulesStore.toggleSchedule(s.id, !s.active)">
                {{ s.active ? '⏸️' : '▶️' }}
              </button>
              <button class="btn-action btn-danger" @click="schedulesStore.deleteSchedule(s.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-list">
        <p>No schedules found. Plan a broadcast to see it here.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-panel {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-group select, 
.form-group input:not([type="checkbox"]) {
  padding: 0.625rem 0.75rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-main);
  font-size: 0.875rem;
  transition: all 0.1s ease;
}

.form-group select:focus, 
.form-group input:not([type="checkbox"]):focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  grid-column: span 2;
}

.schedule-list {
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 0.875rem 1.5rem;
  background: #f8fafc;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

td {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
  font-size: 0.875rem;
  color: var(--text-main);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.upcoming { color: #92400e; background: #fef3c7; }
.running { color: #065f46; background: #d1fae5; }
.ended { color: var(--text-muted); background: #f1f5f9; }
.disabled { color: #991b1b; background: #fee2e2; }

.time-range {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  font-size: 0.8125rem;
}

.arrow {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.5;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: white;
  border: 1px solid var(--border);
  padding: 0.375rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-size: 1rem;
}

.btn-action:hover {
  background: var(--bg-deep);
  border-color: #cbd5e1;
}

.btn-danger:hover { 
  background: #fff1f2; 
  border-color: #fecaca;
  color: var(--error);
}

.empty-list {
  padding: 4rem;
  text-align: center;
  color: var(--text-muted);
}
</style>

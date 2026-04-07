import { defineStore } from 'pinia'
import axios from 'axios'
import type { Schedule } from '../types'

export const useSchedulesStore = defineStore('schedules', {
  state: () => ({
    schedules: [] as Schedule[],
    loading: false
  }),
  actions: {
    async fetchSchedules() {
      this.loading = true
      try {
        const { data } = await axios.get('/api/schedules')
        this.schedules = data
      } finally {
        this.loading = false
      }
    },
    async createSchedule(schedule: Partial<Schedule>) {
      await axios.post('/api/schedules', schedule)
      await this.fetchSchedules()
    },
    async deleteSchedule(id: string) {
      await axios.delete(`/api/schedules/${id}`)
      this.schedules = this.schedules.filter(s => s.id !== id)
    },
    async toggleSchedule(id: string, active: boolean) {
      await axios.patch(`/api/schedules/${id}`, { active: active ? 1 : 0 })
      const schedule = this.schedules.find(s => s.id === id)
      if (schedule) schedule.active = active ? 1 : 0
    }
  }
})

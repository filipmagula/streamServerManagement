import { defineStore } from 'pinia'
import axios from 'axios'
import type { Video } from '../types'

export const useVideosStore = defineStore('videos', {
  state: () => ({
    videos: [] as Video[],
    loading: false
  }),
  actions: {
    async fetchVideos() {
      this.loading = true
      try {
        const { data } = await axios.get('/api/videos')
        this.videos = data
      } finally {
        this.loading = false
      }
    },
    async uploadVideo(file: File, name: string) {
      const formData = new FormData()
      formData.append('video', file)
      formData.append('name', name)
      await axios.post('/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await this.fetchVideos()
    },
    async registerVideo(name: string, path: string) {
      await axios.post('/api/videos/register', { name, source_path: path })
      await this.fetchVideos()
    },
    async deleteVideo(id: string) {
      await axios.delete(`/api/videos/${id}`)
      this.videos = this.videos.filter(v => v.id !== id)
    }
  }
})

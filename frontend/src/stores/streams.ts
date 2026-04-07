import { defineStore } from 'pinia'
import axios from 'axios'
import { useMqttStore } from './mqtt'
import type { Stream } from '../types'

export const useStreamsStore = defineStore('streams', {
  state: () => ({
    streams: [] as Stream[],
    loading: false
  }),
  actions: {
    async fetchStreams() {
      this.loading = true
      try {
        const { data } = await axios.get('/api/streams')
        this.streams = data
      } finally {
        this.loading = false
      }
    },
    async createStream(rtspPath: string, loop: boolean = true) {
      const { data } = await axios.post('/api/streams', { rtsp_path: rtspPath, loop })
      this.streams.push(data)
      return data
    },
    async startStream(streamId: string, videoId: string, loop: boolean = true) {
      await axios.post(`/api/streams/${streamId}/start`, { videoId, loop })
      await this.fetchStreams()
    },
    async stopStream(streamId: string) {
      await axios.post(`/api/streams/${streamId}/stop`)
      await this.fetchStreams()
    },
    async updateLoop(streamId: string, loop: boolean) {
      await axios.patch(`/api/streams/${streamId}`, { loop })
      const stream = this.streams.find(s => s.id === streamId)
      if (stream) stream.loop = loop ? 1 : 0
    },
    updateStreamStateFromMqtt(payload: any, streamId: string) {
      const index = this.streams.findIndex(s => s.id === streamId)
      if (index !== -1) {
        this.streams[index] = { ...this.streams[index], ...payload }
      }
    }
  }
})

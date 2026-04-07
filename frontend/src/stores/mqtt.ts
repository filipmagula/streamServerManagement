import { defineStore } from 'pinia'
import mqtt, { type MqttClient } from 'mqtt'
import type { MqttMessage } from '../types'

export const useMqttStore = defineStore('mqtt', {
  state: () => ({
    client: null as MqttClient | null,
    connected: false,
    messages: [] as MqttMessage[],
  }),
  actions: {
    connect() {
      if (this.client) return

      const brokerUrl = `ws://${window.location.host}/mqtt`
      this.client = mqtt.connect(brokerUrl)

      this.client.on('connect', () => {
        this.connected = true
        console.log('MQTT Connected')
        this.client?.subscribe('environ/video/+/status')
        this.client?.subscribe('environ/video/+/config')
      })

      this.client.on('message', (topic, payload) => {
        const msg = JSON.parse(payload.toString())
        this.messages.unshift({
          topic,
          payload: msg,
          timestamp: Date.now()
        })
        if (this.messages.length > 100) this.messages.pop()

        // Handle specific updates here or in other stores by listening to this store
      })

      this.client.on('close', () => {
        this.connected = false
      })
    },
    publish(topic: string, payload: any) {
      if (this.client?.connected) {
        this.client.publish(topic, JSON.stringify(payload))
      }
    },
    sendCommand(streamId: string, action: string, data: any = {}) {
      this.publish(`environ/video/${streamId}/command`, { action, ...data })
    }
  }
})

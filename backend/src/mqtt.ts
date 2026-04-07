import mqtt, { MqttClient } from 'mqtt';
import { config } from './config';

class MqttService {
  private client: MqttClient | null = null;
  private handlers: Map<string, (payload: any) => void> = new Map();

  connect() {
    this.client = mqtt.connect(config.mqttUrl);

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      // Subscribe to all command topics
      this.client?.subscribe('environ/video/+/command');
    });

    this.client.on('message', (topic, message) => {
      const payload = JSON.parse(message.toString());
      const handler = this.handlers.get(topic) || this.handlers.get(this.getPatternTopic(topic));
      if (handler) {
        handler(payload);
      }
    });

    this.client.on('error', (err) => {
      console.error('MQTT error:', err);
    });
  }

  private getPatternTopic(topic: string): string {
    // Basic pattern conversion: environ/video/123/command -> environ/video/+/command
    const parts = topic.split('/');
    if (parts.length === 4 && parts[0] === 'environ' && parts[1] === 'video' && parts[3] === 'command') {
      return 'environ/video/+/command';
    }
    return topic;
  }

  onCommand(handler: (topic: string, payload: any) => void) {
    this.client?.on('message', (topic, message) => {
      if (topic.endsWith('/command')) {
        try {
          const payload = JSON.parse(message.toString());
          handler(topic, payload);
        } catch (e) {
          console.error('Failed to parse MQTT message', e);
        }
      }
    });
  }

  publish(topic: string, payload: any) {
    if (this.client?.connected) {
      this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
    }
  }

  publishStatus(streamId: string, status: any) {
    this.publish(`environ/video/${streamId}/status`, status);
  }
}

export const mqttService = new MqttService();

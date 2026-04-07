import cron from 'node-cron';
import db from '../db';
import { streamService } from './streamService';
import { Schedule } from '../types';

class SchedulerService {
  private jobs: Map<string, { start: cron.ScheduledTask, end: cron.ScheduledTask }> = new Map();

  async init() {
    const activeSchedules = db.prepare('SELECT * FROM schedules WHERE active = 1').all() as Schedule[];
    for (const schedule of activeSchedules) {
      this.schedule(schedule);
    }
    console.log(`Initialized ${activeSchedules.length} active schedules`);
  }

  schedule(schedule: Schedule) {
    if (this.jobs.has(schedule.id)) {
      this.unschedule(schedule.id);
    }

    const startDate = new Date(schedule.start_at);
    const endDate = new Date(schedule.end_at);

    // Basic cron pattern for one-time execution: "min hour day month dayOfWeek"
    // Note: node-cron supports specific dates via pattern or Date objects in someversions, 
    // but standard way is to transform Date to cron pattern.
    const startCron = `${startDate.getMinutes()} ${startDate.getHours()} ${startDate.getDate()} ${startDate.getMonth() + 1} *`;
    const endCron = `${endDate.getMinutes()} ${endDate.getHours()} ${endDate.getDate()} ${endDate.getMonth() + 1} *`;

    const startJob = cron.schedule(startCron, () => {
      console.log(`Starting scheduled stream: ${schedule.stream_id} (Video: ${schedule.video_id})`);
      streamService.startStream(schedule.stream_id, schedule.video_id, { loop: !!schedule.loop });
    });

    const endJob = cron.schedule(endCron, () => {
      console.log(`Stopping scheduled stream: ${schedule.stream_id}`);
      streamService.stopStream(schedule.stream_id);
    });

    this.jobs.set(schedule.id, { start: startJob, end: endJob });
  }

  unschedule(id: string) {
    const job = this.jobs.get(id);
    if (job) {
      job.start.stop();
      job.end.stop();
      this.jobs.delete(id);
    }
  }

  updateSchedule(schedule: Schedule) {
    if (schedule.active) {
      this.schedule(schedule);
    } else {
      this.unschedule(schedule.id);
    }
  }
}

export const schedulerService = new SchedulerService();

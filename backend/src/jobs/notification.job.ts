import { Worker, type Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { QUEUES } from './queues.js';

interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const notificationWorker = new Worker<NotificationJobData>(
  QUEUES.NOTIFICATION,
  async (job: Job<NotificationJobData>) => {
    const { userId, type, title, body, data } = job.data;
    logger.info({ userId, type }, 'Sending notification');

    // TODO: Implement notification dispatch
    // 1. Create notification record in DB
    // 2. Look up user's FCM token
    // 3. Send push notification via Firebase Admin SDK
    // 4. Handle delivery failures

    logger.info({ userId, type }, 'Notification sent');
  },
  {
    connection: redis,
    concurrency: 10,
  },
);

notificationWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Notification job completed');
});

notificationWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Notification job failed');
});

export { notificationWorker };

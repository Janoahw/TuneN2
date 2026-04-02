import { Queue, Worker, type Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const connection = { connection: redis };

// ─── Queue Definitions ──────────────────────────────────

export const transcodeQueue = new Queue('transcode', connection);
export const notificationQueue = new Queue('notification', connection);
export const payoutQueue = new Queue('payout', connection);
export const aggregationQueue = new Queue('aggregation', connection);
export const subscriptionQueue = new Queue('subscription', connection);
export const cleanupQueue = new Queue('cleanup', connection);

// ─── Queue Names ────────────────────────────────────────

export const QUEUES = {
  TRANSCODE: 'transcode',
  NOTIFICATION: 'notification',
  PAYOUT: 'payout',
  AGGREGATION: 'aggregation',
  SUBSCRIPTION: 'subscription',
  CLEANUP: 'cleanup',
} as const;

// ─── Health Check ───────────────────────────────────────

export async function getQueueHealth(): Promise<Record<string, { waiting: number; active: number; failed: number }>> {
  const queues = [transcodeQueue, notificationQueue, payoutQueue, aggregationQueue, subscriptionQueue, cleanupQueue];
  const health: Record<string, { waiting: number; active: number; failed: number }> = {};

  for (const queue of queues) {
    const [waiting, active, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getFailedCount(),
    ]);
    health[queue.name] = { waiting, active, failed };
  }

  return health;
}

logger.info('📋 BullMQ queues initialized');

import { logger } from '../utils/logger.js';
import { cleanupQueue } from './queues.js';

// Import workers to start them
import { transcodeWorker } from './transcode.job.js';
import { notificationWorker } from './notification.job.js';
import { cleanupWorker } from './cleanup.job.js';

export function startWorkers() {
  logger.info('🔧 Starting BullMQ workers...');
  logger.info(`  ├─ transcode worker (concurrency: 2)`);
  logger.info(`  ├─ notification worker (concurrency: 10)`);
  logger.info(`  └─ cleanup worker (concurrency: 1)`);

  // Schedule stuck song re-enqueue every 5 minutes
  cleanupQueue
    .add('stuck-songs', {}, { repeat: { every: 5 * 60 * 1000 }, removeOnComplete: 10 })
    .then(() => logger.info('📋 Scheduled stuck-songs cleanup job'))
    .catch((err) => logger.error({ error: err }, 'Failed to schedule stuck-songs job'));
}

export async function stopWorkers() {
  logger.info('Stopping BullMQ workers...');
  await Promise.all([
    transcodeWorker.close(),
    notificationWorker.close(),
    cleanupWorker.close(),
  ]);
  logger.info('All workers stopped');
}

export { transcodeWorker, notificationWorker, cleanupWorker };

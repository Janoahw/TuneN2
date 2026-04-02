import { logger } from '../utils/logger.js';

// Import workers to start them
import { transcodeWorker } from './transcode.job.js';
import { notificationWorker } from './notification.job.js';

export function startWorkers() {
  logger.info('🔧 Starting BullMQ workers...');
  logger.info(`  ├─ transcode worker (concurrency: 2)`);
  logger.info(`  └─ notification worker (concurrency: 10)`);
}

export async function stopWorkers() {
  logger.info('Stopping BullMQ workers...');
  await Promise.all([
    transcodeWorker.close(),
    notificationWorker.close(),
  ]);
  logger.info('All workers stopped');
}

export { transcodeWorker, notificationWorker };

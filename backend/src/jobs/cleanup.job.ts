import { Worker, type Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { SongService } from '../services/song.service.js';
import { QUEUES } from './queues.js';

const cleanupWorker = new Worker(
  QUEUES.CLEANUP,
  async (job: Job) => {
    if (job.name === 'stuck-songs') {
      const result = await SongService.reEnqueueStuckSongs();
      return result;
    }

    logger.warn({ jobName: job.name }, 'Unknown cleanup job');
  },
  {
    connection: redis,
    concurrency: 1,
  },
);

cleanupWorker.on('completed', (job) => {
  if (job.name === 'stuck-songs' && job.returnvalue?.reEnqueued > 0) {
    logger.info({ reEnqueued: job.returnvalue.reEnqueued }, 'Stuck songs cleanup completed');
  }
});

cleanupWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, jobName: job?.name, error: err.message }, 'Cleanup job failed');
});

export { cleanupWorker };

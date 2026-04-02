import { Worker, type Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { QUEUES } from './queues.js';

interface TranscodeJobData {
  songId: string;
  inputKey: string;
  outputKey: string;
}

const transcodeWorker = new Worker<TranscodeJobData>(
  QUEUES.TRANSCODE,
  async (job: Job<TranscodeJobData>) => {
    const { songId, inputKey, outputKey } = job.data;
    logger.info({ songId, inputKey }, 'Starting audio transcode');

    // TODO: Implement FFmpeg transcoding pipeline
    // 1. Download original from S3 (inputKey)
    // 2. Transcode to 128kbps AAC via fluent-ffmpeg
    // 3. Upload transcoded file to S3 (outputKey)
    // 4. Update song record: status → 'active', stream_url → outputKey
    // 5. Clean up temp files

    logger.info({ songId }, 'Transcode complete');
  },
  {
    connection: redis,
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60_000,
    },
  },
);

transcodeWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, songId: job.data.songId }, 'Transcode job completed');
});

transcodeWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Transcode job failed');
});

export { transcodeWorker };

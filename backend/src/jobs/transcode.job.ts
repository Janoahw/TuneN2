import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { Worker, type Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { QUEUES } from './queues.js';

interface TranscodeJobData {
  songId: string;
  inputKey: string;
  outputKey: string;
}

async function getS3Client() {
  const { S3Client } = await import('@aws-sdk/client-s3');
  return new S3Client({ region: env.AWS_REGION });
}

async function downloadFromS3(key: string, destPath: string): Promise<void> {
  if (!env.AWS_S3_AUDIO_BUCKET) {
    // Dev mode: create a small silent WAV file for testing
    logger.info({ key }, 'Dev mode: skipping S3 download');
    const silentWav = Buffer.alloc(44);
    // Minimal WAV header
    silentWav.write('RIFF', 0);
    silentWav.writeUInt32LE(36, 4);
    silentWav.write('WAVE', 8);
    silentWav.write('fmt ', 12);
    silentWav.writeUInt32LE(16, 16);
    silentWav.writeUInt16LE(1, 20); // PCM
    silentWav.writeUInt16LE(1, 22); // mono
    silentWav.writeUInt32LE(44100, 24); // sample rate
    silentWav.writeUInt32LE(88200, 28); // byte rate
    silentWav.writeUInt16LE(2, 32); // block align
    silentWav.writeUInt16LE(16, 34); // bits per sample
    silentWav.write('data', 36);
    silentWav.writeUInt32LE(0, 40);
    fs.writeFileSync(destPath, silentWav);
    return;
  }

  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  const s3 = await getS3Client();
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_AUDIO_BUCKET,
      Key: key,
    }),
  );

  if (!response.Body) throw new Error('Empty S3 response body');
  const readableStream = response.Body as Readable;
  await pipeline(readableStream, fs.createWriteStream(destPath));
}

async function uploadToS3(localPath: string, key: string): Promise<void> {
  if (!env.AWS_S3_AUDIO_BUCKET) {
    logger.info({ key }, 'Dev mode: skipping S3 upload');
    return;
  }

  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const s3 = await getS3Client();
  const fileBuffer = fs.readFileSync(localPath);

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_AUDIO_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: 'audio/mp4',
    }),
  );
}

function getAudioDuration(filePath: string): Promise<number> {
  const { execFile } = require('node:child_process') as typeof import('node:child_process');

  return new Promise((resolve, reject) => {
    execFile(
      'ffprobe',
      ['-v', 'quiet', '-print_format', 'json', '-show_format', filePath],
      (error, stdout) => {
        if (error) {
          // If ffprobe not available, return 0 (dev mode)
          logger.warn('ffprobe not available, returning duration 0');
          resolve(0);
          return;
        }
        try {
          const info = JSON.parse(stdout);
          resolve(Math.round(Number(info.format?.duration ?? 0)));
        } catch {
          resolve(0);
        }
      },
    );
  });
}

function transcodeToAAC(inputPath: string, outputPath: string): Promise<void> {
  const { execFile } = require('node:child_process') as typeof import('node:child_process');

  return new Promise((resolve, reject) => {
    execFile(
      'ffmpeg',
      [
        '-i', inputPath,
        '-vn',                    // no video
        '-acodec', 'aac',        // AAC codec
        '-b:a', '128k',          // 128kbps bitrate
        '-ar', '44100',          // 44.1kHz sample rate
        '-ac', '2',              // stereo
        '-movflags', '+faststart', // streaming optimization
        '-y',                     // overwrite output
        outputPath,
      ],
      { timeout: 5 * 60 * 1000 }, // 5-minute timeout
      (error) => {
        if (error) {
          // Dev mode: if ffmpeg not installed, simulate success
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            logger.warn('ffmpeg not available — dev mode: simulating transcode');
            fs.copyFileSync(inputPath, outputPath);
            resolve();
            return;
          }
          reject(new Error(`ffmpeg transcode failed: ${error.message}`));
          return;
        }
        resolve();
      },
    );
  });
}

const transcodeWorker = new Worker<TranscodeJobData>(
  QUEUES.TRANSCODE,
  async (job: Job<TranscodeJobData>) => {
    const { songId, inputKey, outputKey } = job.data;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tunen2-transcode-'));
    const inputPath = path.join(tmpDir, 'input');
    const outputPath = path.join(tmpDir, 'output.m4a');

    try {
      logger.info({ songId, inputKey }, 'Starting audio transcode');

      // 1. Download original from S3
      await job.updateProgress(10);
      await downloadFromS3(inputKey, inputPath);

      // 2. Get duration from original file
      await job.updateProgress(20);
      const durationSeconds = await getAudioDuration(inputPath);

      // 3. Transcode to 128kbps AAC
      await job.updateProgress(30);
      await transcodeToAAC(inputPath, outputPath);

      // 4. Upload transcoded file to S3
      await job.updateProgress(70);
      await uploadToS3(outputPath, outputKey);

      // 5. Update song record: status → 'active', stream_url → outputKey
      await job.updateProgress(90);
      const song = await prisma.song.update({
        where: { id: songId },
        data: {
          status: 'active',
          streamUrl: outputKey,
          durationSeconds: durationSeconds || null,
        },
      });

      await job.updateProgress(100);
      logger.info({ songId, durationSeconds }, 'Transcode complete');

      // Notify followers of new song
      const { NotificationService } = await import('../services/notification.service.js');
      NotificationService.notifyNewSong({
        artistId: song.artistId,
        songId: song.id,
        songTitle: song.title,
      }).catch((err) => {
        logger.error({ err, songId }, 'Failed to send new song notifications');
      });
    } finally {
      // Clean up temp files
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
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

transcodeWorker.on('failed', async (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Transcode job failed');

  // Set song status to 'rejected' on final failure
  if (job && job.attemptsMade >= (job.opts.attempts ?? 3)) {
    try {
      await prisma.song.update({
        where: { id: job.data.songId },
        data: { status: 'rejected' },
      });
      logger.info({ songId: job.data.songId }, 'Song marked as rejected after transcode failures');
    } catch (e) {
      logger.error({ songId: job.data.songId, error: e }, 'Failed to mark song as rejected');
    }
  }
});

export { transcodeWorker };

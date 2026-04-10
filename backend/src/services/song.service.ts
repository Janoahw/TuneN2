import crypto from 'node:crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { transcodeQueue } from '../jobs/queues.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const AUDIO_MIME_TO_EXT: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/flac': 'flac',
  'audio/x-flac': 'flac',
};

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const UPLOAD_EXPIRY_SECONDS = 15 * 60;

export class SongService {
  /**
   * Generate a presigned S3 upload URL for audio or cover art.
   */
  static async generateUploadUrl(
    artistId: string,
    fileType: 'audio' | 'cover-art',
    mimeType: string,
  ) {
    const mimeMap = fileType === 'audio' ? AUDIO_MIME_TO_EXT : IMAGE_MIME_TO_EXT;
    const ext = mimeMap[mimeType];

    if (!ext) {
      throw new ValidationError(
        `Unsupported ${fileType} type: ${mimeType}`,
      );
    }

    const bucket =
      fileType === 'audio' ? env.AWS_S3_AUDIO_BUCKET : env.AWS_S3_IMAGE_BUCKET;
    const prefix = fileType === 'audio' ? 'originals' : 'cover-art';
    const fileKey = `${prefix}/${artistId}/${crypto.randomUUID()}.${ext}`;

    if (!bucket) {
      // Dev mode: return mock URLs
      logger.info({ fileKey }, `Upload URL (dev mode — no S3 ${fileType} bucket configured)`);
      return {
        uploadUrl: `https://mock-s3.local/${fileKey}`,
        fileKey,
      };
    }

    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const s3 = new S3Client({ region: env.AWS_REGION });
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: UPLOAD_EXPIRY_SECONDS,
    });

    return { uploadUrl, fileKey };
  }

  /**
   * Create a new song record and enqueue transcoding.
   */
  static async createSong(
    userId: string,
    data: {
      title: string;
      description?: string;
      genreId: number;
      price: number;
      isFree: boolean;
      audioFileKey: string;
      coverArtKey?: string;
    },
  ) {
    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
    });
    if (!artist) throw new ForbiddenError('Artist profile not found');

    // Verify genre exists
    const genre = await prisma.genre.findUnique({ where: { id: data.genreId } });
    if (!genre) throw new ValidationError('Invalid genre');

    const coverArtUrl = data.coverArtKey
      ? env.AWS_CLOUDFRONT_DOMAIN
        ? `https://${env.AWS_CLOUDFRONT_DOMAIN}/${data.coverArtKey}`
        : `https://mock-cdn.local/${data.coverArtKey}`
      : null;

    const song = await prisma.song.create({
      data: {
        artistId: artist.id,
        title: data.title,
        description: data.description ?? null,
        genreId: data.genreId,
        price: data.price,
        isFree: data.isFree,
        audioUrl: data.audioFileKey,
        coverArtUrl,
        status: 'processing',
      },
      include: { genre: true },
    });

    // Enqueue transcode job
    const outputKey = `downloads/${artist.id}/${song.id}.m4a`;
    await transcodeQueue.add(
      'transcode',
      {
        songId: song.id,
        inputKey: data.audioFileKey,
        outputKey,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    logger.info({ songId: song.id, artistId: artist.id }, 'Song created, transcode enqueued');

    return song;
  }

  /**
   * Get paginated list of artist's own songs.
   */
  static async getArtistSongs(
    userId: string,
    params: { status?: string; page: number; limit: number },
  ) {
    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
    });
    if (!artist) throw new ForbiddenError('Artist profile not found');

    const where: Record<string, unknown> = { artistId: artist.id };
    if (params.status) {
      where.status = params.status;
    } else {
      // Exclude soft-deleted unless explicitly requested
      where.status = { not: 'deleted' };
    }

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
        include: { genre: true },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.song.count({ where }),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      items: songs,
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    };
  }

  /**
   * Get a single song by ID (public).
   */
  static async getSongById(songId: string) {
    const song = await prisma.song.findUnique({
      where: { id: songId },
      include: {
        genre: true,
        artist: {
          include: {
            user: { select: { displayName: true, avatarUrl: true } },
            _count: { select: { songs: { where: { status: 'active' } }, follows: true } },
          },
        },
      },
    });

    if (!song || song.status === 'deleted') {
      throw new NotFoundError('Song not found');
    }

    return song;
  }

  /**
   * Update a song (artist-only, own songs).
   */
  static async updateSong(
    userId: string,
    songId: string,
    data: {
      title?: string;
      description?: string | null;
      genreId?: number;
      price?: number;
      isFree?: boolean;
      coverArtKey?: string | null;
    },
  ) {
    const artist = await prisma.artistProfile.findUnique({ where: { userId } });
    if (!artist) throw new ForbiddenError('Artist profile not found');

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) throw new NotFoundError('Song not found');
    if (song.artistId !== artist.id) throw new ForbiddenError('Not your song');
    if (song.status === 'deleted') throw new NotFoundError('Song not found');

    if (data.genreId) {
      const genre = await prisma.genre.findUnique({ where: { id: data.genreId } });
      if (!genre) throw new ValidationError('Invalid genre');
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.genreId !== undefined) updateData.genreId = data.genreId;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.isFree !== undefined) updateData.isFree = data.isFree;
    if (data.coverArtKey !== undefined) {
      updateData.coverArtUrl = data.coverArtKey
        ? env.AWS_CLOUDFRONT_DOMAIN
          ? `https://${env.AWS_CLOUDFRONT_DOMAIN}/${data.coverArtKey}`
          : `https://mock-cdn.local/${data.coverArtKey}`
        : null;
    }

    const updated = await prisma.song.update({
      where: { id: songId },
      data: updateData,
      include: { genre: true },
    });

    return updated;
  }

  /**
   * Soft-delete a song (set status to 'deleted').
   */
  static async deleteSong(userId: string, songId: string) {
    const artist = await prisma.artistProfile.findUnique({ where: { userId } });
    if (!artist) throw new ForbiddenError('Artist profile not found');

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) throw new NotFoundError('Song not found');
    if (song.artistId !== artist.id) throw new ForbiddenError('Not your song');

    await prisma.song.update({
      where: { id: songId },
      data: { status: 'deleted' },
    });

    logger.info({ songId, artistId: artist.id }, 'Song soft-deleted');
    return { success: true };
  }

  /**
   * Re-enqueue songs stuck in 'processing' for over 10 minutes.
   */
  static async reEnqueueStuckSongs() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const stuckSongs = await prisma.song.findMany({
      where: {
        status: 'processing',
        createdAt: { lt: tenMinutesAgo },
      },
    });

    let reEnqueued = 0;
    for (const song of stuckSongs) {
      const outputKey = `downloads/${song.artistId}/${song.id}.m4a`;
      await transcodeQueue.add(
        'transcode',
        {
          songId: song.id,
          inputKey: song.audioUrl,
          outputKey,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
      reEnqueued++;
    }

    if (reEnqueued > 0) {
      logger.info({ count: reEnqueued }, 'Re-enqueued stuck songs');
    }

    return { reEnqueued };
  }
}

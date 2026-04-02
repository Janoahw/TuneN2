import crypto from "node:crypto";
import { env } from "../config/env.js";
import { ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const UPLOAD_EXPIRY_SECONDS = 15 * 60; // 15 minutes

export class UploadService {
  static async generateUploadUrl(
    userId: string,
    type: "avatar" | "profile-banner",
    mimeType: string,
  ) {
    const ext = MIME_TO_EXT[mimeType];

    if (!ext) {
      throw new ValidationError("Unsupported file type");
    }

    const fileKey = `${type}/${userId}/${crypto.randomUUID()}.${ext}`;

    if (!env.AWS_S3_IMAGE_BUCKET) {
      logger.info({ fileKey }, "Upload URL (dev mode — no S3 bucket configured)");
      return {
        uploadUrl: `https://mock-s3.local/${fileKey}`,
        fileKey,
        publicUrl: `https://mock-cdn.local/${fileKey}`,
      };
    }

    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const s3 = new S3Client({ region: env.AWS_REGION });

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_IMAGE_BUCKET,
      Key: fileKey,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: UPLOAD_EXPIRY_SECONDS,
    });

    const publicUrl = env.AWS_CLOUDFRONT_DOMAIN
      ? `https://${env.AWS_CLOUDFRONT_DOMAIN}/${fileKey}`
      : `https://${env.AWS_S3_IMAGE_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return { uploadUrl, fileKey, publicUrl };
  }
}

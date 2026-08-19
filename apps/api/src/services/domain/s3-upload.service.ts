import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { s3Client, S3_BUCKET, S3_REGION, S3_ENDPOINT } from '../../config/s3';
import { ServiceError } from '../base.service';
import { HTTP_STATUS_CODES } from '@monolenz/types/api';

const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const PRESIGNED_URL_TTL_SECONDS = 300; // 5 minutes

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

class S3UploadService {
  async generateAvatarPresignedUrl(params: {
    userId: string;
    contentType: string;
    fileSize: number;
  }): Promise<{ uploadUrl: string; objectUrl: string; s3Key: string }> {
    const { userId, contentType, fileSize } = params;

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      throw new ServiceError(
        `Invalid content type: ${contentType}. Allowed types: ${[...ALLOWED_CONTENT_TYPES].join(', ')}`,
        null,
        HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
      );
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      throw new ServiceError(
        `File too large: ${fileSize} bytes. Maximum allowed: ${MAX_FILE_SIZE_BYTES} bytes (5 MB)`,
        null,
        HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
      );
    }

    const ext = EXT_MAP[contentType];
    const s3Key = `avatars/${userId}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      ContentType: contentType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: PRESIGNED_URL_TTL_SECONDS });

    const objectUrl = S3_ENDPOINT
      ? `${S3_ENDPOINT.replace(/\/$/, '')}/${S3_BUCKET}/${s3Key}`
      : `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${s3Key}`;

    return { uploadUrl, objectUrl, s3Key };
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    } catch (err: any) {
      // NoSuchKey is expected when the object was already deleted
      if (err?.name !== 'NoSuchKey') {
        throw err;
      }
    }
  }

  extractS3Key(url: string): string | null {
    try {
      const parsed = new URL(url);

      // Standard AWS: <bucket>.s3.<region>.amazonaws.com/<key>
      const awsHostPattern = new RegExp(`^${S3_BUCKET}\\.s3\\.[^.]+\\.amazonaws\\.com$`);
      if (awsHostPattern.test(parsed.hostname)) {
        return parsed.pathname.replace(/^\//, '');
      }

      // Custom endpoint (MinIO etc.): <endpoint>/<bucket>/<key>
      if (S3_ENDPOINT) {
        const endpointHost = new URL(S3_ENDPOINT).hostname;
        if (parsed.hostname === endpointHost) {
          const prefix = `/${S3_BUCKET}/`;
          if (parsed.pathname.startsWith(prefix)) {
            return parsed.pathname.slice(prefix.length);
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }
}

export const s3UploadService = new S3UploadService();

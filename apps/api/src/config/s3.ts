import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const awsRegion = process.env.AWS_REGION || 'us-east-1';
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3BucketName = process.env.S3_BUCKET_NAME;

if (!awsAccessKeyId || !awsSecretAccessKey) {
  console.warn(
    'WARNING: AWS credentials not configured. S3 functionality will be disabled. ' +
      'Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables to enable S3.'
  );
}

if (!s3BucketName) {
  console.warn(
    'WARNING: S3_BUCKET_NAME not configured. S3 functionality will be disabled. ' +
      'Set S3_BUCKET_NAME environment variable to enable S3.'
  );
}

// Create S3 client
export const s3Client = new S3Client({
  region: awsRegion,
  credentials:
    awsAccessKeyId && awsSecretAccessKey
      ? {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        }
      : undefined,
});

// Export configuration
export const s3Config = {
  bucketName: s3BucketName || '',
  region: awsRegion,
  isConfigured: Boolean(awsAccessKeyId && awsSecretAccessKey && s3BucketName),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // Default 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

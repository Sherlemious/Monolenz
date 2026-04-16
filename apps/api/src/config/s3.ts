import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.AWS_S3_BUCKET;
const endpoint = process.env.AWS_S3_ENDPOINT?.trim() || undefined;

if (!region || !accessKeyId || !secretAccessKey || !bucket) {
  const missing: string[] = [];
  if (!region) missing.push('AWS_REGION');
  if (!accessKeyId) missing.push('AWS_ACCESS_KEY_ID');
  if (!secretAccessKey) missing.push('AWS_SECRET_ACCESS_KEY');
  if (!bucket) missing.push('AWS_S3_BUCKET');

  throw new Error(
    `Missing AWS S3 environment variables: ${missing.join(', ')}. ` +
      `Please ensure these are set in your environment.`
  );
}

export const s3Client = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
  ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
});

export const S3_BUCKET = bucket;
export const S3_REGION = region;
export const S3_ENDPOINT = endpoint;

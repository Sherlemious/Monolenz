import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, s3Config } from '../../config/s3';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  bucketName: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export class S3Service {
  private bucketName: string;

  constructor() {
    this.bucketName = s3Config.bucketName;
  }

  /**
   * Checks if S3 is properly configured
   */
  isConfigured(): boolean {
    return s3Config.isConfigured;
  }

  /**
   * Validates file before upload
   */
  private validateFile(buffer: Buffer, mimeType: string): void {
    if (!this.isConfigured()) {
      throw new Error('S3 is not configured. Please set required environment variables.');
    }

    // Check file size
    if (buffer.length > s3Config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${s3Config.maxFileSize / 1024 / 1024}MB`);
    }

    // Check mime type
    if (!s3Config.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed. Allowed types: ${s3Config.allowedMimeTypes.join(', ')}`);
    }
  }

  /**
   * Generates a unique file key
   */
  private generateFileKey(fileName: string, folder?: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0];
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = folder
      ? `${folder}/${timestamp}-${uuid}-${sanitizedFileName}`
      : `${timestamp}-${uuid}-${sanitizedFileName}`;
    return key;
  }

  /**
   * Uploads a file to S3
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    this.validateFile(buffer, mimeType);

    const key = this.generateFileKey(options.fileName || fileName, options.folder);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: options.contentType || mimeType,
      ACL: options.isPublic ? 'public-read' : 'private',
      Metadata: options.metadata,
    });

    await s3Client.send(command);

    const url = options.isPublic ? this.getPublicUrl(key) : await this.getSignedUrl(key, 3600); // 1 hour expiry for private files

    return {
      key,
      url,
      bucketName: this.bucketName,
      fileName: options.fileName || fileName,
      mimeType: options.contentType || mimeType,
      size: buffer.length,
    };
  }

  /**
   * Deletes a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('S3 is not configured.');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Checks if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generates a signed URL for private file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('S3 is not configured.');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Gets the public URL for a public file (if ACL is public-read)
   */
  getPublicUrl(key: string): string {
    const baseUrl = `https://${this.bucketName}.s3.${s3Config.region}.amazonaws.com/`;
    const encodedKey = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    const url = new URL(encodedKey, baseUrl);
    return url.toString();
  }

  /**
   * Deletes a file by extracting the key from URL
   */
  async deleteFileByUrl(url: string): Promise<void> {
    const key = this.extractKeyFromUrl(url);
    if (key) {
      await this.deleteFile(key);
    }
  }

  /**
   * Extracts the S3 key from a URL
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Handle both path-style and virtual-hosted-style URLs
      if (urlObj.hostname.includes('s3')) {
        const pathname = urlObj.pathname;
        // Remove leading slash and bucket name if present in path
        const key = pathname.startsWith(`/${this.bucketName}/`)
          ? pathname.substring(`/${this.bucketName}/`.length)
          : pathname.substring(1);
        return key;
      }
    } catch (error) {
      console.error('Failed to extract key from URL:', error);
    }
    return null;
  }

  /**
   * Uploads multiple files
   */
  async uploadFiles(
    files: Array<{ buffer: Buffer; fileName: string; mimeType: string }>,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file.buffer, file.fileName, file.mimeType, options));

    return await Promise.all(uploadPromises);
  }
}

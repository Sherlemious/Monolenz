# S3 File Upload Integration

This document describes the S3 file upload functionality integrated into the Monolenz API.

## Overview

The S3 integration provides secure file upload, storage, and management capabilities using AWS S3. It supports both public and private file storage with signed URLs for secure access.

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1                          # AWS region for your S3 bucket
AWS_ACCESS_KEY_ID=your_access_key_id          # AWS access key ID
AWS_SECRET_ACCESS_KEY=your_secret_access_key  # AWS secret access key
S3_BUCKET_NAME=your_bucket_name               # S3 bucket name
MAX_FILE_SIZE=5242880                         # Maximum file size in bytes (default: 5MB)
```

### Supported File Types

The following MIME types are supported by default:

- **Images**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **Documents**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

To modify supported file types, update the `allowedMimeTypes` array in [`src/config/s3.ts`](../src/config/s3.ts).

## API Endpoints

All upload endpoints require authentication via the `requireAuth` middleware.

### Upload Single File

**Endpoint**: `POST /api/v1/upload/single`

**Content-Type**: `multipart/form-data`

**Request Body**:

- `file`: File (required) - The file to upload
- `folder`: string (optional) - Target folder name (default: "uploads")
- `isPublic`: boolean (optional) - Whether the file should be publicly accessible (default: false)

**Response**:

```json
{
  "success": true,
  "data": {
    "key": "uploads/1707408000000-abc123-filename.jpg",
    "url": "https://bucket.s3.us-east-1.amazonaws.com/...",
    "bucketName": "your-bucket-name",
    "fileName": "filename.jpg",
    "mimeType": "image/jpeg",
    "size": 102400
  }
}
```

**Example (cURL)**:

```bash
curl -X POST http://localhost:3001/api/v1/upload/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.jpg" \
  -F "folder=profile-pictures" \
  -F "isPublic=true"
```

### Upload Multiple Files

**Endpoint**: `POST /api/v1/upload/multiple`

**Content-Type**: `multipart/form-data`

**Request Body**:

- `files`: File[] (required) - Array of files (max 10)
- `folder`: string (optional) - Target folder name (default: "uploads")
- `isPublic`: boolean (optional) - Whether files should be publicly accessible (default: false)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "key": "uploads/1707408000000-abc123-file1.jpg",
      "url": "https://bucket.s3.us-east-1.amazonaws.com/...",
      "bucketName": "your-bucket-name",
      "fileName": "file1.jpg",
      "mimeType": "image/jpeg",
      "size": 102400
    }
    // ... more files
  ]
}
```

**Example (cURL)**:

```bash
curl -X POST http://localhost:3001/api/v1/upload/multiple \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.jpg" \
  -F "folder=documents"
```

### Delete File

**Endpoint**: `DELETE /api/v1/upload/:key`

**Parameters**:

- `key`: string (required) - URL-encoded S3 object key

**Response**:

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Example (cURL)**:

```bash
curl -X DELETE "http://localhost:3001/api/v1/upload/uploads%2F1707408000000-abc123-file.jpg" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Signed URL

**Endpoint**: `GET /api/v1/upload/signed-url/:key`

**Parameters**:

- `key`: string (required) - URL-encoded S3 object key

**Query Parameters**:

- `expiresIn`: number (optional) - URL expiration time in seconds (default: 3600)

**Response**:

```json
{
  "success": true,
  "data": {
    "url": "https://bucket.s3.amazonaws.com/...?X-Amz-Signature=...",
    "expiresIn": 3600
  }
}
```

**Example (cURL)**:

```bash
curl "http://localhost:3001/api/v1/upload/signed-url/uploads%2F1707408000000-abc123-file.jpg?expiresIn=7200" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Check File Existence

**Endpoint**: `GET /api/v1/upload/exists/:key`

**Parameters**:

- `key`: string (required) - URL-encoded S3 object key

**Response**:

```json
{
  "success": true,
  "data": {
    "exists": true
  }
}
```

## Usage in Code

### Uploading Files

```typescript
import { s3Service } from '../services';

// Upload a single file
const result = await s3Service.uploadFile(fileBuffer, 'filename.jpg', 'image/jpeg', {
  folder: 'profile-pictures',
  isPublic: true,
  metadata: {
    userId: 'user-123',
    uploadedAt: new Date().toISOString(),
  },
});

console.log(result.url); // Public or signed URL
```

### Deleting Files

```typescript
// Delete by key
await s3Service.deleteFile('uploads/1707408000000-abc123-file.jpg');

// Delete by URL
await s3Service.deleteFileByUrl('https://bucket.s3.amazonaws.com/uploads/...');
```

### Generating Signed URLs

```typescript
// Generate a signed URL valid for 2 hours
const signedUrl = await s3Service.getSignedUrl('uploads/1707408000000-abc123-file.jpg', 7200);
```

### Checking File Existence

```typescript
const exists = await s3Service.fileExists('uploads/1707408000000-abc123-file.jpg');
console.log(exists); // true or false
```

## File Naming Convention

Files are automatically renamed using the following pattern:

```
{folder}/{timestamp}-{uuid}-{sanitized-filename}
```

Example: `profile-pictures/1707408000000-abc123-avatar.jpg`

This ensures:

- **Uniqueness**: Timestamp + UUID prevents collisions
- **Traceability**: Original filename is preserved (sanitized)
- **Organization**: Files are organized by folder

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT authentication
2. **File Size Limits**: Configurable via `MAX_FILE_SIZE` environment variable
3. **MIME Type Validation**: Only allowed file types can be uploaded
4. **Private by Default**: Files are private unless explicitly marked as public
5. **Signed URLs**: Private files use temporary signed URLs for secure access
6. **Metadata**: User ID and timestamp are automatically added to file metadata

## Error Handling

The S3 service includes comprehensive error handling:

```json
{
  "success": false,
  "error": "File size exceeds maximum allowed size of 5MB"
}
```

Common errors:

- `S3 is not configured` - Missing AWS credentials
- `File size exceeds maximum allowed size` - File too large
- `File type {type} is not allowed` - Invalid MIME type
- `No file provided` - Missing file in request

## AWS S3 Bucket Setup

1. **Create an S3 Bucket**:

   ```bash
   aws s3 mb s3://your-bucket-name --region us-east-1
   ```

2. **Configure CORS** (if needed for direct browser uploads):

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://yourdomain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **Create IAM User** with the following policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
         "Resource": ["arn:aws:s3:::your-bucket-name", "arn:aws:s3:::your-bucket-name/*"]
       }
     ]
   }
   ```

## Testing

Use the Bruno API collection in [`docs/upload/`](./upload/) to test all S3 endpoints.

## Troubleshooting

### "S3 is not configured" Error

Ensure all required environment variables are set:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`

### "Access Denied" Error

Verify that your IAM user has the correct permissions for your S3 bucket.

### Files Not Uploading

1. Check file size limits (`MAX_FILE_SIZE`)
2. Verify MIME type is in the allowed list
3. Ensure bucket exists and is accessible
4. Check AWS credentials are valid

## Future Enhancements

- [ ] Support for additional cloud storage providers (Google Cloud Storage, Azure Blob)
- [ ] Image optimization and resizing
- [ ] Virus scanning integration
- [ ] Direct browser upload with presigned URLs
- [ ] Automatic cleanup of unused files
- [ ] CDN integration for faster delivery

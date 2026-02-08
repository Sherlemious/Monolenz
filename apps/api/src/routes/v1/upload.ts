import { Router } from 'express';
import {
  upload,
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  getSignedUrl,
  checkFileExists,
} from '../../controllers/upload.controller';
import { authenticate } from '../../middleware/auth';

const router: Router = Router();

// All upload routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/upload/single
 * @desc    Upload a single file
 * @access  Private
 * @body    file: File (multipart/form-data)
 * @body    folder?: string (optional folder name)
 * @body    isPublic?: boolean (default: false)
 */
router.post('/single', upload.single('file'), uploadSingleFile);

/**
 * @route   POST /api/v1/upload/multiple
 * @desc    Upload multiple files
 * @access  Private
 * @body    files: File[] (multipart/form-data)
 * @body    folder?: string (optional folder name)
 * @body    isPublic?: boolean (default: false)
 */
router.post('/multiple', upload.array('files', 10), uploadMultipleFiles);

/**
 * @route   DELETE /api/v1/upload/:key
 * @desc    Delete a file by key
 * @access  Private
 * @params  key: string (URL encoded S3 key)
 */
router.delete('/:key(*)', deleteFile);

/**
 * @route   GET /api/v1/upload/signed-url/:key
 * @desc    Get a signed URL for accessing a private file
 * @access  Private
 * @params  key: string (URL encoded S3 key)
 * @query   expiresIn?: number (expiration time in seconds, default: 3600)
 */
router.get('/signed-url/:key(*)', getSignedUrl);

/**
 * @route   GET /api/v1/upload/exists/:key
 * @desc    Check if a file exists
 * @access  Private
 * @params  key: string (URL encoded S3 key)
 */
router.get('/exists/:key(*)', checkFileExists);

export default router;

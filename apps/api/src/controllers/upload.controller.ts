import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { S3Service } from '../services/infrastructure/s3.service';
import { s3Config } from '../config/s3';

// Initialize S3 service
const s3Service = new S3Service();

// Configure multer for memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: s3Config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (s3Config.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${s3Config.allowedMimeTypes.join(', ')}`));
    }
  },
});

/**
 * Upload a single file
 */
export const uploadSingleFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!s3Service.isConfigured()) {
      res.status(503).json({
        success: false,
        error: 'File upload service is not configured',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file provided',
      });
      return;
    }

    const { folder, isPublic } = req.body;

    const result = await s3Service.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, {
      folder: folder || 'uploads',
      isPublic: isPublic === 'true' || isPublic === true,
      metadata: {
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
      },
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!s3Service.isConfigured()) {
      res.status(503).json({
        success: false,
        error: 'File upload service is not configured',
      });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files provided',
      });
      return;
    }

    const { folder, isPublic } = req.body;

    if (!Array.isArray(req.files)) {
      res.status(400).json({
        success: false,
        error: 'Invalid files format',
      });
      return;
    }

    const filesToUpload = req.files.map((file: { buffer: Buffer; originalname: string; mimetype: string }) => ({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    }));

    const results = await s3Service.uploadFiles(filesToUpload, {
      folder: folder || 'uploads',
      isPublic: isPublic === 'true' || isPublic === true,
      metadata: {
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
      },
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a file by key
 */
export const deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!s3Service.isConfigured()) {
      res.status(503).json({
        success: false,
        error: 'File upload service is not configured',
      });
      return;
    }

    const { key } = req.params;

    if (!key) {
      res.status(400).json({
        success: false,
        error: 'File key is required',
      });
      return;
    }

    await s3Service.deleteFile(key);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a signed URL for a file
 */
export const getSignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!s3Service.isConfigured()) {
      res.status(503).json({
        success: false,
        error: 'File upload service is not configured',
      });
      return;
    }

    const { key } = req.params;
    const expiresIn = parseInt(req.query.expiresIn as string, 10) || 3600;

    if (!key) {
      res.status(400).json({
        success: false,
        error: 'File key is required',
      });
      return;
    }

    const url = await s3Service.getSignedUrl(key, expiresIn);

    res.status(200).json({
      success: true,
      data: { url, expiresIn },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if file exists
 */
export const checkFileExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!s3Service.isConfigured()) {
      res.status(503).json({
        success: false,
        error: 'File upload service is not configured',
      });
      return;
    }

    const { key } = req.params;

    if (!key) {
      res.status(400).json({
        success: false,
        error: 'File key is required',
      });
      return;
    }

    const exists = await s3Service.fileExists(key);

    res.status(200).json({
      success: true,
      data: { exists },
    });
  } catch (error) {
    next(error);
  }
};

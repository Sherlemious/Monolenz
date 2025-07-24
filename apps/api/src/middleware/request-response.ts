import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, HTTP_STATUS_CODES } from '@athaar/types';
import { IPaginationMeta } from '../types/express';

/**
 * Request preprocessing middleware
 * Adds common properties and utilities to request object
 */
export const preprocessRequest = (req: Request, res: Response, next: NextFunction) => {
  // Add request ID for tracing
  req.requestId = uuidv4();
  req.startTime = new Date();

  // Initialize metadata object
  req.metadata = {};

  // Parse pagination parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const sort = req.query.sort as string;
  const order = (req.query.order as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const search = req.query.search as string;

  req.paginationQuery = {
    page,
    limit,
    sort,
    order,
    search,
  };

  // Parse filters (anything not pagination-related)
  req.filters = Object.fromEntries(
    Object.entries(req.query).filter(([key]) => !['page', 'limit', 'sort', 'order', 'search'].includes(key))
  );

  next();
};

/**
 * Response formatting middleware
 * Adds standardized response methods
 */
export const formatResponse = (req: Request, res: Response, next: NextFunction) => {
  // Success response method
  res.success = function <T>(data: T, message = 'Success') {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        version: '1.0.0',
      },
    };

    return this.status(HTTP_STATUS_CODES.OK).json(response);
  };

  // Error response method
  res.error = function (message: string, statusCode = HTTP_STATUS_CODES.BAD_REQUEST, errors?: string[]) {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        version: '1.0.0',
      },
    };

    return this.status(statusCode).json(response);
  };

  // Paginated response method
  res.paginated = function <T>(data: T[], meta: IPaginationMeta, message = 'Success') {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        version: '1.0.0',
        pagination: meta,
      },
    };

    return this.status(HTTP_STATUS_CODES.OK).json(response);
  };

  next();
};

/**
 * Request/Response logging middleware
 */
export const logRequestResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - req.startTime.getTime();

    console.log({
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.userId,
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Error handling middleware
 */
export const handleErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.userId,
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.error('Validation failed', HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, err.errors);
  }

  if (err.name === 'UnauthorizedError') {
    return res.error('Unauthorized', HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  if (err.code === 'ECONNREFUSED') {
    return res.error('Service unavailable', HTTP_STATUS_CODES.SERVICE_UNAVAILABLE);
  }

  // Default error response
  return res.error(
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
  );
};

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, HTTP_STATUS_CODES, PaginationMeta } from '@monolenz/types/api';

/**
 * Request preprocessing middleware
 * Processes query params into standardized, typed objects with defaults
 */
export const preprocessRequest = (req: Request, res: Response, next: NextFunction) => {
  // Add request tracking
  req.requestId = uuidv4();
  req.startTime = new Date();
  req.metadata = {};

  // Process pagination params with defaults
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const sort = (req.query.sort as string) || '';
  const order = (req.query.order as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';

  req.pagination = { page, limit, sort, order };

  // Process search params (extends pagination)
  const query = (req.query.query as string) || '';
  const search = (req.query.search as string) || query;

  // Extract filters (everything except pagination/search params)
  const reservedParams = ['page', 'limit', 'sort', 'order', 'query', 'search'];
  const filters = Object.fromEntries(Object.entries(req.query).filter(([key]) => !reservedParams.includes(key)));

  req.searchParams = { ...req.pagination, query, search, filters };

  next();
};

/**
 * Response formatting middleware
 * Adds standardized response methods to Express Response
 */
export const formatResponse = (req: Request, res: Response, next: NextFunction) => {
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

  res.paginated = function <T>(data: T[], total: number, message = 'Success') {
    const { page, limit } = req.pagination;
    const totalPages = Math.ceil(total / limit);

    const paginationMeta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };

    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        version: '1.0.0',
        pagination: paginationMeta,
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

    // Log request details
    console.log(
      JSON.stringify({
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.userId,
        timestamp: new Date().toISOString(),
      })
    );

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Global error handling middleware
 */
export const handleErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Request Error:', {
    requestId: req.requestId,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    userId: req.userId,
    timestamp: new Date().toISOString(),
  });

  // Helper function to send error response (doesn't rely on res.error)
  const sendError = (message: string, statusCode: number, errors?: string[]) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        version: '1.0.0',
      },
    });
  };

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const zodErrors = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`);
    return sendError('Validation failed', HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, zodErrors);
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return sendError('Duplicate entry', HTTP_STATUS_CODES.CONFLICT, ['Resource already exists']);
  }

  if (err.code === 'P2025') {
    return sendError('Resource not found', HTTP_STATUS_CODES.NOT_FOUND);
  }

  // Handle Supabase auth errors
  if (err.name === 'AuthError' || err.message?.includes('JWT')) {
    return sendError('Authentication failed', HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return sendError('Validation failed', HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, err.errors);
  }

  if (err.name === 'UnauthorizedError') {
    return sendError('Unauthorized access', HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  if (err.code === 'ECONNREFUSED') {
    return sendError('Service temporarily unavailable', HTTP_STATUS_CODES.SERVICE_UNAVAILABLE);
  }

  // Default error response
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Unknown error occurred';

  return sendError(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
};

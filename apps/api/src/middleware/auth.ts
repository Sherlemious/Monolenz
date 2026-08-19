import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { HTTP_STATUS_CODES } from '@monolenz/types';
import { Logger } from '../utils/logger';
import { verifyAuthToken } from '../config/auth';

const logger = new Logger('AuthMiddleware');

function readBearer(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  return token || null;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = readBearer(req);
    if (!token) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        errors: [{ field: 'authorization', message: 'Bearer token required' }],
      });
    }

    const user = await verifyAuthToken(token);
    if (!user) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired token',
        errors: [{ field: 'authorization', message: 'Invalid token' }],
      });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    logger.error('Authentication error', { error: error as Error });
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Authentication service error',
      errors: [{ field: 'auth', message: 'Internal authentication error' }],
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = readBearer(req);
    if (!token) return next();

    const user = await verifyAuthToken(token);
    if (user) {
      req.user = user;
      req.userId = user.id;
      req.userRole = user.role;
    }
    next();
  } catch (error) {
    logger.error('Optional authentication error', { error: error as Error });
    next();
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        errors: [{ field: 'auth', message: 'User not authenticated' }],
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions',
        errors: [
          {
            field: 'authorization',
            message: `Requires one of: ${allowedRoles.join(', ')}`,
          },
        ],
      });
    }

    next();
  };
};

export const authorizeOwnership = (resourceIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.userId) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        errors: [{ field: 'auth', message: 'User not authenticated' }],
      });
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.userId;

    if (req.userRole === 'admin' || resourceId === userId) {
      return next();
    }

    return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
      success: false,
      message: 'Access denied',
      errors: [{ field: 'ownership', message: 'You can only access your own resources' }],
    });
  };
};

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const expectedApiKey = process.env.API_KEY;

  if (!expectedApiKey) {
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'API key authentication not configured',
      errors: [{ field: 'config', message: 'API key not configured' }],
    });
  }

  if (
    !apiKey ||
    apiKey.length !== expectedApiKey.length ||
    !crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedApiKey))
  ) {
    return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid API key',
      errors: [{ field: 'x-api-key', message: 'Valid API key required' }],
    });
  }

  next();
};

export const logActivity = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.activity = {
      action,
      userId: req.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    };

    next();
  };
};

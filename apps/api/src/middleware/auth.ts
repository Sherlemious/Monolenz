import { Request, Response, NextFunction } from 'express';
import { supabaseAuth } from '../config/supabase';
import { HTTP_STATUS_CODES } from '@monolenz/types';

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        errors: [{ field: 'authorization', message: 'Bearer token required' }],
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        errors: [{ field: 'authorization', message: 'Bearer token required' }],
      });
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired token',
        errors: [{ field: 'authorization', message: 'Invalid token' }],
      });
    }

    // Check if user is active
    if (!user.email_confirmed_at) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Email not confirmed',
        errors: [{ field: 'email', message: 'Please confirm your email address' }],
      });
    }

    // Attach user info to request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.app_metadata?.role || 'user';

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Authentication service error',
      errors: [{ field: 'auth', message: 'Internal authentication error' }],
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (!error && user && user.email_confirmed_at) {
      req.user = user;
      req.userId = user.id;
      req.userRole = user.app_metadata?.role || 'user';
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue without authentication on error
  }
};

// Role-based authorization
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

// Resource ownership authorization
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

    // Allow if user is admin or owns the resource
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

// API key authentication (for service-to-service calls)
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

  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid API key',
      errors: [{ field: 'x-api-key', message: 'Valid API key required' }],
    });
  }

  next();
};

// Activity logging middleware
export const logActivity = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store activity info for logging after response
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

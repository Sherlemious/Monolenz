import { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '@monolenz/types';
import * as authService from '../services/domain/auth.service';
import { AuthError } from '../services/domain/auth.service';
import { Logger } from '../utils/logger';

const logger = new Logger('AuthController');

function siteUrl(req: Request) {
  return process.env.PUBLIC_SITE_URL || req.get('origin') || 'http://localhost:3000';
}

function handleAuthError(res: Response, error: unknown) {
  if (error instanceof AuthError) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      errors: [{ field: 'auth', message: error.message }],
    });
  }
  logger.error('Auth error', { error: error as Error });
  return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Authentication service error',
    errors: [{ field: 'auth', message: 'Internal authentication error' }],
  });
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};
    const result = await authService.register(String(email || ''), String(password || ''));
    return res.status(HTTP_STATUS_CODES.CREATED).json({ success: true, data: result });
  } catch (error) {
    return handleAuthError(res, error);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};
    const result = await authService.login(String(email || ''), String(password || ''));
    return res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: result });
  } catch (error) {
    return handleAuthError(res, error);
  }
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required',
    });
  }
  return res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: { user: req.user } });
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body ?? {};
    const result = await authService.requestPasswordReset(String(email || ''), siteUrl(req));
    return res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'If that email exists, a reset link was sent.',
      data: result,
    });
  } catch (error) {
    return handleAuthError(res, error);
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body ?? {};
    await authService.resetPassword(String(token || ''), String(password || ''));
    return res.status(HTTP_STATUS_CODES.OK).json({ success: true, message: 'Password updated' });
  } catch (error) {
    return handleAuthError(res, error);
  }
}

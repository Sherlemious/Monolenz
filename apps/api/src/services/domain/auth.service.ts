import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { signAuthToken, type AuthUser } from '../../config/auth';
import { sendAuthEmail } from '../infrastructure/mailer';
import { Logger } from '../../utils/logger';

const logger = new Logger('AuthService');
const TOKEN_TTL_MS = 60 * 60 * 1000;

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

function toAuthUser(user: { id: string; email: string; role: string }): AuthUser {
  return { id: user.id, email: user.email, role: user.role };
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function issueToken(userId: string, type: 'email_verify' | 'password_reset') {
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.auth_tokens.deleteMany({ where: { user_id: userId, type } });
  await prisma.auth_tokens.create({
    data: {
      user_id: userId,
      type,
      token_hash: hashToken(token),
      expires_at: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

export async function register(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) throw new AuthError('Valid email is required');
  if (password.length < 8) throw new AuthError('Password must be at least 8 characters');

  const existing = await prisma.users.findUnique({ where: { email: normalized } });
  if (existing) throw new AuthError('An account with this email already exists', 409);

  const user = await prisma.users.create({
    data: {
      email: normalized,
      password_hash: await bcrypt.hash(password, 12),
      email_verified_at: new Date(),
      role: 'user',
    },
  });

  const token = await signAuthToken(toAuthUser(user));
  return { token, user: toAuthUser(user) };
}

export async function login(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.users.findUnique({ where: { email: normalized } });
  if (!user) throw new AuthError('Invalid email or password', 401);

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new AuthError('Invalid email or password', 401);

  const token = await signAuthToken(toAuthUser(user));
  return { token, user: toAuthUser(user) };
}

export async function requestPasswordReset(email: string, siteUrl: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.users.findUnique({ where: { email: normalized } });
  if (!user) return { sent: true as const };

  const raw = await issueToken(user.id, 'password_reset');
  const resetUrl = `${siteUrl.replace(/\/$/, '')}/reset-password?token=${raw}`;
  const sent = await sendAuthEmail(
    user.email,
    'Reset your Monolenz password',
    `Reset your password: ${resetUrl}\nThis link expires in 1 hour.`
  );
  if (!sent) {
    logger.warn('Password reset email was not sent; returning URL only in non-production', { userId: user.id });
  }
  return {
    sent: true as const,
    resetUrl: process.env.NODE_ENV === 'production' && sent ? undefined : resetUrl,
  };
}

export async function resetPassword(rawToken: string, password: string) {
  if (password.length < 8) throw new AuthError('Password must be at least 8 characters');
  const tokenHash = hashToken(rawToken);
  const record = await prisma.auth_tokens.findUnique({ where: { token_hash: tokenHash } });
  if (!record || record.type !== 'password_reset' || record.expires_at < new Date()) {
    throw new AuthError('Invalid or expired reset link', 400);
  }

  await prisma.$transaction([
    prisma.users.update({
      where: { id: record.user_id },
      data: { password_hash: await bcrypt.hash(password, 12), updated_at: new Date() },
    }),
    prisma.auth_tokens.deleteMany({ where: { user_id: record.user_id, type: 'password_reset' } }),
  ]);
}

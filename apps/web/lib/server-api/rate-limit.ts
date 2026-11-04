import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import { ServiceError } from 'api/core';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function assertRateLimit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  existing.count += 1;
  if (existing.count > max) {
    throw new ServiceError(
      'Too many tailor requests, please try again later.',
      null,
      HTTP_STATUS_CODES.TOO_MANY_REQUESTS
    );
  }
}

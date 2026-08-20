import { createRequire } from 'node:module';

type NewRelicAgent = typeof import('newrelic');

let cached: NewRelicAgent | null | undefined;

export function getNewRelic(): NewRelicAgent | null {
  if (cached !== undefined) return cached;
  if (process.env.VERCEL || !process.env.NEW_RELIC_LICENSE_KEY) {
    cached = null;
    return cached;
  }
  try {
    const require = createRequire(import.meta.url);
    cached = require('newrelic') as NewRelicAgent;
  } catch {
    cached = null;
  }
  return cached;
}

#!/usr/bin/env node
/**
 * OpenNext compiles every .env file it finds (repo root + apps/web, all modes,
 * including .env.local) into the Worker bundle as process.env defaults. Runtime
 * secrets must come from Worker secrets/bindings instead, so refuse to build the
 * Worker while a secret-looking value sits in one of those files.
 *
 * Deploy from CI (clean checkout) or move local env files aside first.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootDir = path.resolve(appDir, '../..');
const files = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
  '.env.development',
  '.env.development.local',
  '.env.test',
  '.env.test.local',
];

// NEXT_PUBLIC_* values are inlined into client JS anyway; everything else is treated as private.
const isPublic = (key) => key.startsWith('NEXT_PUBLIC_') || key === 'NEXTJS_ENV';

const offenders = [];
for (const dir of [rootDir, appDir]) {
  for (const name of files) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;
      const [, key, value] = match;
      if (!isPublic(key) && value.replace(/^["']|["']$/g, '').trim() !== '') {
        offenders.push(`${path.relative(rootDir, file)}: ${key}`);
      }
    }
  }
}

if (offenders.length) {
  console.error('Refusing to build the Worker: these values would be embedded in the deployed bundle:\n');
  for (const o of offenders) console.error(`  - ${o}`);
  console.error('\nSet them as Worker secrets (`wrangler secret put NAME`) and deploy from CI,');
  console.error('or temporarily move the local env files aside.');
  process.exit(1);
}

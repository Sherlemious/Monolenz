/** @type {import('next').NextConfig} */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const generatedPrismaDir = path.join(webRoot, 'generated', 'prisma');

function listQueryEngines(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((name) => name.includes('query_engine') || name.endsWith('.node'))
    .map((name) => path.join(dir, name));
}

class CopyPrismaEnginesPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CopyPrismaEnginesPlugin', (compilation) => {
      const engines = listQueryEngines(generatedPrismaDir);
      if (engines.length === 0) {
        return;
      }

      const destDirs = [
        path.join(compilation.outputPath, 'app/api/v1'),
        path.join(compilation.outputPath, 'app/api/v1/[...path]'),
      ];

      for (const destDir of destDirs) {
        fs.mkdirSync(destDir, { recursive: true });
        for (const engine of engines) {
          fs.copyFileSync(engine, path.join(destDir, path.basename(engine)));
        }
      }
    });
  }
}

const prismaTraceGlobs = [
  './generated/prisma/**/*',
  '../../node_modules/.pnpm/**/.prisma/client/**',
  '../../node_modules/.pnpm/**/libquery_engine*',
  '../../node_modules/.prisma/client/**',
];

const nextConfig = {
  // Enable standalone output for Docker/Cloud Run deployment
  // Disabled on Windows due to symlink permission issues - re-enable in CI/CD
  output: process.env.VERCEL ? undefined : process.env.CI ? 'standalone' : undefined,
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  outputFileTracingIncludes: {
    '/*': prismaTraceGlobs,
    '/api/**/*': prismaTraceGlobs,
    '/api/v1/[...path]': prismaTraceGlobs,
    '/api/v1/[...path]/route': prismaTraceGlobs,
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(new PrismaPlugin());
      config.plugins.push(new CopyPrismaEnginesPlugin());
    }
    return config;
  },

  // Optimize for production
  poweredByHeader: false,
  generateEtags: false,

  // Compression
  compress: true,

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Redirects for health checks and monitoring
  async redirects() {
    return [
      // Redirect root health check to proper endpoint
      {
        source: '/ping',
        destination: '/health',
        permanent: false,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },

  transpilePackages: ['api'],

  // External packages that should not be bundled for server components
  serverExternalPackages: ['jose', '@prisma/client', 'prisma', 'bcryptjs', 'winston'],
};

export default nextConfig;

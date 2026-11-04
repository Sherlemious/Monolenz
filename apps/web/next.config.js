/** @type {import('next').NextConfig} */
import path from 'node:path';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig = {
  // Deployed to Cloudflare Workers via @opennextjs/cloudflare (it sets standalone output itself).
  outputFileTracingRoot: path.join(process.cwd(), '../..'),

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

  transpilePackages: ['api', '@monolenz/resume-pdf'],

  // External packages that should not be bundled for server components
  serverExternalPackages: [
    'jose',
    '@prisma/client',
    '.prisma/client',
    'bcryptjs',
    'winston',
    '@react-pdf/renderer',
    'openai',
  ],

  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

// Exposes Cloudflare bindings (getCloudflareContext) during `next dev` only; during
// `next build` it would try to emulate Hyperdrive locally.
export default function config(phase) {
  if (phase === PHASE_DEVELOPMENT_SERVER) initOpenNextCloudflareForDev();
  return nextConfig;
}

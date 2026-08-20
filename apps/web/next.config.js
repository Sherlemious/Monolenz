/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker/Cloud Run deployment
  // Disabled on Windows due to symlink permission issues - re-enable in CI/CD
  output: process.env.VERCEL ? undefined : process.env.CI ? 'standalone' : undefined,

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
  serverExternalPackages: ['jose', '@prisma/client', 'prisma', 'bcryptjs', 'winston', 'newrelic'],
};

export default nextConfig;

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  minify: false,
  sourcemap: true,
  splitting: false,
  dts: false,
  platform: 'node',
  treeshake: true,
  external: ['@prisma/client', 'newrelic', 'dotenv'],
  bundle: true,
  // Handle path mapping
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    };
  },
});

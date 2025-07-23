import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  minify: false,
  sourcemap: true,
  splitting: false,
  dts: false,
  external: ['@prisma/client'],
});

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'api/index': 'src/api/index.ts',
    'entities/index': 'src/entities/index.ts',
    'validation/index': 'src/validation/index.ts',
    'enums/index': 'src/enums/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  external: ['zod'],
  outDir: 'dist',
  target: 'es2022',
});

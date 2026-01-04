import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'api/index': 'src/api/index.ts',
    'entities/index': 'src/entities/index.ts',
    'entities/blocks': 'src/entities/blocks.ts',
    'validation/index': 'src/validation/index.ts',
    'validation/block-schemas': 'src/validation/block-schemas.ts',
    'enums/index': 'src/enums/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: false,
  splitting: false,
  sourcemap: true,
  minify: false,
  external: ['zod'],
  outDir: 'dist',
  target: 'es2022',
});

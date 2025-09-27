import { fileURLToPath } from 'node:url';
import path from 'node:path';
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,mjs,cjs,ts}'], // Only lint src/ directory, not config files
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        node: true,
        es2022: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['*.js', '*.mjs'], // Config files without TypeScript parsing
    languageOptions: {
      sourceType: 'module',
      globals: {
        node: true,
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'prisma/generated/', '*.config.js'],
  },
];

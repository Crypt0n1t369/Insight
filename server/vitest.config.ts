import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
    exclude: ['**/node_modules/**'],
  },
});

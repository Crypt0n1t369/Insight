import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['*.test.ts', '*.spec.ts', 'server/*.test.ts', 'server/*.spec.ts'],
    globals: true,
    setupFiles: [],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**']
    }
  }
});

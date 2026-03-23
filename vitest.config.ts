import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      'projects/**',
      'node_modules/**',
      'server/node_modules/**',
    ],
  },
})

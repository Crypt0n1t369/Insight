import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      'projects/**', // Only run tests in top-level dirs, not nested project workspaces
    ],
  },
})

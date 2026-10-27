import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // The fs module cache serves stale `import.meta.glob` results when tool folders are added,
    // silently hiding new registry entries / messages from tests. Correctness over cold-start speed.
    fsModuleCache: false,
  },
})

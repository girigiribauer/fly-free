import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': `${__dirname}/`,
      '~/': `${__dirname}/`,
    },
  },
  test: {
    setupFiles: './vitest.init.ts',
    testTimeout: 5000,
  },
})

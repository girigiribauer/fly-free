/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    alias: {
      '~': path.resolve(__dirname, './'),
      // Allow deep import for jimp plugin in tests
      '@jimp/plugin-resize/dist/commonjs/index.js': path.resolve(__dirname, 'node_modules/@jimp/plugin-resize/dist/commonjs/index.js')
    }
  }
})

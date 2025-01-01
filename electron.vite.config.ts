import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import {
  bytecodePlugin,
  defineConfig,
  externalizeDepsPlugin,
} from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [bytecodePlugin(), externalizeDepsPlugin()],
  },
  preload: {
    plugins: [bytecodePlugin(), externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [react()],
  },
})

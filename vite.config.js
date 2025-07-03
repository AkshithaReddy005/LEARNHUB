import { defineConfig } from 'vite'

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist'
  },
  server: {
    port: 3000,
    open: true
  }
})
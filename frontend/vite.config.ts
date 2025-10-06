import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ez-master/',  // Update this to match your repository name
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

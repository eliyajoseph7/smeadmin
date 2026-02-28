import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import API_CONFIG from './src/config/api'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_CONFIG.BASE_URL, // ← Gets URL from ApiClient config
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

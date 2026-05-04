import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/proxyApi': {
        target: process.env.NODE_ENV === 'production' ? 'https://touching-backend.vercel.app/api' : 'http://localhost:3006/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/proxyApi', '')
      }
    }
  },
})

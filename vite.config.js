import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://v4g9793f-7229.inc1.devtunnels.ms',
        secure: false,
      },
      '/hubs': {
        target: 'https://v4g9793f-7229.inc1.devtunnels.ms',
        ws: true,
        secure: false,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://hostel-management-accomodation-system.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
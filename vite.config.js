import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/golf-booking-finder/',
  server: { port: 3000 },
  build: { outDir: 'dist' }
})

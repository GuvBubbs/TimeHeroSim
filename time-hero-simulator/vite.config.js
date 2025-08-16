import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/TimeHeroSim/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia'],
          charts: ['chart.js'],
          utils: ['papaparse']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'pinia', 'chart.js', 'papaparse']
  }
})

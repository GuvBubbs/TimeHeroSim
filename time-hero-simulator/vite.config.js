import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, mkdirSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Plugin to copy data files from /data to /public/data
function copyDataFiles() {
  return {
    name: 'copy-data-files',
    buildStart() {
      const dataDir = 'data'
      const publicDataDir = 'public/data'
      
      // Create public/data directory if it doesn't exist
      if (!existsSync(publicDataDir)) {
        mkdirSync(publicDataDir, { recursive: true })
      }
      
      // Copy all CSV files from data/ to public/data/
      if (existsSync(dataDir)) {
        const files = readdirSync(dataDir)
        files.forEach(file => {
          if (file.endsWith('.csv')) {
            copyFileSync(join(dataDir, file), join(publicDataDir, file))
            console.log(`📁 Dev: Copied ${file} to public/data/`)
          }
        })
      }
    },
    configureServer(server) {
      // Also copy files when dev server starts
      const dataDir = 'data'
      const publicDataDir = 'public/data'
      
      if (!existsSync(publicDataDir)) {
        mkdirSync(publicDataDir, { recursive: true })
      }
      
      if (existsSync(dataDir)) {
        const files = readdirSync(dataDir)
        files.forEach(file => {
          if (file.endsWith('.csv')) {
            copyFileSync(join(dataDir, file), join(publicDataDir, file))
            console.log(`📁 Copied ${file} to public/data/`)
          }
        })
      }

      // Add API endpoint for saving CSV files
      server.middlewares.use('/api/save-csv', (req, res, next) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const { filename, content } = JSON.parse(body)
              
              if (!filename || !content) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Missing filename or content' }))
                return
              }

              // Security: only allow CSV files
              if (!filename.endsWith('.csv')) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Only CSV files are allowed' }))
                return
              }

              // Write to both /data and /public/data
              const dataPath = join('data', filename)
              const publicPath = join('public/data', filename)
              
              writeFileSync(dataPath, content, 'utf8')
              writeFileSync(publicPath, content, 'utf8')
              
              console.log(`💾 Saved ${filename} to data/ and public/data/`)
              
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, message: `Saved ${filename}` }))
            } catch (error) {
              console.error('Error saving CSV:', error)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to save CSV file' }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), copyDataFiles()],
  base: process.env.NODE_ENV === 'production' ? '/TimeHeroSim/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
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

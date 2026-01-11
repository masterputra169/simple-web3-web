import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Proxy 0x API requests to bypass CORS
        '/api/0x': {
          target: 'https://api.0x.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/0x/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Add required 0x headers
              proxyReq.setHeader('0x-api-key', env.VITE_ZEROX_API_KEY || '')
              proxyReq.setHeader('0x-version', 'v2')
            })
          },
        },
      },
    },
  }
})
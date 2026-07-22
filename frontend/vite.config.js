import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/gradio-api': {
        target: 'https://selva1909-crop-prediction.hf.space',
        changeOrigin: true, // rewrites the Host header so the Space sees a same-site request
        ws: true,           // Gradio uses SSE/websockets for streaming updates
        secure: true,
        rewrite: (path) => path.replace(/^\/gradio-api/, ''),
      },
    },
  },
})
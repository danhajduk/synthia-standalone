// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 👈 allow access from remote devices (e.g. Docker)
    port: 5173, // 👈 set port explicitly (default is 5173)
    proxy: {
      '/api': {
        target: 'http://10.0.0.100:5010', // FastAPI backend
        changeOrigin: true,
        secure: false
      },
      '/model': {
        target: 'http://10.0.0.100:5010',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

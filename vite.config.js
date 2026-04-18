import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration with optimizations for production
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.VITE_PORT || 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
    },
    strictPort: false,
  },
  build: {
    sourcemap: false,
    minify: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
});

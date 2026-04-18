import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration with optimizations for production
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.VITE_PORT || 5173,
    strictPort: false,
    // Remove proxy for Replit - frontend and backend run on same domain
  },
  build: {
    sourcemap: false,
    minify: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
});

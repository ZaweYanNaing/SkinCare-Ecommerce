import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      'lucide-react',
      'react-toastify',
      '@radix-ui/react-dialog',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-popover',
      '@radix-ui/react-alert-dialog'
    ]
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
  },
});

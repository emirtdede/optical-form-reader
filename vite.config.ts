import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  server: {
    port: 8081,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**', '**/release/**'],
      usePolling: true,
      interval: 500,
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons-vendor': ['lucide-react'],
          'export-pdf': ['jspdf', 'jspdf-autotable'],
          'export-spreadsheet': ['exceljs'],
          'export-archive': ['jszip'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});

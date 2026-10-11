import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  envDir: fileURLToPath(new URL('.', import.meta.url)),
  base: '/goit-advancedjs-hw-03/',
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});

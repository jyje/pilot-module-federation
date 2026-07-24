import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { '@': '/src' } },
  server: { host: '127.0.0.1', port: 4175, strictPort: true },
  preview: { host: '127.0.0.1', port: 4175, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.ts'],
  },
});

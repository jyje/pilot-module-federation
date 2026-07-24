import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    federation({
      name: 'vue_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './Monitor': './src/components/Monitor.vue',
      },
      shared: {
        vue: { singleton: true },
      },
    }),
  ],
  resolve: { alias: { '@': '/src' } },
  server: { host: '127.0.0.1', port: 4174, strictPort: true, cors: true },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true, cors: true },
  build: {
    target: 'esnext',
    modulePreload: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.ts'],
  },
});

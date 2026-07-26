import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';
export default defineConfig({
  plugins: [vue(), federation({ name: 'vue_observability', filename: 'remoteEntry.js', dts: false, exposes: { './Remote': './src/ObservabilityRemote.vue' }, shared: { vue: { singleton: true } } })],
  server: { host: '127.0.0.1', port: 3001, strictPort: true, cors: true, proxy: { '/api': 'http://127.0.0.1:8787' } },
  build: { target: 'esnext', modulePreload: false },
});

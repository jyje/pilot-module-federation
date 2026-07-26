import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';
export default defineConfig({
  plugins: [vue(), federation({ name: 'vue_governance', filename: 'remoteEntry.js', dts: false, exposes: { './Remote': './src/GovernanceRemote.vue' }, shared: { vue: { singleton: true } } })],
  server: { host: '127.0.0.1', port: 3002, strictPort: true, cors: true, proxy: { '/api': 'http://127.0.0.1:8787' } },
  build: { target: 'esnext', modulePreload: false },
});

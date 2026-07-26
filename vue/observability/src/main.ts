import { createApp } from 'vue';
import Remote from './ObservabilityRemote.vue';
import '@pilot/design-tokens/platform.css';
createApp(Remote, { platform: { user: { id: 'preview', displayName: 'Preview operator', email: 'preview@example.com' }, tenant: { id: 'preview', name: 'Preview tenant' }, capabilities: ['observability:read'] } }).mount('#app');

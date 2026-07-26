import { createApp } from 'vue';
import Remote from './GovernanceRemote.vue';
import '@pilot/design-tokens/platform.css';
createApp(Remote, { platform: { user: { id: 'preview', displayName: 'Preview operator', email: 'preview@example.com' }, tenant: { id: 'preview', name: 'Preview tenant' }, capabilities: ['governance:read'] } }).mount('#app');

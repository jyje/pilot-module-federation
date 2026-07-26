<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { PlatformContext } from '@pilot/contracts';
import { Button } from './ui/button';

const props = defineProps<{ platform: PlatformContext }>();
const summary = ref<{ healthy: number; degraded: number; rolling: number }>();
const greeting = ref('');
function greet(): void { greeting.value = `Hello, ${props.platform.user.displayName}. The Host-owned deployment team received your action.`; console.info('[vue-deployments-host] operator-action', { tenantId: props.platform.tenant.id, action: 'greet' }); }
onMounted(async () => { const response = await fetch('/api/deployments/summary', { credentials: 'include' }); if (response.ok) summary.value = await response.json(); });
</script>
<template><section class="domain-view" data-testid="deployments-host"><p class="eyebrow">MLOps / {{ props.platform.tenant.name }} / Host-owned</p><h2>Deployment runway</h2><template v-if="summary"><div class="metrics"><div><strong>{{ summary.healthy }}</strong><span>healthy</span></div><div><strong>{{ summary.degraded }}</strong><span>needs attention</span></div><div><strong>{{ summary.rolling }}</strong><span>rolling out</span></div></div><div class="action"><Button data-testid="deployments-hello" @click="greet">Send hello to MLOps</Button><span v-if="greeting" class="status-message" role="status">{{ greeting }}</span></div></template><span v-else class="outlet-state">Checking the deployment runway…</span></section></template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { PlatformContext } from '@pilot/contracts';
const props = defineProps<{ platform: PlatformContext }>();
const summary = ref<{ p95LatencyMs: number; errorRate: number; activeAlerts: number }>();
const greeting = ref('');
function greet(): void { greeting.value = `Hello, ${props.platform.user.displayName}. Signal watch is listening.`; console.info('[observability-remote] operator-action', { tenantId: props.platform.tenant.id, action: 'greet' }); }
onMounted(async () => {
  console.info('[observability-remote] platform-context-received', { userId: props.platform.user.id, tenantId: props.platform.tenant.id, capabilities: [...props.platform.capabilities].join(',') });
  const response = await fetch('/api/observability/summary', { credentials: 'include' });
  if (response.ok) { summary.value = await response.json(); console.info('[observability-remote] session-api-authorized', { tenantId: props.platform.tenant.id }); }
});
</script>
<template><section class="domain-view" data-testid="observability-remote"><p class="eyebrow">SRE / {{ props.platform.tenant.name }}</p><h2>Signal watch</h2><template v-if="summary"><div class="metrics"><div><strong>{{ summary.p95LatencyMs }}ms</strong><span>p95 latency</span></div><div><strong>{{ summary.errorRate }}%</strong><span>error rate</span></div><div><strong>{{ summary.activeAlerts }}</strong><span>active alerts</span></div></div><div class="action"><button class="platform-button" data-testid="observability-hello" @click="greet">Send hello to SRE</button><span v-if="greeting" class="status-message" role="status">{{ greeting }}</span></div></template><span v-else class="outlet-state">Reading the live signal…</span></section></template>

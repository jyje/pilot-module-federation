<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { PlatformContext } from '@pilot/contracts';
const props = defineProps<{ platform: PlatformContext }>();
const summary = ref<{ policiesPassing: number; exceptions: number; auditEvents: number }>();
const greeting = ref('');
function greet(): void { greeting.value = `Hello, ${props.platform.user.displayName}. Governance recorded your check-in.`; console.info('[governance-remote] operator-action', { tenantId: props.platform.tenant.id, action: 'greet' }); }
onMounted(async () => {
  console.info('[governance-remote] platform-context-received', { userId: props.platform.user.id, tenantId: props.platform.tenant.id, capabilities: [...props.platform.capabilities].join(',') });
  const response = await fetch('/api/governance/summary', { credentials: 'include' });
  if (response.ok) { summary.value = await response.json(); console.info('[governance-remote] session-api-authorized', { tenantId: props.platform.tenant.id }); }
});
</script>
<template><section class="domain-view" data-testid="governance-remote"><p class="eyebrow">Security / {{ props.platform.tenant.name }}</p><h2>Policy ledger</h2><template v-if="summary"><div class="metrics"><div><strong>{{ summary.policiesPassing }}</strong><span>policies passing</span></div><div><strong>{{ summary.exceptions }}</strong><span>open exception</span></div><div><strong>{{ summary.auditEvents }}</strong><span>audit events</span></div></div><div class="action"><button class="platform-button" data-testid="governance-hello" @click="greet">Send hello to Security</button><span v-if="greeting" class="status-message" role="status">{{ greeting }}</span></div></template><span v-else class="outlet-state">Reconciling the policy ledger…</span></section></template>

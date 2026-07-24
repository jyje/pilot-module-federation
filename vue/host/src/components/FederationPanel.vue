<script lang="ts">
export default { name: 'FederationPanel' };
</script>

<script setup lang="ts">
import { markRaw, onBeforeUnmount, onMounted, ref, shallowRef, type Component } from 'vue';
import type { DeploymentContext } from '@pilot/contracts';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

const props = withDefaults(
  defineProps<{
    context: DeploymentContext;
    loadMonitor: (retry?: boolean) => Promise<{ default: Component }>;
    timeoutMs?: number;
  }>(),
  { timeoutMs: 8000 },
);

const emit = defineEmits<{
  'deployment-selected': [id: string];
  'alert-acknowledged': [id: string];
}>();

type Status = 'loading' | 'ready' | 'error';

const status = ref<Status>('loading');
const remoteComponent = shallowRef<Component | null>(null);
const attempt = ref(0);
let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

async function load(retry = false): Promise<void> {
  const currentAttempt = attempt.value;
  status.value = 'loading';
  remoteComponent.value = null;

  clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(() => {
    if (attempt.value === currentAttempt) {
      status.value = 'error';
    }
  }, props.timeoutMs);

  try {
    const mod = await props.loadMonitor(retry);
    clearTimeout(timeoutHandle);
    if (attempt.value !== currentAttempt) return;
    remoteComponent.value = markRaw(mod.default);
    status.value = 'ready';
  } catch {
    clearTimeout(timeoutHandle);
    if (attempt.value !== currentAttempt) return;
    status.value = 'error';
  }
}

function retry(): void {
  attempt.value += 1;
  void load(true);
}

onMounted(load);
onBeforeUnmount(() => clearTimeout(timeoutHandle));
</script>

<template>
  <div class="federation-panel" data-testid="federation-panel">
    <div v-if="status === 'loading'" data-testid="federation-loading" class="federation-panel__skeleton">
      <Skeleton class="h-6 w-40" />
      <Skeleton class="h-40 w-full" />
    </div>

    <Alert v-else-if="status === 'error'" variant="destructive" data-testid="federation-error">
      <AlertTitle>Remote failed to load</AlertTitle>
      <AlertDescription>
        vue_remote/Monitor could not be loaded via Module Federation within {{ timeoutMs }}ms.
      </AlertDescription>
      <AlertAction>
        <Button data-testid="federation-retry" size="sm" variant="destructive" @click="retry">
          Retry
        </Button>
      </AlertAction>
    </Alert>

    <component
      :is="remoteComponent"
      v-else-if="remoteComponent"
      :key="attempt"
      :context="context"
      @deployment-selected="(id: string) => emit('deployment-selected', id)"
      @alert-acknowledged="(id: string) => emit('alert-acknowledged', id)"
    />
  </div>
</template>

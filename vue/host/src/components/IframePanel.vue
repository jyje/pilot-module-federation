<script lang="ts">
export default { name: 'IframePanel' };
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { DeploymentContext } from '@pilot/contracts';
import { buildRemoteUrl, parseRemoteMessage, postContextToRemote } from '../lib/hostFrameAdapter';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

const props = withDefaults(
  defineProps<{
    context: DeploymentContext;
    remoteOrigin: string;
    timeoutMs?: number;
  }>(),
  { timeoutMs: 8000 },
);

const emit = defineEmits<{
  'deployment-selected': [id: string];
  'alert-acknowledged': [id: string];
  ready: [];
}>();

type Status = 'loading' | 'ready' | 'error';

const status = ref<Status>('loading');
const iframeKey = ref(0);
const iframeEl = ref<HTMLIFrameElement | null>(null);
let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

const src = computed(() => buildRemoteUrl(props.remoteOrigin, props.context));

function startTimeout(): void {
  clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(() => {
    if (status.value === 'loading') {
      status.value = 'error';
    }
  }, props.timeoutMs);
}

function sendContext(): void {
  const win = iframeEl.value?.contentWindow;
  if (win) {
    postContextToRemote(win, props.remoteOrigin, props.context);
  }
}

function handleMessage(event: MessageEvent): void {
  const message = parseRemoteMessage(event, props.remoteOrigin);
  if (!message) return;

  if (message.type === 'monitor-ready') {
    clearTimeout(timeoutHandle);
    status.value = 'ready';
    emit('ready');
    sendContext();
    return;
  }

  if (message.type === 'deployment-selected') {
    emit('deployment-selected', message.deploymentId);
    return;
  }

  if (message.type === 'alert-acknowledged') {
    emit('alert-acknowledged', message.deploymentId);
  }
}

watch(
  () => props.context,
  () => {
    if (status.value === 'ready') {
      sendContext();
    }
  },
  { deep: true },
);

function retry(): void {
  status.value = 'loading';
  iframeKey.value += 1;
  startTimeout();
}

onMounted(() => {
  window.addEventListener('message', handleMessage);
  startTimeout();
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage);
  clearTimeout(timeoutHandle);
});
</script>

<template>
  <div class="iframe-panel" data-testid="iframe-panel">
    <div v-if="status === 'loading'" data-testid="iframe-loading" class="iframe-panel__skeleton">
      <Skeleton class="h-6 w-40" />
      <Skeleton class="h-40 w-full" />
    </div>

    <Alert v-else-if="status === 'error'" variant="destructive" data-testid="iframe-error">
      <AlertTitle>Remote unavailable</AlertTitle>
      <AlertDescription>{{ src }} did not respond within {{ timeoutMs }}ms.</AlertDescription>
      <AlertAction>
        <Button data-testid="iframe-retry" size="sm" variant="destructive" @click="retry">
          Retry
        </Button>
      </AlertAction>
    </Alert>

    <iframe
      :key="iframeKey"
      ref="iframeEl"
      v-show="status === 'ready'"
      :src="src"
      data-testid="remote-iframe"
      title="Vue Remote — Model Deployment Monitor"
      class="iframe-panel__frame"
      sandbox="allow-scripts allow-same-origin"
    />
  </div>
</template>

<style scoped>
.iframe-panel__frame {
  width: 100%;
  min-height: 24rem;
  border: 1px solid hsl(var(--platform-border));
  border-radius: var(--radius);
}
</style>

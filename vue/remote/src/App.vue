<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from 'vue';
import type { DeploymentContext, MonitorEvent } from '@pilot/contracts';
import { DEFAULT_CONTEXT } from '@pilot/fixtures';
import ErrorBoundary from './components/ErrorBoundary.vue';
import Monitor from './components/Monitor.vue';
import { resolveContextFromQuery } from './lib/context';
import { parseHostContextMessage, postMessageToHost } from './lib/frameAdapter';

/** Vue Host serves on this fixed port; only its exact origin is trusted for postMessage. */
const HOST_ORIGIN = `${window.location.protocol}//${window.location.hostname}:4173`;

const isFramed = window.parent !== window;

const context = reactive<DeploymentContext>(
  resolveContextFromQuery(window.location.search, DEFAULT_CONTEXT),
);

function handleHostMessage(event: MessageEvent): void {
  const payload = parseHostContextMessage(event, HOST_ORIGIN);
  if (payload) {
    Object.assign(context, payload);
  }
}

function forwardToHost(event: MonitorEvent): void {
  if (isFramed) {
    postMessageToHost(window.parent, HOST_ORIGIN, event);
  }
}

onMounted(() => {
  if (isFramed) {
    window.addEventListener('message', handleHostMessage);
    postMessageToHost(window.parent, HOST_ORIGIN, { type: 'monitor-ready' });
  }
});

onUnmounted(() => {
  if (isFramed) {
    window.removeEventListener('message', handleHostMessage);
  }
});
</script>

<template>
  <main class="remote-shell">
    <header class="remote-shell__header">
      <p class="remote-shell__eyebrow">Model Deployment Monitor</p>
      <h1 class="remote-shell__title">Vue Remote</h1>
    </header>
    <ErrorBoundary>
      <Monitor
        :context="context"
        @deployment-selected="(id) => forwardToHost({ type: 'deployment-selected', deploymentId: id })"
        @alert-acknowledged="(id) => forwardToHost({ type: 'alert-acknowledged', deploymentId: id })"
      />
    </ErrorBoundary>
  </main>
</template>

<style scoped>
.remote-shell {
  padding: 2rem;
  max-width: 48rem;
  margin: 0 auto;
}

.remote-shell__header {
  margin-bottom: 1.5rem;
}

.remote-shell__eyebrow {
  font-family: var(--font-mono);
  color: hsl(var(--platform-accent));
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  margin: 0 0 0.5rem;
}

.remote-shell__title {
  font-family: var(--font-display);
  margin: 0;
}
</style>

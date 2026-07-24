<script setup lang="ts">
import type { ModelDeployment } from '@pilot/contracts';

defineProps<{
  deployments: readonly ModelDeployment[];
  selectedId: string;
}>();

const emit = defineEmits<{ select: [id: string] }>();

const STATUS_GLYPH: Record<ModelDeployment['status'], string> = {
  healthy: '●',
  deploying: '◐',
  degraded: '●',
  paused: '○',
};

function glyph(deployment: ModelDeployment): string {
  return STATUS_GLYPH[deployment.status];
}

function statusLabel(deployment: ModelDeployment): string {
  return `${deployment.modelName} — ${deployment.status} — ${deployment.replicas.ready}/${deployment.replicas.desired} replicas`;
}
</script>

<template>
  <ol class="pulse-rail" aria-label="Deployment pulse rail">
    <li v-for="deployment in deployments" :key="deployment.id" class="pulse-rail__item">
      <button
        type="button"
        class="pulse-rail__node"
        :class="[
          `pulse-rail__node--${deployment.status}`,
          { 'pulse-rail__node--selected': deployment.id === selectedId },
        ]"
        :aria-pressed="deployment.id === selectedId"
        :aria-label="statusLabel(deployment)"
        @click="emit('select', deployment.id)"
      >
        <span aria-hidden="true">{{ glyph(deployment) }}</span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.pulse-rail {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.pulse-rail__item {
  display: flex;
  align-items: center;
}

.pulse-rail__item:not(:last-child)::after {
  content: '';
  display: inline-block;
  width: 2rem;
  height: 2px;
  background: hsl(var(--platform-border));
}

.pulse-rail__node {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 2px solid hsl(var(--platform-border));
  background: hsl(var(--platform-surface));
  color: hsl(var(--platform-muted));
  font-size: 1rem;
  cursor: pointer;
}

.pulse-rail__node--healthy {
  color: hsl(var(--platform-accent));
  border-color: hsl(var(--platform-accent));
}

.pulse-rail__node--degraded {
  color: hsl(var(--platform-warning));
  border-color: hsl(var(--platform-warning));
}

.pulse-rail__node--deploying {
  color: hsl(var(--platform-accent));
  border-color: hsl(var(--platform-accent));
  animation: pulse-rail-pulse 1.6s ease-in-out infinite;
}

.pulse-rail__node--paused {
  color: hsl(var(--platform-muted));
}

.pulse-rail__node--selected {
  box-shadow: 0 0 0 2px hsl(var(--platform-accent) / 0.4);
}

@keyframes pulse-rail-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse-rail__node--deploying {
    animation: none;
  }
}
</style>

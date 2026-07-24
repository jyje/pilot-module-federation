<script lang="ts">
export default { name: 'ContextControls' };
</script>

<script setup lang="ts">
import type { DeploymentContext } from '@pilot/contracts';
import { clusterOptions, ENVIRONMENT_OPTIONS, modelOptions } from '../lib/context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const props = defineProps<{ context: DeploymentContext }>();
const emit = defineEmits<{ 'update:context': [context: DeploymentContext] }>();

function updateCluster(clusterId: unknown): void {
  if (typeof clusterId !== 'string') return;
  emit('update:context', { ...props.context, clusterId });
}

function updateModel(modelId: unknown): void {
  if (typeof modelId !== 'string') return;
  emit('update:context', { ...props.context, modelId });
}

function updateEnvironment(environment: unknown): void {
  if (environment !== 'production' && environment !== 'staging') return;
  emit('update:context', { ...props.context, environment });
}
</script>

<template>
  <div class="context-controls" role="group" aria-label="Deployment context">
    <label class="context-controls__field">
      <span class="context-controls__label">Cluster</span>
      <Select :model-value="context.clusterId" @update:model-value="updateCluster">
        <SelectTrigger aria-label="Cluster" class="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in clusterOptions()" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </label>

    <label class="context-controls__field">
      <span class="context-controls__label">Model</span>
      <Select :model-value="context.modelId" @update:model-value="updateModel">
        <SelectTrigger aria-label="Model" class="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in modelOptions()" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </label>

    <label class="context-controls__field">
      <span class="context-controls__label">Environment</span>
      <Select :model-value="context.environment" @update:model-value="updateEnvironment">
        <SelectTrigger aria-label="Environment" class="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in ENVIRONMENT_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </label>
  </div>
</template>

<style scoped>
.context-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
}

.context-controls__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.context-controls__label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: hsl(var(--platform-muted));
}
</style>

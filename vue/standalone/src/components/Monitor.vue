<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { DeploymentContext, ModelDeployment } from '@pilot/contracts';
import { deploymentsForModel, timelineForDeployment } from '@pilot/fixtures';
import { modelNameForId } from '../lib/context';
import DeploymentPulseRail from './DeploymentPulseRail.vue';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

const props = withDefaults(
  defineProps<{
    context: DeploymentContext;
    loading?: boolean;
  }>(),
  { loading: false },
);

const emit = defineEmits<{
  'deployment-selected': [id: string];
  'alert-acknowledged': [id: string];
}>();

const deployments = computed<ModelDeployment[]>(() => {
  const modelName = modelNameForId(props.context.modelId);
  return modelName ? deploymentsForModel(modelName) : [];
});

const selectedId = ref<string | undefined>(deployments.value[0]?.id);

watch(
  () => props.context.modelId,
  () => {
    selectedId.value = deployments.value[0]?.id;
  },
);

const activeSelectedId = computed(() => selectedId.value ?? deployments.value[0]?.id ?? '');

const selectedDeployment = computed(() =>
  deployments.value.find((deployment) => deployment.id === activeSelectedId.value),
);

const timeline = computed(() =>
  selectedDeployment.value ? timelineForDeployment(selectedDeployment.value.id) : [],
);

const acknowledgedIds = ref<ReadonlySet<string>>(new Set());

const showAcknowledge = computed(
  () =>
    selectedDeployment.value?.status === 'degraded' &&
    !acknowledgedIds.value.has(selectedDeployment.value.id),
);

function selectDeployment(id: string): void {
  selectedId.value = id;
  emit('deployment-selected', id);
}

function acknowledge(id: string): void {
  acknowledgedIds.value = new Set(acknowledgedIds.value).add(id);
  emit('alert-acknowledged', id);
}
</script>

<template>
  <section class="monitor" aria-label="Model deployment monitor">
    <div v-if="loading" data-testid="monitor-skeleton" class="monitor__skeleton">
      <Skeleton class="h-6 w-40" />
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-32 w-full" />
    </div>

    <Alert v-else-if="deployments.length === 0" variant="destructive">
      <AlertTitle>No deployments</AlertTitle>
      <AlertDescription>
        No deployments found for this model in the selected context.
      </AlertDescription>
    </Alert>

    <template v-else>
      <DeploymentPulseRail
        :deployments="deployments"
        :selected-id="activeSelectedId"
        @select="selectDeployment"
      />

      <Card v-if="selectedDeployment" class="monitor__card">
        <CardHeader>
          <CardTitle>{{ selectedDeployment.modelName }}</CardTitle>
          <CardDescription>{{ selectedDeployment.status }}</CardDescription>
        </CardHeader>
        <CardContent class="monitor__content">
          <dl class="monitor__stats">
            <div class="monitor__stat">
              <dt>Replicas</dt>
              <dd>{{ selectedDeployment.replicas.ready }}/{{ selectedDeployment.replicas.desired }}</dd>
            </div>
            <div class="monitor__stat">
              <dt>p95 latency</dt>
              <dd>{{ selectedDeployment.p95LatencyMs }} ms</dd>
            </div>
          </dl>

          <Alert v-if="showAcknowledge" variant="destructive" class="monitor__alert">
            <AlertTitle>Degraded deployment</AlertTitle>
            <AlertDescription>
              Latency or replica health has crossed the alert threshold.
            </AlertDescription>
            <AlertAction>
              <Button
                data-testid="acknowledge-alert"
                size="sm"
                variant="destructive"
                @click="acknowledge(selectedDeployment.id)"
              >
                Acknowledge
              </Button>
            </AlertAction>
          </Alert>

          <ul class="monitor__timeline">
            <li v-for="event in timeline" :key="event.id" :class="`monitor__timeline-item--${event.severity}`">
              {{ event.label }}
            </li>
          </ul>
        </CardContent>
      </Card>
    </template>
  </section>
</template>

<style scoped>
.monitor {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.monitor__skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.monitor__stats {
  display: flex;
  gap: 2rem;
  margin: 0 0 1rem;
}

.monitor__stat dt {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: hsl(var(--platform-muted));
}

.monitor__stat dd {
  margin: 0.15rem 0 0;
  font-size: 1.25rem;
  font-family: var(--font-mono);
}

.monitor__alert {
  margin-bottom: 1rem;
}

.monitor__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.875rem;
}

.monitor__timeline-item--warning {
  color: hsl(var(--platform-warning));
}

.monitor__timeline-item--critical {
  color: hsl(var(--platform-danger));
}
</style>

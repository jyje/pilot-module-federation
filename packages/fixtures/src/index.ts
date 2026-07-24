import type { DeploymentContext, ModelDeployment } from '@pilot/contracts';

export interface Cluster {
  id: string;
  name: string;
  region: string;
}

export interface Model {
  id: string;
  name: string;
  framework: string;
}

export type TimelineSeverity = 'info' | 'warning' | 'critical';

export interface TimelineEvent {
  id: string;
  deploymentId: string;
  timestamp: string;
  label: string;
  severity: TimelineSeverity;
}

export const CLUSTERS: readonly Cluster[] = [
  { id: 'cluster-aurora', name: 'Aurora', region: 'us-east-1' },
  { id: 'cluster-borealis', name: 'Borealis', region: 'eu-west-1' },
];

export const MODELS: readonly Model[] = [
  { id: 'model-x', name: 'Model X', framework: 'pytorch' },
  { id: 'model-y', name: 'Model Y', framework: 'onnx' },
];

export const DEPLOYMENTS: readonly ModelDeployment[] = [
  {
    id: 'deploy-001',
    modelName: 'Model X',
    status: 'healthy',
    replicas: { ready: 4, desired: 4 },
    p95LatencyMs: 118,
  },
  {
    id: 'deploy-002',
    modelName: 'Model X',
    status: 'degraded',
    replicas: { ready: 2, desired: 4 },
    p95LatencyMs: 412,
  },
  {
    id: 'deploy-003',
    modelName: 'Model Y',
    status: 'deploying',
    replicas: { ready: 1, desired: 3 },
    p95LatencyMs: 0,
  },
  {
    id: 'deploy-004',
    modelName: 'Model Y',
    status: 'paused',
    replicas: { ready: 0, desired: 2 },
    p95LatencyMs: 0,
  },
];

export const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  {
    id: 'evt-001',
    deploymentId: 'deploy-001',
    timestamp: '2026-07-24T08:00:00.000Z',
    label: 'rollout complete',
    severity: 'info',
  },
  {
    id: 'evt-002',
    deploymentId: 'deploy-002',
    timestamp: '2026-07-24T08:05:00.000Z',
    label: 'latency threshold exceeded',
    severity: 'warning',
  },
  {
    id: 'evt-003',
    deploymentId: 'deploy-003',
    timestamp: '2026-07-24T08:10:00.000Z',
    label: 'replica scaling in progress',
    severity: 'info',
  },
  {
    id: 'evt-004',
    deploymentId: 'deploy-004',
    timestamp: '2026-07-24T08:15:00.000Z',
    label: 'deployment paused by operator',
    severity: 'critical',
  },
];

export const DEFAULT_CONTEXT: DeploymentContext = {
  clusterId: CLUSTERS[0]!.id,
  modelId: MODELS[0]!.id,
  environment: 'production',
};

export function deploymentsForModel(modelName: string): ModelDeployment[] {
  return DEPLOYMENTS.filter((deployment) => deployment.modelName === modelName);
}

export function timelineForDeployment(deploymentId: string): TimelineEvent[] {
  return TIMELINE_EVENTS.filter((event) => event.deploymentId === deploymentId);
}

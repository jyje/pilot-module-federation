export type FrameworkTrack = 'vue' | 'next';

export type CompositionMode = 'federation' | 'iframe' | 'standalone';

export type Environment = 'production' | 'staging';

export type DeploymentStatus = 'healthy' | 'degraded' | 'deploying' | 'paused';

export interface DeploymentContext {
  clusterId: string;
  modelId: string;
  environment: Environment;
}

export interface ModelDeployment {
  id: string;
  modelName: string;
  status: DeploymentStatus;
  replicas: { ready: number; desired: number };
  p95LatencyMs: number;
}

export type MonitorEvent =
  | { type: 'deployment-selected'; deploymentId: string }
  | { type: 'alert-acknowledged'; deploymentId: string }
  | { type: 'environment-changed'; environment: Environment };

export const FRAMEWORK_TRACKS: readonly FrameworkTrack[] = ['vue', 'next'];

export const COMPOSITION_MODES: readonly CompositionMode[] = ['federation', 'iframe', 'standalone'];

export const DEPLOYMENT_STATUSES: readonly DeploymentStatus[] = [
  'healthy',
  'degraded',
  'deploying',
  'paused',
];

const MONITOR_EVENT_TYPES = new Set<MonitorEvent['type']>([
  'deployment-selected',
  'alert-acknowledged',
  'environment-changed',
]);

export function isMonitorEvent(value: unknown): value is MonitorEvent {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }
  const { type } = value as { type: unknown };
  return typeof type === 'string' && MONITOR_EVENT_TYPES.has(type as MonitorEvent['type']);
}

const ENVIRONMENTS = new Set<Environment>(['production', 'staging']);

export function isDeploymentContext(value: unknown): value is DeploymentContext {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { clusterId, modelId, environment } = value as Record<string, unknown>;
  return (
    typeof clusterId === 'string' &&
    typeof modelId === 'string' &&
    typeof environment === 'string' &&
    ENVIRONMENTS.has(environment as Environment)
  );
}

/** Host -> Remote postMessage envelope carrying the selected cluster/model/environment context. */
export interface HostContextMessage {
  type: 'context';
  payload: DeploymentContext;
}

export function isHostContextMessage(value: unknown): value is HostContextMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { type, payload } = value as Record<string, unknown>;
  return type === 'context' && isDeploymentContext(payload);
}

export type RemoteReadyMessage = { type: 'monitor-ready' };

/** Remote -> Host postMessage envelope: either the one-time ready signal or a semantic MonitorEvent. */
export type RemoteToHostMessage = RemoteReadyMessage | MonitorEvent;

export function isRemoteToHostMessage(value: unknown): value is RemoteToHostMessage {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }
  const { type } = value as { type: unknown };
  if (type === 'monitor-ready') {
    return true;
  }
  return isMonitorEvent(value);
}

import { describe, expect, it } from 'vitest';
import {
  DEPLOYMENT_STATUSES,
  FRAMEWORK_TRACKS,
  PLATFORM_CAPABILITIES,
  hasCapability,
  isDeploymentContext,
  isHostContextMessage,
  isMonitorEvent,
  isRemoteToHostMessage,
  type DeploymentContext,
  type HostContextMessage,
  type ModelDeployment,
  type MonitorEvent,
  type RemoteToHostMessage,
} from '../src/index';

describe('framework-neutral contracts', () => {
  it('exposes exactly the two supported framework tracks', () => {
    expect(FRAMEWORK_TRACKS).toEqual(['vue', 'next']);
  });

  it('exposes platform capabilities and checks them against a safe display context', () => {
    expect(PLATFORM_CAPABILITIES).toEqual(['deployments:read', 'observability:read', 'governance:read']);
    expect(hasCapability({
      user: { id: 'u-1', displayName: 'Alex', email: 'alex@example.com' },
      tenant: { id: 't-1', name: 'Aurora' },
      capabilities: ['deployments:read'],
    }, 'deployments:read')).toBe(true);
  });

  it('exposes exactly the four supported deployment statuses', () => {
    expect(DEPLOYMENT_STATUSES).toEqual(['healthy', 'degraded', 'deploying', 'paused']);
  });

  it('recognizes valid MonitorEvent shapes', () => {
    expect(isMonitorEvent({ type: 'deployment-selected', deploymentId: 'd-1' })).toBe(true);
    expect(isMonitorEvent({ type: 'alert-acknowledged', deploymentId: 'd-1' })).toBe(true);
    expect(isMonitorEvent({ type: 'environment-changed', environment: 'production' })).toBe(true);
  });

  it('rejects malformed values', () => {
    expect(isMonitorEvent(null)).toBe(false);
    expect(isMonitorEvent(undefined)).toBe(false);
    expect(isMonitorEvent({})).toBe(false);
    expect(isMonitorEvent({ type: 'unknown-event' })).toBe(false);
  });

  it('DeploymentContext, ModelDeployment, and MonitorEvent carry the required fields', () => {
    const context: DeploymentContext = {
      clusterId: 'cluster-aurora',
      modelId: 'model-x',
      environment: 'production',
    };
    const deployment: ModelDeployment = {
      id: 'd-1',
      modelName: 'model-x',
      status: 'healthy',
      replicas: { ready: 3, desired: 3 },
      p95LatencyMs: 120,
    };
    const event: MonitorEvent = { type: 'deployment-selected', deploymentId: deployment.id };

    expect(context.clusterId).toBe('cluster-aurora');
    expect(deployment.replicas.ready).toBe(3);
    expect(event.type).toBe('deployment-selected');
  });

  it('recognizes valid DeploymentContext shapes and rejects malformed ones', () => {
    expect(
      isDeploymentContext({ clusterId: 'cluster-aurora', modelId: 'model-x', environment: 'production' }),
    ).toBe(true);
    expect(isDeploymentContext({ clusterId: 'c', modelId: 'm', environment: 'canary' })).toBe(false);
    expect(isDeploymentContext(null)).toBe(false);
    expect(isDeploymentContext({})).toBe(false);
  });

  it('recognizes a valid Host-to-Remote context message and rejects malformed ones', () => {
    const message: HostContextMessage = {
      type: 'context',
      payload: { clusterId: 'cluster-aurora', modelId: 'model-x', environment: 'production' },
    };
    expect(isHostContextMessage(message)).toBe(true);
    expect(isHostContextMessage({ type: 'context', payload: {} })).toBe(false);
    expect(isHostContextMessage({ type: 'not-context', payload: message.payload })).toBe(false);
    expect(isHostContextMessage(null)).toBe(false);
  });

  it('recognizes valid Remote-to-Host messages (ready signal or MonitorEvent) and rejects malformed ones', () => {
    const ready: RemoteToHostMessage = { type: 'monitor-ready' };
    const selected: RemoteToHostMessage = { type: 'deployment-selected', deploymentId: 'd-1' };
    expect(isRemoteToHostMessage(ready)).toBe(true);
    expect(isRemoteToHostMessage(selected)).toBe(true);
    expect(isRemoteToHostMessage({ type: 'unknown' })).toBe(false);
    expect(isRemoteToHostMessage(null)).toBe(false);
  });
});

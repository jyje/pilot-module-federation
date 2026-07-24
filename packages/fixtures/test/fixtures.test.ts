import { describe, expect, it } from 'vitest';
import {
  CLUSTERS,
  DEFAULT_CONTEXT,
  DEPLOYMENTS,
  MODELS,
  TIMELINE_EVENTS,
  deploymentsForModel,
  timelineForDeployment,
} from '../src/index';

describe('deterministic fixtures', () => {
  it('has at least two clusters and two models', () => {
    expect(CLUSTERS.length).toBeGreaterThanOrEqual(2);
    expect(MODELS.length).toBeGreaterThanOrEqual(2);
  });

  it('covers all four deployment statuses across fixtures', () => {
    const statuses = new Set(DEPLOYMENTS.map((d) => d.status));
    expect(statuses).toEqual(new Set(['healthy', 'degraded', 'deploying', 'paused']));
  });

  it('every deployment has at least one timeline event', () => {
    for (const deployment of DEPLOYMENTS) {
      expect(timelineForDeployment(deployment.id).length).toBeGreaterThan(0);
    }
  });

  it('filters deployments by model name deterministically', () => {
    const result = deploymentsForModel('Model X');
    expect(result.map((d) => d.id)).toEqual(['deploy-001', 'deploy-002']);
  });

  it('default context references an existing cluster and model', () => {
    expect(CLUSTERS.some((c) => c.id === DEFAULT_CONTEXT.clusterId)).toBe(true);
    expect(MODELS.some((m) => m.id === DEFAULT_CONTEXT.modelId)).toBe(true);
  });

  it('timeline events are ordered chronologically', () => {
    const timestamps = TIMELINE_EVENTS.map((e) => new Date(e.timestamp).getTime());
    const sorted = [...timestamps].sort((a, b) => a - b);
    expect(timestamps).toEqual(sorted);
  });
});

import { describe, expect, it } from 'vitest';
import { resolveMonitorState } from '../lib/monitor';

describe('resolveMonitorState', () => {
  it('selects the first deployment for the requested model by default', () => {
    const state = resolveMonitorState('model-x');

    expect(state.selected?.id).toBe('deploy-001');
    expect(state.deployments).toHaveLength(2);
    expect(state.timeline.map((event) => event.id)).toEqual(['evt-001']);
  });

  it('preserves a deployment selection only when it belongs to the requested model', () => {
    const state = resolveMonitorState('model-y', 'deploy-004');

    expect(state.selected?.id).toBe('deploy-004');
    expect(state.selected?.status).toBe('paused');
  });

  it('falls back to the first model deployment when a stale selection is received', () => {
    const state = resolveMonitorState('model-y', 'deploy-002');

    expect(state.selected?.id).toBe('deploy-003');
    expect(state.selected?.status).toBe('deploying');
  });

  it('returns no deployments and no selection for an unresolvable model id', () => {
    const state = resolveMonitorState('model-unknown');

    expect(state.deployments).toHaveLength(0);
    expect(state.selected).toBeUndefined();
    expect(state.timeline).toHaveLength(0);
  });
});

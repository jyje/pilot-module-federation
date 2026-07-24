import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { ModelDeployment } from '@pilot/contracts';
import DeploymentPulseRail from '../src/components/DeploymentPulseRail.vue';

const DEPLOYMENTS: ModelDeployment[] = [
  { id: 'd-1', modelName: 'Model X', status: 'healthy', replicas: { ready: 4, desired: 4 }, p95LatencyMs: 100 },
  { id: 'd-2', modelName: 'Model X', status: 'deploying', replicas: { ready: 1, desired: 3 }, p95LatencyMs: 0 },
  { id: 'd-3', modelName: 'Model X', status: 'paused', replicas: { ready: 0, desired: 2 }, p95LatencyMs: 0 },
];

describe('DeploymentPulseRail', () => {
  it('renders one keyboard-addressable node per deployment', () => {
    const wrapper = mount(DeploymentPulseRail, {
      props: { deployments: DEPLOYMENTS, selectedId: 'd-1' },
    });
    const nodes = wrapper.findAll('button.pulse-rail__node');
    expect(nodes).toHaveLength(3);
  });

  it('marks only the selected deployment node as pressed', () => {
    const wrapper = mount(DeploymentPulseRail, {
      props: { deployments: DEPLOYMENTS, selectedId: 'd-2' },
    });
    const nodes = wrapper.findAll('button.pulse-rail__node');
    expect(nodes[0]!.attributes('aria-pressed')).toBe('false');
    expect(nodes[1]!.attributes('aria-pressed')).toBe('true');
    expect(nodes[2]!.attributes('aria-pressed')).toBe('false');
  });

  it('labels each node with model name, status, and replica count', () => {
    const wrapper = mount(DeploymentPulseRail, {
      props: { deployments: DEPLOYMENTS, selectedId: 'd-1' },
    });
    expect(wrapper.findAll('button.pulse-rail__node')[0]!.attributes('aria-label')).toContain('healthy');
    expect(wrapper.findAll('button.pulse-rail__node')[0]!.attributes('aria-label')).toContain('4/4');
  });

  it('emits select with the deployment id when a node is clicked', async () => {
    const wrapper = mount(DeploymentPulseRail, {
      props: { deployments: DEPLOYMENTS, selectedId: 'd-1' },
    });
    await wrapper.findAll('button.pulse-rail__node')[2]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([['d-3']]);
  });

  it('only animates the currently deploying node', () => {
    const wrapper = mount(DeploymentPulseRail, {
      props: { deployments: DEPLOYMENTS, selectedId: 'd-1' },
    });
    const nodes = wrapper.findAll('button.pulse-rail__node');
    expect(nodes[0]!.classes()).not.toContain('pulse-rail__node--deploying');
    expect(nodes[1]!.classes()).toContain('pulse-rail__node--deploying');
  });
});

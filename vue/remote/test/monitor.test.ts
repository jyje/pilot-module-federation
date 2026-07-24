import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { DeploymentContext } from '@pilot/contracts';
import Monitor from '../src/components/Monitor.vue';

const MODEL_X_CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-x',
  environment: 'production',
};

const MODEL_Y_CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-y',
  environment: 'production',
};

describe('Monitor', () => {
  it('shows the first deployment for the context by default: health, replicas, p95 latency, timeline', () => {
    const wrapper = mount(Monitor, { props: { context: MODEL_X_CONTEXT } });
    const text = wrapper.text();
    expect(text).toContain('Model X');
    expect(text).toContain('healthy');
    expect(text).toContain('4');
    expect(text).toContain('118');
    expect(text).toContain('rollout complete');
  });

  it('renders one pulse rail node per deployment for the model', () => {
    const wrapper = mount(Monitor, { props: { context: MODEL_X_CONTEXT } });
    expect(wrapper.findAll('button.pulse-rail__node')).toHaveLength(2);
  });

  it('selecting another deployment updates the shown evidence and emits deployment-selected', async () => {
    const wrapper = mount(Monitor, { props: { context: MODEL_X_CONTEXT } });
    await wrapper.findAll('button.pulse-rail__node')[1]!.trigger('click');
    expect(wrapper.text()).toContain('degraded');
    expect(wrapper.text()).toContain('412');
    expect(wrapper.emitted('deployment-selected')).toEqual([['deploy-002']]);
  });

  it('shows an acknowledgable alert for a degraded deployment and emits alert-acknowledged', async () => {
    const wrapper = mount(Monitor, { props: { context: MODEL_X_CONTEXT } });
    await wrapper.findAll('button.pulse-rail__node')[1]!.trigger('click');
    const ackButton = wrapper.find('[data-testid="acknowledge-alert"]');
    expect(ackButton.exists()).toBe(true);
    await ackButton.trigger('click');
    expect(wrapper.emitted('alert-acknowledged')).toEqual([['deploy-002']]);
    expect(wrapper.find('[data-testid="acknowledge-alert"]').exists()).toBe(false);
  });

  it('does not show an acknowledge alert for a healthy deployment', () => {
    const wrapper = mount(Monitor, { props: { context: MODEL_X_CONTEXT } });
    expect(wrapper.find('[data-testid="acknowledge-alert"]').exists()).toBe(false);
  });

  it('shows an accessible empty state when the model has no deployments', () => {
    const wrapper = mount(Monitor, {
      props: { context: { ...MODEL_Y_CONTEXT, modelId: 'model-unknown' } },
    });
    expect(wrapper.find('[role="alert"]').text()).toContain('No deployments');
    expect(wrapper.findAll('button.pulse-rail__node')).toHaveLength(0);
  });

  it('shows a loading skeleton instead of deployment evidence when loading', () => {
    const wrapper = mount(Monitor, { props: { context: MODEL_X_CONTEXT, loading: true } });
    expect(wrapper.find('[data-testid="monitor-skeleton"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('rollout complete');
  });
});

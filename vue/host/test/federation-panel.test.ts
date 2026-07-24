import { defineComponent, h, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { DeploymentContext } from '@pilot/contracts';
import FederationPanel from '../src/components/FederationPanel.vue';

const CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-x',
  environment: 'production',
};

const FakeMonitor = defineComponent({
  props: { context: { type: Object, required: true } },
  emits: ['deployment-selected', 'alert-acknowledged'],
  setup(props, { emit }) {
    return () =>
      h('div', { 'data-testid': 'fake-monitor' }, [
        h('span', {}, props.context.modelId),
        h(
          'button',
          {
            'data-testid': 'fake-select',
            onClick: () => emit('deployment-selected', 'deploy-002'),
          },
          'select',
        ),
        h(
          'button',
          {
            'data-testid': 'fake-ack',
            onClick: () => emit('alert-acknowledged', 'deploy-002'),
          },
          'ack',
        ),
      ]);
  },
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('FederationPanel', () => {
  it('shows a loading skeleton while the remote module is resolving', async () => {
    const pending = deferred<{ default: typeof FakeMonitor }>();
    const wrapper = mount(FederationPanel, {
      props: { context: CONTEXT, loadMonitor: () => pending.promise },
    });
    expect(wrapper.find('[data-testid="federation-loading"]').exists()).toBe(true);
    pending.resolve({ default: FakeMonitor });
    await flushAll();
  });

  it('renders the resolved remote component and forwards its context prop once loaded', async () => {
    const loadMonitor = vi.fn().mockResolvedValue({ default: FakeMonitor });
    const wrapper = mount(FederationPanel, {
      props: { context: CONTEXT, loadMonitor },
    });
    await flushAll();
    expect(wrapper.find('[data-testid="fake-monitor"]').text()).toContain('model-x');
  });

  it('forwards deployment-selected and alert-acknowledged from the loaded remote component', async () => {
    const loadMonitor = vi.fn().mockResolvedValue({ default: FakeMonitor });
    const wrapper = mount(FederationPanel, {
      props: { context: CONTEXT, loadMonitor },
    });
    await flushAll();
    await wrapper.find('[data-testid="fake-select"]').trigger('click');
    await wrapper.find('[data-testid="fake-ack"]').trigger('click');
    expect(wrapper.emitted('deployment-selected')).toEqual([['deploy-002']]);
    expect(wrapper.emitted('alert-acknowledged')).toEqual([['deploy-002']]);
  });

  it('shows an error alert with a retry button when the loader rejects', async () => {
    const loadMonitor = vi.fn().mockRejectedValue(new Error('network down'));
    const wrapper = mount(FederationPanel, {
      props: { context: CONTEXT, loadMonitor },
    });
    await flushAll();
    expect(wrapper.find('[data-testid="federation-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="federation-retry"]').exists()).toBe(true);
  });

  it('shows a timeout error when the loader does not settle before timeoutMs', async () => {
    vi.useFakeTimers();
    try {
      const neverSettles = new Promise(() => {});
      const wrapper = mount(FederationPanel, {
        props: { context: CONTEXT, loadMonitor: () => neverSettles as never, timeoutMs: 1000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      expect(wrapper.find('[data-testid="federation-error"]').exists()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('retries and shows the remote component after a prior load failure', async () => {
    const loadMonitor = vi
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ default: FakeMonitor });
    const wrapper = mount(FederationPanel, {
      props: { context: CONTEXT, loadMonitor },
    });
    await flushAll();
    expect(wrapper.find('[data-testid="federation-error"]').exists()).toBe(true);

    await wrapper.find('[data-testid="federation-retry"]').trigger('click');
    await flushAll();

    expect(loadMonitor).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[data-testid="fake-monitor"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="federation-error"]').exists()).toBe(false);
  });
});

async function flushAll(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
  await nextTick();
}

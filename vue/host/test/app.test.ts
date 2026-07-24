import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../src/App.vue';

/**
 * App-level tests stub FederationPanel/IframePanel entirely so they never
 * trigger a real Module Federation import or a real iframe network request —
 * only App's own composition/context/ledger wiring is under test here.
 * FederationPanel and IframePanel's own loading/error/retry behavior is
 * covered independently in federation-panel.test.ts and iframe-panel.test.ts.
 */
const FederationPanelStub = defineComponent({
  name: 'FederationPanel',
  props: { context: { type: Object, required: true }, loadMonitor: { type: Function, required: true } },
  emits: ['deployment-selected', 'alert-acknowledged'],
  setup(props) {
    return () => h('div', { 'data-testid': 'federation-stub' }, props.context.modelId);
  },
});

const IframePanelStub = defineComponent({
  name: 'IframePanel',
  props: { context: { type: Object, required: true }, remoteOrigin: { type: String, required: true } },
  emits: ['ready', 'deployment-selected', 'alert-acknowledged'],
  setup(props) {
    return () => h('div', { 'data-testid': 'iframe-stub' }, props.context.modelId);
  },
});

function mountApp() {
  return mount(App, {
    global: {
      stubs: {
        FederationPanel: FederationPanelStub,
        IframePanel: IframePanelStub,
      },
    },
  });
}

describe('App', () => {
  it('shows the Federation panel by default with a composition boundary label', () => {
    const wrapper = mountApp();
    expect(wrapper.find('[data-testid="federation-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="iframe-stub"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="composition-boundary"]').text()).toContain('Federation');
  });

  it('switches to the iframe panel when the iframe tab is activated', async () => {
    const wrapper = mountApp();
    await wrapper.findAll('[role="tab"]')[1]!.trigger('mousedown', { button: 0 });

    expect(wrapper.find('[data-testid="iframe-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="federation-stub"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="composition-boundary"]').text()).toContain('iframe');
  });

  it('propagates a cluster context change down to the active panel', async () => {
    const wrapper = mountApp();
    const clusterSelect = wrapper.findComponent({ name: 'ContextControls' });
    await clusterSelect.vm.$emit('update:context', {
      clusterId: 'cluster-borealis',
      modelId: 'model-y',
      environment: 'staging',
    });

    expect(wrapper.find('[data-testid="federation-stub"]').text()).toBe('model-y');
  });

  it('records a federation deployment-selected event in the Host event ledger', async () => {
    const wrapper = mountApp();
    await wrapper.findComponent(FederationPanelStub).vm.$emit('deployment-selected', 'deploy-002');

    const entries = wrapper.findAll('[data-testid="ledger-entry"]');
    expect(entries).toHaveLength(1);
    expect(entries[0]!.text()).toContain('federation');
    expect(entries[0]!.text()).toContain('deploy-002');
  });

  it('records an iframe ready + alert-acknowledged event in the Host event ledger', async () => {
    const wrapper = mountApp();
    await wrapper.findAll('[role="tab"]')[1]!.trigger('mousedown', { button: 0 });
    const iframeStub = wrapper.findComponent(IframePanelStub);
    await iframeStub.vm.$emit('ready');
    await iframeStub.vm.$emit('alert-acknowledged', 'deploy-002');

    const entries = wrapper.findAll('[data-testid="ledger-entry"]');
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.text()).join(' ')).toContain('iframe');
  });
});

import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../src/App.vue';
import { Select } from '../src/components/ui/select';

describe('App', () => {
  it('renders context controls and the monitor for the default context', () => {
    const wrapper = mount(App);
    expect(wrapper.text()).toContain('Cluster');
    expect(wrapper.text()).toContain('Model X');
    expect(wrapper.findAll('button.pulse-rail__node').length).toBeGreaterThan(0);
  });

  it('changing model context updates the monitor evidence', async () => {
    const wrapper = mount(App);
    const [, modelSelect] = wrapper.findAllComponents(Select);
    await modelSelect!.vm.$emit('update:modelValue', 'model-y');

    expect(wrapper.text()).toContain('Model Y');
    expect(wrapper.text()).not.toContain('Model X');
  });

  it('selecting a deployment records a deployment-selected entry in the event ledger', async () => {
    const wrapper = mount(App);
    await wrapper.findAll('button.pulse-rail__node')[1]!.trigger('click');

    const entries = wrapper.findAll('[data-testid="ledger-entry"]');
    expect(entries).toHaveLength(1);
    expect(entries[0]!.text()).toContain('Deployment selected');
    expect(entries[0]!.text()).toContain('deploy-002');
  });

  it('acknowledging a degraded alert records an alert-acknowledged entry in the event ledger', async () => {
    const wrapper = mount(App);
    await wrapper.findAll('button.pulse-rail__node')[1]!.trigger('click');
    await wrapper.find('[data-testid="acknowledge-alert"]').trigger('click');

    const entries = wrapper.findAll('[data-testid="ledger-entry"]');
    expect(entries.map((entry) => entry.text()).join(' ')).toContain('Alert acknowledged');
    expect(entries.map((entry) => entry.text()).join(' ')).toContain('deploy-002');
  });

  it('shows an empty event ledger before any interaction', () => {
    const wrapper = mount(App);
    expect(wrapper.text()).toContain('No events yet');
  });
});

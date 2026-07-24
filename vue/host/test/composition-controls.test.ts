import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CompositionControls from '../src/components/CompositionControls.vue';

function tabs(wrapper: ReturnType<typeof mount>) {
  const all = wrapper.findAll('[role="tab"]');
  return { federationTab: all[0]!, iframeTab: all[1]! };
}

describe('CompositionControls', () => {
  it('renders Federation and iframe tabs with the current mode marked active', () => {
    const wrapper = mount(CompositionControls, { props: { mode: 'federation' } });
    const { federationTab, iframeTab } = tabs(wrapper);
    expect(federationTab.text()).toBe('Federation');
    expect(iframeTab.text()).toBe('iframe');
    expect(federationTab.attributes('aria-selected')).toBe('true');
    expect(iframeTab.attributes('aria-selected')).toBe('false');
  });

  it('emits update:mode "iframe" when the iframe tab is activated', async () => {
    const wrapper = mount(CompositionControls, { props: { mode: 'federation' } });
    await tabs(wrapper).iframeTab.trigger('mousedown', { button: 0 });
    expect(wrapper.emitted('update:mode')).toEqual([['iframe']]);
  });

  it('emits update:mode "federation" when the federation tab is activated', async () => {
    const wrapper = mount(CompositionControls, { props: { mode: 'iframe' } });
    await tabs(wrapper).federationTab.trigger('mousedown', { button: 0 });
    expect(wrapper.emitted('update:mode')).toEqual([['federation']]);
  });
});

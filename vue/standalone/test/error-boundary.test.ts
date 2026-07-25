import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import ErrorBoundary from '../src/components/ErrorBoundary.vue';

const Bomb = defineComponent({
  setup() {
    throw new Error('boom');
  },
  render: () => null,
});

const Safe = defineComponent({
  render: () => h('p', 'safe content'),
});

describe('ErrorBoundary', () => {
  it('renders the default slot when the child does not throw', () => {
    const wrapper = mount(ErrorBoundary, { slots: { default: () => h(Safe) } });
    expect(wrapper.text()).toContain('safe content');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it('shows an accessible error state and suppresses the crash when the child throws', async () => {
    const wrapper = mount(ErrorBoundary, { slots: { default: () => h(Bomb) } });
    await nextTick();
    expect(wrapper.find('[role="alert"]').text()).toContain('Model deployment monitor unavailable');
    expect(wrapper.text()).not.toContain('safe content');
  });

  it('recovers and re-renders the default slot after Retry is clicked', async () => {
    let shouldThrow = true;
    const Flaky = defineComponent({
      setup() {
        if (shouldThrow) throw new Error('boom');
        return () => h('p', 'recovered');
      },
    });
    const wrapper = mount(ErrorBoundary, { slots: { default: () => h(Flaky) } });
    await nextTick();
    expect(wrapper.find('[data-testid="error-boundary-retry"]').exists()).toBe(true);

    shouldThrow = false;
    await wrapper.find('[data-testid="error-boundary-retry"]').trigger('click');

    expect(wrapper.text()).toContain('recovered');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });
});

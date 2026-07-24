import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import type { DeploymentContext } from '@pilot/contracts';
import IframePanel from '../src/components/IframePanel.vue';
import { buildRemoteUrl } from '../src/lib/hostFrameAdapter';

// Each IframePanel registers a window "message" listener on mount; without
// unmounting between tests, a leaked listener from a prior test would also
// react to the next test's dispatched message and double-count postMessage calls.
enableAutoUnmount(afterEach);

const REMOTE_ORIGIN = 'http://127.0.0.1:4174';
const CONTEXT: DeploymentContext = {
  clusterId: 'cluster-aurora',
  modelId: 'model-x',
  environment: 'production',
};

let postMessageSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  postMessageSpy = vi.fn();
  Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
    configurable: true,
    get() {
      return { postMessage: postMessageSpy };
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function dispatchHostMessage(data: unknown, origin: string): void {
  window.dispatchEvent(new MessageEvent('message', { data, origin }));
}

describe('IframePanel', () => {
  it('renders the remote iframe with a src built from the origin and context, and shows a loading skeleton', () => {
    const wrapper = mount(IframePanel, {
      props: { context: CONTEXT, remoteOrigin: REMOTE_ORIGIN },
    });
    expect(wrapper.find('[data-testid="iframe-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="remote-iframe"]').attributes('src')).toBe(
      buildRemoteUrl(REMOTE_ORIGIN, CONTEXT),
    );
  });

  it('transitions to ready and posts context once a monitor-ready message arrives from the exact origin', async () => {
    const wrapper = mount(IframePanel, {
      props: { context: CONTEXT, remoteOrigin: REMOTE_ORIGIN },
    });
    dispatchHostMessage({ type: 'monitor-ready' }, REMOTE_ORIGIN);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="iframe-loading"]').exists()).toBe(false);
    expect(wrapper.emitted('ready')).toHaveLength(1);
    expect(postMessageSpy).toHaveBeenCalledExactlyOnceWith(
      { type: 'context', payload: CONTEXT },
      REMOTE_ORIGIN,
    );
  });

  it('ignores a monitor-ready message from an unexpected origin', async () => {
    const wrapper = mount(IframePanel, {
      props: { context: CONTEXT, remoteOrigin: REMOTE_ORIGIN },
    });
    dispatchHostMessage({ type: 'monitor-ready' }, 'https://evil.example.com');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="iframe-loading"]').exists()).toBe(true);
    expect(wrapper.emitted('ready')).toBeUndefined();
  });

  it('forwards a validated deployment-selected message as its own component event', async () => {
    const wrapper = mount(IframePanel, {
      props: { context: CONTEXT, remoteOrigin: REMOTE_ORIGIN },
    });
    dispatchHostMessage({ type: 'monitor-ready' }, REMOTE_ORIGIN);
    await wrapper.vm.$nextTick();
    dispatchHostMessage({ type: 'deployment-selected', deploymentId: 'deploy-002' }, REMOTE_ORIGIN);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('deployment-selected')).toEqual([['deploy-002']]);
  });

  it('posts the updated context to the remote when the context prop changes after ready', async () => {
    const wrapper = mount(IframePanel, {
      props: { context: CONTEXT, remoteOrigin: REMOTE_ORIGIN },
    });
    dispatchHostMessage({ type: 'monitor-ready' }, REMOTE_ORIGIN);
    await wrapper.vm.$nextTick();
    postMessageSpy.mockClear();

    const nextContext = { ...CONTEXT, modelId: 'model-y' };
    await wrapper.setProps({ context: nextContext });

    expect(postMessageSpy).toHaveBeenCalledExactlyOnceWith(
      { type: 'context', payload: nextContext },
      REMOTE_ORIGIN,
    );
  });

  it('shows a timeout error with a retry button when no ready message arrives in time', async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mount(IframePanel, {
        props: { context: CONTEXT, remoteOrigin: REMOTE_ORIGIN, timeoutMs: 1000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      expect(wrapper.find('[data-testid="iframe-error"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="iframe-retry"]').exists()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('remounts the iframe element when retry is clicked after a timeout', async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mount(IframePanel, {
        props: { context: CONTEXT, remoteOrigin: REMOTE_ORIGIN, timeoutMs: 1000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      const firstIframe = wrapper.find('[data-testid="remote-iframe"]').element;

      await wrapper.find('[data-testid="iframe-retry"]').trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-testid="iframe-loading"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="iframe-error"]').exists()).toBe(false);
      const secondIframe = wrapper.find('[data-testid="remote-iframe"]').element;
      expect(secondIframe).not.toBe(firstIframe);
    } finally {
      vi.useRealTimers();
    }
  });
});

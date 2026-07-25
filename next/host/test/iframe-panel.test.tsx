import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { DeploymentContext } from '@pilot/contracts';
import { IframePanel } from '../components/iframe-panel';
import { buildRemoteUrl } from '../lib/host-frame-adapter';

afterEach(() => {
  cleanup();
});

const REMOTE_ORIGIN = 'http://127.0.0.1:3001';
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
    render(
      <IframePanel
        context={CONTEXT}
        remoteOrigin={REMOTE_ORIGIN}
        onReady={() => {}}
        onDeploymentSelected={() => {}}
        onAlertAcknowledged={() => {}}
      />,
    );
    expect(screen.getByTestId('iframe-loading')).toBeInTheDocument();
    expect(screen.getByTestId('remote-iframe')).toHaveAttribute('src', buildRemoteUrl(REMOTE_ORIGIN, CONTEXT));
  });

  it('transitions to ready and posts context once a monitor-ready message arrives from the exact origin', async () => {
    const onReady = vi.fn();
    render(
      <IframePanel
        context={CONTEXT}
        remoteOrigin={REMOTE_ORIGIN}
        onReady={onReady}
        onDeploymentSelected={() => {}}
        onAlertAcknowledged={() => {}}
      />,
    );
    dispatchHostMessage({ type: 'monitor-ready' }, REMOTE_ORIGIN);

    expect(await screen.findByTestId('remote-iframe')).toBeVisible();
    expect(screen.queryByTestId('iframe-loading')).not.toBeInTheDocument();
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(postMessageSpy).toHaveBeenCalledExactlyOnceWith({ type: 'context', payload: CONTEXT }, REMOTE_ORIGIN);
  });

  it('ignores a monitor-ready message from an unexpected origin', () => {
    const onReady = vi.fn();
    render(
      <IframePanel
        context={CONTEXT}
        remoteOrigin={REMOTE_ORIGIN}
        onReady={onReady}
        onDeploymentSelected={() => {}}
        onAlertAcknowledged={() => {}}
      />,
    );
    dispatchHostMessage({ type: 'monitor-ready' }, 'https://evil.example.com');

    expect(screen.getByTestId('iframe-loading')).toBeInTheDocument();
    expect(onReady).not.toHaveBeenCalled();
  });

  it('forwards a validated deployment-selected message as its own callback', async () => {
    const onDeploymentSelected = vi.fn();
    render(
      <IframePanel
        context={CONTEXT}
        remoteOrigin={REMOTE_ORIGIN}
        onReady={() => {}}
        onDeploymentSelected={onDeploymentSelected}
        onAlertAcknowledged={() => {}}
      />,
    );
    dispatchHostMessage({ type: 'monitor-ready' }, REMOTE_ORIGIN);
    await screen.findByTestId('remote-iframe');
    dispatchHostMessage({ type: 'deployment-selected', deploymentId: 'deploy-002' }, REMOTE_ORIGIN);

    expect(onDeploymentSelected).toHaveBeenCalledWith('deploy-002');
  });

  it('posts the updated context to the remote when the context prop changes after ready', async () => {
    const { rerender } = render(
      <IframePanel
        context={CONTEXT}
        remoteOrigin={REMOTE_ORIGIN}
        onReady={() => {}}
        onDeploymentSelected={() => {}}
        onAlertAcknowledged={() => {}}
      />,
    );
    dispatchHostMessage({ type: 'monitor-ready' }, REMOTE_ORIGIN);
    await screen.findByTestId('remote-iframe');
    postMessageSpy.mockClear();

    const nextContext = { ...CONTEXT, modelId: 'model-y' };
    rerender(
      <IframePanel
        context={nextContext}
        remoteOrigin={REMOTE_ORIGIN}
        onReady={() => {}}
        onDeploymentSelected={() => {}}
        onAlertAcknowledged={() => {}}
      />,
    );

    expect(postMessageSpy).toHaveBeenCalledExactlyOnceWith({ type: 'context', payload: nextContext }, REMOTE_ORIGIN);
  });

  it('shows a timeout error with a retry button when no ready message arrives in time', async () => {
    vi.useFakeTimers();
    try {
      render(
        <IframePanel
          context={CONTEXT}
          remoteOrigin={REMOTE_ORIGIN}
          timeoutMs={1000}
          onReady={() => {}}
          onDeploymentSelected={() => {}}
          onAlertAcknowledged={() => {}}
        />,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      expect(screen.getByTestId('iframe-error')).toBeInTheDocument();
      expect(screen.getByTestId('iframe-retry')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('remounts the iframe element when retry is clicked after a timeout', async () => {
    vi.useFakeTimers();
    try {
      render(
        <IframePanel
          context={CONTEXT}
          remoteOrigin={REMOTE_ORIGIN}
          timeoutMs={1000}
          onReady={() => {}}
          onDeploymentSelected={() => {}}
          onAlertAcknowledged={() => {}}
        />,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      const firstIframe = screen.getByTestId('remote-iframe');

      act(() => {
        fireEvent.click(screen.getByTestId('iframe-retry'));
      });

      expect(screen.getByTestId('iframe-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('iframe-error')).not.toBeInTheDocument();
      const secondIframe = screen.getByTestId('remote-iframe');
      expect(secondIframe).not.toBe(firstIframe);
    } finally {
      vi.useRealTimers();
    }
  });
});

import { describe, expect, it, vi } from 'vitest';
import { buildRemoteUrl, parseRemoteMessage, postContextToRemote } from '../lib/host-frame-adapter';

const REMOTE_ORIGIN = 'http://127.0.0.1:3001';
const CONTEXT = { clusterId: 'cluster-aurora', modelId: 'model-x', environment: 'production' as const };

describe('buildRemoteUrl', () => {
  it('builds the remote origin URL with context encoded as query parameters', () => {
    const url = buildRemoteUrl(REMOTE_ORIGIN, CONTEXT);
    const parsed = new URL(url);
    expect(parsed.origin).toBe(REMOTE_ORIGIN);
    expect(parsed.searchParams.get('clusterId')).toBe('cluster-aurora');
    expect(parsed.searchParams.get('modelId')).toBe('model-x');
    expect(parsed.searchParams.get('environment')).toBe('production');
  });
});

describe('parseRemoteMessage', () => {
  it('accepts a monitor-ready message from the exact expected origin', () => {
    const event = new MessageEvent('message', {
      origin: REMOTE_ORIGIN,
      data: { type: 'monitor-ready' },
    });
    expect(parseRemoteMessage(event, REMOTE_ORIGIN)).toEqual({ type: 'monitor-ready' });
  });

  it('accepts a semantic MonitorEvent from the exact expected origin', () => {
    const event = new MessageEvent('message', {
      origin: REMOTE_ORIGIN,
      data: { type: 'deployment-selected', deploymentId: 'deploy-002' },
    });
    expect(parseRemoteMessage(event, REMOTE_ORIGIN)).toEqual({
      type: 'deployment-selected',
      deploymentId: 'deploy-002',
    });
  });

  it('rejects a message from any other origin even with a well-formed payload', () => {
    const event = new MessageEvent('message', {
      origin: 'https://evil.example.com',
      data: { type: 'monitor-ready' },
    });
    expect(parseRemoteMessage(event, REMOTE_ORIGIN)).toBeNull();
  });

  it('rejects a payload with no recognizable type field even from the exact expected origin', () => {
    const event = new MessageEvent('message', {
      origin: REMOTE_ORIGIN,
      data: { deploymentId: 'deploy-002' },
    });
    expect(parseRemoteMessage(event, REMOTE_ORIGIN)).toBeNull();
  });

  it('rejects an unrelated message shape', () => {
    const event = new MessageEvent('message', {
      origin: REMOTE_ORIGIN,
      data: { type: 'not-a-remote-message' },
    });
    expect(parseRemoteMessage(event, REMOTE_ORIGIN)).toBeNull();
  });
});

describe('postContextToRemote', () => {
  it('posts a well-formed HostContextMessage to the exact configured remote origin only', () => {
    const target = { postMessage: vi.fn() } as unknown as Window;
    postContextToRemote(target, REMOTE_ORIGIN, CONTEXT);
    expect(target.postMessage).toHaveBeenCalledExactlyOnceWith({ type: 'context', payload: CONTEXT }, REMOTE_ORIGIN);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { parseHostContextMessage, postMessageToHost } from '../src/lib/frameAdapter';

const HOST_ORIGIN = 'http://127.0.0.1:4173';

describe('parseHostContextMessage', () => {
  const payload = { clusterId: 'cluster-aurora', modelId: 'model-x', environment: 'production' as const };

  it('accepts a well-formed context message from the exact expected origin', () => {
    const event = new MessageEvent('message', {
      origin: HOST_ORIGIN,
      data: { type: 'context', payload },
    });
    expect(parseHostContextMessage(event, HOST_ORIGIN)).toEqual(payload);
  });

  it('rejects a message from any other origin', () => {
    const event = new MessageEvent('message', {
      origin: 'https://evil.example.com',
      data: { type: 'context', payload },
    });
    expect(parseHostContextMessage(event, HOST_ORIGIN)).toBeNull();
  });

  it('rejects a malformed payload even from the exact expected origin', () => {
    const event = new MessageEvent('message', {
      origin: HOST_ORIGIN,
      data: { type: 'context', payload: { clusterId: 'cluster-aurora' } },
    });
    expect(parseHostContextMessage(event, HOST_ORIGIN)).toBeNull();
  });

  it('rejects an unrelated message shape', () => {
    const event = new MessageEvent('message', {
      origin: HOST_ORIGIN,
      data: { type: 'not-context' },
    });
    expect(parseHostContextMessage(event, HOST_ORIGIN)).toBeNull();
  });
});

describe('postMessageToHost', () => {
  it('posts the message to the exact configured host origin only', () => {
    const target = { postMessage: vi.fn() } as unknown as Window;
    postMessageToHost(target, HOST_ORIGIN, { type: 'monitor-ready' });
    expect(target.postMessage).toHaveBeenCalledExactlyOnceWith({ type: 'monitor-ready' }, HOST_ORIGIN);
  });

  it('forwards a semantic MonitorEvent unchanged', () => {
    const target = { postMessage: vi.fn() } as unknown as Window;
    const event = { type: 'deployment-selected' as const, deploymentId: 'deploy-001' };
    postMessageToHost(target, HOST_ORIGIN, event);
    expect(target.postMessage).toHaveBeenCalledExactlyOnceWith(event, HOST_ORIGIN);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const runtime = vi.hoisted(() => ({
  registerRemotes: vi.fn(),
  loadRemote: vi.fn(),
}));

vi.mock('@module-federation/runtime', () => runtime);

import { loadFederatedMonitor } from '../src/lib/federatedMonitor';

describe('loadFederatedMonitor', () => {
  beforeEach(() => {
    runtime.registerRemotes.mockReset();
    runtime.loadRemote.mockReset();
  });

  it('registers the Remote lazily and loads the exposed Monitor', async () => {
    const monitor = { name: 'Monitor' };
    runtime.loadRemote.mockResolvedValue({ default: monitor });

    await expect(
      loadFederatedMonitor('http://127.0.0.1:4174/remoteEntry.js'),
    ).resolves.toEqual({ default: monitor });

    expect(runtime.registerRemotes).toHaveBeenCalledWith(
      [
        {
          name: 'vue_remote',
          entry: 'http://127.0.0.1:4174/remoteEntry.js',
          type: 'module',
        },
      ],
      { force: true },
    );
    expect(runtime.loadRemote).toHaveBeenCalledWith('vue_remote/Monitor');
  });

  it('uses a new Remote entry URL for a retry so the browser does not reuse a failed ESM import', async () => {
    runtime.loadRemote.mockResolvedValue({ default: { name: 'Monitor' } });

    await loadFederatedMonitor('http://127.0.0.1:4174/remoteEntry.js', true);

    expect(runtime.registerRemotes).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          entry: expect.stringMatching(/^http:\/\/127\.0\.0\.1:4174\/remoteEntry\.js\?retry=/),
        name: 'vue_remote',
        type: 'module',
        }),
      ],
      { force: true },
    );
  });

  it('rejects an empty runtime module so FederationPanel can show retry UI', async () => {
    runtime.loadRemote.mockResolvedValue(null);

    await expect(
      loadFederatedMonitor('http://127.0.0.1:4174/remoteEntry.js'),
    ).rejects.toThrow('vue_remote/Monitor returned no module');
  });
});

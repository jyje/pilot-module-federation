import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.vue';

const CONTEXT = {
  user: { id: 'user-operator', displayName: 'Alex Kim', email: 'alex@aurora.example' },
  tenant: { id: 'tenant-aurora', name: 'Aurora Research' },
  capabilities: ['deployments:read', 'observability:read', 'governance:read'] as const,
};

const { loadPlatformRemote } = vi.hoisted(() => ({ loadPlatformRemote: vi.fn() }));
vi.mock('../src/lib/api', () => ({ restoreSession: vi.fn(), login: vi.fn(), logout: vi.fn() }));
vi.mock('../src/lib/platform-remotes', () => ({
  loadPlatformRemote,
  REMOTES: [
    { id: 'observability', label: 'Observability', capability: 'observability:read', entry: 'http://remote/observability', remoteName: 'observability' },
    { id: 'governance', label: 'Governance', capability: 'governance:read', entry: 'http://remote/governance', remoteName: 'governance' },
  ],
}));

const RemoteStub = defineComponent({ props: { platform: { type: Object, required: true } }, setup: () => () => h('div', { 'data-testid': 'remote-stub' }, 'team remote') });

describe('Platform Shell', () => {
  beforeEach(async () => {
    const api = await import('../src/lib/api');
    vi.mocked(api.restoreSession).mockResolvedValue(CONTEXT);
    loadPlatformRemote.mockResolvedValue({ default: RemoteStub });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ healthy: 4, degraded: 1, rolling: 1 }) }));
    window.history.replaceState({}, '', '/deployments');
  });

  it('keeps the signed-in identity and mission rail while changing team routes', async () => {
    const wrapper = mount(App);
    await flushPromises();
    expect(wrapper.text()).toContain('Alex Kim');
    expect(wrapper.findAll('nav button')).toHaveLength(3);
    expect(wrapper.find('[data-testid="deployments-host"]').exists()).toBe(true);

    await wrapper.findAll('nav button')[2]!.trigger('click');
    await flushPromises();
    expect(window.location.pathname).toBe('/governance');
    expect(loadPlatformRemote).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'governance' }), false);
    expect(wrapper.text()).toContain('Alex Kim');
  });
});

import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import EventLedgerPanel from '../src/components/EventLedgerPanel.vue';
import type { LedgerEntry } from '../src/lib/eventLedger';

describe('EventLedgerPanel', () => {
  it('shows an empty-state message when there are no entries', () => {
    const wrapper = mount(EventLedgerPanel, { props: { entries: [] } });
    expect(wrapper.text()).toContain('No events yet');
  });

  it('renders one item per entry with its source and a human-readable description', () => {
    const entries: LedgerEntry[] = [
      {
        id: 2,
        source: 'federation',
        event: { type: 'deployment-selected', deploymentId: 'deploy-002' },
        timestamp: '2026-07-24T08:00:01.000Z',
      },
      {
        id: 1,
        source: 'iframe',
        event: { type: 'monitor-ready' },
        timestamp: '2026-07-24T08:00:00.000Z',
      },
    ];
    const wrapper = mount(EventLedgerPanel, { props: { entries } });
    const items = wrapper.findAll('[data-testid="ledger-entry"]');
    expect(items).toHaveLength(2);
    expect(items[0]!.text()).toContain('federation');
    expect(items[0]!.text()).toContain('deploy-002');
    expect(items[1]!.text()).toContain('iframe');
    expect(items[1]!.text()).toContain('ready');
  });
});

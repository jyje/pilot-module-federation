import { describe, expect, it } from 'vitest';
import { createEventLedger } from '../src/lib/eventLedger';

describe('createEventLedger', () => {
  it('starts empty', () => {
    const ledger = createEventLedger();
    expect(ledger.entries.value).toEqual([]);
  });

  it('records an event with an incrementing id and a timestamp, newest first', () => {
    let tick = 0;
    const now = () => new Date(tick++ === 0 ? '2026-07-24T08:00:00.000Z' : '2026-07-24T08:00:01.000Z');
    const ledger = createEventLedger(now);

    ledger.record({ type: 'deployment-selected', deploymentId: 'deploy-001' });
    ledger.record({ type: 'alert-acknowledged', deploymentId: 'deploy-001' });

    expect(ledger.entries.value).toEqual([
      {
        id: 2,
        event: { type: 'alert-acknowledged', deploymentId: 'deploy-001' },
        timestamp: '2026-07-24T08:00:01.000Z',
      },
      {
        id: 1,
        event: { type: 'deployment-selected', deploymentId: 'deploy-001' },
        timestamp: '2026-07-24T08:00:00.000Z',
      },
    ]);
  });

  it('clears all entries', () => {
    const ledger = createEventLedger();
    ledger.record({ type: 'deployment-selected', deploymentId: 'deploy-001' });
    ledger.clear();
    expect(ledger.entries.value).toEqual([]);
  });
});

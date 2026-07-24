import { describe, expect, it } from 'vitest';
import { createEventLedger } from '../src/lib/eventLedger';

describe('createEventLedger', () => {
  it('starts empty', () => {
    const ledger = createEventLedger();
    expect(ledger.entries.value).toEqual([]);
  });

  it('records an event with an incrementing id and the given source', () => {
    const fixedNow = () => new Date('2026-07-24T08:00:00.000Z');
    const ledger = createEventLedger(fixedNow);

    const first = ledger.record({ type: 'monitor-ready' }, 'iframe');
    const second = ledger.record({ type: 'deployment-selected', deploymentId: 'deploy-002' }, 'federation');

    expect(first.id).toBe(1);
    expect(second.id).toBe(2);
    expect(first.source).toBe('iframe');
    expect(second.source).toBe('federation');
    expect(first.timestamp).toBe('2026-07-24T08:00:00.000Z');
  });

  it('prepends new entries so the most recent event is first', () => {
    const ledger = createEventLedger();
    ledger.record({ type: 'monitor-ready' }, 'iframe');
    ledger.record({ type: 'deployment-selected', deploymentId: 'deploy-002' }, 'federation');

    expect(ledger.entries.value).toHaveLength(2);
    expect(ledger.entries.value[0]!.event).toEqual({ type: 'deployment-selected', deploymentId: 'deploy-002' });
    expect(ledger.entries.value[1]!.event).toEqual({ type: 'monitor-ready' });
  });

  it('clear() empties the ledger', () => {
    const ledger = createEventLedger();
    ledger.record({ type: 'monitor-ready' }, 'iframe');
    ledger.clear();
    expect(ledger.entries.value).toEqual([]);
  });
});

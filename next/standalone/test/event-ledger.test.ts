import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEventLedger } from '../lib/event-ledger';

describe('useEventLedger', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useEventLedger());
    expect(result.current.entries).toEqual([]);
  });

  it('records an event with an incrementing id and a timestamp, newest first', () => {
    let tick = 0;
    const now = () => new Date(tick++ === 0 ? '2026-07-24T08:00:00.000Z' : '2026-07-24T08:00:01.000Z');
    const { result } = renderHook(() => useEventLedger(now));

    act(() => {
      result.current.record({ type: 'deployment-selected', deploymentId: 'deploy-001' });
    });
    act(() => {
      result.current.record({ type: 'alert-acknowledged', deploymentId: 'deploy-001' });
    });

    expect(result.current.entries).toEqual([
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
    const { result } = renderHook(() => useEventLedger());
    act(() => {
      result.current.record({ type: 'deployment-selected', deploymentId: 'deploy-001' });
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.entries).toEqual([]);
  });
});

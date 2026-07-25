import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEventLedger } from '../lib/event-ledger';

describe('useEventLedger', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useEventLedger());
    expect(result.current.entries).toEqual([]);
  });

  it('records an event with an incrementing id and the given source', () => {
    const fixedNow = () => new Date('2026-07-24T08:00:00.000Z');
    const { result } = renderHook(() => useEventLedger(fixedNow));

    let first: { id: number; source: string; timestamp: string } | undefined;
    let second: { id: number; source: string; timestamp: string } | undefined;
    act(() => {
      first = result.current.record({ type: 'monitor-ready' }, 'iframe');
    });
    act(() => {
      second = result.current.record({ type: 'deployment-selected', deploymentId: 'deploy-002' }, 'federation');
    });

    expect(first?.id).toBe(1);
    expect(second?.id).toBe(2);
    expect(first?.source).toBe('iframe');
    expect(second?.source).toBe('federation');
    expect(first?.timestamp).toBe('2026-07-24T08:00:00.000Z');
  });

  it('prepends new entries so the most recent event is first', () => {
    const { result } = renderHook(() => useEventLedger());
    act(() => {
      result.current.record({ type: 'monitor-ready' }, 'iframe');
    });
    act(() => {
      result.current.record({ type: 'deployment-selected', deploymentId: 'deploy-002' }, 'federation');
    });

    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entries[0]!.event).toEqual({ type: 'deployment-selected', deploymentId: 'deploy-002' });
    expect(result.current.entries[1]!.event).toEqual({ type: 'monitor-ready' });
  });

  it('clear() empties the ledger', () => {
    const { result } = renderHook(() => useEventLedger());
    act(() => {
      result.current.record({ type: 'monitor-ready' }, 'iframe');
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.entries).toEqual([]);
  });
});

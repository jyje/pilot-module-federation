import { useCallback, useRef, useState } from 'react';
import type { MonitorEvent } from '@pilot/contracts';

export interface LedgerEntry {
  id: number;
  event: MonitorEvent;
  timestamp: string;
}

export function useEventLedger(now: () => Date = () => new Date()) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const nextId = useRef(1);

  const record = useCallback(
    (event: MonitorEvent): LedgerEntry => {
      const entry: LedgerEntry = {
        id: nextId.current++,
        event,
        timestamp: now().toISOString(),
      };
      setEntries((current) => [entry, ...current]);
      return entry;
    },
    [now],
  );

  const clear = useCallback(() => setEntries([]), []);

  return { entries, record, clear };
}

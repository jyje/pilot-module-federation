import { useCallback, useRef, useState } from 'react';
import type { RemoteToHostMessage } from '@pilot/contracts';

export type LedgerSource = 'federation' | 'iframe';

export interface LedgerEntry {
  id: number;
  source: LedgerSource;
  event: RemoteToHostMessage;
  timestamp: string;
}

export function useEventLedger(now: () => Date = () => new Date()) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const nextId = useRef(1);

  const record = useCallback(
    (event: RemoteToHostMessage, source: LedgerSource): LedgerEntry => {
      const entry: LedgerEntry = {
        id: nextId.current++,
        source,
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

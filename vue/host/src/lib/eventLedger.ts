import { ref, type Ref } from 'vue';
import type { RemoteToHostMessage } from '@pilot/contracts';

export type LedgerSource = 'federation' | 'iframe';

export interface LedgerEntry {
  id: number;
  source: LedgerSource;
  event: RemoteToHostMessage;
  timestamp: string;
}

export interface EventLedger {
  entries: Ref<LedgerEntry[]>;
  record(event: RemoteToHostMessage, source: LedgerSource): LedgerEntry;
  clear(): void;
}

/** Host-owned ledger of every Remote-originated event, regardless of composition mode. */
export function createEventLedger(now: () => Date = () => new Date()): EventLedger {
  const entries = ref<LedgerEntry[]>([]);
  let nextId = 1;

  function record(event: RemoteToHostMessage, source: LedgerSource): LedgerEntry {
    const entry: LedgerEntry = {
      id: nextId++,
      source,
      event,
      timestamp: now().toISOString(),
    };
    entries.value = [entry, ...entries.value];
    return entry;
  }

  function clear(): void {
    entries.value = [];
  }

  return { entries, record, clear };
}

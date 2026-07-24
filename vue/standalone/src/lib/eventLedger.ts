import { ref, type Ref } from 'vue';
import type { MonitorEvent } from '@pilot/contracts';

export interface LedgerEntry {
  id: number;
  event: MonitorEvent;
  timestamp: string;
}

export interface EventLedger {
  entries: Ref<LedgerEntry[]>;
  record(event: MonitorEvent): LedgerEntry;
  clear(): void;
}

/** Standalone-owned ledger of every Monitor-emitted event; there is only one composition mode. */
export function createEventLedger(now: () => Date = () => new Date()): EventLedger {
  const entries = ref<LedgerEntry[]>([]);
  let nextId = 1;

  function record(event: MonitorEvent): LedgerEntry {
    const entry: LedgerEntry = {
      id: nextId++,
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

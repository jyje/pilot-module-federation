<script setup lang="ts">
import type { LedgerEntry } from '../lib/eventLedger';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

defineProps<{ entries: readonly LedgerEntry[] }>();

function describe(entry: LedgerEntry): string {
  const { event } = entry;
  if (event.type === 'monitor-ready') {
    return 'Remote monitor ready';
  }
  if (event.type === 'deployment-selected') {
    return `Deployment selected: ${event.deploymentId}`;
  }
  if (event.type === 'alert-acknowledged') {
    return `Alert acknowledged: ${event.deploymentId}`;
  }
  return `Environment changed: ${event.environment}`;
}
</script>

<template>
  <Card class="event-ledger" aria-label="Host event ledger">
    <CardHeader>
      <CardTitle>Event ledger</CardTitle>
    </CardHeader>
    <CardContent>
      <p v-if="entries.length === 0" class="event-ledger__empty">No events yet.</p>
      <ul v-else class="event-ledger__list">
        <li
          v-for="entry in entries"
          :key="entry.id"
          data-testid="ledger-entry"
          class="event-ledger__item"
        >
          <Badge :variant="entry.source === 'federation' ? 'default' : 'secondary'">
            {{ entry.source }}
          </Badge>
          <span class="event-ledger__description">{{ describe(entry) }}</span>
          <time class="event-ledger__timestamp">{{ entry.timestamp }}</time>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>

<style scoped>
.event-ledger__empty {
  color: hsl(var(--platform-muted));
  font-size: 0.875rem;
  margin: 0;
}

.event-ledger__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-ledger__item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
}

.event-ledger__timestamp {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: hsl(var(--platform-muted));
}
</style>

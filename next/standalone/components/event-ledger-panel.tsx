import type { LedgerEntry } from '../lib/event-ledger';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

function describe(entry: LedgerEntry): string {
  const { event } = entry;
  if (event.type === 'deployment-selected') {
    return `Deployment selected: ${event.deploymentId}`;
  }
  if (event.type === 'alert-acknowledged') {
    return `Alert acknowledged: ${event.deploymentId}`;
  }
  return `Environment changed: ${event.environment}`;
}

function label(entry: LedgerEntry): string {
  return entry.event.type === 'deployment-selected' ? 'selection' : 'alert';
}

export function EventLedgerPanel({ entries }: { entries: readonly LedgerEntry[] }) {
  return (
    <Card aria-label="Standalone event ledger">
      <CardHeader>
        <CardTitle>Event ledger</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="m-0 text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {entries.map((entry) => (
              <li key={entry.id} data-testid="ledger-entry" className="flex items-center gap-2.5 text-[0.85rem]">
                <Badge variant="secondary">{label(entry)}</Badge>
                <span>{describe(entry)}</span>
                <time className="ml-auto font-mono text-xs text-muted-foreground">{entry.timestamp}</time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

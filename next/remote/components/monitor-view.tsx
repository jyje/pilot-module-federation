import type { MonitorState } from '../lib/monitor';
import { PulseRail } from './pulse-rail';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function MonitorView({
  state,
  selectedId,
  loading = false,
  showAcknowledge,
  onSelect,
  onAcknowledge,
}: {
  state: MonitorState;
  selectedId: string;
  loading?: boolean;
  showAcknowledge: boolean;
  onSelect: (id: string) => void;
  onAcknowledge: (id: string) => void;
}) {
  if (loading) {
    return (
      <section aria-label="Model deployment monitor" className="flex flex-col gap-3">
        <div data-testid="monitor-skeleton" className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </section>
    );
  }

  if (state.deployments.length === 0 || !state.selected) {
    return (
      <section aria-label="Model deployment monitor">
        <Alert variant="destructive">
          <AlertTitle>No deployments</AlertTitle>
          <AlertDescription>No deployments found for this model in the selected context.</AlertDescription>
        </Alert>
      </section>
    );
  }

  const selected = state.selected;

  return (
    <section aria-label="Model deployment monitor" className="flex flex-col gap-5">
      <PulseRail deployments={state.deployments} selectedId={selectedId} onSelect={onSelect} />

      <Card>
        <CardHeader>
          <CardTitle>{selected.modelName}</CardTitle>
          <CardDescription>{selected.status}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="flex gap-8 m-0">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Replicas</dt>
              <dd className="mt-1 font-mono text-xl">
                {selected.replicas.ready}/{selected.replicas.desired}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">p95 latency</dt>
              <dd className="mt-1 font-mono text-xl">{selected.p95LatencyMs} ms</dd>
            </div>
          </dl>

          {showAcknowledge && (
            <Alert variant="destructive">
              <AlertTitle>Degraded deployment</AlertTitle>
              <AlertDescription>Latency or replica health has crossed the alert threshold.</AlertDescription>
              <AlertAction>
                <Button
                  data-testid="acknowledge-alert"
                  size="sm"
                  variant="destructive"
                  onClick={() => onAcknowledge(selected.id)}
                >
                  Acknowledge
                </Button>
              </AlertAction>
            </Alert>
          )}

          <ul className="flex flex-col gap-1.5 text-sm m-0 p-0 list-none">
            {state.timeline.map((event) => (
              <li
                key={event.id}
                className={
                  event.severity === 'warning'
                    ? 'text-[hsl(var(--platform-warning))]'
                    : event.severity === 'critical'
                      ? 'text-[hsl(var(--platform-danger))]'
                      : undefined
                }
              >
                {event.label}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

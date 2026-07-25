'use client';

import { useEffect, useState } from 'react';
import type { DeploymentContext } from '@pilot/contracts';
import { resolveMonitorState } from '../lib/monitor';
import { PulseRail } from './pulse-rail';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function Monitor({
  context,
  loading = false,
  onDeploymentSelected,
  onAlertAcknowledged,
}: {
  context: DeploymentContext;
  loading?: boolean;
  onDeploymentSelected: (id: string) => void;
  onAlertAcknowledged: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>();
  const [acknowledgedIds, setAcknowledgedIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    setSelectedId(undefined);
  }, [context.modelId]);

  const state = resolveMonitorState(context.modelId, selectedId);
  const activeSelectedId = selectedId ?? state.selected?.id ?? '';
  const showAcknowledge =
    state.selected?.status === 'degraded' && !acknowledgedIds.has(state.selected.id);

  function selectDeployment(id: string): void {
    setSelectedId(id);
    onDeploymentSelected(id);
  }

  function acknowledge(id: string): void {
    setAcknowledgedIds((current) => new Set(current).add(id));
    onAlertAcknowledged(id);
  }

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
      <PulseRail deployments={state.deployments} selectedId={activeSelectedId} onSelect={selectDeployment} />

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
                  onClick={() => acknowledge(selected.id)}
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

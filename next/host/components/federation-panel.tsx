'use client';

import { Component, Suspense, lazy, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DeploymentContext } from '@pilot/contracts';
import { loadFederatedMonitor } from '../lib/load-federated-monitor';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

class FederationErrorBoundary extends Component<
  { onRetry: () => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" data-testid="federation-error">
          <AlertTitle>Remote unavailable</AlertTitle>
          <AlertDescription>The federated Monitor failed to load.</AlertDescription>
          <AlertAction>
            <Button data-testid="federation-retry" size="sm" variant="destructive" onClick={this.props.onRetry}>
              Retry
            </Button>
          </AlertAction>
        </Alert>
      );
    }
    return this.props.children;
  }
}

export function FederationPanel({
  context,
  onDeploymentSelected,
  onAlertAcknowledged,
}: {
  context: DeploymentContext;
  onDeploymentSelected: (id: string) => void;
  onAlertAcknowledged: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>();
  const [acknowledgedIds, setAcknowledgedIds] = useState<ReadonlySet<string>>(new Set());
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setSelectedId(undefined);
  }, [context.modelId]);

  const FederatedMonitor = useMemo(() => lazy(loadFederatedMonitor), [attempt]);

  function selectDeployment(id: string): void {
    setSelectedId(id);
    onDeploymentSelected(id);
  }

  function acknowledge(id: string): void {
    setAcknowledgedIds((current) => new Set(current).add(id));
    onAlertAcknowledged(id);
  }

  function retry(): void {
    setAttempt((n) => n + 1);
  }

  return (
    <FederationErrorBoundary key={attempt} onRetry={retry}>
      <Suspense
        fallback={
          <div data-testid="federation-loading" className="flex flex-col gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        }
      >
        <FederatedMonitor
          context={context}
          selectedId={selectedId}
          acknowledgedIds={acknowledgedIds}
          onSelect={selectDeployment}
          onAcknowledge={acknowledge}
        />
      </Suspense>
    </FederationErrorBoundary>
  );
}

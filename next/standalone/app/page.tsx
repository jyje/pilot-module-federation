'use client';

import { useState } from 'react';
import type { DeploymentContext } from '@pilot/contracts';
import { DEFAULT_CONTEXT } from '@pilot/fixtures';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ContextControls } from '../components/context-controls';
import { EventLedgerPanel } from '../components/event-ledger-panel';
import { Monitor } from '../components/monitor';
import { useEventLedger } from '../lib/event-ledger';

export default function StandalonePage() {
  const [context, setContext] = useState<DeploymentContext>({ ...DEFAULT_CONTEXT });
  const ledger = useEventLedger();

  return (
    <main className="mx-auto w-[min(94rem,100%)] p-[clamp(1rem,2.5vw,2.5rem)]">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="m-0 mb-1.5 font-mono text-xs uppercase tracking-wide text-[hsl(var(--platform-accent))]">
            AI Platform Console + Model Deployment Monitor
          </p>
          <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.7rem)] tracking-tight">
            Flight Deck Ledger
          </h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--platform-muted))]">
            Non-composed baseline: deployment context and monitor evidence in one Next application, no
            Module Federation and no iframe.
          </p>
        </div>
        <Badge variant="secondary">Next Standalone · 3002</Badge>
      </header>

      <Card className="mb-4 border-[hsl(var(--platform-border))] bg-[hsl(var(--platform-surface))]">
        <CardHeader>
          <CardTitle>Deployment context</CardTitle>
        </CardHeader>
        <CardContent>
          <ContextControls context={context} onContextChange={setContext} />
        </CardContent>
      </Card>

      <section
        aria-label="Deployment monitor and event ledger"
        className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(18rem,0.8fr)]"
      >
        <div className="min-h-[28rem] rounded-[var(--radius)] border border-[hsl(var(--platform-border))] bg-[hsl(var(--platform-surface))] p-[clamp(0.75rem,2vw,1.25rem)]">
          <Monitor
            context={context}
            onDeploymentSelected={(id) => ledger.record({ type: 'deployment-selected', deploymentId: id })}
            onAlertAcknowledged={(id) => ledger.record({ type: 'alert-acknowledged', deploymentId: id })}
          />
        </div>
        <EventLedgerPanel entries={ledger.entries} />
      </section>
    </main>
  );
}

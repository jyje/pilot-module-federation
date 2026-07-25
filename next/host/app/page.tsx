'use client';

import { useState } from 'react';
import type { DeploymentContext } from '@pilot/contracts';
import { DEFAULT_CONTEXT } from '@pilot/fixtures';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CompositionControls, type CompositionMode } from '../components/composition-controls';
import { ContextControls } from '../components/context-controls';
import { EventLedgerPanel } from '../components/event-ledger-panel';
import { FederationPanel } from '../components/federation-panel';
import { IframePanel } from '../components/iframe-panel';
import { useEventLedger } from '../lib/event-ledger';

const REMOTE_ORIGIN = process.env.NEXT_PUBLIC_NEXT_REMOTE_ORIGIN ?? 'http://127.0.0.1:3001';

export default function HostPage() {
  const [context, setContext] = useState<DeploymentContext>({ ...DEFAULT_CONTEXT });
  const [mode, setMode] = useState<CompositionMode>('iframe');
  const ledger = useEventLedger();

  return (
    <main className="mx-auto w-[min(94rem,100%)] p-[clamp(1rem,2.5vw,2.5rem)]">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="m-0 mb-1.5 font-mono text-xs uppercase tracking-wide text-[hsl(var(--platform-accent))]">
            AI Platform Console
          </p>
          <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.7rem)] tracking-tight">
            Flight Deck Ledger
          </h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--platform-muted))]">
            Coordinate model deployment evidence without losing operational context.
          </p>
        </div>
        <Badge variant="secondary">Next Host · 3000</Badge>
      </header>

      <Card className="mb-4 border-[hsl(var(--platform-border))] bg-[hsl(var(--platform-surface))]">
        <CardHeader>
          <CardTitle>Deployment context</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ContextControls context={context} onContextChange={setContext} />
          <CompositionControls mode={mode} onModeChange={setMode} />
          <p
            data-testid="composition-boundary"
            className="m-0 font-mono text-xs uppercase tracking-wide text-[hsl(var(--platform-muted))]"
          >
            {mode === 'federation' ? 'Federation component boundary' : 'iframe document boundary'}
          </p>
        </CardContent>
      </Card>

      <section
        aria-label="Composed monitor and Host event evidence"
        className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(0,2fr)_minmax(18rem,0.8fr)]"
      >
        <div className="min-h-[28rem] rounded-[var(--radius)] border border-[hsl(var(--platform-border))] bg-[hsl(var(--platform-surface))] p-[clamp(0.75rem,2vw,1.25rem)]">
          {mode === 'federation' ? (
            <FederationPanel
              context={context}
              onDeploymentSelected={(id) =>
                ledger.record({ type: 'deployment-selected', deploymentId: id }, 'federation')
              }
              onAlertAcknowledged={(id) =>
                ledger.record({ type: 'alert-acknowledged', deploymentId: id }, 'federation')
              }
            />
          ) : (
            <IframePanel
              context={context}
              remoteOrigin={REMOTE_ORIGIN}
              onReady={() => ledger.record({ type: 'monitor-ready' }, 'iframe')}
              onDeploymentSelected={(id) =>
                ledger.record({ type: 'deployment-selected', deploymentId: id }, 'iframe')
              }
              onAlertAcknowledged={(id) =>
                ledger.record({ type: 'alert-acknowledged', deploymentId: id }, 'iframe')
              }
            />
          )}
        </div>
        <EventLedgerPanel entries={ledger.entries} />
      </section>
    </main>
  );
}

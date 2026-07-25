'use client';

import { useEffect, useState } from 'react';
import type { DeploymentContext, MonitorEvent } from '@pilot/contracts';
import { DEFAULT_CONTEXT } from '@pilot/fixtures';
import { Monitor } from '../components/monitor';
import { parseHostContextMessage, postMessageToHost } from '../lib/frame-adapter';
import { resolveContextFromQuery } from '../lib/context';

const HOST_ORIGIN = 'http://127.0.0.1:3000';

export default function RemoteHealthPage() {
  const [context, setContext] = useState<DeploymentContext>(DEFAULT_CONTEXT);
  const [isFramed, setIsFramed] = useState(false);

  useEffect(() => {
    const framed = window.parent !== window;
    setIsFramed(framed);
    setContext(resolveContextFromQuery(window.location.search, DEFAULT_CONTEXT));

    if (!framed) return;

    postMessageToHost(window.parent, HOST_ORIGIN, { type: 'monitor-ready' });

    function handleHostMessage(event: MessageEvent): void {
      const payload = parseHostContextMessage(event, HOST_ORIGIN);
      if (payload) setContext(payload);
    }

    window.addEventListener('message', handleHostMessage);
    return () => window.removeEventListener('message', handleHostMessage);
  }, []);

  function forwardToHost(event: MonitorEvent): void {
    if (isFramed) postMessageToHost(window.parent, HOST_ORIGIN, event);
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-6">
        <p className="m-0 mb-2 font-mono text-xs uppercase tracking-wide text-[hsl(var(--platform-accent))]">
          Model Deployment Monitor
        </p>
        <h1 className="m-0 font-[family-name:var(--font-display)] text-4xl tracking-tight">Next Remote</h1>
      </header>
      <Monitor
        context={context}
        onDeploymentSelected={(id) => forwardToHost({ type: 'deployment-selected', deploymentId: id })}
        onAlertAcknowledged={(id) => forwardToHost({ type: 'alert-acknowledged', deploymentId: id })}
      />
    </main>
  );
}

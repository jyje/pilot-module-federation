'use client';

import { useEffect, useRef, useState } from 'react';
import type { DeploymentContext } from '@pilot/contracts';
import { buildRemoteUrl, parseRemoteMessage, postContextToRemote } from '../lib/host-frame-adapter';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

type Status = 'loading' | 'ready' | 'error';

export function IframePanel({
  context,
  remoteOrigin,
  timeoutMs = 8000,
  onReady,
  onDeploymentSelected,
  onAlertAcknowledged,
}: {
  context: DeploymentContext;
  remoteOrigin: string;
  timeoutMs?: number;
  onReady: () => void;
  onDeploymentSelected: (id: string) => void;
  onAlertAcknowledged: (id: string) => void;
}) {
  const [status, setStatus] = useState<Status>('loading');
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timeoutHandle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const statusRef = useRef(status);
  statusRef.current = status;

  const src = buildRemoteUrl(remoteOrigin, context);

  function startTimeout(): void {
    clearTimeout(timeoutHandle.current);
    timeoutHandle.current = setTimeout(() => {
      if (statusRef.current === 'loading') {
        setStatus('error');
      }
    }, timeoutMs);
  }

  function sendContext(nextContext: DeploymentContext): void {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      postContextToRemote(win, remoteOrigin, nextContext);
    }
  }

  useEffect(() => {
    function handleMessage(event: MessageEvent): void {
      const message = parseRemoteMessage(event, remoteOrigin);
      if (!message) return;

      if (message.type === 'monitor-ready') {
        clearTimeout(timeoutHandle.current);
        setStatus('ready');
        onReady();
        sendContext(context);
        return;
      }

      if (message.type === 'deployment-selected') {
        onDeploymentSelected(message.deploymentId);
        return;
      }

      if (message.type === 'alert-acknowledged') {
        onAlertAcknowledged(message.deploymentId);
      }
    }

    window.addEventListener('message', handleMessage);
    startTimeout();
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutHandle.current);
    };
  }, [remoteOrigin, iframeKey]);

  useEffect(() => {
    if (status === 'ready') {
      sendContext(context);
    }
  }, [context]);

  function retry(): void {
    setStatus('loading');
    setIframeKey((key) => key + 1);
  }

  return (
    <div data-testid="iframe-panel">
      {status === 'loading' && (
        <div data-testid="iframe-loading" className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {status === 'error' && (
        <Alert variant="destructive" data-testid="iframe-error">
          <AlertTitle>Remote unavailable</AlertTitle>
          <AlertDescription>
            {src} did not respond within {timeoutMs}ms.
          </AlertDescription>
          <AlertAction>
            <Button data-testid="iframe-retry" size="sm" variant="destructive" onClick={retry}>
              Retry
            </Button>
          </AlertAction>
        </Alert>
      )}

      <iframe
        key={iframeKey}
        ref={iframeRef}
        src={src}
        data-testid="remote-iframe"
        title="Next Remote — Model Deployment Monitor"
        className="w-full min-h-96 rounded-[var(--radius)] border border-[hsl(var(--platform-border))]"
        style={{ display: status === 'ready' ? 'block' : 'none' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

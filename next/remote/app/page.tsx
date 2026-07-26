'use client';

import { useEffect, useState } from 'react';
import type { PlatformContext } from '@pilot/contracts';
import ObservabilityRemote from '@/components/federated-hello';

export default function RemotePage() {
  const [platform, setPlatform] = useState<PlatformContext | null>(null);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [hello, setHello] = useState('');

  useEffect(() => {
    void fetch('/api/auth/session', { credentials: 'include' }).then(async (response) => {
      if (!response.ok) return;
      const { context } = await response.json() as { context: PlatformContext };
      setPlatform(context);
      const metrics = await fetch('/api/observability/summary', { credentials: 'include' });
      if (metrics.ok) setSummary(await metrics.json() as Record<string, number>);
    });
  }, []);

  if (!platform) return <main className="standalone-shell"><p className="eyebrow">Observability / HTTP remote / port 4001</p><h1>Sign in through the Platform Host first.</h1><p>This independent preview reuses the Host session cookie. Open <a href="http://127.0.0.1:4000/observability">the Platform Host</a> to establish it.</p></main>;

  return <main className="standalone-shell"><p className="eyebrow">Standalone Remote Preview · port 4001</p><ObservabilityRemote platform={platform} summary={summary} onHello={() => setHello(`Hello, ${platform.user.displayName}. SRE received your action.`)} />{hello && <p role="status" className="hello-status">{hello}</p>}</main>;
}

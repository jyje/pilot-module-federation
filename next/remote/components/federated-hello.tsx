import type { PlatformContext } from '@pilot/contracts';
import { Button } from './ui/button';

/**
 * An intentionally stateless federated surface. The Host owns React hooks and
 * session state; the Remote receives only the safe PlatformContext contract.
 */
export default function ObservabilityRemote({ platform, summary, onHello }: { platform: PlatformContext; summary: Record<string, number> | null; onHello: () => void }) {
  console.info('[next-observability-remote] platform-context-received', { userId: platform.user.id, tenantId: platform.tenant.id });
  return <section data-testid="next-federated-hello" className="domain-view">
    <p className="eyebrow">SRE / {platform.tenant.name} / HTTP Remote</p>
    <h2>Signal watch</h2>
    {summary ? <><div className="metrics"><div><strong>{summary.p95LatencyMs}ms</strong><span>p95 latency</span></div><div><strong>{summary.errorRate}%</strong><span>error rate</span></div><div><strong>{summary.activeAlerts}</strong><span>active alerts</span></div></div><div className="action"><Button data-testid="next-observability-hello" onClick={onHello}>Send hello to SRE</Button></div></> : <p className="outlet-state">Reading the live signal…</p>}
  </section>;
}

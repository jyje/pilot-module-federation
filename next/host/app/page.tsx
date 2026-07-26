'use client';

import dynamic from 'next/dynamic';
import { FormEvent, useEffect, useState } from 'react';
import type { PlatformContext, PlatformRoute } from '@pilot/contracts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ObservabilityRemote = dynamic(() => import('next_observability/ObservabilityRemote'), { ssr: false, loading: () => <p className="outlet-state">Synchronizing the SRE surface…</p> });
const GovernanceRemote = dynamic(() => import('next_governance/GovernanceRemote'), { ssr: false, loading: () => <p className="outlet-state">Synchronizing the governance surface…</p> });

const NAVIGATION: { id: PlatformRoute; label: string; capability: PlatformContext['capabilities'][number] }[] = [
  { id: 'deployments', label: 'Deployments', capability: 'deployments:read' },
  { id: 'observability', label: 'Observability', capability: 'observability:read' },
  { id: 'governance', label: 'Governance', capability: 'governance:read' },
];

async function requestSession(): Promise<PlatformContext | null> {
  const response = await fetch('/api/auth/session', { credentials: 'include' });
  return response.ok ? (await response.json() as { context: PlatformContext }).context : null;
}

function routeFromPath(): PlatformRoute {
  const value = window.location.pathname.slice(1);
  return NAVIGATION.some((item) => item.id === value) ? value as PlatformRoute : 'deployments';
}

export default function HostPage() {
  const [session, setSession] = useState<PlatformContext | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex@aurora.example');
  const [password, setPassword] = useState('demo-password');
  const [route, setRoute] = useState<PlatformRoute>('deployments');
  const [error, setError] = useState('');
  const [hello, setHello] = useState('');
  const [deploymentSummary, setDeploymentSummary] = useState<{ healthy: number; degraded: number; rolling: number } | null>(null);
  const [remoteSummary, setRemoteSummary] = useState<Record<string, number> | null>(null);

  useEffect(() => { void requestSession().then((context) => { setSession(context); setRoute(routeFromPath()); }); }, []);
  useEffect(() => {
    const onPopState = () => setRoute(routeFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => {
    if (session && route === 'deployments') void fetch('/api/deployments/summary', { credentials: 'include' }).then(async (response) => response.ok && setDeploymentSummary(await response.json()));
  }, [route, session]);
  useEffect(() => {
    if (!session || route === 'deployments') { setRemoteSummary(null); return; }
    void fetch(`/api/${route}/summary`, { credentials: 'include' }).then(async (response) => response.ok && setRemoteSummary(await response.json()));
  }, [route, session]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
    if (!response.ok) { setError((await response.json() as { error: string }).error); return; }
    const context = await requestSession(); setSession(context); setRoute(routeFromPath()); console.info('[next-platform-shell] session-established', { userId: context?.user.id, tenantId: context?.tenant.id });
  }
  function navigate(next: PlatformRoute) { window.history.pushState({}, '', `/${next}`); setRoute(next); setHello(''); }
  function action(team: string) { setHello(`Hello, ${session!.user.displayName}. ${team} received your action.`); console.info('[next-platform-shell] operator-action', { tenantId: session!.tenant.id, team }); }

  if (!session) return <main className="auth-shell"><form onSubmit={signIn}><Card className="login-card"><p className="eyebrow">AI Platform / secure entry</p><h1>Open the mission rail.</h1><p>Choose the display name shown to every team surface. Use any non-empty password; the local Fastify API creates a signed, HttpOnly demo session.</p><label>Name<input aria-label="Name" value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Email<input aria-label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input aria-label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="error">{error}</p>}<Button type="submit">Sign in</Button></Card></form></main>;

  const available = NAVIGATION.filter((item) => session.capabilities.includes(item.capability));
  return <main className="platform-shell"><aside className="mission-rail"><div className="brand">AP</div><p className="tenant">{session.tenant.name}</p><nav aria-label="Platform navigation">{available.map((item) => <Button key={item.id} variant="ghost" className={route === item.id ? 'rail-button active' : 'rail-button'} onClick={() => navigate(item.id)}><span className="rail-dot" />{item.label}</Button>)}</nav><div className="identity"><strong>{session.user.displayName}</strong><span>{session.user.email}</span><Button variant="outline" onClick={() => { void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); setSession(null); window.history.pushState({}, '', '/'); }}>Sign out</Button></div></aside><section className="workspace"><header><p className="eyebrow">{route === 'deployments' ? 'Deployments / Host-owned' : `${route} / HTTP Remote`} / {session.tenant.id}</p><p className="session-mark">Session shared · HttpOnly cookie</p></header><div className="remote-outlet">{route === 'deployments' && <section className="domain-view"><p className="eyebrow">MLOps / {session.tenant.name} / Host-owned</p><h2>Deployment runway</h2>{deploymentSummary ? <><div className="metrics"><div><strong>{deploymentSummary.healthy}</strong><span>healthy</span></div><div><strong>{deploymentSummary.degraded}</strong><span>needs attention</span></div><div><strong>{deploymentSummary.rolling}</strong><span>rolling out</span></div></div><div className="action"><Button onClick={() => action('MLOps')}>Send hello to MLOps</Button></div></> : <p className="outlet-state">Checking the deployment runway…</p>}</section>}{route === 'observability' && <ObservabilityRemote platform={session} summary={remoteSummary} onHello={() => action('SRE')} />}{route === 'governance' && <GovernanceRemote platform={session} summary={remoteSummary} onHello={() => action('Security')} />}{hello && <p role="status" className="hello-status">{hello}</p>}</div></section></main>;
}

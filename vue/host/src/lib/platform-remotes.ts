import { loadRemote, registerRemotes } from '@module-federation/runtime';
import type { PlatformCapability, PlatformRoute } from '@pilot/contracts';
import type { Component } from 'vue';

export interface PlatformRemoteModule { default: Component }
export interface RemoteRegistration {
  id: PlatformRoute;
  label: string;
  capability: PlatformCapability;
  entry: string;
  remoteName: string;
}

export const REMOTES: readonly RemoteRegistration[] = [
  { id: 'observability', label: 'Observability', capability: 'observability:read', entry: import.meta.env.VITE_OBSERVABILITY_REMOTE ?? 'http://127.0.0.1:3001/remoteEntry.js', remoteName: 'vue_observability' },
  { id: 'governance', label: 'Governance', capability: 'governance:read', entry: import.meta.env.VITE_GOVERNANCE_REMOTE ?? 'http://127.0.0.1:3002/remoteEntry.js', remoteName: 'vue_governance' },
];

const registeredRemoteNames = new Set<string>();

export async function loadPlatformRemote(remote: RemoteRegistration, retry = false): Promise<PlatformRemoteModule> {
  if (retry) registeredRemoteNames.delete(remote.remoteName);
  if (!registeredRemoteNames.has(remote.remoteName)) {
    registerRemotes([{ name: remote.remoteName, entry: remote.entry, type: 'module' }]);
    registeredRemoteNames.add(remote.remoteName);
  }
  const module = await loadRemote<PlatformRemoteModule>(`${remote.remoteName}/Remote`);
  if (!module) throw new Error(`${remote.label} did not expose a route module.`);
  return module;
}

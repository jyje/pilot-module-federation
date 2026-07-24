import { loadRemote, registerRemotes } from '@module-federation/runtime';
import type { Component } from 'vue';

export interface FederatedMonitorModule {
  default: Component;
}

/** Register and load the Remote only when the composition panel asks for it. */
export async function loadFederatedMonitor(entry: string, retry = false): Promise<FederatedMonitorModule> {
  const remoteEntry = new URL(entry);
  if (retry) {
    // Browsers cache a failed native ESM import by URL. A retry needs a new URL
    // as well as a forced runtime re-registration to issue another request.
    remoteEntry.searchParams.set('retry', crypto.randomUUID());
  }

  // `force` clears the runtime's cached failed entry/module before retrying.
  // Without it, a Remote that starts after an outage stays unavailable until a full Host reload.
  registerRemotes(
    [
      {
        name: 'vue_remote',
        entry: remoteEntry.href,
        type: 'module',
      },
    ],
    { force: true },
  );

  const remoteModule = await loadRemote<FederatedMonitorModule>('vue_remote/Monitor');
  if (!remoteModule) {
    throw new Error('vue_remote/Monitor returned no module');
  }

  return remoteModule;
}

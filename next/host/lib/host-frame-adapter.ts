import type { DeploymentContext, RemoteToHostMessage } from '@pilot/contracts';
import { isRemoteToHostMessage } from '@pilot/contracts';

export function buildRemoteUrl(origin: string, context: DeploymentContext): string {
  const url = new URL(origin);
  url.searchParams.set('clusterId', context.clusterId);
  url.searchParams.set('modelId', context.modelId);
  url.searchParams.set('environment', context.environment);
  return url.toString();
}

export function parseRemoteMessage(event: MessageEvent, expectedRemoteOrigin: string): RemoteToHostMessage | null {
  if (event.origin !== expectedRemoteOrigin) {
    return null;
  }
  if (!isRemoteToHostMessage(event.data)) {
    return null;
  }
  return event.data;
}

export function postContextToRemote(target: Window, remoteOrigin: string, context: DeploymentContext): void {
  target.postMessage({ type: 'context', payload: context }, remoteOrigin);
}

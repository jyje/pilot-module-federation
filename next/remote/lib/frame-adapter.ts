import type { DeploymentContext, RemoteToHostMessage } from '@pilot/contracts';
import { isHostContextMessage } from '@pilot/contracts';

export function parseHostContextMessage(
  event: MessageEvent,
  expectedHostOrigin: string,
): DeploymentContext | null {
  if (event.origin !== expectedHostOrigin) {
    return null;
  }
  if (!isHostContextMessage(event.data)) {
    return null;
  }
  return event.data.payload;
}

export function postMessageToHost(target: Window, hostOrigin: string, message: RemoteToHostMessage): void {
  target.postMessage(message, hostOrigin);
}

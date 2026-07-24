import type { DeploymentContext, RemoteToHostMessage } from '@pilot/contracts';
import { isHostContextMessage } from '@pilot/contracts';

/**
 * Validates both the exact sender origin and the message schema before trusting
 * a context update from a framing Host — an origin match alone is not sufficient.
 */
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

export function postMessageToHost(
  target: Window,
  hostOrigin: string,
  message: RemoteToHostMessage,
): void {
  target.postMessage(message, hostOrigin);
}

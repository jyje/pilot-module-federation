/**
 * Isolates the bare `next_remote/...` federation specifier in its own module.
 * Vite/Vitest cannot statically resolve it (it only exists as a webpack
 * remotes alias), so every test mocks this whole module instead of letting
 * the real specifier reach Vite's transform step.
 */
export function loadFederatedMonitor() {
  return import('next_remote/FederatedMonitor');
}

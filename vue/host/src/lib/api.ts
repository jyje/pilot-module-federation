import type { PlatformContext } from '@pilot/contracts';

export async function restoreSession(): Promise<PlatformContext | null> {
  const response = await fetch('/api/auth/session', { credentials: 'include' });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('The platform session could not be restored.');
  return (await response.json() as { context: PlatformContext }).context;
}

export async function login(name: string, email: string, password: string): Promise<PlatformContext> {
  const response = await fetch('/api/auth/login', {
    method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) throw new Error((await response.json() as { error: string }).error);
  const context = await restoreSession();
  if (!context) throw new Error('The session was not available after sign-in.');
  return context;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

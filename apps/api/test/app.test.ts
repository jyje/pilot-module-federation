import { afterEach, describe, expect, it } from 'vitest';
import { createApi } from '../src/app';

const apps: Awaited<ReturnType<typeof createApi>>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

async function api() {
  const app = await createApi({ cookieSecret: 'test-secret' });
  apps.push(app);
  return app;
}

describe('authentication session', () => {
  it('rejects an empty demo password without creating a session', async () => {
    const app = await api();
    const response = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { name: 'Alex', email: 'alex@example.com', password: '' } });
    expect(response.statusCode).toBe(400);
  });

  it('creates a signed HttpOnly session that restores PlatformContext without returning a credential', async () => {
    const app = await api();
    const login = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { name: 'Jiyoon Park', email: 'alex@example.com', password: 'anything' } });
    expect(login.statusCode).toBe(204);
    const cookie = login.headers['set-cookie'];
    expect(cookie).toContain('HttpOnly');

    const session = await app.inject({ method: 'GET', url: '/api/auth/session', headers: { cookie: cookie! } });
    expect(session.statusCode).toBe(200);
    expect(session.json()).toEqual({
      context: expect.objectContaining({ user: expect.objectContaining({ displayName: 'Jiyoon Park', email: 'alex@example.com' }) }),
    });
    expect(session.body).not.toContain('anything');
  });

  it('enforces a domain capability and invalidates the session on logout', async () => {
    const app = await api();
    const login = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { name: 'Security Operator', email: 'security@example.com', password: 'anything' } });
    const cookie = login.headers['set-cookie']!;
    const denied = await app.inject({ method: 'GET', url: '/api/deployments/summary', headers: { cookie } });
    expect(denied.statusCode).toBe(403);
    expect((await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { cookie } })).statusCode).toBe(204);
    expect((await app.inject({ method: 'GET', url: '/api/auth/session', headers: { cookie } })).statusCode).toBe(401);
  });
});

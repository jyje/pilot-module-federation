import cookie from '@fastify/cookie';
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import type { PlatformCapability, PlatformContext } from '@pilot/contracts';

const SESSION_COOKIE = 'pilot_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

interface Session {
  context: PlatformContext;
  expiresAt: number;
}

export interface CreateApiOptions {
  cookieSecret?: string;
  now?: () => number;
}

function demoContext(displayName: string, email: string): PlatformContext {
  const isSecurityDemo = email.toLowerCase().startsWith('security');
  return {
    user: {
      id: isSecurityDemo ? 'user-security' : 'user-operator',
      displayName,
      email,
    },
    tenant: { id: 'tenant-aurora', name: 'Aurora Research' },
    capabilities: isSecurityDemo
      ? ['governance:read']
      : ['deployments:read', 'observability:read', 'governance:read'],
  };
}

function sessionId(): string {
  return crypto.randomUUID();
}

export async function createApi(options: CreateApiOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  const now = options.now ?? Date.now;
  const sessions = new Map<string, Session>();

  await app.register(cookie, {
    secret: options.cookieSecret ?? 'pilot-local-cookie-secret-change-in-production',
  });

  function contextFromRequest(request: FastifyRequest): PlatformContext | null {
    const signed = request.cookies[SESSION_COOKIE];
    if (!signed) return null;
    const unsigned = request.unsignCookie(signed);
    if (!unsigned.valid) return null;
    const session = sessions.get(unsigned.value);
    if (!session || session.expiresAt <= now()) {
      sessions.delete(unsigned.value);
      return null;
    }
    return session.context;
  }

  function requireCapability(request: FastifyRequest, capability: PlatformCapability): PlatformContext | null {
    const context = contextFromRequest(request);
    if (!context || !context.capabilities.includes(capability)) return null;
    return context;
  }

  app.post<{
    Body: { name?: string; email?: string; password?: string };
  }>('/api/auth/login', async (request, reply) => {
    const name = request.body?.name?.trim();
    const email = request.body?.email?.trim();
    const password = request.body?.password;
    if (!name || !email || !password?.trim()) {
      return reply.code(400).send({ error: 'Name, email, and password are required.' });
    }

    const id = sessionId();
    sessions.set(id, { context: demoContext(name, email), expiresAt: now() + SESSION_TTL_MS });
    reply.setCookie(SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      signed: true,
      secure: false,
      maxAge: SESSION_TTL_MS / 1000,
    });
    return reply.code(204).send();
  });

  app.get('/api/auth/session', async (request, reply) => {
    const context = contextFromRequest(request);
    if (!context) return reply.code(401).send({ error: 'Authentication required.' });
    return { context };
  });

  app.post('/api/auth/logout', async (request, reply) => {
    const signed = request.cookies[SESSION_COOKIE];
    if (signed) {
      const unsigned = request.unsignCookie(signed);
      if (unsigned.valid) sessions.delete(unsigned.value);
    }
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return reply.code(204).send();
  });

  app.get('/api/deployments/summary', async (request, reply) => {
    const context = requireCapability(request, 'deployments:read');
    if (!context) return reply.code(403).send({ error: 'deployments:read is required.' });
    return { tenantId: context.tenant.id, healthy: 4, degraded: 1, rolling: 1 };
  });

  app.get('/api/observability/summary', async (request, reply) => {
    const context = requireCapability(request, 'observability:read');
    if (!context) return reply.code(403).send({ error: 'observability:read is required.' });
    return { tenantId: context.tenant.id, p95LatencyMs: 118, errorRate: 0.17, activeAlerts: 2 };
  });

  app.get('/api/governance/summary', async (request, reply) => {
    const context = requireCapability(request, 'governance:read');
    if (!context) return reply.code(403).send({ error: 'governance:read is required.' });
    return { tenantId: context.tenant.id, policiesPassing: 27, exceptions: 1, auditEvents: 48 };
  });

  return app;
}

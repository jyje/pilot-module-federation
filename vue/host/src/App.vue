<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch, type Component } from 'vue';
import type { PlatformContext, PlatformRoute } from '@pilot/contracts';
import { hasCapability } from '@pilot/contracts';
import { login, logout, restoreSession } from './lib/api';
import { loadPlatformRemote, REMOTES, type RemoteRegistration } from './lib/platform-remotes';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import DeploymentsHostView from './components/DeploymentsHostView.vue';

const session = ref<PlatformContext | null>(null);
const name = ref('');
const email = ref('alex@aurora.example');
const password = ref('demo-password');
const authError = ref('');
const sessionLoading = ref(true);
const route = ref<PlatformRoute>('deployments');
const remote = shallowRef<Component | null>(null);
const remoteError = ref('');
const remoteLoading = ref(false);
let currentRequest = 0;
const handlePopState = () => { route.value = routeFromPath(); };

const navigation = computed(() => session.value ? [{ id: 'deployments' as const, label: 'Deployments', capability: 'deployments:read' as const }, ...REMOTES].filter((item) => hasCapability(session.value!, item.capability)) : []);
const activeRemote = computed<RemoteRegistration | undefined>(() => REMOTES.find((item) => item.id === route.value));

function routeFromPath(): PlatformRoute {
  const segment = window.location.pathname.split('/')[1];
  return ['deployments', ...REMOTES.map((item) => item.id)].includes(segment ?? '') ? segment as PlatformRoute : 'deployments';
}

function navigate(next: PlatformRoute): void {
  if (!navigation.value.some((item) => item.id === next)) return;
  window.history.pushState({}, '', `/${next}`);
  route.value = next;
}

async function mountRemote(retry = false): Promise<void> {
  const target = activeRemote.value;
  if (!target) { remote.value = null; remoteLoading.value = false; return; }
  const request = ++currentRequest;
  remote.value = null;
  remoteError.value = '';
  remoteLoading.value = true;
  try {
    const module = await loadPlatformRemote(target, retry);
    if (request === currentRequest) {
      remote.value = module.default;
      console.info('[platform-shell] remote-mounted', { route: target.id, tenantId: session.value?.tenant.id });
    }
  } catch (cause) {
    if (request === currentRequest) remoteError.value = cause instanceof Error ? cause.message : 'The team surface could not be loaded.';
  } finally {
    if (request === currentRequest) remoteLoading.value = false;
  }
}

async function signIn(): Promise<void> {
  authError.value = '';
  try {
    session.value = await login(name.value, email.value, password.value);
    console.info('[platform-shell] session-established', { userId: session.value.user.id, tenantId: session.value.tenant.id, capabilities: [...session.value.capabilities].join(',') });
  } catch (cause) { authError.value = cause instanceof Error ? cause.message : 'Sign-in failed.'; }
}

async function signOut(): Promise<void> { await logout(); session.value = null; remote.value = null; window.history.pushState({}, '', '/'); }

watch([route, activeRemote], () => { if (session.value && route.value !== 'deployments') void mountRemote(); else { remote.value = null; remoteLoading.value = false; } });

onMounted(async () => {
  try { session.value = await restoreSession(); } catch (cause) { authError.value = cause instanceof Error ? cause.message : 'Session restore failed.'; }
  sessionLoading.value = false;
  route.value = routeFromPath();
  if (session.value && !navigation.value.some((item) => item.id === route.value)) navigate(navigation.value[0]!.id);
  window.addEventListener('popstate', handlePopState);
});
onUnmounted(() => window.removeEventListener('popstate', handlePopState));
</script>

<template>
  <main v-if="sessionLoading" class="auth-shell"><p>Restoring the control room…</p></main>
  <main v-else-if="!session" class="auth-shell">
    <form @submit.prevent="signIn"><Card class="login-card">
      <p class="eyebrow">AI Platform / secure entry</p><h1>Open the mission rail.</h1>
      <p>Choose the display name shown to every team surface. Use any non-empty password; the local Fastify API creates a signed, HttpOnly demo session.</p>
      <label>Name <input v-model="name" autocomplete="name" required /></label>
      <label>Email <input v-model="email" type="email" required /></label>
      <label>Password <input v-model="password" type="password" required /></label>
      <p v-if="authError" class="error">{{ authError }}</p><Button type="submit">Sign in</Button>
    </Card></form>
  </main>
  <main v-else class="platform-shell">
    <aside class="mission-rail"><div class="brand">AP</div><p class="tenant">{{ session.tenant.name }}</p>
      <nav aria-label="Platform navigation"><button v-for="item in navigation" :key="item.id" :class="['rail-button', { active: route === item.id }]" @click="navigate(item.id)"><span class="rail-dot" />{{ item.label }}</button></nav>
      <div class="identity"><strong>{{ session.user.displayName }}</strong><span>{{ session.user.email }}</span><button class="rail-button" @click="signOut">Sign out</button></div>
    </aside>
    <section class="workspace"><header><p class="eyebrow">{{ route === 'deployments' ? 'Deployments / Host-owned' : activeRemote?.label + ' / HTTP Remote' }} / {{ session.tenant.id }}</p><p class="session-mark">Session shared · HttpOnly cookie</p></header>
      <div class="remote-outlet"><DeploymentsHostView v-if="route === 'deployments'" :platform="session" /><p v-else-if="remoteLoading" class="loading">Synchronizing team surface…</p><div v-else-if="remoteError" class="remote-error"><strong>Remote unavailable</strong><p>{{ remoteError }}</p><button class="platform-button" @click="mountRemote(true)">Retry</button></div><component :is="remote" v-else-if="remote" :platform="session" /></div>
    </section>
  </main>
</template>

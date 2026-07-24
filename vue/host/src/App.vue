<script setup lang="ts">
import { ref } from 'vue';
import type { DeploymentContext } from '@pilot/contracts';
import { DEFAULT_CONTEXT } from '@pilot/fixtures';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import CompositionControls from './components/CompositionControls.vue';
import ContextControls from './components/ContextControls.vue';
import EventLedgerPanel from './components/EventLedgerPanel.vue';
import FederationPanel from './components/FederationPanel.vue';
import IframePanel from './components/IframePanel.vue';
import { createEventLedger } from './lib/eventLedger';
import { loadFederatedMonitor } from './lib/federatedMonitor';

type CompositionMode = 'federation' | 'iframe';

const context = ref<DeploymentContext>({ ...DEFAULT_CONTEXT });
const mode = ref<CompositionMode>('federation');
const ledger = createEventLedger();
const remoteOrigin = import.meta.env.VITE_VUE_REMOTE_ORIGIN ?? 'http://127.0.0.1:4174';
const remoteEntry = import.meta.env.VITE_VUE_REMOTE_ENTRY ?? `${remoteOrigin}/remoteEntry.js`;

const loadMonitor = (retry = false) => loadFederatedMonitor(remoteEntry, retry);

function updateContext(next: DeploymentContext): void {
  context.value = next;
}

function updateMode(next: CompositionMode): void {
  mode.value = next;
}

function recordDeployment(id: string, source: CompositionMode): void {
  ledger.record({ type: 'deployment-selected', deploymentId: id }, source);
}

function recordAcknowledgement(id: string, source: CompositionMode): void {
  ledger.record({ type: 'alert-acknowledged', deploymentId: id }, source);
}

function recordReady(): void {
  ledger.record({ type: 'monitor-ready' }, 'iframe');
}
</script>

<template>
  <main class="console-shell">
    <header class="console-header">
      <div>
        <p class="console-eyebrow">AI Platform Console</p>
        <h1>Flight Deck Ledger</h1>
        <p class="console-summary">Coordinate model deployment evidence without losing operational context.</p>
      </div>
      <Badge variant="secondary">Vue Host · 4173</Badge>
    </header>

    <Card class="control-deck">
      <CardHeader>
        <CardTitle>Deployment context</CardTitle>
      </CardHeader>
      <CardContent class="control-deck__content">
        <ContextControls :context="context" @update:context="updateContext" />
        <CompositionControls :mode="mode" @update:mode="updateMode" />
        <p data-testid="composition-boundary" class="boundary-label">
          {{ mode === 'federation' ? 'Federation component boundary' : 'iframe document boundary' }}
        </p>
      </CardContent>
    </Card>

    <section class="composition-grid" aria-label="Composed monitor and Host event evidence">
      <div class="composition-stage">
        <FederationPanel
          v-if="mode === 'federation'"
          :context="context"
          :load-monitor="loadMonitor"
          @deployment-selected="(id) => recordDeployment(id, 'federation')"
          @alert-acknowledged="(id) => recordAcknowledgement(id, 'federation')"
        />
        <IframePanel
          v-else
          :context="context"
          :remote-origin="remoteOrigin"
          @ready="recordReady"
          @deployment-selected="(id) => recordDeployment(id, 'iframe')"
          @alert-acknowledged="(id) => recordAcknowledgement(id, 'iframe')"
        />
      </div>
      <EventLedgerPanel :entries="ledger.entries.value" />
    </section>
  </main>
</template>

<style scoped>
.console-shell {
  width: min(94rem, 100%);
  margin: 0 auto;
  padding: clamp(1rem, 2.5vw, 2.5rem);
}

.console-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.console-eyebrow,
.boundary-label {
  margin: 0 0 0.35rem;
  color: hsl(var(--platform-accent));
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.7rem);
  letter-spacing: -0.045em;
}

.console-summary {
  max-width: 44rem;
  margin: 0.55rem 0 0;
  color: hsl(var(--platform-muted));
}

.control-deck,
.composition-stage {
  border-color: hsl(var(--platform-border));
  background: hsl(var(--platform-surface));
}

.control-deck__content {
  display: grid;
  gap: 1rem;
}

.boundary-label {
  margin: 0;
  color: hsl(var(--platform-muted));
}

.composition-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(18rem, 0.8fr);
  gap: 1rem;
  margin-top: 1rem;
}

.composition-stage {
  min-height: 28rem;
  padding: clamp(0.75rem, 2vw, 1.25rem);
  border: 1px solid hsl(var(--platform-border));
  border-radius: var(--radius);
}

@media (max-width: 900px) {
  .composition-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .console-header {
    flex-direction: column;
  }
}
</style>
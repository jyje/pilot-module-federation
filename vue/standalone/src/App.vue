<script setup lang="ts">
import { ref } from 'vue';
import type { DeploymentContext, MonitorEvent } from '@pilot/contracts';
import { DEFAULT_CONTEXT } from '@pilot/fixtures';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import ContextControls from './components/ContextControls.vue';
import EventLedgerPanel from './components/EventLedgerPanel.vue';
import Monitor from './components/Monitor.vue';
import { createEventLedger } from './lib/eventLedger';

const context = ref<DeploymentContext>({ ...DEFAULT_CONTEXT });
const ledger = createEventLedger();

function updateContext(next: DeploymentContext): void {
  context.value = next;
}

function recordEvent(event: MonitorEvent): void {
  ledger.record(event);
}
</script>

<template>
  <main class="console-shell">
    <header class="console-header">
      <div>
        <p class="console-eyebrow">AI Platform Console + Model Deployment Monitor</p>
        <h1>Flight Deck Ledger</h1>
        <p class="console-summary">
          Non-composed baseline: deployment context and monitor evidence in one Vue application, no
          Module Federation and no iframe.
        </p>
      </div>
      <Badge variant="secondary">Vue Standalone · 4175</Badge>
    </header>

    <Card class="control-deck">
      <CardHeader>
        <CardTitle>Deployment context</CardTitle>
      </CardHeader>
      <CardContent class="control-deck__content">
        <ContextControls :context="context" @update:context="updateContext" />
      </CardContent>
    </Card>

    <section class="composition-grid" aria-label="Deployment monitor and event ledger">
      <div class="composition-stage">
        <Monitor
          :context="context"
          @deployment-selected="(id) => recordEvent({ type: 'deployment-selected', deploymentId: id })"
          @alert-acknowledged="(id) => recordEvent({ type: 'alert-acknowledged', deploymentId: id })"
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

.console-eyebrow {
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

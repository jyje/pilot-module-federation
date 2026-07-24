# Frontend design direction

## Subject

- **Product:** AI Platform Console and Model Deployment Monitor
- **Audience:** AI platform operators and MLOps engineers
- **Single job:** Determine whether model deployments are healthy, locate the affected deployment, and move from signal to action without losing cluster/model context.

## Directions considered

### A. Flight Deck Ledger — selected

A compact operations surface that combines a flight-deck instrument hierarchy with an append-only deployment ledger.

```text
┌───────────────────────────────────────────────────────────────┐
│ AI PLATFORM / cluster-aurora / production      framework mode │
├───────────────┬───────────────────────────────────────────────┤
│ context       │ deployment pulse rail                         │
│ cluster       │ ●━━━━●━━━━◐━━━━○                               │
│ model         ├───────────────────────────────────────────────┤
│ environment   │ active deployment      operational evidence  │
│ composition   │ replicas / p95 / state  event ledger          │
└───────────────┴───────────────────────────────────────────────┘
```

### B. Blueprint Console — not selected

A light engineering-sheet surface with topology lines and annotated service boundaries. Clear for architecture explanation, but less effective for continuous health scanning and screenshot contrast.

## Token system

| Token | Hex | Purpose |
| --- | --- | --- |
| Flight Black | `#090E18` | page background |
| Instrument Panel | `#111827` | primary surface |
| Bulkhead | `#243044` | border and structure |
| Telemetry Ice | `#DCE7F5` | primary foreground |
| Signal Teal | `#39D0B6` | healthy/current state |
| Caution Amber | `#F4B740` | warning/degraded state |
| Fault Coral | `#FF6B6B` | failed/error state |

Implementation should map these values into CSS variables rather than scattering literals.

## Type roles

- **Display:** Manrope Variable, restrained use for product and deployment names.
- **Body:** Manrope Variable for labels and explanatory copy.
- **Utility/data:** JetBrains Mono Variable for model IDs, cluster names, latency, replicas, ports, and event timestamps.

## Layout

- Host: context rail on the left, composition canvas in the center, Host-owned event ledger on the right/bottom depending on width.
- Remote: pulse rail first, deployment list second, selected deployment evidence third.
- Standalone: combines Host context and Monitor without a runtime boundary, preserving the same information order.
- Mobile: context becomes a compact top sheet; evidence stacks beneath the pulse rail; no horizontal page overflow.

## Signature element — deployment pulse rail

A semantic horizontal rail shows deployment progression and current health. Nodes encode real lifecycle states and are keyboard-addressable where interactive. Motion is limited to the currently deploying node and is disabled under `prefers-reduced-motion`.

## Self-critique

- A dark telemetry surface risks becoming a generic neon dashboard. Countermeasure: no gradient hero, no glow halos, no decorative charts, and no wall of identical KPI cards.
- Structure must reflect operational ownership. Host chrome, Remote root, iframe boundary, and Standalone baseline should be visibly labelled for comparison without exposing implementation jargon in primary action labels.
- shadcn components remain supporting primitives. The pulse rail and ledger hierarchy carry the project identity.

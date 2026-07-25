<div align="center">

# jyje/pilot-module-federation

Vue 3 and latest Next.js UI-in-UI microfrontend comparison.

Six independently runnable applications, one shared AI platform scenario, and evidence-based comparisons of Module Federation, iframe, and non-composed standalone delivery.

[![GitHub stars](https://img.shields.io/github/stars/jyje/pilot-module-federation?style=social)](https://github.com/jyje/pilot-module-federation)

[English](README.md) / [한국어](README-ko.md)

</div>

## Status

`v0.0.1` Draft. The pnpm workspace, shared contracts/fixtures/design tokens, all six apps, both Module Federation implementations, iframe composition for both frameworks, and both non-composed Standalone baselines are implemented and verified — see [Validation](#validation) below. The version stays at `0.0.1` until the owner reviews the evidence and approves the `v0.1.0` gate; remote push follows a separate approval, tracked in [`TASK.md`](TASK.md).

## Pilot scenario

The Host is an **AI Platform Console**. The Remote is a **Model Deployment Monitor**.

```text
AI Platform Console (Host)
├── cluster, model, and environment context
├── composition selector (Federation / iframe)
└── Model Deployment Monitor (Remote)
    ├── deployment health and replicas
    ├── latency and event timeline
    └── semantic events returned to Host
```

The comparison has three forms per framework, all implemented:

1. Host + Remote through Module Federation.
2. Host + Remote through iframe.
3. A separate Standalone baseline that contains the Console and Monitor in one non-composed app.

The Remote also remains directly previewable as a focused operations surface. The Standalone app is intentionally separate — not an alias for the Remote preview — so setup, runtime boundaries, failure modes, and developer experience can be compared fairly.

## Framework matrix

| Track | Host | Remote | Standalone baseline | UI components | Composition targets |
| --- | --- | --- | --- | --- | --- |
| Vue | Vue 3 | Vue 3 | Vue 3 | shadcn-vue (`reka-nova`) | Federation, iframe, non-composed standalone |
| Next | Next.js `16.2.11` | Next.js `16.2.11` | Next.js `16.2.11` | shadcn/ui (`radix-nova`) | Federation, iframe, non-composed standalone |

shadcn/ui is React-based; Vue uses shadcn-vue, a Vue port with an equivalent component and theming model under a different registry style name (`reka-nova` vs. `radix-nova`). Both trees consume the same `@pilot/design-tokens` package, so the Flight Deck Ledger palette, typography, and `focus-visible` treatment render pixel-identical regardless of framework — confirmed live, not just asserted, during the [Playwright MCP QA pass](docs/validation/playwright-mcp-v0.1.0.md).

## Module Federation on the latest Next.js

The obvious path, `@module-federation/nextjs-mf@8.8.71`, is **`INVALIDATED`** on `next@16.2.11`: its declared peer range tops out at Next 15, and `next.config.mjs` crashes before any webpack compilation runs — full evidence in [`spikes/next-latest-federation/README.md`](spikes/next-latest-federation/README.md). Next.js itself was never downgraded to force a pass.

That verdict is about one wrapper package, not about whether Federation is possible on Next 16 at all. A follow-up investigation found that webpack 5's own built-in `ModuleFederationPlugin` — which Next bundles internally regardless of `nextjs-mf` — works, once four Next-specific issues are worked around (a chunk-loading-global collision, a split-runtime-chunk stall, browser-cache masking of every fix, and Module Federation not carrying the exposed component's own CSS across the origin boundary). Full debugging record: [`spikes/next-raw-federation/README.md`](spikes/next-raw-federation/README.md).

`next/host` and `next/remote` ship this working implementation. The one real constraint: the exposed `FederatedMonitor` component is deliberately **stateless** — the Host owns all interaction state and passes it down as props — because reliable React-singleton sharing between two independently-built Next apps remains unresolved (tracked as I-018 in [`LOG.md`](LOG.md); not needed for a stateless boundary). This is a legitimate architectural choice, not a workaround forced by a bug: it mirrors how the Host already owns composition and event-ledger state everywhere else in this project.

## Composition comparison

- **Module Federation:** implemented for both frameworks. Vue uses `@module-federation/vite`; Next uses webpack's own `ModuleFederationPlugin` directly (see above). Both share the same fixture/context semantics and both post source-tagged events (`federation`) into the Host's event ledger.
- **iframe:** implemented for both frameworks, with an exact-origin `postMessage` contract validated on both sides (origin check *and* schema check — an origin match alone is not sufficient) and an 8-second timeout → fallback → Retry flow, verified live via network-level outage simulation.
- **Remote direct preview:** both Remotes run and are useful standalone, independent of any Host.
- **Non-composed Standalone baseline:** both frameworks implement the same Console + Monitor scenario in one application with no runtime composition, enforced by an architecture-guard test that fails the build if the app imports another app's source, Module Federation, an iframe, or `postMessage`.
- **Web Components:** a framework-neutral alternative not implemented in this pilot — Vue and React can both compile to custom elements, trading the native-DOM composition Module Federation and iframe both provide for a smaller, standards-based runtime footprint and no cross-framework state-sharing story of its own.
- **single-spa:** an orchestration alternative for portfolios with many independently-deployed route "parcels" — a different problem shape than this pilot's single Host + single Remote scenario, better suited to larger multi-team, multi-route surfaces than to a two-app comparison like this one.

No universal winner is declared. Module Federation gives native DOM composition and shared dependency de-duplication at the cost of framework-version coupling and (on Next 16, today) meaningful setup complexity; iframe gives strong isolation and framework independence at the cost of a document boundary and a hand-rolled message contract; a non-composed Standalone avoids both trade-offs entirely by not composing at runtime — the right choice depends on which of those costs a given team is actually trying to avoid.

## Repository layout

```text
vue/
├── host/         AI Platform Console (Federation + iframe)
├── remote/       Model Deployment Monitor (directly previewable)
└── standalone/   non-composed Console + Monitor baseline
next/
├── host/         AI Platform Console (Federation + iframe)
├── remote/       Model Deployment Monitor (directly previewable)
└── standalone/   non-composed Console + Monitor baseline
packages/
├── contracts/       framework-neutral TypeScript contracts
├── fixtures/        deterministic shared domain fixtures
└── design-tokens/   shared semantic CSS variables (Flight Deck Ledger)
spikes/
├── next-latest-federation/   @module-federation/nextjs-mf — INVALIDATED
└── next-raw-federation/      raw webpack.container.ModuleFederationPlugin — adopted
e2e/                Playwright Test specs
docs/
└── validation/     Playwright MCP live-QA report
artifacts/
└── screenshots/readme/
```

One pnpm workspace centralizes the lockfile, scripts, contracts, fixtures, and design tokens. No application imports another application's source, router, or store — enforced by architecture-guard tests on both Standalone baselines.

## Getting started

```bash
pnpm install
```

```bash
pnpm dev
```

Runs all six development servers in parallel with package-prefixed logs: Vue Host `4173`, Vue Remote `4174`, Vue Standalone `4175`, Next Host `3000`, Next Remote `3001`, Next Standalone `3002`.

Filtered variants:

```bash
pnpm dev:composed      # the four Host/Remote servers only
pnpm dev:standalone    # the two Standalone baselines only
pnpm dev:vue           # Vue Host + Remote + Standalone
pnpm dev:next          # Next Host + Remote + Standalone
```

Or run any single app independently, e.g.:

```bash
pnpm --filter @pilot/next-host dev
```

## Validation

```bash
pnpm lint        # ESLint across the whole workspace
pnpm typecheck   # tsc / vue-tsc per package
pnpm test        # Vitest unit/component tests — 237/237
pnpm build       # nine independent builds
pnpm e2e         # Playwright Test — 16/16
```

Every command above is a real gate: `lint` runs ESLint directly rather than delegating to per-package scripts that may not exist, and `test`/`e2e` cover both frameworks' Federation and iframe paths, including Remote-unreachable → fallback → Retry recovery.

Beyond automated coverage, a structured **Microsoft Playwright MCP** pass exercised all 8 surfaces (both frameworks × Remote/Standalone/Host-Federation/Host-iframe) live in a real browser at three breakpoints — accessibility tree, keyboard-only interaction, console, network/CORS, and responsive layout. It found and fixed three real defects invisible to the automated suite: a Vue `postMessage` `DataCloneError`, Module Federation silently dropping the exposed component's own Tailwind CSS, and a Vue/Next responsive-breakpoint mismatch. Full report: [`docs/validation/playwright-mcp-v0.1.0.md`](docs/validation/playwright-mcp-v0.1.0.md).

## Screenshots

Captured from production previews via Playwright MCP at a temporary 130% presentation zoom (`document.documentElement.style.zoom`, capture-only — never shipped in application CSS).

![Vue Host composing the Remote through Module Federation, showing the degraded-deployment alert and a federation-sourced event ledger entry.](artifacts/screenshots/readme/vue-host-federation.png)
▲ Vue Host composing the Remote through Module Federation, showing the degraded-deployment alert and a federation-sourced event ledger entry.

![Vue Host embedding the Remote through an iframe, with the framed document's own header visible inside the composition boundary.](artifacts/screenshots/readme/vue-iframe-comparison.png)
▲ Vue Host embedding the Remote through an iframe, with the framed document's own header visible inside the composition boundary.

![Vue Remote running as a directly previewable, standalone application with no Host present.](artifacts/screenshots/readme/vue-remote-standalone.png)
▲ Vue Remote running as a directly previewable, standalone application with no Host present.

![Vue Standalone showing the same Console and Monitor scenario composed in one non-federated, non-framed application.](artifacts/screenshots/readme/vue-standalone-baseline.png)
▲ Vue Standalone showing the same Console and Monitor scenario composed in one non-federated, non-framed application.

![Next Host composing the Remote through raw webpack Module Federation, with both a federation-sourced and an iframe-sourced event already in the ledger.](artifacts/screenshots/readme/next-host-federation.png)
▲ Next Host composing the Remote through raw webpack Module Federation, with both a federation-sourced and an iframe-sourced event already in the ledger.

![Next Host embedding the Remote through an iframe, with the framed Next Remote document visible inside the composition boundary.](artifacts/screenshots/readme/next-iframe-comparison.png)
▲ Next Host embedding the Remote through an iframe, with the framed Next Remote document visible inside the composition boundary.

![Next Remote running as a directly previewable, standalone application with no Host present.](artifacts/screenshots/readme/next-remote-standalone.png)
▲ Next Remote running as a directly previewable, standalone application with no Host present.

![Next Standalone showing the same Console and Monitor scenario composed in one non-federated, non-framed application.](artifacts/screenshots/readme/next-standalone-baseline.png)
▲ Next Standalone showing the same Console and Monitor scenario composed in one non-federated, non-framed application.

## Known limitations and deferred work

- **React-singleton sharing across Module Federation is unresolved on Next 16** (I-018). The adopted implementation sidesteps this by keeping the exposed component stateless rather than depending on a fix; a future federated surface that genuinely needs a shared React instance (e.g. context providers spanning the boundary) would need to revisit this.
- **Neither pilot track has a router**, so browser Back/Forward behavior is out of scope by construction, not an oversight.
- **Keyboard flow is verified live** (Playwright MCP) but not yet captured as a repeatable Playwright *Test* spec.
- **`favicon.ico` is missing** on all six apps (cosmetic `404`, identical everywhere, not fixed).
- Byte-identical rendering between shadcn/ui and shadcn-vue is not claimed — see the Framework matrix above for what *is* verified identical (design tokens, focus-visible, keyboard semantics).

## Plans and tasks

- [Architecture plan](2026-07-20_114438-pilot-module-federation.md)
- [Implementation checklist](TASK.md)
- [Implementation log](LOG.md)
- [Project instructions](CLAUDE.md)

## Project-local skills

- `frontend-design`: design direction, tokens, typography, layout, and visual self-critique.
- `centered-readme`: centered hero with a normally left-aligned document body.
- `git-commit-helper`: approved gitmoji, domain, commit, and push workflow.

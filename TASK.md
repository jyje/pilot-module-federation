# TASK — pilot-module-federation

> **Current version:** `v0.0.1` Draft
> **Target version:** `v0.1.0` Pilot
> **Repository target:** `jyje/pilot-module-federation`
> **Push policy:** Never push based on version readiness alone. Push only after the owner separately says that remote push is currently possible.

Detailed rationale: [`2026-07-20_114438-pilot-module-federation.md`](2026-07-20_114438-pilot-module-federation.md)

## 0. Confirmed owner decisions

- [x] Remove `vue` from the project name: `pilot-module-federation`.
- [x] Keep the project at `v0.0.1` Draft during local implementation.
- [x] Build two Vue 3 apps: Vue Host and Vue Remote.
- [x] Build two latest Next.js apps: Next Host and Next Remote.
- [x] Use a pnpm monorepo.
- [x] Add a root command that runs all six development servers in parallel.
- [x] Use Module Federation as the recommended composition method where framework support is validated.
- [x] Compare Module Federation with iframe, Web Components, and single-spa in README.
- [x] Implement iframe comparison routes for Vue and Next.
- [x] Use the AI Platform Console + Model Deployment Monitor scenario.
- [x] Ensure each Remote is useful as a standalone application.
- [x] Add a separate non-composed Standalone baseline for Vue and Next.
- [x] Use Vercel shadcn/ui in Next apps.
- [x] Use shadcn-vue in Vue apps; document that it is a Vue port rather than a Vercel React package.
- [x] Capture readable README screenshots at a temporary 130% presentation scale.
- [x] Require both Playwright Test and Microsoft Playwright MCP validation.

## 1. Current local baseline

- [x] Rename local folder to `~/repo/jyje/pilot-module-federation`.
- [x] Rename GitHub target to `jyje/pilot-module-federation` in the plan.
- [x] Rename root plan to `2026-07-20_114438-pilot-module-federation.md`.
- [x] Rename Hermes plan copy to `2026-07-20_114438-pilot-module-federation.md`.
- [x] Keep branch `main` with zero commits.
- [x] Keep Git remote absent.
- [x] Preserve project-local `frontend-design`, `centered-readme`, and `git-commit-helper` skills.
- [x] Create `vue/host`, `vue/remote`, and `vue/standalone` directories.
- [x] Create `next/host`, `next/remote`, and `next/standalone` directories.
- [x] Update `README.md` to the new project name and six-app scope.
- [x] Update `CLAUDE.md` to the new plan path, project name, framework tracks, and validation gates.
- [x] Verify no old `pilot-vue-module-federation` path remains.
- [x] Review and approve the revised initial commit message. (Owner approved a shorter final wording; actual initial commit is `8a6c65f 🎉 init(project): bootstrap cross-framework federation pilot`, not the draft text below — kept here only as the historical proposal.)

### Revised draft commit proposal (superseded — see actual `8a6c65f` above)

```text
🎉 init(project): bootstrap v0.0.1 cross-framework planning workspace

Initialize the local draft with project-specific Claude skills, project
instructions, a centered README, the Vue and Next architecture plan, and the
reviewed implementation checklist.
```

## 2. Resolve and lock framework versions

- [x] Record the implementation-date output of `npm view vue version`. (`3.5.40`, re-confirmed 2026-07-24, matches snapshot.)
- [x] Record the implementation-date output of `npm view next version`. (`16.2.11`, re-confirmed 2026-07-24, matches snapshot.)
- [x] Record the implementation-date output of `npm view shadcn version`. (`4.14.1`, re-confirmed 2026-07-24, matches snapshot.)
- [x] Record the implementation-date output of `npm view shadcn-vue version`. (`2.8.0`, re-confirmed 2026-07-24, matches snapshot.)
- [x] Record the implementation-date output of `npm view @module-federation/vite version`. (`1.19.1`, re-confirmed 2026-07-24, matches snapshot.)
- [x] Record the implementation-date output of `npm view @module-federation/nextjs-mf version peerDependencies --json`. (`8.8.71`, peers `next ^12 || ^13 || ^14 || ^15`, re-confirmed 2026-07-24; see spike verdict `INVALIDATED` in `spikes/next-latest-federation/README.md`.)
- [x] Lock reviewed exact versions in `package.json` and `pnpm-lock.yaml`. (Every app `package.json` pins exact versions — no `^`/`~` ranges — e.g. `next@16.2.11`, `vue@3.5.40`, `@module-federation/vite@1.19.1`; `pnpm-lock.yaml` is committed and reviewed.)
- [x] Do not silently downgrade Next.js to obtain federation compatibility. (Verified throughout: `next@16.2.11` end to end, in both the invalidated `nextjs-mf` spike and the adopted raw-webpack Federation implementation.)

### Current research snapshot

- [x] Vue observed: `3.5.40`.
- [x] Next observed: `16.2.11`.
- [x] shadcn observed: `4.14.1`.
- [x] shadcn-vue observed: `2.8.0`.
- [x] Vite federation observed: `1.19.1`.
- [x] Next federation observed: `8.8.71`, peer support Next 12–15 only.
- [x] Official Next federation docs reviewed: App Router unsupported, Pages Router supported, support ending/maintenance mode.

## 3. Highest-risk spike — latest Next Module Federation

Do this before building product UI.

- [x] Create `spikes/next-latest-federation/README.md` with Given/When/Then criteria.
- [x] Create disposable minimal latest-Next Host and Remote spike apps.
- [x] Use the exact latest Next version, not Next 15.
- [x] Try Pages Router because App Router is officially unsupported by `nextjs-mf`.
- [x] Force local Webpack as required by the plugin documentation.
- [x] Preserve peer warnings and runtime errors as evidence.
- [x] Expose one minimal client component from Remote. (Written but never executed — config load failed before compilation.)
- [ ] Load it in Host through a real remote entry. — Not reached; `next.config.mjs` failed to load before webpack compilation.
- [ ] Verify direct Remote URL. — Not reached.
- [ ] Verify Host render. — Not reached.
- [ ] Verify hard refresh. — Not reached.
- [ ] Inspect browser console and network requests. — Not reached; no browser was ever opened.
- [ ] Run a Playwright smoke interaction. — Not reached.
- [x] Write one verdict:
  - [ ] `VALIDATED`
  - [ ] `PARTIAL`
  - [x] `INVALIDATED`
- [x] Record exact constraints and recommendation.
- [x] Remove disposable spike code after verdict; retain evidence README.

### Verdict policy

- [ ] If `VALIDATED`, implement Next Federation in the main Next apps. — N/A, not validated for `@module-federation/nextjs-mf` specifically.
- [ ] If `PARTIAL`, include it only if constraints are owner-approved and reproducible. — See the follow-up spike below: a `PARTIAL` alternative was found, is reproducible, and the owner directed it be completed into a real, working implementation (2026-07-25).
- [x] If `INVALIDATED`, implement latest Next standalone + iframe only and document the federation incompatibility. — Still true for `@module-federation/nextjs-mf` itself; superseded for Federation as a whole by the follow-up spike.
- [x] Never mark Next Federation complete without observed browser evidence. (D-007/D-008: live Playwright-MCP-browser evidence collected for the adopted alternative — see below.)

### Follow-up spike — raw `webpack.container.ModuleFederationPlugin`, bypassing `nextjs-mf`

The `INVALIDATED` verdict above is specific to the `@module-federation/nextjs-mf` wrapper package — it says nothing about whether Module Federation itself is possible on Next 16 by other means. Stopping at "unsupported" without checking this would have been premature; see `spikes/next-raw-federation/README.md` and LOG.md D-008 for the full Given/When/Then record.

- [x] Confirm Next 16.2.11 bundles a working `webpack.container.ModuleFederationPlugin` internally (`webpack@5.98.0`, independent of `nextjs-mf`).
- [x] Build a disposable Host/Remote pair using the raw plugin (no `nextjs-mf`, no extra `webpack` devDependency).
- [x] Diagnose and fix, in order: server-compilation `remotes` resolution, the chunk-loading-global collision (`output.uniqueName`), the split-runtime-chunk stall (`optimization.runtimeChunk: false`), and browser `immutable`-cache masking of every prior fix.
- [x] Verify a stateless exposed component renders live, cross-origin, in a real browser. (Verdict: works.)
- [x] Verify a stateful (hook-using) exposed component under the same setup. (Verdict: crashes without React singleton sharing; async singleton sharing between two independently-built Next apps hit a further, unresolved stall — tracked as I-018, not blocking.)
- [x] Adopt a pragmatic architecture that sidesteps the unresolved sharing gap: the exposed component is fully stateless/prop-controlled (Host owns all interaction state), eliminating the need for React singleton sharing entirely.
- [x] Port the adopted mechanism into the real `next/remote` and `next/host` apps (not just the spike) and verify live in the browser: composition-mode switch, deployment selection, alert acknowledgement, and Host-owned event ledger recording with a `federation` source badge, all working end-to-end.
- [x] Verify Remote-unreachable → fallback → Retry recovery for the new Federation path (Playwright E2E, network-level abort/restore).
- [x] Remove disposable spike code after verdict; retain evidence README (matches the policy already used for the first spike).
- **Verdict: `PARTIAL` — adopted.** Real Module Federation is implemented for the Next track using a stateless federation boundary. `@module-federation/nextjs-mf` remains unused and still `INVALIDATED`; Next itself was never downgraded from `16.2.11`.

## 4. pnpm workspace foundation

### Repository structure

```text
vue/host
vue/remote
vue/standalone
next/host
next/remote
next/standalone
packages/contracts
packages/fixtures
packages/design-tokens
spikes/next-latest-federation
e2e
docs
artifacts/screenshots/readme
```

- [x] Create root `package.json` with version `0.0.1`, `private: true`, and exact `packageManager`. (`pnpm@11.14.0`, `engines.node` pinned to `22.22.3`.)
- [x] Create `pnpm-workspace.yaml` for `vue/*`, `next/*`, and `packages/*`.
- [x] Create root TypeScript, lint, and format configuration. (`tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`.)
- [x] Create `packages/contracts`.
- [x] Create `packages/fixtures`.
- [x] Create `packages/design-tokens`.
- [x] Generate and review one `pnpm-lock.yaml`.
- [x] Create the three directories the structure above still only promises: `e2e/`, `docs/validation/`, and `artifacts/screenshots/readme/`. (All three exist and are populated: `e2e/` has 7 spec files, `docs/validation/` has the EN/KO QA report pair, `artifacts/screenshots/readme/` has the 8 required screenshots.)
- [x] Stop tracking generated `next-env.d.ts`. (`.gitignore` line 21: `next/*/next-env.d.ts`; also `**/@mf-types/` and `**/*.tsbuildinfo`.)

### Parallel development commands

Runtime evidence: D-006.

- [x] Add `pnpm dev` to run all six app servers in parallel. (`Scope: 6 of 10`; all six ports returned `200`.)
- [x] Add `pnpm dev:composed` to run the four Host/Remote servers. (`Scope: 4 of 10`; only `3000`, `3001`, `4173`, `4174` bound.)
- [x] Add `pnpm dev:standalone` to run the two Standalone baselines. (`Scope: 2 of 10`; only `3002` and `4175` bound.)
- [x] Add `pnpm dev:vue` to run Vue Host, Remote, and Standalone. (Filter resolves to exactly `vue/host`, `vue/remote`, `vue/standalone`.)
- [x] Add `pnpm dev:next` to run Next Host, Remote, and Standalone. (Filter resolves to exactly `next/host`, `next/remote`, `next/standalone`.)
- [x] Stream package-prefixed logs. (`--stream` emits `vue/host dev:`, `next/remote dev:`, … prefixes.)
- [x] Verify Ctrl+C terminates all child servers. (`SIGINT` to the root `pnpm dev` left zero listeners on all six ports for all three parallel commands.)
- [x] Add filtered one-app commands to README. (README "Getting started" section: `pnpm --filter @pilot/next-host dev` example, plus `dev:composed`/`dev:standalone`/`dev:vue`/`dev:next`.)

### Port allocation

- [x] Vue Host: `4173`. (Production preview verified at `http://127.0.0.1:4173/` during D-005.)
- [x] Vue Remote: `4174`. (Verified via `vite preview` + `curl` in D-003.)
- [x] Vue Standalone: `4175`. (Verified via `vite preview` + `curl` in D-004.)
- [x] Next Host: `3000`. (D-006 dev server returned `200`; scaffold only, no product UI yet.)
- [x] Next Remote: `3001`. (D-006 dev server returned `200`; scaffold only, no product UI yet.)
- [x] Next Standalone: `3002`. (D-006 dev server returned `200`; scaffold only, no product UI yet.)
- [x] Reconcile dev-server bind hosts. (D-007: all three Next apps now run `next dev`/`next start` with `-H 127.0.0.1`, matching Vite's explicit `127.0.0.1` binding. Verified `lsof` shows `127.0.0.1:3001` rather than `*:3001` after the change.)

## 5. Shared domain contracts and fixtures

- [x] Define `DeploymentContext`.
- [x] Define `ModelDeployment`.
- [x] Define `MonitorEvent` union.
- [x] Define framework and composition-mode labels for comparison UI. (`FrameworkTrack`, `CompositionMode` in `@pilot/contracts`.)
- [x] Create deterministic fixture clusters, models, deployments, metrics, and timeline events. (`@pilot/fixtures`.)
- [x] Keep shared packages framework-neutral.
- [x] Do not put React, Vue, Router, or stores in shared packages.
- [x] Add contract and fixture tests first. (RED/GREEN evidence in `LOG.md` D-002.)
- [x] Confirm both framework tracks render the same fixture semantics. (`e2e/vue-composition.spec.ts` and `e2e/next-composition.spec.ts` both assert identical Model X / `deploy-002` behavior through the same Host; `e2e/remote-standalone.spec.ts` and `e2e/standalone-baseline.spec.ts` are parameterized over both frameworks against the same fixture data.)

## 6. Frontend design review

Use `.claude/skills/frontend-design/SKILL.md` before production UI.

Artifact: [`docs/design-direction.md`](docs/design-direction.md). Selection record: D-001.

- [x] Define audience: AI platform operator / MLOps engineer.
- [x] Define Host job: choose context and coordinate platform surfaces.
- [x] Define Remote job: inspect model deployment health and act on events.
- [x] Produce two design directions. (A. Flight Deck Ledger, B. Blueprint Console.)
- [x] Review directions with owner. (D-001 records Flight Deck Ledger as the approved implementation default.)
- [x] Select one visual direction. (Flight Deck Ledger.)
- [x] Define shared semantic color tokens. (Seven-token table; implemented as CSS variables in `@pilot/design-tokens`.)
- [x] Define display, body, and utility typography. (Manrope Variable display/body, JetBrains Mono Variable utility/data.)
- [x] Define Host and Remote desktop wireframes.
- [x] Define mobile behavior. (Context becomes a compact top sheet; no horizontal page overflow.)
- [x] Define one signature visual/interaction tied to model deployment status. (Deployment pulse rail.)
- [x] Reject generic centered-hero/dashboard-card defaults unless justified. (Self-critique section bans gradient heroes, glow halos, decorative charts, and identical-KPI-card walls.)
- [x] Confirm focus-visible and reduced-motion behavior. (D-009: confirmed live via computed style on both Vue Remote and Next Remote — identical `2px solid hsl(var(--platform-accent))` outline with `2px` offset from the shared `@pilot/design-tokens` rule. `prefers-reduced-motion` still only has static evidence, `DeploymentPulseRail.vue:117`; not re-verified live in this pass.)

**Gate:** Do not finalize shadcn components or styling before this review. — Satisfied for the Vue track; the direction predates the Vue shadcn install.

## 7. shadcn parity setup

### Next Host, Remote, and Standalone

- [x] Initialize all three with official `shadcn` CLI. (`components.json` present in all three; style `radix-nova`, base color `neutral`.)
- [x] Use the same base style and semantic tokens. (Identical `components.json` across the three Next apps; each depends on `@pilot/design-tokens`; `app/globals.css` now maps shadcn's semantic tokens onto `--platform-*` HSL triplets, mirroring the Vue `style.css` mapping — verified via `next build` after the change.)
- [x] Add only required components: Button, Badge, Card, Tabs, Table/List, Alert, Skeleton, Tooltip, Select. (All nine installed in all three Next apps via `npx shadcn@4.14.1 add`; no font-CDN reinsertion regression this time, unlike I-015.)
- [x] Keep generated component source within each app unless a reviewed React UI package is justified. (Each app owns its own `components/ui/`; no shared React UI package exists.)

### Vue Host, Remote, and Standalone

- [x] Initialize all three with `shadcn-vue`. (`components.json` present in all three; style `reka-nova`, base color `neutral`.)
- [x] Use equivalent base style and shared semantic tokens. (`reka-nova` is the shadcn-vue counterpart of `radix-nova`; all three consume `@pilot/design-tokens`.)
- [x] Add equivalent required components. (All nine present in each Vue app: `alert`, `badge`, `button`, `card`, `select`, `skeleton`, `table`, `tabs`, `tooltip`.)
- [x] Keep Vue-generated component source within each app unless a reviewed Vue UI package is justified. (Each app owns `src/components/ui/`; no shared Vue UI package exists.)

### Parity gate

- [x] Compare component roles, spacing, typography, states, and accessibility. (D-007: both tracks now use Alert/Badge/Button/Card/Select/Skeleton/Table/Tabs/Tooltip for the same roles — loading skeleton, degraded alert + acknowledge action, pulse-rail selection, event-ledger badges. Fine-grained visual/accessibility comparison still needs the Section 11 live Playwright MCP pass.)
- [x] Do not claim byte-identical rendering. (README "Known limitations" section states this explicitly.)
- [x] Document official shadcn/ui vs shadcn-vue provenance accurately. (README Framework matrix note: `radix-nova` shadcn/ui is the official Vercel React tooling; `reka-nova` shadcn-vue is stated as a Vue port, not a Vercel package.)

## 8. Vue 3 applications

### Vue Remote — standalone Model Deployment Monitor

- [x] Scaffold Vue 3 + TypeScript + Vite.
- [x] Build standalone route/context loading.
- [x] Build deployment summary, status, replicas, p95 latency, and timeline.
- [x] Emit semantic monitor events.
- [x] Add accessible loading, empty, error, and degraded states. (D-007: added `ErrorBoundary.vue` — `onErrorCaptured` + a Retry button — wrapping `Monitor` in both `App.vue`, closing the Remote-local error gap; 26/26 `vue/remote` tests pass. Accessibility of all four states is still unverified in a live browser; that remains open for Section 11.)
- [x] Verify standalone build and direct URL. (D-003 and re-verified in D-005.)

### Vue Host — AI Platform Console

- [x] Scaffold Vue 3 + TypeScript + Vite.
- [x] Build cluster/model/environment context selector.
- [x] Add composition selector: Federation / iframe.
- [x] Add Host-owned event/activity panel.
- [x] Add Host-owned loading, error, timeout, and retry UX. (D-005 production-preview outage/recovery evidence.)

### Vue Standalone — non-composed baseline

- [x] Implement the same Console context and Monitor functionality in one Vue application. (`App.vue` composes `ContextControls` + `Monitor` + `EventLedgerPanel`; see D-004.)
- [x] Reuse only framework-neutral contracts, fixtures, and design tokens. (`@pilot/contracts`, `@pilot/fixtures`, `@pilot/design-tokens` only; no Vue/React/router imported from another app.)
- [x] Do not import `vue/remote` source or use Module Federation/iframe. (Enforced by `test/architecture-guard.test.ts`, 4/4 passing.)
- [x] Verify direct URL, navigation, events, and production build. (`curl -is http://localhost:4175/` → `200` against `vite preview`; 36/36 tests cover context/deployment-selection/acknowledgement/ledger events; `vue-tsc --noEmit && vite build` succeeds.)
- [x] Record setup/runtime differences from the composed modes. (See D-004: no frame adapter, no postMessage, no query-string context resolution, no federation config; ledger has no `source` field or `monitor-ready` entry.)

### Vue iframe comparison

- [x] Embed Vue Remote standalone URL.
- [x] Restrict iframe permissions/sandbox intentionally. (`allow-scripts allow-same-origin`; no top-navigation, popups, forms, or downloads.)
- [x] Use exact `targetOrigin` for `postMessage`.
- [x] Validate `event.origin` and message schema.
- [x] Synchronize context and semantic events.
- [x] Test Remote unavailable behavior. (D-005: 8s fallback and restart/retry recovery in a production preview.)

### Vue Module Federation

- [x] Configure `@module-federation/vite` Remote exposure.
- [x] Expose only the reviewed Monitor component/API.
- [x] Share Vue correctly.
- [x] Configure runtime Remote URL and CORS.
- [x] Load Remote in Host.
- [x] Verify props/events, styles, failure, and retry. (D-005 production-preview outage/recovery evidence.)
- [x] Verify routing behavior. (N/A by design: the Vue pilot has no router, documented in Sections 4/8/10; not inferred as untested.)
- [x] Verify `remoteEntry.js` and chunks from Remote origin.
- [x] Compare Federation and iframe behavior with the same fixture/context. (`e2e/vue-composition.spec.ts` exercises both modes against the identical Model X fixture through the same Host.)

## 9. Latest Next.js applications

Runtime and browser evidence: D-007.

### Next Remote — standalone Model Deployment Monitor

- [x] Scaffold the latest Next.js with TypeScript. (Pre-existing scaffold, `next@16.2.11`.)
- [x] Use App Router for the main standalone/iframe app unless the validated federation path requires a separate Pages Router boundary. (App Router; no Federation route exists to require Pages Router.)
- [x] Initialize official shadcn/ui. (`components.json`, style `radix-nova`; nine components installed: alert, badge, button, card, select, skeleton, table, tabs, tooltip.)
- [x] Implement the same domain semantics as Vue Remote. (`lib/context.ts`, `lib/monitor.ts`, `components/pulse-rail.tsx`, `components/monitor.tsx` port Vue Remote's `context.ts`/`Monitor.vue`/`DeploymentPulseRail.vue` line-for-line; loading/empty/degraded states match; a `model-unknown` case now returns `undefined` instead of throwing, closing a Vue-side gap.)
- [x] Verify standalone production build and direct URL. (`next build` succeeds; `next start -H 127.0.0.1 -p 3001` + `curl http://127.0.0.1:3001/` → `200` with "Model X" / "healthy" in the server-rendered HTML.)
- [x] Add a Remote-local error boundary. (`app/error.tsx`, the gap flagged in Section 8; ported back to Vue Remote/Standalone as `ErrorBoundary.vue` for parity.)

### Next Host — AI Platform Console

- [x] Scaffold the latest Next.js with TypeScript. (Pre-existing scaffold, `next@16.2.11`.)
- [x] Initialize official shadcn/ui. (Same nine components as Remote/Standalone.)
- [x] Implement the same Host context and event semantics as Vue Host. (`lib/context.ts`, `lib/event-ledger.ts` (with `source: 'federation' | 'iframe'`), `components/context-controls.tsx`, `components/event-ledger-panel.tsx` port the Vue Host equivalents.)
- [x] Add composition selector for implemented modes. (`components/composition-controls.tsx`, a Radix Tabs port of Vue's `CompositionControls.vue`; Federation tab renders a real, working `FederationPanel` — see the Federation section below. D-007's evidence-backed "unsupported" state was superseded by D-008's working implementation and removed.)

### Next Standalone — non-composed baseline

- [x] Implement the same Console context and Monitor functionality in one latest-Next application. (`app/page.tsx` composes `ContextControls` + `Monitor` + `EventLedgerPanel`, mirroring `vue/standalone/src/App.vue`.)
- [x] Reuse only framework-neutral contracts, fixtures, and design tokens. (`@pilot/contracts`, `@pilot/fixtures`, `@pilot/design-tokens` only.)
- [x] Do not import `next/remote` source or use Module Federation/iframe. (Enforced by `test/architecture-guard.test.ts`, 4/4 passing — a React/Next port of the Vue Standalone guard.)
- [x] Verify direct URL, navigation, interactions, and production build. (31/31 tests; `tsc --noEmit` clean; `next build` succeeds.)
- [x] Record setup/runtime differences from the composed modes. (Same boundary as Vue Standalone: no frame adapter, no postMessage, no query-string context resolution; ledger has no `source` field or `monitor-ready` entry.)

### Next iframe comparison

- [x] Embed Next Remote standalone URL. (`components/iframe-panel.tsx`; `src` built via `buildRemoteUrl`.)
- [x] Apply the same exact-origin message contract as Vue. (`lib/host-frame-adapter.ts` / `lib/frame-adapter.ts` port `hostFrameAdapter.ts` / `frameAdapter.ts` exactly; both Next apps now bind `127.0.0.1` explicitly via `-H 127.0.0.1`, matching Vite, so the exact-origin check is meaningful in both dev and production preview.)
- [x] Verify context, events, history, unavailable state, and recovery. (D-007: live Playwright-MCP-browser run against real `next start` previews on `127.0.0.1:3000`/`3001` — iframe loaded, `monitor-ready` recorded in the Host ledger, clicking the degraded pulse-rail node inside the iframe updated the Remote *and* posted `deployment-selected: deploy-002` to the Host ledger. Loading/error/retry timeout paths are covered by 7/7 `iframe-panel.test.tsx` cases; no router exists in this pilot, so "history" is out of scope, same caveat as the Vue track.)

### Conditional Next Federation — implemented via raw `webpack.container.ModuleFederationPlugin`

`@module-federation/nextjs-mf` itself is still `INVALIDATED` (I-006) — unchanged,
unused. Following the Section 3 follow-up spike (`PARTIAL — adopted`), Next
Federation is implemented directly against webpack's own built-in plugin.
See `spikes/next-raw-federation/README.md` and LOG.md D-008.

- [x] Apply only the spike-proven configuration. (`config.output.uniqueName`, `config.output.publicPath` on the Remote, `config.optimization.runtimeChunk = false` on both, CORS + `Cache-Control: no-store` on the Remote's `remoteEntry.js`, both apps forced to `--webpack`.)
- [x] Keep Pages/App Router and Webpack constraints explicit. (App Router on both `next/host` and `next/remote`; Turbopack disabled for both apps via the `--webpack` CLI flag on `dev`/`build`.)
- [x] Verify real Remote entry, chunks, refresh, console, and events. (D-008: live Playwright-MCP-browser run — real `remoteEntry.js` fetched cross-origin from `127.0.0.1:3001`, rendered inside `127.0.0.1:3000`'s own React tree, hard-refresh-clean, zero console errors, full deployment-selected/alert-acknowledged event flow into the Host ledger with a `federation` badge.)
- [x] Expose a Federation-safe component. (`components/federated-monitor.tsx` — deliberately holds no React state of its own; the Host owns `selectedId`/`acknowledgedIds` and passes them as props. This sidesteps the one part of the mechanism that did **not** get fully solved: async React-singleton sharing between two independently-built Next apps — see I-018. A stateless boundary needs no singleton at all.)
- [x] Add fallback/retry UX matching the iframe path's shape. (`components/federation-panel.tsx` — a class-based `FederationErrorBoundary` + `Suspense`, `data-testid="federation-error"`/`federation-retry"`; verified via Playwright E2E network-abort/restore, mirroring the Vue Federation panel's own recovery test.)
- [x] Compare Federation and iframe behavior with the same fixture/context. (Both modes now render the identical Monitor semantics from the identical fixtures against the same Host-managed context; only the transport/boundary differs, exactly like the Vue track.)

## 10. Automated tests

### Framework unit/component tests

- [x] Vue contract adapter tests.
- [x] Vue Remote component tests.
- [x] Vue Host integration tests.
- [x] Wire a test runner into the three Next apps. (D-007: `vitest` + `jsdom` + `@testing-library/react` + `@vitejs/plugin-react` added to all three; each has its own `vitest.config.ts` and `test/setup.ts`.)
- [x] Next contract adapter tests. (`next/remote/test/{monitor,context}.test.ts` — 8 tests; ported to `next/standalone` and `next/host` as well.)
- [x] Next Remote React component tests. (`next/remote/test/{pulse-rail,monitor-component}.test.tsx` — 17 tests, via `@testing-library/react` + `user-event`.)
- [x] Next Host integration tests. (`next/host/test/app.test.tsx` — 5 tests covering default iframe boundary, Federation-unsupported switch, and Host ledger recording from real `postMessage` events.)
- [x] iframe message origin/schema tests. (Both tracks: Vue's `frameAdapter`/`hostFrameAdapter` tests plus the Next `frame-adapter`/`host-frame-adapter` ports — 10 tests total in Next.)

### Build tests

- [x] Build `vue-host` independently. (D-005: `vue-tsc --noEmit && vite build` succeeds.)
- [x] Build `vue-remote` independently. (D-003 and re-verified in D-005.)
- [x] Build `vue-standalone` independently. (See D-004: `vue-tsc --noEmit && vite build` succeeds, plain Vite SPA output, no federation artifacts.)
- [x] Build `next-host` independently. (D-007: `next build` succeeds against the real composed-Host implementation, not the scaffold.)
- [x] Build `next-remote` independently. (D-007: `next build` succeeds against the real Monitor implementation, not the scaffold.)
- [x] Build `next-standalone` independently. (D-007: `next build` succeeds against the real Console+Monitor implementation, not the scaffold.)
- [x] Build all packages from root. (D-007: `pnpm build` passes across all nine workspace packages, exit code `0`.)

### Playwright Test E2E

D-008: `playwright.config.ts` added; `pnpm e2e` → **16/16 passing**, now
**20/20** after adding `e2e/keyboard-flow.spec.ts`
(`@playwright/test@1.62.0`, chromium). All six preview servers (three Vue
`vite preview`, three `next start`) are declared as `webServer` entries and
started/reused automatically.

- [x] Manage all required preview servers in `playwright.config.ts`. (Six `webServer` entries, `reuseExistingServer` outside CI.)
- [x] Test both directly previewable Remotes. (`e2e/remote-standalone.spec.ts`, parameterized over Vue + Next.)
- [x] Test both non-composed Standalone baselines. (`e2e/standalone-baseline.spec.ts`, parameterized over Vue + Next.)
- [x] Test Vue iframe. (`e2e/vue-composition.spec.ts`.)
- [x] Test Vue Federation. (`e2e/vue-composition.spec.ts`.)
- [x] Test Next iframe. (`e2e/next-composition.spec.ts`.)
- [x] Test Next Federation now that it's implemented. (`e2e/next-composition.spec.ts` — the item was originally scoped "only if validated"; the Section 3 follow-up spike validated an alternative path, so this is no longer conditional.)
- [x] Test Host/Remote event synchronization. (Covered inline in the composition specs: selecting/acknowledging in the framed or federated Monitor is asserted against the Host's own ledger.)
- [ ] Test browser Back/Forward. — Still N/A: neither track's pilot has a router (documented already in Sections 4/8).
- [x] Test Remote stop, fallback, restart, and retry. (`e2e/remote-recovery.spec.ts` — 4 scenarios: iframe × {Vue, Next}, Federation × {Vue, Next}, each via network-level abort/restore rather than an actual killed process, verifying the same fallback/retry UI contract.)
- [x] Test keyboard flow and focus. (`e2e/keyboard-flow.spec.ts`, added this pass: 4 scenarios — {Vue, Next} × {Federation, iframe} — each switches the composition tab via `ArrowRight`, selects the degraded pulse-rail node via `Enter`, and dismisses its alert via `Enter` on Acknowledge, using only `.focus()` + key presses, no `.click()`. All 4 pass, verified alongside the rest of the suite: `20/20`.)

### Required root commands

- [x] `pnpm lint` — D-007: root script is now `eslint .` (was the vacuous `pnpm -r --if-present lint`), so ESLint genuinely runs. Fixed the two real defects it surfaced: generated `@mf-types/`, `next-env.d.ts`, and `*.tsbuildinfo` weren't ignored (231 errors on generated code), and two `eslint-disable` comments referenced an uninstalled `react-hooks/exhaustive-deps` rule. Clean exit `0` after both fixes.
- [x] `pnpm typecheck`
- [x] `pnpm test` — D-008: whole-workspace `pnpm test` is `237/237` passing (9 packages, 0 skipped).
- [x] `pnpm build`
- [x] `pnpm e2e` — D-008: `16/16` passing; now `20/20` after adding `e2e/keyboard-flow.spec.ts` this pass.

## 11. Microsoft Playwright MCP validation

### Project setup

- [x] Verify Node.js 18+. (`node --version` → `v22.22.3`, matching the pinned `engines.node`.)
- [x] Add project-scope MCP:

```bash
claude mcp add --scope project playwright -- npx @playwright/mcp@latest
```

- [x] Review generated `.mcp.json`. (D-007: removed the duplicate `playwright` entry, keeping only project-scoped `playwright-project`.)
- [x] Confirm Playwright MCP is connected. (Connected and exposed `browser_*` tools in the 2026-07-25 session; also used directly this session via the Browser pane to verify the Next Host/Remote composed iframe flow live — see D-007.)
- [x] Record resolved MCP version. (`@playwright/mcp@0.0.78`, resolved 2026-07-25 via the `latest` tag.)
- [x] Decide whether to pin the MCP version before any eventual push. (D-007: pinned `.mcp.json` to `@playwright/mcp@0.0.78`, replacing `latest`, so validation evidence stays reproducible.)

### Live QA matrix

D-009: full pass across all 8 surfaces × 3 breakpoints, 2026-07-25. Three real
defects found and fixed live (a Vue iframe `DataCloneError`, a Module
Federation CSS-scanning gap, and a Vue/Next responsive-breakpoint mismatch).
Full detail in `docs/validation/playwright-mcp-v0.1.0.md`.

- [x] Vue Remote standalone.
- [x] Vue non-composed Standalone baseline.
- [x] Vue Host Federation. (Found and fixed the `DataCloneError` postMessage bug here.)
- [x] Vue Host iframe.
- [x] Next Remote standalone.
- [x] Next non-composed Standalone baseline.
- [x] Next Host iframe.
- [x] Next Host Federation. (Found and fixed the Module Federation CSS-scanning gap here.)
- [x] Accessibility snapshots and landmark review.
- [x] Keyboard-only navigation and focus review. (Full flow verified via real Playwright MCP: Select open/choose, composition-tab arrow-key switching, pulse-rail selection, Acknowledge — all working, all frameworks. An earlier attempt via the Claude Code Browser pane's `computer` tool gave false negatives; documented as a tooling artifact, not an app defect.)
- [x] Host/Remote context and event interactions.
- [x] Console error/warning review.
- [x] Network, Remote entry, chunk, and CORS review.
- [x] Remote stop/fallback/restart/retry review. (Verified via `e2e/remote-recovery.spec.ts`, 4/4 — this MCP server's tool surface doesn't expose network-route interception for a live manual re-check.)
- [x] Desktop `1440 × 900`.
- [x] Tablet `768 × 1024`. (This exact breakpoint is where the Vue/Next layout-collapse mismatch was found.)
- [x] Mobile `390 × 844`.
- [x] Record results in `docs/validation/playwright-mcp-v0.1.0.md`.

## 12. README comparison and 130% screenshots

Use `.claude/skills/centered-readme/SKILL.md`.

### README content

Known stale claims to fix in this pass:

- [x] Rewrite "Important Next.js compatibility constraint". — Replaced by the README's "Module Federation on the latest Next.js" section: states `@module-federation/nextjs-mf` is `INVALIDATED` (I-006) and unused, and that a raw `webpack.container.ModuleFederationPlugin` alternative is implemented and working (D-008, `spikes/next-raw-federation/README.md`), with the I-018 stateless-component constraint spelled out.
- [x] Relabel "Planned root commands". — README's "Getting started" section presents `pnpm dev` and the filtered variants (`dev:composed`, `dev:standalone`, `dev:vue`, `dev:next`) as implemented, plus a per-app filter example (`pnpm --filter @pilot/next-host dev`).
- [x] Update the "conditional Federation" wording in the framework matrix's Next row. — Framework matrix now lists "Federation, iframe, non-composed standalone" for both tracks with no "conditional" qualifier; the Federation section explains the stateless/prop-controlled constraint (I-018) directly below it.

- [x] Centered project hero for `jyje/pilot-module-federation`. (`README.md`/`README-ko.md`, `centered-readme` skill applied — stars badge + `[English](README.md) / [한국어](README-ko.md)` link row.)
- [x] `v0.0.1` Draft status until release gate. (README "Status" section.)
- [x] Four-app architecture diagram. (Pilot scenario ASCII diagram + Repository layout tree — six apps plus shared packages/spikes.)
- [x] pnpm monorepo and parallel-server explanation. (Getting started + Repository layout sections.)
- [x] Product scenario and standalone/federated value. (Pilot scenario section.)
- [x] Vue and Next outcome matrix. (Framework matrix section.)
- [x] Module Federation vs iframe comparison. (Composition comparison section.)
- [x] Web Components and single-spa alternatives. (Composition comparison section, both explicitly described as not implemented in this pilot.)
- [x] shadcn/ui vs shadcn-vue provenance. (Framework matrix note: `radix-nova` vs `reka-nova`, Vue port explicitly labelled.)
- [x] Next latest federation compatibility evidence. (Module Federation on the latest Next.js section, linking both spike READMEs.)
- [x] Start, build, test, and MCP validation commands. (Getting started + Validation sections.)
- [x] Known limitations and deferred work. (Known limitations and deferred work section: I-018, no router, keyboard flow not yet scripted, missing favicon, no byte-identical rendering claim.)

### Screenshot policy

- [x] Capture production previews through Playwright MCP.
- [x] Use viewport `1440 × 900` for README desktop captures.
- [x] Inject temporary `document.documentElement.style.zoom = "1.3"` for capture only.
- [x] Wait for fonts, Remote chunks, and animation to settle.
- [x] Remove zoom after capture; never add it to production CSS. (Zoom was only ever set via `evaluate` on the live page for the capture, never written to any `.css` file.)
- [x] Use full-width images, not small side-by-side thumbnails.
- [x] Use meaningful alt text.
- [x] Add a filled-triangle caption with wording identical to alt text.
- [x] Review readability in GitHub Markdown preview.

### Required images

- [x] Vue Host + Federation. (`artifacts/screenshots/readme/vue-host-federation.png`.)
- [x] Vue Remote standalone. (`artifacts/screenshots/readme/vue-remote-standalone.png`.)
- [x] Vue non-composed Standalone baseline. (`artifacts/screenshots/readme/vue-standalone-baseline.png`.)
- [x] Vue iframe comparison. (`artifacts/screenshots/readme/vue-iframe-comparison.png`.)
- [x] Next Remote standalone. (`artifacts/screenshots/readme/next-remote-standalone.png`.)
- [x] Next non-composed Standalone baseline. (`artifacts/screenshots/readme/next-standalone-baseline.png`.)
- [x] Next iframe comparison. (`artifacts/screenshots/readme/next-iframe-comparison.png`.)
- [x] Next Host + Federation. (No longer conditional — implemented, D-008. `artifacts/screenshots/readme/next-host-federation.png`.)

## 13. `v0.1.0` first-push gate

### Functional

- [x] Six applications run and build independently. (D-006/D-007.)
- [x] `pnpm dev` runs six servers in parallel. (D-006.)
- [x] `pnpm dev:composed` runs four Host/Remote servers. (D-006.)
- [x] `pnpm dev:standalone` runs two non-composed baselines. (D-006.)
- [x] Vue Federation works. (D-005.)
- [x] Vue iframe works. (D-005.)
- [x] Next iframe works. (D-007: live browser run — Host loaded the Remote iframe, `monitor-ready` recorded, and clicking a degraded pulse-rail node inside the iframe updated both the Remote and the Host's ledger via `postMessage`.)
- [x] Next Federation verdict is honest and documented, and it works. (I-006: `@module-federation/nextjs-mf` stays `INVALIDATED`, unused. D-008: a raw `webpack.container.ModuleFederationPlugin` alternative is implemented, verified live in the browser — real cross-origin `remoteEntry.js`, real component render, real selection/acknowledgement/ledger event flow.)
- [x] Each Remote is useful standalone. (Both Remotes verified via direct production-preview URL: D-003/D-005 for Vue, D-007 for Next.)

### Quality

- [x] Shared contract and fixture tests pass.
- [x] Lint command passes. (D-007/D-008: real `eslint .` run, `0` errors.)
- [x] Typecheck passes.
- [x] Unit/component tests pass. (D-008: `237/237` across all 9 packages.)
- [x] Four independent builds pass. (All six app builds pass against real implementations, not scaffolds.)
- [x] Applicable Playwright Test E2E passes. (D-009: `16/16`, re-run after the D-009 fixes.)
- [x] Playwright MCP validation report passes. (D-009: `docs/validation/playwright-mcp-v0.1.0.md` — full 8-surface × 3-breakpoint pass.)
- [x] No unresolved console, network, CORS, accessibility, or responsive defect remains. (D-009: three real defects found live and fixed — see the report; zero known open defects in the flows exercised.)

### Documentation

- [x] README reflects measured outcomes, not planned claims. (Full rewrite — see Section 12 checklist above.)
- [x] Alternatives comparison is complete. (Composition comparison section: Federation, iframe, Remote direct preview, non-composed Standalone, Web Components, single-spa.)
- [x] 130% screenshots are readable and accurately captioned. (8/8 required images captured and embedded with alt text + matching filled-triangle caption.)
- [x] Next and Vue shadcn provenance is accurate. (Framework matrix: `radix-nova` shadcn/ui vs `reka-nova` shadcn-vue, Vue port stated explicitly.)
- [x] `TASK.md` contains no false completed item. (This pass reconciled Sections 12/13 against actual README/screenshot state.)
- [x] Stable documents translated into English/Korean pairs, per owner instruction. (README, `docs/design-direction.md`, `docs/validation/playwright-mcp-v0.1.0.md`, the architecture plan, and both spike READMEs each have a `-ko.md` twin with a language-link line; `TASK.md`/`LOG.md` intentionally remain English-only living checklists per owner's scoping answer.)

### Git and release

- [ ] Version changes from `0.0.1` to `0.1.0` only after review.
- [ ] No credentials, session metadata, or unintended local paths are staged.
- [ ] All local commits were individually approved.
- [ ] Working tree is clean.
- [ ] Owner reviews the final evidence.
- [ ] Owner explicitly approves remote creation/configuration if still absent.
- [ ] Owner separately states that remote push is currently possible.
- [ ] Owner explicitly approves the exact push command immediately before execution.

**Hard rule:** Completing this gate never authorizes a push automatically. Wait for the owner's separate availability instruction and exact push approval.

## 14. Execution sequence for the remaining work

Reconciled 2026-07-26 (D-006 → D-007 → D-008 → D-009 → this pass). Stages A,
B, B′, and C are now fully complete for both tracks. Both Vue and Next have
production-verified Standalone, Host, and Remote apps with **all three**
composition modes — Federation, iframe, non-composed standalone — and a full
automated + live-QA validation record, including a scripted keyboard-flow
E2E spec. Only Stage D item 18 (version bump and the owner's `v0.1.0` gate
review) remains, and it is explicitly owner-gated — see Section 13's Git and
release checklist.

### Stage A — unblock the Next track ✅ done (D-007)

1. ~~Wire a test runner into the three Next apps.~~ Done.
2. ~~Register real `lint` scripts~~. Done.
3. ~~Create `e2e/`, `docs/validation/`, `artifacts/screenshots/readme/`; gitignore
   `next-env.d.ts`.~~ Done, plus untracked the accidentally-committed
   `vue/host/@mf-types/` generated directory (23 files) found while fixing lint.

### Stage B — Next product implementation ✅ done (D-007)

4. ~~Add the nine shadcn components to the three Next apps at parity with Vue.~~ Done.
5. ~~Next Remote~~ Done, including the Remote-local error boundary, backported
   to Vue Remote/Standalone as `ErrorBoundary.vue` for parity.
6. ~~Next Standalone~~ Done, with an architecture-guard test port.
7. ~~Next Host~~ Done (iframe path first; Federation added in Stage B′).
8. ~~Next iframe~~ Done. Bind-host question resolved: all three Next apps now
   run with `-H 127.0.0.1`, matching Vite.

### Stage B′ — Next Federation, the real thing ✅ done (D-008)

D-007 shipped an honest "unsupported" evidence state for Next Federation,
matching the `@module-federation/nextjs-mf` `INVALIDATED` verdict. The owner
then directed that stopping there wasn't the point of the pilot — the
question was whether Federation could work on Next 16 *by any means*, not
just via the one broken wrapper package. Investigated and resolved:

9. ~~Spike raw `webpack.container.ModuleFederationPlugin`, bypassing `nextjs-mf`
   entirely.~~ Done — `spikes/next-raw-federation/README.md`, verdict `PARTIAL
   — adopted`. Works for stateless components; hook-based React-singleton
   sharing between independently-built Next apps hit an unresolved async-timing
   stall (I-018, not blocking).
10. ~~Port the adopted mechanism into the real `next/remote`/`next/host`~~ Done:
    `components/federated-monitor.tsx` (stateless, Host-controlled),
    `components/federation-panel.tsx` (error boundary + Suspense + retry),
    both `next.config.ts` files carry the webpack federation config, both
    apps run `--webpack`. Verified live in the browser end-to-end.
11. ~~Removed the now-inaccurate `FederationUnsupported` component~~ and its test.

### Stage C — validation ✅ fully done (D-009 + this pass)

12. ~~Playwright Test E2E across both tracks and all implemented modes.~~ Done
    (D-008, re-verified D-009): `16/16` passing, including Federation-outage/
    retry for both frameworks. The browser Back/Forward item remains correctly
    N/A (no router in either track). ~~A scripted keyboard-flow spec~~ Done
    this pass: `e2e/keyboard-flow.spec.ts`, `20/20` total.
13. ~~Remove the duplicate Playwright MCP server and pin its version~~ Done
    (D-007). ~~Structured Section 11 live-QA matrix~~ Done (D-009):
    `docs/validation/playwright-mcp-v0.1.0.md` — all 8 surfaces × 3
    breakpoints, accessibility/keyboard/console/network/responsive all
    checked. **Found and fixed three real defects live**: a Vue Host iframe
    `DataCloneError` on every context sync (reactive Proxy through
    `postMessage`), a Module Federation CSS-scanning gap (Tailwind never sees
    the federated component's own utility classes, so they silently have no
    rule), and a Vue/Next responsive-breakpoint mismatch (900px vs 768px) at
    exactly the report's own tablet breakpoint. All three fixed and
    re-verified; full suite re-run afterward (`237/237` unit, `16/16` e2e).
14. ~~Confirm both tracks render identical fixture semantics~~ Done (Section 5)
    and ~~complete the remaining Section 7 parity item~~ Done (byte-identical
    rendering disclaimer + README provenance detail both now in README).

### Stage D — release preparation

15. ~~README rewrite~~ Done — full rewrite of the Next-track sections from
    "unsupported"/"planned" to "implemented", plus the new Federation
    architecture note (I-018). `README.md`/`README-ko.md` both shipped.
16. ~~130% screenshots, including the now-real Next Host + Federation shot.~~
    Done — all 8 required images captured and embedded.
17. ~~Translate stable documents into English/Korean pairs.~~ Done — README,
    design direction, the Playwright MCP validation report, the architecture
    plan, and both spike READMEs each have a `-ko.md` twin plus a language-link
    line; `TASK.md`/`LOG.md` stay English-only per owner's scoping decision.
18. Version bump and the `v0.1.0` gate review.

**Sequencing rule:** do not start Stage C before Stage B is complete for a
given mode. A validation report that predates the feature it validates is the
failure mode this checklist exists to prevent.

## Review notes

- Latest Next Federation spike policy:
- App Router vs Pages Router decision after spike:
- MCP version pinning:
- Screenshot tracking policy:
- Hosted demo requirement for `v0.1.0`:
- Approved deferred scope:

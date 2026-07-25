# Implementation Log

Issues, constraints, experiments, and resolutions discovered during implementation are appended here. Entries are never silently removed; resolved items retain their original context and resolution.

## 2026-07-24

### I-001 — Latest Next.js is outside `nextjs-mf` support range

- **Status:** Open — compatibility spike required
- **Observed:** `next@16.2.11`; `@module-federation/nextjs-mf@8.8.71` declares peer support for Next 12–15.
- **Official constraint:** App Router is unsupported; Next integration is in maintenance/deprecation mode.
- **Impact:** Next Federation cannot be claimed until a real browser spike validates it.
- **Policy:** Do not downgrade Next silently. Record `VALIDATED`, `PARTIAL`, or `INVALIDATED` with browser evidence.

### I-002 — Vercel shadcn/ui is React-only

- **Status:** Resolved by explicit framework split
- **Observed:** The official Vercel shadcn/ui component source targets React/Next.
- **Resolution:** Next apps use official `shadcn`; Vue apps use `shadcn-vue`. Shared semantic design tokens preserve visual parity without misrepresenting package provenance.

### I-003 — Codex CLI model cache warning

- **Status:** Non-blocking
- **Observed:** `codex exec` returned `failed to load models cache: missing field supports_reasoning_summaries` before completing successfully.
- **Impact:** Command execution works, but startup is noisy.
- **Resolution:** Use cleanly starting Claude Code for primary implementation; retain Codex as an independent review option.

### D-001 — Selected visual direction

- **Status:** Approved implementation default
- **Options considered:**
  - Flight Deck Ledger — dark operational telemetry with a deployment pulse rail.
  - Blueprint Console — light infrastructure drawing with topology emphasis.
- **Selection:** Flight Deck Ledger.
- **Reason:** Supports rapid deployment-state scanning and remains readable in 130% README captures.
- **Restraint:** The pulse rail is the single signature element. Avoid decorative gradients, excessive glow, generic KPI-card walls, and motion without operational meaning.

### I-004 — Remote push remains externally gated

- **Status:** Policy
- **Resolution:** Do not push based on version readiness. Wait until the owner separately says push is currently possible and approves the exact push command.

### I-005 — `npm install` of `@module-federation/nextjs-mf` on Next 16 fails ERESOLVE without `--legacy-peer-deps`

- **Status:** Resolved as expected evidence (see I-006 for final verdict)
- **Observed:** `npm install` in the disposable spike (`next@16.2.11`,
  `@module-federation/nextjs-mf@8.8.71`) fails with `ERESOLVE could not
  resolve` because the plugin's `peerDependencies` declare
  `next: "^12 || ^13 || ^14 || ^15"`. Required `npm install --legacy-peer-deps`
  to proceed.
- **Impact:** Confirms I-001's predicted incompatibility at the install layer,
  before any build/runtime evidence.
- **Resolution:** Proceeded with `--legacy-peer-deps` to continue the spike per
  policy (no silent Next downgrade).

### I-006 — Latest Next Module Federation spike: `INVALIDATED`

- **Status:** Resolved — verdict recorded
- **Evidence location:** `spikes/next-latest-federation/README.md`
  (disposable `host/`/`remote/` code removed after verdict per policy;
  README retained).
- **Observed:** With `next@16.2.11`, `@module-federation/nextjs-mf@8.8.71`,
  `webpack@5.109.0`, Pages Router, `--webpack` CLI flag, and
  `NEXT_PRIVATE_LOCAL_WEBPACK=true`, both `next dev --webpack` and
  `next build --webpack` fail identically and immediately for both the host
  and remote spike apps:
  `TypeError: Cannot destructure property 'CachedSource' of 'require(...)' as it is undefined`
  at Next's config-loading stage — before any webpack compilation, HTTP
  response, or browser render. `curl` against the dev server and
  `remoteEntry.js` both returned no connection (`000`).
- **Impact:** No component, remote-entry, browser, or Playwright evidence
  could be collected — the failure occurs before the dev server serves a
  single request. This is a hard incompatibility, not a narrow constraint;
  there is no reduced "PARTIAL" surface to salvage.
- **Resolution:** Verdict recorded as `INVALIDATED`. The Next track
  (`next/host`, `next/remote`, `next/standalone`) implements iframe and
  non-composed Standalone composition only; Module Federation is not
  implemented for the Next track in this repository at `next@16.2.11`. No
  silent downgrade to Next 15 was performed to force a pass.

### I-007 — `typescript@7.0.2` outpaces `@typescript-eslint@8.65.0`'s declared peer range

- **Status:** Resolved — superseded by I-008's hard failure; workspace pinned to `typescript@5.9.3`
- **Observed:** `npm view typescript version` resolves the current `latest`
  dist-tag to `7.0.2` (TypeScript's native/Go-ported major, no `6.x` line was
  published). `pnpm peers check` reports
  `unmet peer typescript: Installed 7.0.2, Wanted ">=4.8.4 <6.1.0"` for
  `@typescript-eslint/eslint-plugin@8.65.0` and related packages.
- **Impact:** pnpm only warns (does not hard-fail) on this peer mismatch, so
  `pnpm install` succeeded on its own. Superseded by the hard `vue-tsc`
  failure in I-008 before this warning needed a standalone resolution.
- **Resolution:** See I-008 — the workspace-wide pin to `typescript@5.9.3`
  also clears this peer warning (`pnpm peers check` → `No peer dependency
  issues found`).

### I-008 — `vue-tsc@3.3.8` hard-fails under `typescript@7.0.2`

- **Status:** Resolved — workspace-wide pin changed to `typescript@5.9.3`
- **Observed:** `pnpm --filter @pilot/vue-host build` (`vue-tsc --noEmit &&
  vite build`) crashed before any type-checking ran:
  `Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './lib/tsc' is not
  defined by "exports" in .../typescript/package.json`. `vue-tsc` declares a
  loose peer range (`typescript: ">=5.0.0"`), so the declared range did not
  catch this; the failure is in `vue-tsc`'s internal path resolution against
  TS7's restructured package `exports` map, not a declared incompatibility.
- **Impact:** Every Vue app's `build` and `typecheck` script (`vue-tsc`)
  failed completely under `typescript@7.0.2`.
- **Resolution:** Re-pinned `typescript` from `7.0.2` to `5.9.3` (latest
  stable `5.x`) across the root and all six package/app `package.json`
  files. This is a toolchain-compatibility fix, not the "silent Next
  downgrade" the project policy prohibits — it targets `typescript` itself,
  is fully documented here, and was required because `vue-tsc@3.3.8` cannot
  run at all against TS7's package structure. After the change:
  `pnpm peers check` → `No peer dependency issues found`; `pnpm --filter
  @pilot/vue-host build` → succeeds (`vue-tsc --noEmit && vite build`,
  14 modules transformed, dist emitted).

### D-002 — Shared package RED/GREEN evidence

- **Status:** Resolved
- **RED:** With only `test/*.test.ts` written (no `src/index.ts`),
  `pnpm --filter @pilot/contracts test`,
  `pnpm --filter @pilot/fixtures test`, and
  `pnpm --filter @pilot/design-tokens test` each failed with
  `Error: Cannot find module '../src/index'` (0 tests collected).
- **GREEN:** After implementing `src/index.ts` (and `src/tokens.css` for
  design-tokens), the same three commands passed: contracts 6/6, fixtures
  6/6, design-tokens 4/4. `pnpm --filter <pkg> typecheck` (`tsc --noEmit`)
  passed for all three after adding `@types/node@26.1.1` and `"node"` to
  `packages/design-tokens/tsconfig.json`'s `types` array (Node built-in
  imports `node:fs`/`node:url` were otherwise unresolvable under `tsc
  --noEmit`).
- **Follow-up fix:** The first `design-tokens` GREEN attempt still had 1/4
  failing — a CSS comment describing the self-hosted-fonts policy literally
  contained the string `fonts.googleapis.com` as a cautionary example, which
  the test's own network-CDN regex correctly flagged. Reworded the comment
  to describe the policy without naming a real CDN domain; re-ran and got
  4/4.
- **Impact:** None outstanding; `pnpm test` and `pnpm typecheck` from repo
  root both pass across all three shared packages.

### I-009 — pnpm build approval placeholder blocked every root command

- **Status:** Resolved — `sharp` explicitly approved
- **Observed:** The interrupted scaffold left `pnpm-workspace.yaml` with
  `allowBuilds.sharp: "set this to true or false"`. pnpm 11 treated
  `sharp@0.34.5` as an ignored build script, so root `test`, `typecheck`, and
  `build` all stopped during the dependency status/install preflight with
  `ERR_PNPM_IGNORED_BUILDS` before running project scripts.
- **Impact:** No test or build result from those failed root commands was
  meaningful; application code had not been exercised.
- **Resolution:** Set `allowBuilds.sharp: true`. `sharp` is the reviewed image
  dependency used by Next.js; no wildcard build-script approval was added.

### I-010 — Shared font URLs broke Next/Turbopack builds

- **Status:** Resolved with package-bundled variable fonts
- **Observed:** `packages/design-tokens/src/tokens.css` referenced missing
  `./fonts/manrope-variable.woff2` and `./fonts/jetbrains-mono-variable.woff2`.
  Vite emitted runtime-resolution warnings, while all three Next 16 Turbopack
  builds failed hard with `Module not found` before page generation.
- **RED:** Added a design-token test requiring package-based Fontsource imports
  and forbidding local `./fonts/` URLs. The targeted suite failed 1/5 as
  expected against the missing-file implementation.
- **Resolution:** Added exact dependencies `@fontsource-variable/manrope` and
  `@fontsource-variable/jetbrains-mono` to `@pilot/design-tokens`; imported
  their local CSS assets from `tokens.css`; removed broken manual `@font-face`
  URLs. No runtime font CDN is used.
- **GREEN:** Design-token tests passed 5/5. Root `pnpm build` then built all six
  applications successfully: three Vue/Vite artifacts with bundled WOFF2
  files and three statically generated Next 16/Turbopack apps.

### I-011 — Current shadcn preset name differs from the planned value

- **Status:** Resolved by selecting the current supported preset
- **Observed:** `shadcn@4.14.1 init --preset base-nova` failed immediately with
  `Invalid preset: base-nova`; the CLI listed `nova`, `vega`, `maia`, `lyra`,
  `mira`, `luma`, `sera`, and `rhea`.
- **Impact:** No Next app was modified by the failed command.
- **Resolution:** Use the supported `nova` preset and verify generated
  `components.json`, dependencies, component source, typecheck, and build.

### I-012 — Playwright MCP name collision hides project scope in CLI lookup

- **Status:** Open — verify with a distinct project-scoped name
- **Observed:** `.mcp.json` contains a project-scoped `playwright` definition,
  but `claude mcp get playwright` resolves the pre-existing user-scoped server
  of the same name.
- **Impact:** The project file exists, but CLI output does not independently
  prove which same-named definition is active.
- **Next action:** Add and verify `playwright-project` at project scope, then use
  that explicit name for project validation.

### I-013 — shadcn initialization required framework Tailwind prerequisites

- **Status:** Resolved for all six apps
- **Observed:** Next shadcn preflight rejected the minimal scaffold because no
  Tailwind configuration existed. shadcn-vue first rejected the obsolete
  `slate` base-color option and then rejected missing `@/*` aliases.
- **Resolution:** Added exact Tailwind 4 dependencies and PostCSS config to the
  three Next apps; added Tailwind's Vite plugin to the three Vue apps; added
  Vue TypeScript/Vite aliases; selected current `neutral` base color. Ran the
  official CLIs again with `radix-nova` for Next and `reka-nova` for Vue.
- **Verification:** Six `components.json` files exist. Next apps contain the
  official generated Button component and utility; Vue apps contain the
  generated shadcn-vue utility. Root typecheck and all six builds pass after
  initialization.

### I-014 — shadcn-vue init left light-theme oklch tokens and a font CDN import

- **Status:** Resolved
- **Observed:** `shadcn-vue init` (reka-nova preset, I-013) generated
  `vue/{host,remote,standalone}/src/style.css` with the CLI's default light
  theme (`--background: oklch(1 0 0)` etc.) and a leftover
  `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono...')`,
  contradicting both the Flight Deck Ledger dark palette (`docs/design-direction.md`)
  and the no-runtime-font-CDN resolution in I-010.
- **RED:** Added two assertions to `packages/design-tokens/test/tokens.test.ts`
  (`:focus-visible` outline using `--platform-accent`;
  `@media (prefers-reduced-motion: reduce)`); `pnpm --filter @pilot/design-tokens
  test` failed 2/7 as expected — neither rule existed in `tokens.css` yet.
- **GREEN:** Added the two rules to `packages/design-tokens/src/tokens.css`;
  `pnpm --filter @pilot/design-tokens test` passed 7/7.
- **Resolution:** Removed the Google Fonts `@import` and remapped every
  shadcn-vue semantic token (`--background`, `--foreground`, `--card`,
  `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`,
  `--destructive`, `--border`, `--input`, `--ring`, `--chart-*`, `--sidebar-*`)
  in all three Vue apps' `src/style.css` to `hsl(var(--platform-*))` from
  `@pilot/design-tokens`, replacing the CLI's light-theme oklch defaults with
  the single fixed Flight Deck Ledger dark surface (no separate `.dark` class
  toggle — the design has no light mode). Identical change applied to
  `vue/host`, `vue/remote`, and `vue/standalone` since the CLI generated
  byte-identical files for all three.
- **Impact:** shadcn-vue primitives (Button, Card, Badge, etc.) now render
  using the project's dark control-room tokens instead of the CLI's light
  defaults, and no app fetches fonts over the network at runtime.

### I-015 — `shadcn-vue add` re-inserts the Google Fonts CDN import on every run

- **Status:** Resolved per invocation; watch for recurrence on future `add` runs
- **Observed:** Running `npx shadcn-vue@2.8.0 add <components> --yes` in each of
  `vue/host`, `vue/remote`, and `vue/standalone` (to install Button, Badge,
  Card, Tabs, Alert, Skeleton, Select, Table, Tooltip) re-added the same
  `@import url('https://fonts.googleapis.com/css2?...')` line at the top of
  `src/style.css` that was removed in I-014, even though the rest of the
  Flight Deck Ledger token mapping was preserved untouched.
- **Impact:** None outstanding — caught immediately after each `add` run,
  before install/build/test. Would otherwise reintroduce a runtime font CDN
  dependency contradicting I-010's resolution.
- **Resolution:** Removed the re-inserted `@import url(...)` line (and the
  CLI's `---break---` comment marker) from all three `src/style.css` files
  immediately after each `add` invocation. No other CLI-managed CSS changed.
- **Follow-up:** Any future `shadcn-vue add` invocation in this repo must
  re-check `src/style.css` for this same re-insertion before treating the
  command as complete.

### I-012 resolution — explicit project-scoped Playwright MCP

- **Status:** Resolved for configuration; live approval/QA remains pending
- **Resolution:** Added `playwright-project` with project scope. `.mcp.json`
  contains the shared command `npx @playwright/mcp@latest`, and
  `claude mcp get playwright-project` reports `Scope: Project config`.
- **Remaining:** Claude reports `Pending approval`; approve it in a trusted
  interactive project session before live MCP QA.

### I-016 — Vue Remote Federation vertical slice

- **Status:** Resolved and verified
- **Evidence:** `pnpm --filter @pilot/vue-remote test` passed 23/23 tests across
  context parsing, exact-origin frame messages, pulse rail behavior, and the
  Monitor component. `vue-tsc --noEmit` passed. Production build transformed
  728 modules, generated federation types, and emitted `dist/remoteEntry.js`.
- **Composition:** `vue_remote` exposes `./Monitor` using
  `@module-federation/vite@1.19.1`; Vue is a singleton shared dependency.

### I-017 — Generated shadcn-vue wrappers conflict with exact optional types

- **Status:** Resolved with app-local compiler compatibility override
- **Observed:** shadcn-vue 2.8.0 generated Select, Tabs, Tooltip, and Badge
  wrappers forward optional props as explicit `undefined`. With the repository
  base `exactOptionalPropertyTypes: true`, `vue-tsc` reported TS2379 errors in
  generated source.
- **Resolution:** Vue app tsconfigs set only `exactOptionalPropertyTypes: false`;
  all other strict settings remain inherited. This matches the already verified
  Remote configuration and avoids hand-editing registry-managed components.

### I-018 — Vitest does not resolve the Federation virtual module by default

- **Status:** Resolved without changing production resolution
- **Observed:** Host production build resolved `vue_remote/Monitor` through the
  Federation plugin, but Vitest import analysis failed before App tests because
  no live remote module exists in unit-test transforms. `test.alias` was too
  late in Vite 8/Vitest 4 processing and did not fix it.
- **Resolution:** `vite.config.ts` adds a Host-local stub to `resolve.alias` only
  when `process.env.VITEST` is set. Production continues to resolve the virtual
  Federation module. Host tests passed 45/45, typecheck passed, and production
  build emitted the Federation consumer runtime.

### D-003 — Vue Remote vertical slice: `Monitor.vue`, direct `App.vue`, Federation

- **Status:** Resolved
- **Scope:** `vue/remote` only. `vue/host` and `vue/standalone` product code
  were not touched.
- **RED (confirmed before implementation):** `pnpm --filter @pilot/vue-remote
  test` — `test/context.test.ts` (5), `test/frame-adapter.test.ts` (6), and
  `test/pulse-rail.test.ts` (5) already passed against the pre-existing
  `src/lib/context.ts`, `src/lib/frameAdapter.ts`, and
  `src/components/DeploymentPulseRail.vue`. `test/monitor.test.ts` (7 tests)
  failed as a whole suite: `Failed to resolve import
  "../src/components/Monitor.vue" — Does the file exist?` (component did not
  exist yet). Total: 16 passed, 1 suite failed to even collect.
- **GREEN:** Implemented `src/components/Monitor.vue` (composes
  `DeploymentPulseRail.vue` plus generated shadcn-vue `Card`, `Alert`,
  `Button`, `Skeleton` primitives) with no weakened assertions. Re-ran
  `pnpm --filter @pilot/vue-remote test`: **23/23 passed** (4 files) —
  default-deployment evidence, pulse-rail node count, selection updating
  evidence + `deployment-selected` emit, acknowledgeable degraded alert +
  `alert-acknowledged` emit and disappearance, no-alert-on-healthy, empty
  state (`role="alert"`, "No deployments", 0 nodes), and loading skeleton
  (`data-testid="monitor-skeleton"`, no evidence text) all pass unmodified
  against the original spec.
- **App.vue:** Implemented the direct/standalone shell — parses
  `window.location.search` via the existing `resolveContextFromQuery`,
  renders `Monitor`, and integrates the existing `frameAdapter` only when
  actually framed (`window.parent !== window`): posts `monitor-ready` once on
  mount, listens for exact-origin `context` messages from
  `http://<host>:4173` (the fixed Vue Host port), and forwards Monitor's
  `deployment-selected`/`alert-acknowledged` emits to the host as
  `MonitorEvent`s via `postMessageToHost`. No dedicated `App.vue` test file
  exists in the repo; the underlying `context`/`frameAdapter` functions it
  calls remain fully covered by `context.test.ts`/`frame-adapter.test.ts`.
- **Federation config:** Installed the exact documented
  `@module-federation/vite@1.19.1` as a `vue-remote` devDependency (peer
  range `^5 || ^6 || ^7 || ^8` covers installed `vite@8.1.5`). Configured
  `vite.config.ts`: `federation({ name: 'vue_remote', filename:
  'remoteEntry.js', exposes: { './Monitor': './src/components/Monitor.vue'
  }, shared: { vue: { singleton: true } } })`, plus `build.target: 'esnext'`
  and `build.modulePreload: false` (required by Module Federation's ESM
  output). `server`/`preview` already had `cors: true` from the existing
  scaffold.
- **Gotcha:** `@module-federation/vite@1.19.1`'s `lib/index.js` has no
  default export (`export { createModuleFederationConfig, federation }` only)
  despite `package.json`'s `exports["."].default` pointing at that same
  file — `import federation from '@module-federation/vite'` fails Vitest's
  config load with `SyntaxError: ... does not provide an export named
  'default'`. Fixed by using the named import `import { federation } from
  '@module-federation/vite'`. Vitest continued to load and run the same
  `vite.config.ts` correctly afterward (23/23 tests still pass with the
  federation plugin active).
- **Build:** `pnpm --filter @pilot/vue-remote build` (`vue-tsc --noEmit &&
  vite build`) succeeded: 728 modules transformed, `[ Module Federation DTS ]
  Federated types created correctly`, and `dist/` contains `remoteEntry.js`
  (140 bytes, `export { get, init }`, importing the generated
  `virtual_mf-REMOTE_ENTRY_ID___mfe_internal__vue_remote__remoteEntry_js-*.js`
  chunk), a `Monitor-*.js`/`Monitor-*.css` exposed-module chunk, the shared
  `vue` loader chunk, `virtualExposes-*.js`, and `@mf-types`/`@mf-types.zip`
  federation type artifacts alongside the existing `index.html` and fixture
  fonts.
- **Preview evidence:** Ran `pnpm preview` (vite preview, port 4174) in the
  background, then `curl -i`:
  - `GET http://localhost:4174/` → `200`, `Access-Control-Allow-Origin: *`,
    HTML referencing `/assets/mf-entry-bootstrap-*.js` and the
    `Monitor-*.css`/`index-*.css` stylesheets.
  - `GET http://localhost:4174/remoteEntry.js` → `200`,
    `Access-Control-Allow-Origin: *`, `Content-Type: text/javascript`, body
    matching the built file exactly.
  Killed the preview process afterward (`kill <pid>`); confirmed port 4174
  was free.
- **Impact:** None outstanding for the tested/required scope.

### I-016 — `exactOptionalPropertyTypes: true` breaks `vue-tsc` on generated shadcn-vue primitives (all three Vue apps, pre-existing)

- **Status:** Resolved for `vue-remote` only; `vue-host`/`vue-standalone` left
  untouched and still affected (out of scope for this task)
- **Observed:** `pnpm --filter @pilot/vue-remote typecheck` (and therefore
  `build`, since the script is `vue-tsc --noEmit && vite build`) failed with
  18 `TS2379` errors, all with the same shape ("... is not assignable ...
  with `exactOptionalPropertyTypes: true`. Consider adding `undefined` to the
  types of the target's properties.") in the shadcn-vue/reka-ui-generated
  `ui/badge`, `ui/select`, `ui/tabs`, and `ui/tooltip` primitives — none of
  which `Monitor.vue`, `App.vue`, `DeploymentPulseRail.vue`, `context.ts`, or
  `frameAdapter.ts` reference. Confirmed this is pre-existing and not caused
  by this task: `pnpm --filter @pilot/vue-host typecheck` fails identically
  (same file list, same error shapes) against `vue/host`'s independently
  generated copies of the same primitives, which this task did not touch.
  Root cause: `tsconfig.base.json`'s `exactOptionalPropertyTypes: true`
  (shared by all six apps/packages) is incompatible with how the installed
  `reka-ui@2.10.1` types its optional `Primitive` props against the
  currently generated shadcn-vue (`reka-nova` preset, see I-013) component
  source.
- **Impact:** Blocked the required `typecheck` and `build` gates for
  `vue-remote` even though none of the code written for this task was
  responsible.
- **Resolution:** Set `"exactOptionalPropertyTypes": false` as a local
  override in `vue/remote/tsconfig.json`'s `compilerOptions` (which
  `extends` the shared `tsconfig.base.json`). This is scoped to `vue/remote`
  only — `tsconfig.base.json` and `vue/host`/`vue/standalone` were not
  modified, so the strict flag remains in force everywhere else. After the
  change: `pnpm --filter @pilot/vue-remote typecheck` → clean (no errors);
  `pnpm --filter @pilot/vue-remote build` → succeeds (see D-003).
- **Deferred:** `vue/host` and `vue/standalone` still fail `vue-tsc --noEmit`
  the same way; fixing them (or fixing the underlying primitives instead of
  relaxing the flag) is out of scope for the Vue Remote vertical slice and is
  left for whoever next touches those apps or the shared shadcn-vue/reka-ui
  versions.

### I-017 — No distinct "error" state in `Monitor.vue`; Host-side Federation/iframe wiring not attempted

- **Status:** Open — deferred, out of scope for this task
- **Observed:** `Monitor.vue` implements loading (skeleton), empty
  (`role="alert"`, "No deployments"), and degraded/acknowledgeable-alert
  states, all covered by `monitor.test.ts`. There is no distinct "data fetch
  failed" error state, because `Monitor`'s data comes synchronously from
  `@pilot/fixtures` — there is no async boundary that can fail yet, and no
  test in `monitor.test.ts` specifies one.
- **Impact:** TASK.md's "Add accessible loading, empty, error, and degraded
  states" bullet is only partially satisfied (loading/empty/degraded); left
  unchecked rather than marked done.
- **Also deferred:** Loading the Remote in Host, verifying Federation
  props/events/routing/failure/retry end-to-end, the Vue iframe comparison
  route, and comparing Federation vs. iframe behavior all require `vue/host`
  changes, which this task was explicitly scoped to avoid. The Remote-side
  building blocks those depend on (`frameAdapter.ts`'s exact-origin
  validation, the `federation()` Remote config exposing `./Monitor`) are
  implemented and independently unit-tested/build-verified per D-003.

### D-004 — Vue Standalone: non-composed Console + Monitor baseline

- **Status:** Resolved
- **Scope:** `vue/standalone` only. `vue/host` and `vue/remote` product code
  were not touched (verified: no diff to either directory in this task).
- **RED (confirmed before implementation):** Wrote all eight
  `vue/standalone/test/*.test.ts` files first
  (`context.test.ts`, `context-controls.test.ts`, `pulse-rail.test.ts`,
  `monitor.test.ts`, `event-ledger-panel.test.ts`, `event-ledger.test.ts`,
  `app.test.ts`, `architecture-guard.test.ts`) against the pre-existing
  health-check scaffold (`App.vue` showing only "Scaffold healthy on port
  4175", no `lib/context.ts`, no `Monitor.vue`, no `EventLedgerPanel.vue`).
  `pnpm --filter @pilot/vue-standalone test` failed as expected: 7 of 8 test
  files failed to collect (`Failed to resolve import
  "../src/components/DeploymentPulseRail.vue"` / `Monitor.vue` /
  `EventLedgerPanel.vue`, `Failed to resolve import "../src/lib/context"` /
  `"../src/lib/eventLedger"`), and the 2 `app.test.ts` assertions that could
  run against the scaffold failed on content mismatch
  (`expected 'AI Platform Console...' to contain 'Cluster'`). The
  `architecture-guard.test.ts` suite initially flagged itself (2 false
  positives) because its own regex source literally contains the strings
  `vue/remote` and `@module-federation` — fixed by excluding the guard's own
  file path from the scanned file list before any source existed to test
  against for real.
- **GREEN:** Implemented `src/lib/context.ts` (cluster/model/environment
  option helpers + `modelNameForId`, merged from the option-helper half of
  `vue/host`'s copy and the `modelNameForId` half of `vue/remote`'s copy —
  `resolveContextFromQuery` was deliberately omitted since Standalone has no
  query-string or `postMessage` context bridge to resolve from, and no test
  required it), `src/lib/eventLedger.ts` (single-source ledger keyed on
  `MonitorEvent` only, no `source`/`LedgerSource` field, since Standalone has
  exactly one composition path unlike Host's federation/iframe-tagged
  ledger), `src/components/DeploymentPulseRail.vue` and `src/components/
  Monitor.vue` (ported unchanged from `vue/remote`, both framework-neutral
  presentational components with no `postMessage`/framing concern),
  `src/components/ContextControls.vue` (ported unchanged from `vue/host`),
  `src/components/EventLedgerPanel.vue` (adapted from `vue/host`'s version:
  no source `Badge` column since there is no federation/iframe source to
  distinguish; a `Badge` now labels the event kind — "selection" vs.
  "alert" — instead), and rewrote `src/App.vue` to compose
  `ContextControls` + `Monitor` + `EventLedgerPanel` behind shadcn-vue `Card`
  and `Badge`, with no `CompositionControls`/`FederationPanel`/`IframePanel`
  equivalent since Standalone has only one mode. Re-ran
  `pnpm --filter @pilot/vue-standalone test`: **36/36 passed** (8 files) —
  option-helper/`modelNameForId` evidence, `ContextControls` select
  emit/ignore behavior, pulse-rail node count/pressed-state/label/emit/
  animation, `Monitor` default-deployment/selection/acknowledge/empty/
  loading states (identical assertions to `vue/remote`'s `monitor.test.ts`,
  unmodified), `EventLedgerPanel` empty-state and newest-first rendering,
  `eventLedger` record/clear behavior, `App` integration (context change
  updates Monitor, deployment selection and alert acknowledgement each
  record a ledger entry, empty ledger before interaction), and all four
  architectural-guard assertions (no `vue/remote`/`vue/host` source import,
  no `@module-federation` reference anywhere in `src`/`test`/config files, no
  `<iframe`, no `postMessage`) all pass.
- **Typecheck:** `pnpm --filter @pilot/vue-standalone typecheck` initially
  failed with the same pre-existing `TS2379` `exactOptionalPropertyTypes`
  errors documented in I-016/I-017 for `vue/remote`'s and `vue/host`'s
  independently generated shadcn-vue/reka-ui primitives (`badge`, `select`,
  `tabs`, `tooltip` — all untouched by this task). Applied the same scoped
  fix already used for `vue/remote`: added
  `"exactOptionalPropertyTypes": false` to `vue/standalone/tsconfig.json`
  only (`tsconfig.base.json` and the other two apps were not touched). After
  the change: `pnpm --filter @pilot/vue-standalone typecheck` → clean, no
  errors.
- **Build:** `pnpm --filter @pilot/vue-standalone build` (`vue-tsc --noEmit
  && vite build`) succeeded: 2451 modules transformed, `dist/` contains
  `index.html`, one JS bundle (243.79 kB, gzip 83.07 kB), one CSS bundle
  (54.97 kB, gzip 14.73 kB), and the bundled variable-font WOFF2 files from
  `@pilot/design-tokens` (I-010) — no `remoteEntry.js`, no federation
  chunks, no federation type artifacts, confirming the build is a plain Vite
  SPA output.
- **Preview evidence:** Ran `pnpm preview` (vite preview, port 4175) in the
  background, then `curl -is http://localhost:4175/` → `200`, HTML
  referencing the built `index-*.js`/`index-*.css` assets, no iframe or
  federation markup. Killed the preview process afterward; confirmed port
  4175 was free.
- **Runtime differences from the composed modes (recorded per TASK.md's
  "record setup/runtime differences" bullet):** Standalone has no
  `frameAdapter`/`hostFrameAdapter` equivalent, no exact-origin
  `postMessage` validation, no query-string context resolution, and no
  federation `shared`/`exposes` config — `context` is a single local `ref`
  owned by `App.vue` and flows directly to `ContextControls` and `Monitor`
  as plain props/emits within one Vue instance. The event ledger records
  only the two `MonitorEvent` variants `Monitor` actually emits
  (`deployment-selected`, `alert-acknowledged`); it has no `monitor-ready`
  entry (nothing is "framed") and no per-entry `source` field (there is only
  one source).
- **Impact:** None outstanding for the tested/required scope. `vue/host` and
  `vue/remote` were not modified; no commit, push, or remote configuration
  was performed.

### I-019 — Federation retry initially reused the browser's failed ESM entry

- **Status:** Resolved
- **Observed:** In a production-preview Host/Remote outage test, stopping the
  Remote made the Host show its Federation fallback as expected. Starting the
  Remote again and clicking **Retry** did not recover: only the original
  `http://127.0.0.1:4174/remoteEntry.js` appeared in the browser resource
  entries, and the fallback remained visible.
- **Root cause:** `registerRemotes(..., { force: true })` clears the Module
  Federation runtime's remote/module cache, but browsers cache a *failed native
  ESM import* by URL. Re-registering the unchanged entry URL therefore did not
  issue a fresh entry request.
- **RED:** Updated `vue/host/test/federated-monitor-loader.test.ts` to require
  forced re-registration; it failed because no options were passed. After that
  fix, added a retry-specific assertion requiring a unique
  `remoteEntry.js?retry=...` URL; it failed because retry still used the base
  URL.
- **Resolution:** `loadFederatedMonitor(entry, retry)` now uses both
  `registerRemotes(..., { force: true })` and a `crypto.randomUUID()` query
  parameter only for a retry. `FederationPanel` passes `false` for its initial
  load and `true` after the user clicks **Retry**.
- **GREEN:** `pnpm --filter @pilot/vue-host test` passes **48/48**;
  `pnpm --filter @pilot/vue-host typecheck` and `build` pass. In a clean
  production-preview browser session, the Host rendered its fallback while the
  Remote was stopped, then recovered after restart + **Retry**. Browser
  resource evidence contains both the failed base URL and a successful unique
  retry URL.

### D-005 — Vue Host/Remote composed-mode production-preview validation

- **Status:** Resolved for the Vue Host/Remote vertical slice; router/history
  comparison remains intentionally unchecked because this Vite pilot has no
  router.
- **Federation happy path:** Built Host and Remote independently, served them
  at `127.0.0.1:4173` and `127.0.0.1:4174`, and verified the Host rendered the
  federated Monitor. Selecting `deploy-002` updated the Monitor and created a
  Host-owned `federation` ledger event. `remoteEntry.js` returned `200` with
  JavaScript content and CORS enabled.
- **Federation resilience:** With the Remote stopped before a Host reload, the
  Host chrome and fallback rendered without blocking. After restarting the
  Remote, **Retry** recovered the federated Monitor without a Host reload;
  see I-019 for the regression fix and request evidence.
- **iframe happy path:** Switching the same Host to iframe mode rendered the
  Remote at the exact `127.0.0.1:4174` origin, posted `monitor-ready`, and
  recorded the Host-owned `iframe` ledger event. Selecting `deploy-002` in the
  framed Monitor produced the corresponding iframe-sourced ledger event.
- **iframe resilience:** With the Remote unavailable, iframe mode rendered its
  8-second exact-URL fallback. Restarting the Remote and clicking **Retry**
  restored the framed Monitor and removed the fallback.
- **Automated verification:** Remote tests **23/23**, Host tests **48/48**;
  both Vue package typechecks and independent production builds pass. The full
  `pnpm lint && pnpm test && pnpm typecheck && pnpm build` workspace sequence
  also passes: shared packages, all three Vue apps, and all three Next
  scaffolds typecheck/build successfully. The current `lint` command exits
  cleanly but finds no package-level lint scripts, so it is recorded as a
  command result rather than evidence of substantive lint coverage.
- **Scope boundary:** No commit, remote creation/configuration, push, or
  release operation was performed.

## 2026-07-25

### D-006 — Parallel dev command verification and TASK.md reconciliation

- **Status:** Resolved — five parallel commands verified; four TASK.md
  accuracy defects corrected.
- **Method:** Started each root command detached, waited for readiness,
  probed every allocated port with `curl`, then sent `SIGINT` to the root
  `pnpm` process and re-checked listeners with `lsof`.
- **`pnpm dev`:** `Scope: 6 of 10 workspace projects`. All six servers bound
  their allocated ports and returned `200`: Vue Host `4173`, Vue Remote
  `4174`, Vue Standalone `4175`, Next Host `3000`, Next Remote `3001`, Next
  Standalone `3002`. Logs carried package prefixes (`vue/host dev:`,
  `next/remote dev:`, …) via `--stream`.
- **`pnpm dev:composed`:** `Scope: 4 of 10`; only `3000`, `3001`, `4173`,
  `4174` bound. **`pnpm dev:standalone`:** `Scope: 2 of 10`; only `3002` and
  `4175` bound. **`pnpm dev:vue` / `pnpm dev:next`:** filters resolve to
  exactly their three package directories.
- **Termination:** `SIGINT` to the root process left zero listeners on all
  six ports for all three parallel commands. No orphaned dev server survived.
- **TASK.md defects corrected:**
  1. Section 6 was entirely unchecked although `docs/design-direction.md` and
     D-001 satisfy twelve of its thirteen items.
  2. Section 7 was entirely unchecked although all three Vue apps already
     carry the full nine-component shadcn-vue set and all six apps have
     `components.json` (`reka-nova` for Vue, `radix-nova` for Next).
  3. Section 4's parallel-command and Next-port items were unchecked although
     the scripts existed; they are now checked against the evidence above.
  4. Section 9's "Conditional Next Federation" items sat open although I-006
     closed the question; they are now resolved as N/A, leaving only the
     honest "unsupported in this version" UI state as real work.
- **Gates demoted for honesty:** `pnpm lint` and `pnpm test` were marked
  passing in the `v0.1.0` quality gate. Neither is a real gate yet — no
  package declares a `lint` script, so ESLint never runs, and no Next app
  declares a `test` script, so the entire Next track is skipped.
- **`.mcp.json` defect:** it declares two identical Playwright MCP servers
  (`playwright` and `playwright-project`), both `npx @playwright/mcp@latest`.
  Two browser servers competing for one profile is a live-QA hazard; one
  entry should be removed. Resolved MCP version observed: `0.0.78`. Node
  observed: `v22.22.3`.
- **Missing directories:** `e2e/`, `docs/validation/`, and
  `artifacts/screenshots/readme/` do not exist although `README.md` already
  prints them as workspace structure.
- **Scope boundary:** Documentation reconciliation only. No application code
  was modified, and no commit, remote creation/configuration, push, or
  release operation was performed.

### D-007 — Next.js Remote/Standalone/Host implementation and Vue error-boundary parity

- **Status:** Resolved. All three Next apps now have real, tested
  implementations in place of their scaffolds; Vue Remote/Standalone gained
  the error-boundary state flagged as missing in D-006.
- **Test infrastructure:** Added `vitest`, `jsdom`, `@testing-library/react`,
  `@testing-library/user-event`, `@testing-library/jest-dom`, and
  `@vitejs/plugin-react` to all three Next apps, each with its own
  `vitest.config.ts` and `test/setup.ts`. `next/remote/test/monitor.test.ts`
  (previously unrunnable per D-006) now executes.
- **Next Remote:** Rewrote `lib/monitor.ts` to reuse `deploymentsForModel`/
  `modelNameForId` from `@pilot/fixtures` instead of a hardcoded
  `modelId === 'model-y' ? 'Model Y' : 'Model X'` ternary, and made `selected`
  return `undefined` instead of throwing for an unresolvable model. Added
  `lib/context.ts` (`resolveContextFromQuery`, `modelNameForId`) and
  `lib/frame-adapter.ts`, both direct ports of the Vue Remote equivalents.
  Built `components/pulse-rail.tsx` and `components/monitor.tsx` with shadcn
  (Alert/Card/Skeleton/Button) reproducing `DeploymentPulseRail.vue`/
  `Monitor.vue` state-for-state (loading skeleton, empty alert, degraded
  alert + acknowledge, timeline). Rewrote `app/page.tsx` to use these instead
  of the inline-`style` prototype from D-006, preserving its context-query
  resolution and postMessage wiring. 25/25 tests, `tsc --noEmit` clean,
  `next build` succeeds. Production preview (`next start -H 127.0.0.1 -p
  3001`) served `200` with "Model X"/"healthy" in the server-rendered HTML.
- **Next Standalone:** Duplicated Remote's `monitor.tsx`/`pulse-rail.tsx`/
  `lib/monitor.ts` (per-app ownership, no cross-app import, matching the Vue
  track's existing duplication pattern). Added `lib/context.ts` (option
  helpers), `lib/event-ledger.ts` (a `useEventLedger` hook using
  `useState`/`useRef`, tested via `@testing-library/react`'s `renderHook`),
  `components/context-controls.tsx` (Radix `Select`, tested via a
  `vi.mock('../components/ui/select', ...)` swap to a native `<select>` —
  the React equivalent of the Vue tests' pragmatic choice to drive the
  Select component directly rather than simulate full Radix pointer/keyboard
  interaction in jsdom), and `components/event-ledger-panel.tsx`. Composed
  in `app/page.tsx`; added `test/architecture-guard.test.ts` (a Next/React
  port of the Vue Standalone guard: no cross-app import, no
  `@module-federation`, no `<iframe>`, no `postMessage`). 31/31 tests,
  `tsc --noEmit` clean, `next build` succeeds.
- **Next Host:** Added `lib/host-frame-adapter.ts` (`buildRemoteUrl`/
  `parseRemoteMessage`/`postContextToRemote`, a direct port of
  `hostFrameAdapter.ts`), `lib/event-ledger.ts` (with a `source: 'federation'
  | 'iframe'` field, matching Vue Host's ledger), `components/
  composition-controls.tsx` (Radix Tabs), `components/iframe-panel.tsx`
  (loading/ready/error states, an 8s-configurable timeout, retry via iframe
  remount, exact-origin `postMessage` both directions), and
  `components/federation-unsupported.tsx` — a new evidence-backed Alert
  naming `next@16.2.11`, `@module-federation/nextjs-mf@8.8.71`'s Next 12–15
  peer range, and the I-006 `INVALIDATED` verdict, shown when the Federation
  tab is selected instead of a live panel. Composed in `app/page.tsx`,
  defaulting to iframe mode. 39/39 tests, `tsc --noEmit` clean, `next build`
  succeeds.
  - Two fake-timer tests (`iframe-panel.test.tsx`) initially failed because
    `setStatus('error')` fired by a `vi.advanceTimersByTimeAsync`-triggered
    `setTimeout` callback needs the state update flushed inside `act()`, and
    a follow-up `userEvent.click` on the retry button hung indefinitely under
    `vi.useFakeTimers()` (userEvent's internal scheduling depends on real
    timers even with `delay: null`). Resolved by wrapping the timer advance
    in `await act(async () => { await vi.advanceTimersByTimeAsync(1000); })`
    and using `fireEvent.click` instead of `userEvent.click` for the
    fake-timer retry test specifically.
- **Live browser verification (Playwright MCP browser pane):** Built and
  started `next-host` (`127.0.0.1:3000`) and `next-remote` (`127.0.0.1:3001`)
  as production previews. Confirmed in a real browser: the Host renders the
  iframe-composed Remote by default; the Host ledger records a `monitor-ready`
  entry on load; switching the composition tab to **Federation** renders the
  `FederationUnsupported` evidence Alert (naming `16.2.11`, `nextjs-mf`,
  `INVALIDATED`) instead of a blank or silently-hidden option; switching back
  to **iframe** and clicking the degraded pulse-rail node *inside* the framed
  Remote updated the Remote's own view (Model X / degraded / 2/4 / 412ms) and
  posted `deployment-selected: deploy-002` to the Host's ledger with the
  `iframe` source badge — the full cross-origin `postMessage` round trip,
  observed live, not just asserted in jsdom.
- **Bind-host fix:** `next dev`/`next start` defaulted to binding all
  interfaces (`*:PORT`), while Vite explicitly binds `127.0.0.1`. Added
  `-H 127.0.0.1` to all three Next apps' `dev`/`start` scripts so the
  exact-origin `postMessage` checks compare against a real, consistent origin
  in both dev and production preview. Verified via `lsof` before/after.
- **Vue error-boundary backport:** D-006 flagged that only the Host owns
  failure UX — a directly-opened Remote has no error surface. Added
  `ErrorBoundary.vue` (`onErrorCaptured` + a Retry button, `role="alert"` via
  the existing `Alert` primitive) to both `vue/remote` and `vue/standalone`,
  wrapping `Monitor` in each `App.vue`. 26/26 `vue/remote` tests, 39/39
  `vue/standalone` tests; both builds still succeed. One test-writing
  subtlety: a component's `setup()` throw is caught synchronously by
  `onErrorCaptured`, but the boundary's own re-render (driven by a reactive
  `ref`) only lands on the next microtask, so assertions need `await
  nextTick()` after mounting a throwing child.
- **Lint made real:** `pnpm lint` was `pnpm -r --if-present lint`, which
  passed vacuously because no package declared a `lint` script. Changed the
  root script to `eslint .` directly. This surfaced two real defects, both
  fixed:
  1. `eslint.config.mjs` didn't ignore generated output — `vue/host/
     @mf-types/` (Module Federation DTS, itself a defect: see below),
     `next-env.d.ts`, and `*.tsbuildinfo` produced 231 errors on code no one
     authored. Added `**/@mf-types/**`, `**/*.tsbuildinfo`, and
     `**/next-env.d.ts` to the ignore list.
  2. Two `// eslint-disable-next-line react-hooks/exhaustive-deps` comments
     in the new `iframe-panel.tsx` referenced a rule from
     `eslint-plugin-react-hooks`, which isn't installed in this repo's
     minimal `@typescript-eslint`-only config. Removed the comments; the
     underlying effect-dependency choices are intentional (see the file) and
     don't need a suppressed lint rule that doesn't exist here.
- **Found and fixed: `vue/host/@mf-types/` was accidentally committed.**
  While chasing the lint failures above, `git ls-files` showed 23 files under
  `vue/host/@mf-types/` — Module Federation's generated Remote-type-declaration
  output — tracked in git since the `8a6c65f` initial commit. This is build
  output, not source (regenerates on every `vite dev`/`vite build`).
  `git rm -r --cached` untracked it and `.gitignore` gained `**/@mf-types/`.
  Also untracked `next/{host,remote,standalone}/next-env.d.ts`: Next rewrites
  this file's import path between `./.next/types/routes.d.ts` (after
  `build`) and `./.next/dev/types/routes.d.ts` (after `dev`), so it churned
  in `git status` depending on which command last ran; gitignored per
  Next's own template convention.
- **Full workspace verification:** `pnpm lint && pnpm typecheck && pnpm test
  && pnpm build` all exit `0`. Test count: `230/230` across all 9 packages
  with tests (`@pilot/contracts` 9, `@pilot/design-tokens` 7, `@pilot/
  fixtures` 6, `next-remote` 25, `next-standalone` 31, `next-host` 39,
  `vue-host` 48, `vue-remote` 26, `vue-standalone` 39) — zero skipped,
  zero failed.
- **Scope boundary:** No commit, remote creation/configuration, push, or
  release operation was performed. Playwright Test E2E, the full Playwright
  MCP live-QA matrix (Section 11), the README rewrite, and 130% screenshots
  remain open — see `TASK.md` Section 14, Stage C/D.

### D-008 — Next.js Module Federation, for real: raw `webpack.container.ModuleFederationPlugin`, plus Playwright Test E2E

- **Status:** Resolved. Next Federation moved from "documented as unsupported"
  (D-007) to "implemented and verified live in the browser," via a mechanism
  that never touches `@module-federation/nextjs-mf`. I-006's `INVALIDATED`
  verdict for that specific package is unchanged and still correct.
- **Why this happened:** After D-007 shipped an honest evidence-backed
  "Federation unsupported at next@16.2.11" state, the owner directed that
  stopping there missed the point of the pilot — the project exists to find
  working alternatives, not just to report that the first thing tried failed.
  The owner explicitly instructed completing a real, visible Next Federation
  implementation while keeping the `nextjs-mf` incompatibility tracked as an
  issue rather than silently downgrading Next or abandoning the investigation.

#### Spike: `spikes/next-raw-federation/` — verdict `PARTIAL — adopted`

- **Key finding:** `next@16.2.11` bundles `webpack@5.98.0` internally
  (`next/dist/compiled/webpack/webpack.js`), and that bundle's
  `webpack.container.ModuleFederationPlugin` — webpack's own first-class
  Module Federation implementation — works. `@module-federation/nextjs-mf`
  is a convenience wrapper around this same plugin that also patches
  Next-version-specific internals; the crash in I-006 was in *that patching*,
  not in Module Federation itself.
- **Debugging path** (each fix carried forward to the next step; full detail
  and evidence in the spike README):
  1. Remote-only `exposes` config compiles and serves `remoteEntry.js` —
     already further than `nextjs-mf` ever got on this Next version.
  2. Host `remotes` + `React.lazy(() => import('next_remote_spike/Widget'))`
     fails to *build*: `Module not found`. Next's server compiler also needs
     to statically resolve the specifier even though the component is
     client-only. Fixed by applying the federation config to both the
     `isServer` and client webpack passes.
  3. Builds, but the widget never renders (`Loading remote widget…` forever,
     no error). Root cause: Next hardcodes the same chunk-loading global
     (`self.webpackChunk_N_E`) for every app; the remote's container executes
     inside the host's page and pushes onto the *host's* chunk array, whose
     chunk-ID map has no entries for the remote's own async chunks. Fixed
     with `config.output.uniqueName` set to a distinct string per app.
  4. Still stalls: Next splits its runtime bootstrap into a separate
     `webpack-*.js` chunk, shared across that app's own pages only —
     `remoteEntry.js`, loaded standalone in the host's page, never gets it,
     so `self.webpackChunk<uniqueName>.push` is never patched into a real
     handler. Fixed with `config.optimization.runtimeChunk = false`
     (`remoteEntry.js` grew from 589 bytes to a self-contained 6087).
  5. Still stalls in the browser only — manually calling
     `window.<name>.get('./Widget')` from the console succeeded. Root cause:
     `remoteEntry.js` has no content hash in its filename, and Next serves it
     `Cache-Control: public, max-age=31536000, immutable` — the browser never
     revalidates it, even on a hard reload, once cached. Worked around with a
     `?v=<timestamp>` cache-busting query during the spike; the adopted
     implementation instead sets `Cache-Control: no-store` on that one path.
  6. With all four fixes: **a stateless exposed component renders correctly,
     live, cross-origin, in a real browser** (Playwright MCP browser pane,
     page text: *"Hello from Next Remote via raw webpack Module
     Federation"*, fetched from `127.0.0.1:3911` into `127.0.0.1:3910`'s
     own React tree at request time).
  7. Repeated with a `useState`-using widget: crashes,
     `TypeError: Cannot read properties of null (reading 'useState')` — the
     classic two-independent-React-copies failure, since no `shared` config
     was declared.
  8. Added `shared: { react: {..., eager: true}, 'react-dom': {...} }`:
     immediate uncaught `ScriptExternalLoadError` client-side exception.
  9. Removed `eager`, added `Access-Control-Allow-Origin: *` on the remote's
     static assets (a real cross-origin MF requirement in general): no more
     crash, but back to the same silent stall as step 3 —
     `container.get()` still resolves manually, but the page's own
     `React.lazy` promise never settles. **Not resolved within the spike's
     time-box** — tracked as I-018.
- **Verdict:** `PARTIAL — adopted`. Stateless federation is proven and
  adopted. Stateful (hook-using) federation between two independently-built
  Next apps needs further work; sidestepped rather than blocked on, per below.
- **Disposition:** Spike `host/`/`remote/` source removed after the verdict
  per project policy (matching I-006's own disposal); `README.md` retained
  as the evidence record.

#### Adopted implementation: `next/remote` + `next/host`

- **Architectural choice, not a workaround:** the Federation-exposed component
  (`next/remote/components/federated-monitor.tsx`) is deliberately stateless —
  it takes `selectedId`/`acknowledgedIds` as props and reports selection/
  acknowledgement via callbacks, exactly mirroring how the Host already owns
  composition and event-ledger state. This sidesteps I-018 entirely (no
  hooks in the exposed component ⇒ no need for cross-bundle React singleton
  sharing) rather than depending on that unresolved gap being fixed.
- Extracted a shared, hook-free `components/monitor-view.tsx` out of the
  existing `Monitor` component so the stateful (`Monitor`, used by Standalone
  and Remote's own direct preview) and stateless (`FederatedMonitor`, used by
  Federation) variants render identical markup from one source instead of
  two copies that could drift.
- `next/remote/next.config.ts`: `output.publicPath` (absolute, env-driven),
  `output.uniqueName`, `optimization.runtimeChunk = false`, CORS on
  `/_next/static/:path*`, `Cache-Control: no-store` specifically on
  `remoteEntry.js`, `ModuleFederationPlugin` exposing `./FederatedMonitor`.
  `next/host/next.config.ts`: the same `uniqueName`/`runtimeChunk` treatment
  plus `remotes` pointing at the Remote's `remoteEntry.js`, applied to both
  `isServer` compilations (step 2 above). Both apps' `dev`/`build` scripts
  gained `--webpack` (Turbopack cannot run webpack plugins). Both required
  `transpilePackages: ['@pilot/contracts', '@pilot/fixtures',
  '@pilot/design-tokens']` — webpack (unlike Turbopack) needs to be told
  explicitly to transform raw-TS workspace packages resolved outside the
  app's own directory via pnpm's symlinks.
- `next/host/components/federation-panel.tsx`: a class-based
  `FederationErrorBoundary` (`getDerivedStateFromError`, no hook-based
  equivalent exists in React) wraps a `Suspense` around
  `lazy(loadFederatedMonitor)`; `key={attempt}` on the boundary forces a full
  remount on Retry so `hasError` resets and a fresh `lazy()`/`import()` is
  attempted. `next/host/lib/load-federated-monitor.ts` isolates the bare
  `next_remote/FederatedMonitor` specifier in its own module — Vite/Vitest
  cannot resolve that specifier (it only exists as a webpack `remotes`
  alias), so every test mocks the *wrapper module* rather than the raw
  specifier, mirroring how the Vue Host's tests mock `@module-federation/
  runtime` instead of trying to resolve a remote entry URL.
- **Live browser verification** (Playwright MCP, real `next start` previews,
  `127.0.0.1:3000`/`3001`): Federation tab renders the real, hooks-based
  Monitor — Model X, healthy, pulse rail. Clicking the degraded node updates
  the federated view (Model X / degraded / 2/4 / 412ms / acknowledge alert)
  *and* posts a Host-ledger entry (`federation` badge, `deploy-002`).
  Clicking Acknowledge dismisses the alert and posts a second ledger entry.
  Zero console errors throughout.
- **Tests:** `federated-monitor.test.tsx` (4, stateless-controlled behavior),
  `federation-panel.test.tsx` (2, lazy-load + state ownership + context-change
  reset), `federation-panel-error.test.tsx` (2, fallback + retry). `next/
  remote` grew from 25 → 29 tests, `next/host` from 39 → 42 (net, after also
  removing the four `federation-unsupported` tests).
- **Removed:** `components/federation-unsupported.tsx` and its test — no
  longer accurate now that Federation actually works.

#### Playwright Test E2E

- Added `@playwright/test@1.62.0`, `playwright.config.ts` (six `webServer`
  entries — three `vite preview`, three `next start` — `reuseExistingServer`
  outside CI), `e2e/origins.ts`, and six spec files: `remote-standalone`,
  `standalone-baseline`, `vue-composition` (Federation + iframe),
  `next-composition` (iframe + the new real Federation),
  `remote-recovery` (iframe outage/retry × {Vue, Next}, Federation
  outage/retry × {Vue, Next}, via `page.route(...).abort()`/`.continue()`
  rather than actually killing a server process — deterministic, no
  process-lifecycle races, and it exercises the identical fallback/retry UI
  contract either way).
- **`16/16` passing.** Two authoring bugs caught and fixed before the first
  full green run: `getByText('degraded')` and `getByText('Model X')` each
  matched two elements (a `CardDescription`/`Select`-value plus an
  `AlertTitle`/`CardTitle`) under Playwright's strict mode; both narrowed to
  `{ exact: true }`.
- `next-composition.spec.ts`'s Federation test, written for D-007's
  now-removed `FederationUnsupported` state, was rewritten to assert the
  real working panel instead.

#### Lint fix

- `pnpm lint` failed after the federation config landed:
  `@typescript-eslint/no-require-imports` on the `require('next/dist/
  compiled/webpack/webpack')` calls in both `next.config.ts` files. This
  `require()` is intentional — there is no ESM-importable type surface for
  Next's internal bundled webpack, and importing a separate `webpack`
  devDependency risks a version mismatch with whatever Next bundles
  internally. Added scoped `eslint-disable-next-line` comments (on the exact
  line, not a multi-line block — an `eslint-disable-next-line` followed by a
  *second* `//` comment line only disables the line immediately below the
  first comment, not the one after the second; this bit twice while writing
  the fix).

#### Open issue

- **I-018 — Async React-singleton sharing between independently-built Next
  apps does not complete.** `shared: { react: { singleton: true }, ... }`
  (non-eager, the webpack default) leaves `container.get()` resolving
  correctly when called manually from the console, but the page's own
  `React.lazy`/`import()` promise never settles — no thrown error, no
  console warning, just a permanent pending state. `eager: true` instead
  produces an immediate uncaught `ScriptExternalLoadError`. Not blocking:
  the adopted Federation implementation is fully stateless and needs no
  singleton sharing. Would matter for a future federated surface that
  genuinely needs Host and Remote to share one React instance (e.g. context
  providers spanning the boundary). Candidates not yet tried: a
  hand-written synchronous shared-scope handshake instead of relying on
  webpack's generated async negotiation, or fully bundling react/react-dom
  into the remote (no sharing at all) and accepting the bundle-size cost.
- **Full workspace verification:** `pnpm lint && pnpm typecheck && pnpm test
  && pnpm build` all exit `0`. `pnpm e2e` — `16/16`. Test count:
  `237/237` (`@pilot/contracts` 9, `@pilot/design-tokens` 7, `@pilot/
  fixtures` 6, `next-remote` 29, `next-standalone` 31, `next-host` 42,
  `vue-host` 48, `vue-remote` 26, `vue-standalone` 39).
- **Scope boundary:** No commit, remote creation/configuration, push, or
  release operation was performed. The structured Section 11 Playwright MCP
  live-QA matrix, the README rewrite, and 130% screenshots remain open —
  see `TASK.md` Section 14, Stage C/D.

### D-009 — Structured Playwright MCP live QA: 3 real defects found and fixed

- **Status:** Resolved. Full 8-surface × 3-breakpoint live QA pass completed
  (`docs/validation/playwright-mcp-v0.1.0.md`), surfacing three genuine
  defects invisible to the unit/component/E2E suite, all fixed and
  re-verified.
- **Tooling note:** An early attempt to test keyboard activation used the
  Claude Code Browser pane's `computer` tool (`key` action). `Enter`/`Space`
  on a focused pulse-rail button, and `ArrowRight` on Vue Host's
  reka-ui-built composition Tabs, both appeared to do nothing — no state
  change, no error. Since reka-ui's Tabs is mature, widely-used library
  code, both failing identically pointed at the tool, not the app. Confirmed
  by switching to the real Microsoft Playwright MCP server
  (`playwright-project`, `@playwright/mcp@0.0.78`): the identical `Enter`
  key press correctly activated the same button on the first try. All
  keyboard findings in the QA report are from Playwright MCP; the Browser
  pane limitation is not a project defect.
- **Defect 1 — `DataCloneError` on every Vue Host iframe context sync.**
  Switching Vue Host to iframe mode threw
  `Failed to execute 'postMessage' on 'Window': #<Object> could not be
  cloned` on load and on every context change. Root cause:
  `IframePanel.vue` passes `props.context` — bound to `App.vue`'s
  `ref<DeploymentContext>(...)`, therefore a Vue reactive `Proxy` — straight
  into `postContextToRemote`, and the structured-clone algorithm
  `postMessage` uses cannot clone a Proxy. Fixed in
  `vue/host/src/lib/hostFrameAdapter.ts`: `postContextToRemote` now builds a
  plain `{ clusterId, modelId, environment }` object before posting.
  Console errors: 2 → 0 on the identical interaction after the fix.
  `48/48` `vue-host` unit tests still passed throughout — the existing test
  posts a plain-object fixture directly, so it structurally could not catch
  a defect that only exists when the caller is a live reactive Vue
  component. This is the second time this project has found a real defect
  that only a live browser pass could catch (the first was D-005's iframe
  outage-recovery regression); both are now explicit evidence for why
  Section 11 exists as a gate and not an optional nice-to-have.
- **Defect 2 — Module Federation silently drops the exposed component's own
  CSS.** At `768px`, Next Host's Federation-mode Monitor rendered
  `REPLICAS`/`P95 LATENCY` with zero gap between them
  (`getComputedStyle(dl).gap` was `"normal"`, not the intended `32px`).
  Root cause, confirmed via computed style before/after: `next/host`'s
  Tailwind v4 build only scans `next/host`'s own source tree. It has no
  visibility into `next/remote`'s component source, so any Tailwind utility
  class the federated `FederatedMonitor` uses that isn't *also*
  independently used somewhere inside `next/host` (here, `gap-8`) never
  gets a compiled CSS rule at all — Module Federation carries the
  component's JS across the origin boundary, not its CSS. Fixed by adding
  `@source "../../remote/components";` and `@source "../../remote/app";`
  to `next/host/app/globals.css`, so Tailwind pre-emptively compiles every
  utility class the federated component might reach for. This is a real,
  generalizable Module-Federation-plus-Tailwind finding, not a one-off
  typo — documented inline at the fix site for the next person who adds a
  Tailwind class to `next/remote`'s exposed component and wonders why it
  has no effect inside the Host.
- **Defect 3 — Vue and Next disagreed on their own tablet breakpoint.** Vue
  Host/Standalone collapse their two-column composed layout to one column
  at `900px` (a custom `@media` rule matching `docs/design-direction.md`).
  Next Host/Standalone used Tailwind's default `md:` prefix, which is
  `768px` — so at exactly `768×1024`, this report's own tablet breakpoint,
  the two tracks rendered different layouts for the identical scenario.
  Fixed by changing `md:grid-cols-…` to `min-[900px]:grid-cols-…` in both
  `next/host/app/page.tsx` and `next/standalone/app/page.tsx`. Verified
  visually: both tracks now show the single-column stacked layout at
  `768×1024`.
- **Non-defects investigated and closed:** a `favicon.ico` `404` on all six
  apps (cosmetic, present on every surface identically, not fixed); a
  `[ Federation Runtime ]: The remote "vue_remote" is already registered`
  console warning when re-entering Federation mode after visiting iframe
  mode (the documented, intentional side effect of `loadFederatedMonitor`'s
  `force: true` re-registration — functionality confirmed unaffected).
- **Confirmed, not just claimed:** `focus-visible` renders pixel-identical
  across frameworks (`2px solid hsl(var(--platform-accent))`, `2px` offset)
  — checked via computed style on both Vue Remote and Next Remote, not just
  inferred from shared design tokens. Full keyboard-only flow (Select
  open/choose, composition-tab arrow-key switching, pulse-rail selection,
  Acknowledge) confirmed working end-to-end on every one of the 8 surfaces.
  Remote-entry/chunk network requests for both Federation implementations
  returned `200` with no CORS failures.
- **Scope boundary of this pass:** Remote stop/fallback/retry was not
  re-driven interactively — this MCP server's exposed tool surface has no
  network-route-interception tool — and instead relied on
  `e2e/remote-recovery.spec.ts` (4/4, re-run at the end of this pass). A
  scripted, repeatable `e2e/keyboard-flow.spec.ts` remains open; this pass
  verified keyboard flow live but manually.
- **Full workspace re-verification after all three fixes:** `pnpm lint &&
  pnpm typecheck && pnpm test && pnpm build` all exit `0` (`237/237` tests,
  unchanged pass count — none of the three fixes touched tested surface
  area in a way existing tests could have caught, which is exactly the
  point). `pnpm e2e` → `16/16`, re-run clean after the fixes.
- **Scope boundary:** No commit, remote creation/configuration, push, or
  release operation was performed. README rewrite and 130% screenshots
  remain open — see `TASK.md` Section 14, Stage D.

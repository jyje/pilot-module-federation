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
- [ ] Review and approve the revised initial commit message.

### Revised draft commit proposal

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
- [ ] Lock reviewed exact versions in `package.json` and `pnpm-lock.yaml`.
- [ ] Do not silently downgrade Next.js to obtain federation compatibility.

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

- [ ] If `VALIDATED`, implement Next Federation in the main Next apps. — N/A, not validated.
- [ ] If `PARTIAL`, include it only if constraints are owner-approved and reproducible. — N/A, not partial.
- [x] If `INVALIDATED`, implement latest Next standalone + iframe only and document the federation incompatibility.
- [x] Never mark Next Federation complete without observed browser evidence. (None claimed; none was collected.)

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

### Parallel development commands

- [ ] Add `pnpm dev` to run all six app servers in parallel.
- [ ] Add `pnpm dev:composed` to run the four Host/Remote servers.
- [ ] Add `pnpm dev:standalone` to run the two Standalone baselines.
- [ ] Add `pnpm dev:vue` to run Vue Host, Remote, and Standalone.
- [ ] Add `pnpm dev:next` to run Next Host, Remote, and Standalone.
- [ ] Stream package-prefixed logs.
- [ ] Verify Ctrl+C terminates all child servers.
- [ ] Add filtered one-app commands to README.

### Port allocation

- [x] Vue Host: `4173`. (Production preview verified at `http://127.0.0.1:4173/` during D-005.)
- [x] Vue Remote: `4174`. (Verified via `vite preview` + `curl` in D-003.)
- [x] Vue Standalone: `4175`. (Verified via `vite preview` + `curl` in D-004.)
- [ ] Next Host: `3000`.
- [ ] Next Remote: `3001`.
- [ ] Next Standalone: `3002`.

## 5. Shared domain contracts and fixtures

- [x] Define `DeploymentContext`.
- [x] Define `ModelDeployment`.
- [x] Define `MonitorEvent` union.
- [x] Define framework and composition-mode labels for comparison UI. (`FrameworkTrack`, `CompositionMode` in `@pilot/contracts`.)
- [x] Create deterministic fixture clusters, models, deployments, metrics, and timeline events. (`@pilot/fixtures`.)
- [x] Keep shared packages framework-neutral.
- [x] Do not put React, Vue, Router, or stores in shared packages.
- [x] Add contract and fixture tests first. (RED/GREEN evidence in `LOG.md` D-002.)
- [ ] Confirm both framework tracks render the same fixture semantics. — Deferred until apps consume the fixtures (Section 8/9).

## 6. Frontend design review

Use `.claude/skills/frontend-design/SKILL.md` before production UI.

- [ ] Define audience: AI platform operator / MLOps engineer.
- [ ] Define Host job: choose context and coordinate platform surfaces.
- [ ] Define Remote job: inspect model deployment health and act on events.
- [ ] Produce two design directions.
- [ ] Review directions with owner.
- [ ] Select one visual direction.
- [ ] Define shared semantic color tokens.
- [ ] Define display, body, and utility typography.
- [ ] Define Host and Remote desktop wireframes.
- [ ] Define mobile behavior.
- [ ] Define one signature visual/interaction tied to model deployment status.
- [ ] Reject generic centered-hero/dashboard-card defaults unless justified.
- [ ] Confirm focus-visible and reduced-motion behavior.

**Gate:** Do not finalize shadcn components or styling before this review.

## 7. shadcn parity setup

### Next Host, Remote, and Standalone

- [ ] Initialize all three with official `shadcn` CLI.
- [ ] Use the same base style and semantic tokens.
- [ ] Add only required components: Button, Badge, Card, Tabs, Table/List, Alert, Skeleton, Tooltip, Select.
- [ ] Keep generated component source within each app unless a reviewed React UI package is justified.

### Vue Host, Remote, and Standalone

- [ ] Initialize all three with `shadcn-vue`.
- [ ] Use equivalent base style and shared semantic tokens.
- [ ] Add equivalent required components.
- [ ] Keep Vue-generated component source within each app unless a reviewed Vue UI package is justified.

### Parity gate

- [ ] Compare component roles, spacing, typography, states, and accessibility.
- [ ] Do not claim byte-identical rendering.
- [ ] Document official shadcn/ui vs shadcn-vue provenance accurately.

## 8. Vue 3 applications

### Vue Remote — standalone Model Deployment Monitor

- [x] Scaffold Vue 3 + TypeScript + Vite.
- [x] Build standalone route/context loading.
- [x] Build deployment summary, status, replicas, p95 latency, and timeline.
- [x] Emit semantic monitor events.
- [ ] Add accessible loading, empty, error, and degraded states.
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
- [ ] Verify routing behavior. (The current Vue pilot has no router; do not infer Back/Forward behavior.)
- [x] Verify `remoteEntry.js` and chunks from Remote origin.
- [ ] Compare Federation and iframe behavior with the same fixture/context.

## 9. Latest Next.js applications

### Next Remote — standalone Model Deployment Monitor

- [ ] Scaffold the latest Next.js with TypeScript.
- [ ] Use App Router for the main standalone/iframe app unless the validated federation path requires a separate Pages Router boundary.
- [ ] Initialize official shadcn/ui.
- [ ] Implement the same domain semantics as Vue Remote.
- [ ] Verify standalone production build and direct URL.

### Next Host — AI Platform Console

- [ ] Scaffold the latest Next.js with TypeScript.
- [ ] Initialize official shadcn/ui.
- [ ] Implement the same Host context and event semantics as Vue Host.
- [ ] Add composition selector for implemented modes.

### Next Standalone — non-composed baseline

- [ ] Implement the same Console context and Monitor functionality in one latest-Next application.
- [ ] Reuse only framework-neutral contracts, fixtures, and design tokens.
- [ ] Do not import `next/remote` source or use Module Federation/iframe.
- [ ] Verify direct URL, navigation, interactions, and production build.
- [ ] Record setup/runtime differences from the composed modes.

### Next iframe comparison

- [ ] Embed Next Remote standalone URL.
- [ ] Apply the same exact-origin message contract as Vue.
- [ ] Verify context, events, history, unavailable state, and recovery.

### Conditional Next Federation

- [ ] Apply only the spike-proven configuration.
- [ ] Keep Pages/App Router and Webpack constraints explicit.
- [ ] Verify real Remote entry, chunks, refresh, console, and events.
- [ ] If not validated, omit this route and show an evidence-backed “unsupported in this version” comparison state.

## 10. Automated tests

### Framework unit/component tests

- [x] Vue contract adapter tests.
- [x] Vue Remote component tests.
- [x] Vue Host integration tests.
- [ ] Next contract adapter tests.
- [ ] Next Remote React component tests.
- [ ] Next Host integration tests.
- [x] iframe message origin/schema tests.

### Build tests

- [x] Build `vue-host` independently. (D-005: `vue-tsc --noEmit && vite build` succeeds.)
- [x] Build `vue-remote` independently. (D-003 and re-verified in D-005.)
- [x] Build `vue-standalone` independently. (See D-004: `vue-tsc --noEmit && vite build` succeeds, plain Vite SPA output, no federation artifacts.)
- [x] Build `next-host` independently. (Root `pnpm build` succeeds; current scaffold output.)
- [x] Build `next-remote` independently. (Root `pnpm build` succeeds; current scaffold output.)
- [x] Build `next-standalone` independently. (Root `pnpm build` succeeds; current scaffold output.)
- [x] Build all packages from root. (`pnpm build` passes across all nine workspace packages with build scripts.)

### Playwright Test E2E

- [ ] Manage all required preview servers in `playwright.config.ts`.
- [ ] Test both directly previewable Remotes.
- [ ] Test both non-composed Standalone baselines.
- [ ] Test Vue iframe.
- [ ] Test Vue Federation.
- [ ] Test Next iframe.
- [ ] Test Next Federation only if validated.
- [ ] Test Host/Remote event synchronization.
- [ ] Test browser Back/Forward.
- [ ] Test Remote stop, fallback, restart, and retry.
- [ ] Test keyboard flow and focus.

### Required root commands

- [x] `pnpm lint` (passes; current workspace packages have no package-level lint command to run.)
- [x] `pnpm typecheck`
- [x] `pnpm test`
- [x] `pnpm build`
- [ ] `pnpm e2e`

## 11. Microsoft Playwright MCP validation

### Project setup

- [ ] Verify Node.js 18+.
- [ ] Add project-scope MCP:

```bash
claude mcp add --scope project playwright -- npx @playwright/mcp@latest
```

- [ ] Review generated `.mcp.json`.
- [ ] Confirm `claude mcp list` reports Playwright connected.
- [ ] Record resolved MCP version.
- [ ] Decide whether to pin the MCP version before any eventual push.

### Live QA matrix

- [ ] Vue Remote standalone.
- [ ] Vue non-composed Standalone baseline.
- [ ] Vue Host Federation.
- [ ] Vue Host iframe.
- [ ] Next Remote standalone.
- [ ] Next non-composed Standalone baseline.
- [ ] Next Host iframe.
- [ ] Next Host Federation if validated.
- [ ] Accessibility snapshots and landmark review.
- [ ] Keyboard-only navigation and focus review.
- [ ] Host/Remote context and event interactions.
- [ ] Console error/warning review.
- [ ] Network, Remote entry, chunk, and CORS review.
- [ ] Remote stop/fallback/restart/retry review.
- [ ] Desktop `1440 × 900`.
- [ ] Tablet `768 × 1024`.
- [ ] Mobile `390 × 844`.
- [ ] Record results in `docs/validation/playwright-mcp-v0.1.0.md`.

## 12. README comparison and 130% screenshots

Use `.claude/skills/centered-readme/SKILL.md`.

### README content

- [ ] Centered project hero for `jyje/pilot-module-federation`.
- [ ] `v0.0.1` Draft status until release gate.
- [ ] Four-app architecture diagram.
- [ ] pnpm monorepo and parallel-server explanation.
- [ ] Product scenario and standalone/federated value.
- [ ] Vue and Next outcome matrix.
- [ ] Module Federation vs iframe comparison.
- [ ] Web Components and single-spa alternatives.
- [ ] shadcn/ui vs shadcn-vue provenance.
- [ ] Next latest federation compatibility evidence.
- [ ] Start, build, test, and MCP validation commands.
- [ ] Known limitations and deferred work.

### Screenshot policy

- [ ] Capture production previews through Playwright MCP.
- [ ] Use viewport `1440 × 900` for README desktop captures.
- [ ] Inject temporary `document.documentElement.style.zoom = "1.3"` for capture only.
- [ ] Wait for fonts, Remote chunks, and animation to settle.
- [ ] Remove zoom after capture; never add it to production CSS.
- [ ] Use full-width images, not small side-by-side thumbnails.
- [ ] Use meaningful alt text.
- [ ] Add a filled-triangle caption with wording identical to alt text.
- [ ] Review readability in GitHub Markdown preview.

### Required images

- [ ] Vue Host + Federation.
- [ ] Vue Remote standalone.
- [ ] Vue non-composed Standalone baseline.
- [ ] Vue iframe comparison.
- [ ] Next Remote standalone.
- [ ] Next non-composed Standalone baseline.
- [ ] Next iframe comparison.
- [ ] Next Host + Federation only if validated.

## 13. `v0.1.0` first-push gate

### Functional

- [ ] Six applications run and build independently.
- [ ] `pnpm dev` runs six servers in parallel.
- [ ] `pnpm dev:composed` runs four Host/Remote servers.
- [ ] `pnpm dev:standalone` runs two non-composed baselines.
- [ ] Vue Federation works.
- [ ] Vue iframe works.
- [ ] Next iframe works.
- [ ] Next Federation verdict is honest and documented.
- [ ] Each Remote is useful standalone.

### Quality

- [x] Shared contract and fixture tests pass.
- [x] Lint command passes. (No package-level lint command is currently registered; add actual lint scripts before treating this as a substantive code-quality gate.)
- [x] Typecheck passes.
- [x] Unit/component tests pass.
- [x] Four independent builds pass. (All six current app builds also pass.)
- [ ] Applicable Playwright Test E2E passes.
- [ ] Playwright MCP validation report passes.
- [ ] No unresolved console, network, CORS, accessibility, or responsive defect remains.

### Documentation

- [ ] README reflects measured outcomes, not planned claims.
- [ ] Alternatives comparison is complete.
- [ ] 130% screenshots are readable and accurately captioned.
- [ ] Next and Vue shadcn provenance is accurate.
- [ ] `TASK.md` contains no false completed item.

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

## Review notes

- Latest Next Federation spike policy:
- App Router vs Pages Router decision after spike:
- MCP version pinning:
- Screenshot tracking policy:
- Hosted demo requirement for `v0.1.0`:
- Approved deferred scope:

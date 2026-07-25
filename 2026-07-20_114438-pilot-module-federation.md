# Cross-framework UI-in-UI Module Federation pilot implementation plan

**Language:** [English](2026-07-20_114438-pilot-module-federation.md) · [한국어](2026-07-20_114438-pilot-module-federation-ko.md)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task after the owner approves `TASK.md`.

**Goal:** Build one local-first pilot that compares the same UI-in-UI scenario across Vue 3 and the latest Next.js, using Host, Remote, and non-composed Standalone applications per framework and documenting Module Federation against iframe, Web Components, and orchestration alternatives.

**Architecture:** A pnpm workspace contains six applications: Host, Remote, and Standalone for Vue and for Next. Each Remote is directly previewable and can be embedded by its Host. Each Standalone is a separate non-composed baseline that implements the Console and Monitor in one app without importing Remote source. Vue uses Vite Module Federation as the primary working implementation. Latest Next.js Module Federation starts with a high-risk compatibility spike because the official Next federation plugin does not currently declare support for Next 16 or App Router; Next always includes iframe and non-composed Standalone comparisons, and only claims Federation if the spike proves it.

**Tech Stack:** pnpm workspaces, TypeScript, Vue 3, Vite, `@module-federation/vite`, latest Next.js, React, Vercel shadcn/ui for Next, shadcn-vue for Vue, Vitest, Vue Test Utils, React Testing Library, Playwright Test, Microsoft Playwright MCP.

**Version state:** `v0.0.1` Draft. Version readiness never authorizes a push; push remains blocked until the owner separately says that remote push is currently possible and approves the exact command.

---

## 1. Confirmed product scenario

### Federated use

The **AI Platform Console** Host renders a **Model Deployment Monitor** Remote inside a selected cluster/model workspace.

```text
AI Platform Console (Host)
├── global navigation
├── cluster and model context
├── framework/composition selector
└── Model Deployment Monitor (Remote)
    ├── deployment health
    ├── replica and latency summary
    ├── event timeline
    └── deployment-selected / alert-acknowledged events
```

### Standalone use

The same Remote runs as a dedicated operations dashboard. An operator can open the monitor directly on a wallboard, bookmark a deployment URL, or use it when the full platform console is unavailable.

### Why this example fits the pilot

- The embedded Remote is useful within a larger product context.
- The standalone Remote remains a complete, understandable UI.
- Host-to-Remote context and Remote-to-Host events have clear meanings.
- The same fixture data and user flow can be reproduced in Vue and Next for a fair comparison.
- Loading, CORS, routing, style isolation, failure, and recovery are visible to a reviewer.

---

## 2. Evidence-based framework constraints

Research snapshot on 2026-07-20:

| Package | Observed version | Relevant constraint |
| --- | --- | --- |
| `vue` | `3.5.40` | Supported by the Vue/Vite track |
| `next` | `16.2.11` | Latest observed Next.js |
| `@module-federation/vite` | `1.19.1` | Peer range includes Vite 5–8 |
| `@module-federation/nextjs-mf` | `8.8.71` | Peer range declares Next 12–15 only |
| `shadcn` | `4.14.1` | Official React/Next CLI and components |
| `shadcn-vue` | `2.8.0` | Vue port with similar design/component model |

### Next.js risk statement

The Module Federation Next.js documentation currently says:

- App Router is not supported.
- Pages Router is supported.
- Supported Next versions are 12–15.
- Next.js support is ending / in maintenance mode.
- Local webpack internals are required.

Therefore the plan does **not** promise that latest Next.js 16 Module Federation works. It performs a minimal spike first and reports one of three outcomes:

- `VALIDATED`: Next 16, Pages Router, Webpack, and `nextjs-mf` work for the required client-side Remote component.
- `PARTIAL`: the Remote loads only with constraints that are too narrow or unstable for the main comparison.
- `INVALIDATED`: latest Next cannot use this plugin reliably; the Next track remains latest Next standalone + iframe and the README records the evidence.

No silent downgrade to Next 15 is allowed. A Next 15 compatibility variant may be proposed later as a separate comparison.

### shadcn naming accuracy

- Next applications use Vercel's official `shadcn/ui` tooling and React components.
- Vue applications use `shadcn-vue`, a Vue port, because Vercel's React components cannot run natively in Vue.
- Both tracks share visual tokens and the same component roles, but the README must not call shadcn-vue an official Vercel Vue package.

---

## 3. Composition methods to implement and compare

| Method | Vue track | Latest Next track | Purpose |
| --- | --- | --- | --- |
| Module Federation | Required primary implementation | Compatibility spike; implement only if validated | Runtime component composition and independent artifacts |
| iframe | Required comparison route | Required comparison route | Strong document isolation and latest-Next fallback |
| Remote direct preview | Required | Required | Prove the Remote is independently inspectable and useful |
| Non-composed Standalone baseline | Required | Required | Compare against one app with no runtime composition boundary |
| Web Components | Document only in `v0.0.1` | Document only | Framework-neutral alternative |
| single-spa | Document only | Document only | Route/parcel orchestration alternative |

The README recommends Module Federation when framework/tooling support is healthy and the UI needs native DOM composition. It recommends iframe when hard isolation or unsupported framework versions outweigh tighter integration.

---

## 4. pnpm monorepo decision

A pnpm workspace provides:

- One repository and lockfile for six applications and shared packages.
- Workspace linking for contracts, fixtures, and design tokens.
- Filtered commands for one app or one framework.
- Recursive/parallel commands for all development servers.
- Central lint, typecheck, test, and build orchestration without pretending the apps share runtime state.

It does not automatically mean “all servers run together,” but root scripts can do that explicitly.

Planned root commands:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel --stream --filter './vue/**' --filter './next/**' dev",
    "dev:composed": "pnpm -r --parallel --stream --filter './vue/host' --filter './vue/remote' --filter './next/host' --filter './next/remote' dev",
    "dev:standalone": "pnpm -r --parallel --stream --filter './vue/standalone' --filter './next/standalone' dev",
    "dev:vue": "pnpm -r --parallel --stream --filter './vue/**' dev",
    "dev:next": "pnpm -r --parallel --stream --filter './next/**' dev",
    "build": "pnpm -r --filter './packages/**' --filter './vue/**' --filter './next/**' build",
    "test": "pnpm -r --filter './packages/**' --filter './vue/**' --filter './next/**' test"
  }
}
```

Exact pnpm selector syntax must be verified after package manifests exist. The acceptance criterion is observable: `pnpm dev` starts four named servers with streamed, prefixed logs and exits cleanly when interrupted.

---

## 5. Corrected repository structure

```text
pilot-module-federation/
├── vue/
│   ├── host/                     # AI Platform Console that composes Remote
│   ├── remote/                   # Model Deployment Monitor MFE + direct preview
│   └── standalone/               # Non-composed Console + Monitor baseline
├── next/
│   ├── host/                     # AI Platform Console that composes Remote
│   ├── remote/                   # Model Deployment Monitor + direct preview
│   └── standalone/               # Non-composed Console + Monitor baseline
├── packages/
│   ├── contracts/                # Framework-neutral TypeScript contracts
│   ├── fixtures/                 # Shared deterministic model/deployment data
│   └── design-tokens/            # Shared CSS variables and semantic tokens
├── spikes/
│   └── next-latest-federation/
│       └── README.md             # VALIDATED / PARTIAL / INVALIDATED evidence
├── e2e/
│   ├── vue-federation.spec.ts
│   ├── vue-iframe.spec.ts
│   ├── next-federation.spec.ts   # Present only if spike validates
│   ├── next-iframe.spec.ts
│   └── standalone-remotes.spec.ts
├── docs/
│   ├── architecture.md
│   ├── comparison.md
│   ├── decisions/
│   │   └── 0001-composition-methods.md
│   └── validation/
│       ├── playwright-mcp-v0.1.0.md
│       └── readme-screenshots.md
├── artifacts/
│   └── screenshots/
│       └── readme/
├── .claude/skills/
├── .mcp.json                     # Added by project-scope Playwright MCP setup
├── CLAUDE.md
├── README.md
├── TASK.md
├── 2026-07-20_114438-pilot-module-federation.md
├── package.json
├── pnpm-workspace.yaml
├── playwright.config.ts
└── pnpm-lock.yaml
```

### Ports

| App | Port | Standalone URL |
| --- | ---: | --- |
| Vue Host | 4173 | `http://127.0.0.1:4173` |
| Vue Remote | 4174 | `http://127.0.0.1:4174` |
| Vue Standalone | 4175 | `http://127.0.0.1:4175` |
| Next Host | 3000 | `http://127.0.0.1:3000` |
| Next Remote | 3001 | `http://127.0.0.1:3001` |
| Next Standalone | 3002 | `http://127.0.0.1:3002` |

---

## 6. Shared scenario contract

`packages/contracts` defines framework-neutral data, not components or stores.

```ts
export type FrameworkTrack = 'vue' | 'next'
export type CompositionMode = 'federation' | 'iframe' | 'standalone'
export type Environment = 'production' | 'staging'

export interface DeploymentContext {
  clusterId: string
  modelId: string
  environment: Environment
}

export interface ModelDeployment {
  id: string
  modelName: string
  status: 'healthy' | 'degraded' | 'deploying' | 'paused'
  replicas: { ready: number; desired: number }
  p95LatencyMs: number
}

export type MonitorEvent =
  | { type: 'deployment-selected'; deploymentId: string }
  | { type: 'alert-acknowledged'; deploymentId: string }
  | { type: 'environment-changed'; environment: Environment }
```

Ownership rules:

- Host chooses framework track, composition mode, cluster, model, and environment.
- Remote owns monitor tabs, filters, timeline display, and local presentation state.
- Federation uses typed props/events.
- iframe uses the same semantic contract over `postMessage` with exact origin checks.
- Remote direct preview reads equivalent context from its own URL.
- Non-composed Standalone owns the same context and Monitor functionality inside one application without importing Remote source.
- No shared runtime store crosses an application boundary.

---

## 7. Design-system parity

Use the local `frontend-design` skill before UI implementation.

### Required component roles

Both tracks implement equivalent roles with framework-native shadcn variants:

- Button
- Badge
- Card
- Tabs
- Table or item list
- Alert
- Skeleton
- Tooltip
- Select

### Shared tokens

`packages/design-tokens` publishes semantic CSS variables, for example:

```css
:root {
  --platform-background: 220 24% 8%;
  --platform-surface: 220 19% 12%;
  --platform-border: 218 16% 24%;
  --platform-foreground: 210 20% 96%;
  --platform-muted: 215 14% 66%;
  --platform-accent: 188 84% 48%;
  --platform-warning: 38 92% 55%;
}
```

The final palette, typography, and signature element require owner review. “Same design” means semantic parity and recognizable component roles, not byte-identical framework output.

---

## 8. Implementation sequence

### Phase A — owner review and documentation correction

1. Approve this corrected plan and `TASK.md`.
2. Update README/CLAUDE name, version, six-app scope, and links.
3. Approve the initial local `v0.0.1` commit.

### Phase B — highest-risk Next compatibility spike

1. Resolve and record the latest Next version at implementation time.
2. Build minimal Next Host and Remote spike apps with no shadcn or product UI.
3. Try Pages Router + local Webpack + `nextjs-mf` without hiding peer warnings.
4. Verify real Remote rendering, browser console, network chunks, and refresh.
5. Record `VALIDATED`, `PARTIAL`, or `INVALIDATED` in `spikes/next-latest-federation/README.md`.
6. Delete disposable spike code after the verdict; preserve the evidence document.

### Phase C — workspace and shared packages

1. Create pnpm workspace and root scripts.
2. Add contracts, fixtures, and design-token packages.
3. Add test-first contract validation.
4. Verify one-app, composed-only, standalone-only, per-framework, and six-server commands.

### Phase D — frontend design review

1. Produce two design directions for AI Platform Console / Model Deployment Monitor.
2. Review tokens, typography, responsive layout, and signature element.
3. Select one direction before product UI implementation.

### Phase E — Vue 3 track

1. Scaffold Vue Host and Remote.
2. Install shadcn-vue components.
3. Build standalone Remote.
4. Build iframe route with exact-origin `postMessage` contract.
5. Build Vite Module Federation Remote exposure and Host consumption.
6. Add loading, error, timeout, retry, routing, and event handling.
7. Build a separate non-composed Standalone Console + Monitor baseline.
8. Test unit, build, Remote preview, Standalone, iframe, and federation modes.

### Phase F — latest Next track

1. Scaffold latest Next Host and Remote with official shadcn/ui.
2. Build standalone Remote.
3. Build a separate non-composed Standalone Console + Monitor baseline.
4. Build iframe route with exact-origin `postMessage` contract.
5. If Phase B is `VALIDATED`, build the proven Federation path and test it.
6. If Phase B is `PARTIAL` or `INVALIDATED`, do not ship an unstable plugin path; document why the Next track differs.

### Phase G — cross-framework comparison

1. Use identical fixtures and semantic events.
2. Compare setup, runtime loading, failure isolation, routing, styles, bundle boundaries, and developer experience.
3. Explain Web Components and single-spa as documented alternatives.
4. Recommend by context, not one universal winner.

### Phase H — automated and MCP validation

1. Run framework unit/component tests.
2. Build all six apps independently.
3. Run Playwright Test against standalone, iframe, and supported federation modes.
4. Run Microsoft Playwright MCP for accessibility snapshots, interaction, console, network, failure/recovery, and responsive QA.
5. Record evidence under `docs/validation/`.

### Phase I — README screenshot and release review

1. Capture full-width README screenshots at a deterministic 130% presentation scale.
2. Review captions, alt text, ordering, and readability.
3. Update comparison table with measured outcomes.
4. Complete the `v0.1.0` gate.
5. Keep push blocked until the owner separately says that push is currently possible, regardless of version readiness.

---

## 9. Automated validation matrix

| Track | Remote preview | Non-composed Standalone | iframe | Federation | Failure/recovery |
| --- | --- | --- | --- | --- | --- |
| Vue 3 | Required | Required | Required | Required | Required |
| Latest Next | Required | Required | Required | Conditional on spike | Required for implemented modes |

Required root commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

Additional acceptance:

- `pnpm dev` starts six servers in parallel with readable prefixed logs.
- `pnpm dev:composed` starts four Host/Remote servers.
- `pnpm dev:standalone` starts two non-composed baselines.
- Each app can start and build alone.
- Remote URLs work independently.
- No Host imports Remote source files directly.
- iframe messages validate both `event.origin` and message shape.
- Console and network errors are treated as failures unless explicitly explained.

---

## 10. Playwright MCP and screenshot policy

### MCP setup

```bash
claude mcp add --scope project playwright -- npx @playwright/mcp@latest
```

Review the generated `.mcp.json`. Record the resolved MCP version for the release evidence and decide whether to pin it before any eventual push.

### MCP review targets

- Six application URLs, including both non-composed Standalone baselines
- Vue Host federation route
- Vue Host iframe route
- Next Host iframe route
- Next Host federation route only if the spike validates
- accessibility tree and landmarks
- keyboard flow and focus
- URL and semantic event synchronization
- console, network, remote entries, chunks, and CORS
- Remote server stop, fallback, restart, and retry
- desktop, tablet, and mobile viewports

### README screenshots at 130%

Use Playwright MCP on production previews. For readability:

1. Set viewport to `1440 × 900` unless the screenshot documents responsive behavior.
2. Apply a temporary 130% page presentation scale for capture only, preferably by evaluating:

```js
document.documentElement.style.zoom = '1.3'
```

3. Capture only after fonts, Remote chunks, and animation settle.
4. Remove the injected zoom after capture; it must not enter production styles.
5. Place screenshots full-width in README instead of small side-by-side thumbnails.
6. Use meaningful alt text and repeat the same wording in a filled-triangle caption.

Example:

```markdown
![Vue Host에 연합된 Model Deployment Monitor](artifacts/screenshots/readme/vue-federation.png)
▲ Vue Host에 연합된 Model Deployment Monitor
```

Required README images:

- Vue Federation inside Host
- Vue Remote standalone
- Vue non-composed Standalone baseline
- Vue iframe comparison
- Next Remote standalone
- Next non-composed Standalone baseline
- Next iframe comparison
- Next Federation only if validated

---

## 11. `v0.1.0` first-push gate

The `v0.1.0` readiness review requires all applicable criteria, but never authorizes a push automatically:

- Owner-approved plan and design direction
- Six applications working independently
- Vue federation and iframe working
- Next iframe working
- Next federation verdict documented honestly
- Shared contracts, fixtures, and design tokens verified
- Root parallel development command working
- Lint, typecheck, test, build, and E2E all passing
- Playwright MCP validation report complete
- 130% README screenshots reviewed
- README comparison includes Module Federation, iframe, Web Components, and single-spa
- No secrets, session metadata, or unexplained local paths staged
- Owner separately states that remote push is currently possible and approves the exact push command

The repository remains `v0.0.1` until the release review changes it to `v0.1.0`.

---

## 12. Sources

- [Module Federation Next.js integration](https://module-federation.io/practice/frameworks/next/index.html) — App Router unsupported, Pages Router support, Next 12–15 support, maintenance/deprecation notice.
- [`@module-federation/nextjs-mf`](https://www.npmjs.com/package/@module-federation/nextjs-mf) — current peer dependency evidence.
- [`@module-federation/vite`](https://github.com/module-federation/vite) — Vite Host/Remote configuration.
- [Latest Next.js documentation](https://nextjs.org/docs) — current Next version and Turbopack/App Router behavior.
- [shadcn/ui](https://ui.shadcn.com/docs) — official React/Next components and monorepo support.
- [shadcn-vue](https://www.shadcn-vue.com/docs/introduction.html) — Vue port and Vue component catalog.
- [pnpm workspaces](https://pnpm.io/workspaces) and [filtering](https://pnpm.io/filtering) — workspace linking and filtered commands.
- [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp) — accessibility-tree browser automation and Claude Code setup.

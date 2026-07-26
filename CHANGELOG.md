# Changelog

All notable changes to this project are documented in this file.

## v0.1.0 - 2026-07-26


### Documentation

- 📄 docs(plan): record D-006 through D-008 evidence and reconcile TASK.md

Update TASK.md across the workspace/shadcn/Next/testing/gate sections
to match verified reality instead of stale planned-state claims, and
append the D-006/D-007/D-008 log entries documenting parallel-dev-
command verification, the full Next implementation, and the Module
Federation investigation.

- 📄 docs(plan): record the D-009 Playwright MCP live QA pass

Full 8-surface × 3-breakpoint structured QA pass (accessibility,
keyboard-only flow, console, network, responsive), written up in
docs/validation/playwright-mcp-v0.1.0.md. Update TASK.md's Section 11
live QA matrix and related gate items to match, and append the D-009
LOG.md entry with full defect detail.

- 📄 docs(readme): rewrite README with measured outcomes and add screenshots

Replace the planning-era README with a full rewrite reflecting the
implemented state: both frameworks' Federation/iframe/standalone modes,
the Next.js Module Federation investigation outcome, and the 8 required
130% screenshots captured live via Playwright MCP. Add a Korean README
twin per the centered-readme skill's multilingual convention.

- 📄 docs(i18n): add Korean translations for stable documents

Pair the architecture plan, design-direction doc, Playwright MCP
validation report, and both spike READMEs with Korean twins, and add a
language-link line to each English original. TASK.md and LOG.md stay
English-only as living checklists, per owner scoping decision.

- 📄 docs(plan): reconcile TASK.md Sections 12-14 with shipped documentation

Mark README content, screenshot policy, required images, and
documentation-gate checklist items done with evidence now that the
README rewrite, screenshots, and EN/KO translation pass have shipped.

- 📄 docs(plan): close remaining TASK.md checklist gaps and record D-010

Mark several already-true items across Sections 1, 2, 4, 5, 7, 8, and
14 with concrete evidence, and log the README/screenshot/i18n push
plus the new keyboard-flow spec as LOG.md D-010.

- 📄 docs(plan): verify Section 13 process gates and record push scoping

Confirm no session metadata/credentials were staged, all commits were
individually approved, the working tree is clean, and the remote is
already configured with prior owner approval. Note that push approval
is a per-push gate, not a standing one.

- 📄 docs(platform-shell): record CSS parity and validation evidence

Document the team-owned remote topology, shared Flight Deck CSS contract, computed-style parity, validation captures, and the retired comparison scope.


### Features

- ✨ feat(next-remote): implement the standalone Model Deployment Monitor

Port Vue Remote's Monitor/DeploymentPulseRail/context/frameAdapter to
React with shadcn parity (nine components), wire the Flight Deck Ledger
design tokens into globals.css, and add a Remote-local error boundary.
Test-first throughout: monitor state resolution, pulse-rail
interaction, and the Monitor component's loading/empty/degraded states.

- ✨ feat(next-standalone): implement the non-composed Console + Monitor baseline

Port Vue Standalone's Console+Monitor composition (context controls,
event ledger, Monitor) to React, with the same architecture-guard test
asserting no cross-app import, no Module Federation, no iframe, and no
postMessage.

- ✨ feat(next-host): implement the AI Platform Console with iframe composition

Port Vue Host's context/composition controls and Host-owned event
ledger to React, with an iframe panel handling loading/ready/error/retry
and the same exact-origin postMessage contract as the Vue track. Also
fixes the dev-server bind host (Next defaulted to all interfaces; Vite
explicitly binds 127.0.0.1) so the exact-origin check is meaningful.

- ✨ feat(next-federation): implement Module Federation via raw webpack.container.ModuleFederationPlugin

@module-federation/nextjs-mf remains INVALIDATED on next@16.2.11
(unfixed, unused). This implements Federation directly against
webpack's own built-in plugin instead, bypassing the broken wrapper
entirely — see spikes/next-raw-federation/README.md for the full
debugging record (chunk-loading-global collision, split-runtime-chunk
stall, immutable-cache masking, and the still-open async-shared-React
gap tracked as I-018). The exposed component is deliberately stateless
(Host owns selection/acknowledgement state) to sidestep I-018 rather
than depend on it. Wires the Host's composition selector together with
the already-built iframe panel.

- ✨ feat(platform-shell): replace comparison surfaces with team-owned remotes

Add the authenticated Fastify-backed Vue and Next platform shells with\nHost-owned Deployments plus independently served Observability and Governance\nHTTP Federation remotes.\n\nIntroduce the shared Flight Deck CSS contract and verification scripts while\nremoving the retired iframe and standalone comparison implementation.


### Fixes

- 🐛 bug(lint): make `pnpm lint` actually run ESLint

`pnpm lint` was `pnpm -r --if-present lint`, which always exited 0
because no workspace package declared a `lint` script — ESLint never
ran. Point the root script at `eslint .` directly, and teach the flat
config to ignore generated output (@mf-types, next-env.d.ts,
tsbuildinfo) so it doesn't fail on code nobody authored.

- 🐛 bug(vue-host): fix DataCloneError on every iframe context sync

Vue reactive Proxy objects cannot be cloned by postMessage's structured-
clone algorithm. IframePanel.vue was passing the reactive `context` prop
straight through; postContextToRemote now copies it into a plain object
first. Found live via Playwright MCP — the existing unit test used a
plain-object fixture, so it could not have caught this.

- 🐛 bug(next-federation): fix Module Federation dropping the exposed component's own CSS

Module Federation carries JS across the origin boundary but not CSS.
next/host's Tailwind build only scans its own source, so any utility
class next/remote's FederatedMonitor used that wasn't independently used
inside next/host (here, gap-8) compiled to no rule at all. Added @source
directives pointing at next/remote's component source so next/host's
Tailwind build pre-emptively includes them.

- 🐛 bug(next): match Vue's 900px responsive breakpoint for the composed layout

Next Host/Standalone collapsed their two-column layout at Tailwind's
default 768px md: breakpoint while Vue collapsed at a custom 900px rule,
so the two tracks disagreed on layout at 768×1024 — this project's own
tablet QA breakpoint. Switched both to min-[900px]: to match.

- 🛠️ fix(platform-shell): enforce shared button styling across frameworks

Route every visible Vue and Next button through the Flight Deck button contract, including login, navigation, sign-out, and domain actions.

Add computed-style parity checks and refreshed interaction evidence so spacing, borders, radius, colors, and typography cannot drift between frameworks.


### Maintenance

- 🔧 chore(repo): stop tracking generated build output

Module Federation DTS output (vue/host/@mf-types/) was committed by
accident in the initial commit, and Next rewrites next-env.d.ts's import
path differently after `dev` vs `build`, causing constant untracked
churn. Ignore both, and scaffold the e2e/, docs/validation/, and
artifacts/screenshots/readme/ directories the README already documents.

- 🔧 chore(mcp): remove duplicate Playwright MCP server and pin its version

.mcp.json declared two identical playwright/playwright-project entries
both running @playwright/mcp@latest — two browser servers racing for
one profile. Keep the project-scoped entry only, pinned to 0.0.78 so
validation evidence stays reproducible.

- 🔧 chore(repo): expose Claude assets through .agents

Add the portable relative .agents symlink so compatible agent tooling can discover the repository guidance and skills.


### Security

- 🔐 security(dependencies): resolve Dependabot advisories

Pin patched transitive dependency versions through pnpm overrides and refresh the lockfile to remove all reported security vulnerabilities.


### Tests

- ✅ test(e2e): add Playwright Test suite across both frameworks and all composition modes

playwright.config.ts manages all six preview servers. Six spec files
cover both directly-previewable Remotes, both Standalone baselines, Vue
Federation/iframe, Next Federation/iframe, and Remote-unreachable →
fallback → retry recovery for both frameworks in both composition
modes.

- ✅ test(e2e): add scripted keyboard-only composition flow spec

Add e2e/keyboard-flow.spec.ts covering the four keyboard-only paths
D-009 verified manually but never scripted: switching the composition
tab, selecting the degraded pulse-rail node, and dismissing its alert
via Acknowledge, across {Vue, Next} x {Federation, iframe}.

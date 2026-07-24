# Project instructions

## Current phase

This repository is `v0.0.1` Draft. The owner authorized local implementation on 2026-07-24.

- Proceed through `TASK.md` locally, beginning with the latest-Next compatibility spike and test-first workspace foundation.
- Read `2026-07-20_114438-pilot-module-federation.md` for detailed architecture rationale.
- Use `TASK.md` as the executable checklist and update only verified items.
- Never push based on version readiness alone. Push only after the owner separately says that remote push is currently allowed.
- Creating or configuring a Git remote also requires explicit owner approval.
- Do not create local commits without presenting the exact message and receiving explicit approval.

## Required project-local skills

Load and follow these skills when their trigger applies:

- `.claude/skills/frontend-design/SKILL.md`
  - Required before planning, implementing, or visually reviewing any of the four UIs.
  - Establish the audience, page job, design directions, tokens, typography, layouts, and one justified signature element before production UI code.
- `.claude/skills/centered-readme/SKILL.md`
  - Required before materially changing `README.md`.
  - Keep only the README hero centered and keep the body left-aligned.
  - Add badges only when their workflow, package, or license is real.
- `.claude/skills/git-commit-helper/SKILL.md`
  - Required before proposing or creating every commit.
  - Use `<gitmoji> <type>(<domain>): <title>` and wait for approval before each commit and push.

## Repository identity

- GitHub target: `jyje/pilot-module-federation`.
- Local repository: `~/repo/jyje/pilot-module-federation`.
- Current version: `0.0.1` Draft.
- Target first-push version: `0.1.0` Pilot.

## Planned applications

- `vue/host`: Vue 3 AI Platform Console that composes the Remote.
- `vue/remote`: Vue 3 Model Deployment Monitor exposed to the Host and directly previewable.
- `vue/standalone`: Vue 3 non-federated baseline containing Console and Monitor in one app.
- `next/host`: latest Next.js AI Platform Console that composes the Remote.
- `next/remote`: latest Next.js Model Deployment Monitor exposed where supported and directly previewable.
- `next/standalone`: latest Next.js non-federated baseline containing Console and Monitor in one app.

Each Remote must be directly previewable. Each Standalone app is a separate non-composed baseline, not an alias for the Remote preview.

## Planned shared packages

- `packages/contracts`: framework-neutral TypeScript contracts.
- `packages/fixtures`: deterministic shared domain fixtures.
- `packages/design-tokens`: semantic CSS variables shared by both tracks.

Do not place Vue, React, routers, component implementations, or application stores in shared packages without an explicit plan amendment.

## Framework and composition rules

- Vue 3 uses shadcn-vue and must implement Vite Module Federation, iframe, and standalone modes.
- Next uses Vercel shadcn/ui and must implement iframe and standalone modes.
- Latest Next Module Federation is conditional on the documented compatibility spike.
- Do not silently downgrade Next.js from latest to satisfy `@module-federation/nextjs-mf`.
- Do not claim App Router federation support; current official Module Federation documentation says App Router is unsupported.
- If the latest Next spike is invalidated, document the result and omit the unstable federation route.

## Boundary rules

- Host owns global layout, route/context selection, composition mode, fallback, and retry.
- Remote owns deployment monitor UI and local presentation state.
- Federation communicates through typed props/events.
- iframe communicates through validated `postMessage` payloads with exact origins.
- No application may import another application's source, router, or store.

## pnpm workspace expectations

- Root `pnpm dev` must run all six development servers in parallel with package-prefixed logs.
- Root `pnpm dev:composed` must run the four Host/Remote servers without the Standalone baselines.
- Root `pnpm dev:standalone` must run the two Standalone baselines.
- Per-framework and per-app filtered commands must remain available.
- Every app must also start, test, and build independently.
- One lockfile and workspace linking do not justify runtime coupling.

## Verification expectations

- Use test-first development for behavior changes.
- Run lint, typecheck, unit/component tests, four independent builds, and applicable E2E.
- Use Playwright Test for repeatable automation.
- Configure Microsoft Playwright MCP at project scope and use it for live accessibility, interaction, console, network, CORS, failure/recovery, and responsive QA.
- Treat unexplained console warnings, network failures, hydration errors, and federation errors as defects.
- Do not call a mode validated from a successful HTML render or Remote entry fetch alone.

## README screenshot policy

- Capture production previews through Playwright MCP.
- Apply a temporary 130% presentation zoom for capture only.
- Do not commit the zoom to application styles.
- Display screenshots full-width for readability.
- Use meaningful alt text followed by a filled-triangle caption with identical wording.

## Git safety

- Never include Claude session IDs, session URLs, or transcript metadata in commits.
- Never create a remote, push, publish, or release without explicit approval.
- Completion of `v0.1.0` does not imply push approval; wait until the owner explicitly says push is currently possible.
- Keep planning, spikes, workspace setup, framework implementation, validation evidence, and release work separable by concern.

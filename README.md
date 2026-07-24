<div align="center">

# jyje/pilot-module-federation

Vue 3 and latest Next.js UI-in-UI microfrontend comparison.

Six independently runnable applications, one shared AI platform scenario, and evidence-based comparisons of Module Federation, iframe, and non-composed standalone delivery.

**Status: `v0.0.1` Draft · Local planning and compatibility validation**

</div>

## Status

This repository is a local draft. It has no remote. Completing the `v0.1.0` release gate does not authorize a push; remote push remains blocked until the owner separately says that push is currently possible.

The pnpm workspace, shared contracts/fixtures/design tokens, and all six app
scaffolds are implemented locally. The Vue track has production-preview
evidence for Federation, iframe, and non-composed Standalone delivery. The
latest-Next Federation spike is `INVALIDATED`; the Next track therefore keeps
iframe and Standalone as its implemented composition targets.

## Pilot scenario

The Host is an **AI Platform Console**. The Remote is a **Model Deployment Monitor**.

```text
AI Platform Console (Host)
├── cluster, model, and environment context
├── composition selector
└── Model Deployment Monitor (Remote)
    ├── deployment health and replicas
    ├── latency and event timeline
    └── semantic events returned to Host
```

The comparison has three forms per framework:

1. Host + Remote through Module Federation where supported.
2. Host + Remote through iframe.
3. A separate Standalone baseline that contains the Console and Monitor in one non-composed app.

The Remote also remains directly previewable as a focused operations surface. The Standalone app is intentionally separate so setup, runtime boundaries, failure modes, and developer experience can be compared fairly.

## Framework matrix

| Track | Host | Remote | Standalone baseline | UI components | Composition targets |
| --- | --- | --- | --- | --- | --- |
| Vue | Vue 3 | Vue 3 | Vue 3 | shadcn-vue | Federation, iframe, non-composed standalone |
| Next | Latest Next.js | Latest Next.js | Latest Next.js | Vercel shadcn/ui | iframe, non-composed standalone, conditional Federation |

Vercel shadcn/ui is React-based. Vue uses shadcn-vue, a Vue port with a similar component and theming model; the project will keep the provenance distinction explicit.

## Important Next.js compatibility constraint

The latest observed Next.js version is `16.2.11`. The current `@module-federation/nextjs-mf@8.8.71` peer range declares Next 12–15, its documentation does not support App Router, and Next integration is in maintenance/deprecation mode.

The Next track therefore starts with a compatibility spike. It will report `VALIDATED`, `PARTIAL`, or `INVALIDATED` before the product UI claims Next Module Federation support. The project will not silently downgrade Next.js to make the result look successful.

## pnpm monorepo

The repository uses one pnpm workspace for six applications and shared framework-neutral packages.

Planned root commands:

- `pnpm dev`: run all six development servers in parallel.
- `pnpm dev:composed`: run the four Host/Remote servers.
- `pnpm dev:standalone`: run the two Standalone baselines.
- `pnpm dev:vue`: run Vue Host, Remote, and Standalone.
- `pnpm dev:next`: run Next Host, Remote, and Standalone.
- Filtered commands: run, test, or build one application independently.

The monorepo centralizes the lockfile, scripts, contracts, fixtures, and design tokens. It does not allow one application to import another application's source or runtime store.

## Workspace structure

```text
vue/
├── host/
├── remote/
└── standalone/
next/
├── host/
├── remote/
└── standalone/
packages/
├── contracts/
├── fixtures/
└── design-tokens/
spikes/
└── next-latest-federation/
e2e/
docs/
└── validation/
artifacts/
└── screenshots/readme/
```

## Composition comparison

- **Module Federation:** preferred when framework support is healthy and native DOM composition is needed.
- **iframe:** implemented as an isolation-focused comparison and latest-Next fallback.
- **Remote direct preview:** required for both frameworks.
- **Non-composed Standalone baseline:** required for both frameworks as the no-runtime-composition control.
- **Web Components:** documented as a framework-neutral alternative.
- **single-spa:** documented as an orchestration alternative for route/parcel portfolios.

The final README will recommend by constraints rather than declaring one universal winner.

## Validation

`v0.1.0` requires both:

- Playwright Test for repeatable automated E2E.
- Microsoft Playwright MCP for live accessibility-tree, interaction, console, network, CORS, failure/recovery, and responsive QA.

README screenshots will be captured from production previews at a temporary 130% presentation scale for readability, displayed full-width, and paired with meaningful alt text and matching captions.

## Plans and tasks

- [Architecture plan](2026-07-20_114438-pilot-module-federation.md)
- [Implementation checklist](TASK.md)
- [Project instructions](CLAUDE.md)

## Project-local skills

- `frontend-design`: design direction, tokens, typography, layout, and visual self-critique.
- `centered-readme`: centered hero with a normally left-aligned document body.
- `git-commit-helper`: approved gitmoji, domain, commit, and push workflow.

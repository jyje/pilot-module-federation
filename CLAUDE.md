# Project instructions

## Current direction

This repository is a Vue 3 Module Federation pilot for an AI Platform Shell with three team-owned Remotes: Deployments, Observability, and Governance. A compact Next.js Host/Remote track verifies the same HTTP federation contract with shadcn/ui. The authoritative architecture is [`PLAN.md`](PLAN.md).

- Keep the project at `v0.0.1` Draft until the owner approves a release gate.
- Do not create a Git remote, commit, push, publish, or release without explicit owner approval.
- Update `TASK.md` only for verified work.

## Application boundaries

- `vue/host` is the Platform Shell. It owns mock authentication, tenant/capability context, global header, sidebar, URL routing, remote registration, and route-level recovery.
- `vue/remote` (Deployments), `vue/observability`, and `vue/governance` are independently runnable Remotes owned by their respective teams.
- `next/host` and `next/remote` are the independently served HTTP Federation verification pair.
- `packages/contracts` contains framework-neutral public contracts only.
- `packages/fixtures` contains deterministic domain fixtures only.
- `packages/design-tokens` contains semantic CSS variables only.

No application may import another application's source, router, or store. Federation boundaries use typed props/events. Do not introduce iframe bridges or a shared runtime store.

## Authentication and authorization

- The Host supplies only a minimal `PlatformContext`; it never passes a bearer, refresh, or session token to a Remote.
- Production authentication is Host/BFF-owned OIDC with `Secure`, `HttpOnly` cookies. Mock authentication must have the same public context shape.
- The Host may control navigation visibility, but APIs/BFF enforce authorization on every request.
- Public build variables may configure Remote URLs. Never expose secrets through `VITE_*` variables.

## UI and verification

- Use `.claude/skills/frontend-design/SKILL.md` before planning, implementing, or visually reviewing UI work.
- Preserve the Host-owned Flight Deck Ledger shell and mission rail; Remote screens may specialize their domain outlet without replacing global navigation.
- Use test-first development. Validate typecheck, unit/component tests, builds, deep links, capability denial, Remote outage/retry, keyboard navigation, and browser console/network behavior.
- Treat unexplained console, CORS, hydration, and federation failures as defects.

## Git safety

- Never include session IDs, session URLs, or transcript metadata in commits.
- Use `.claude/skills/git-commit-helper/SKILL.md` before proposing or creating a commit.

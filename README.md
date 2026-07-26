<div align="center">

# jyje/pilot-module-federation

An AI Platform Shell that keeps login and global navigation while team-owned micro frontends deploy independently over HTTP Module Federation.

[English](README.md) / [한국어](README-ko.md)

</div>

## Status

`v0.0.1` pilot. Both Vue and Next run the same topology: Host-owned Deployments plus independent Observability and Governance HTTP Remotes.

## Target architecture

```text
AI Platform Shell (Vue Host)
├── login session, tenant, and capability context
├── persistent header and mission-rail sidebar
├── URL routing, remote loading, fallback, and retry
└── federation route outlet
    ├── Deployments     — MLOps team
    ├── Observability   — SRE team
    └── Governance      — Security team

Fastify API
└── same-origin /api session and domain endpoints
```

The shell owns the user experience shared by every route. Each Remote owns its domain UI and local state, and is independently built and deployed. No Remote imports the Host's source, router, or store.

## Design system

The project design reference is [DESIGN.md](DESIGN.md). The actual cross-framework contract is [`packages/design-tokens/src/platform.css`](packages/design-tokens/src/platform.css): both Hosts and all four Remotes import its semantic colors, Manrope/JetBrains Mono roles, spacing, responsive metrics, focus ring, reduced-motion behavior, Shell layout, and domain-surface treatment. Each framework keeps its own local primitives, but those primitives resolve to the same CSS values: 36px actions with 12px horizontal padding and 6px radius, plus the same Flight Deck accent rather than team-specific theme colors.

## Authentication model

The pilot includes a TypeScript Fastify backend because a front-end-only login cannot verify shared session behavior or server authorization.

- A local user chooses a display name, enters an email, and any non-empty password.
- Fastify creates a deterministic demo session and returns a signed `HttpOnly`, `SameSite=Lax` cookie.
- The Host reads `GET /api/auth/session`, then supplies a minimal `PlatformContext`—user, tenant, capabilities—to the mounted Remote.
- A Remote uses the same cookie session through its same-origin `/api/*` request; it never receives a password, bearer token, refresh token, or session token.
- Domain APIs independently enforce the current tenant and capability. Sidebar visibility is UX, not authorization.

Local Vite servers will proxy `/api` to Fastify. Production will serve the shell and API through one origin, avoiding cross-origin cookie behavior.

## Repository layout

```text
apps/api/                 Fastify session and domain API
vue/host/                 Vue Platform Shell
vue/observability/        SRE Federation Remote
vue/governance/           Security Federation Remote
next/host/                Next.js Host using shadcn/ui
next/remote/              Next.js Observability HTTP Remote
next/governance/          Next.js Governance HTTP Remote
packages/contracts/       framework-neutral platform contracts
packages/fixtures/        deterministic domain fixtures
packages/design-tokens/   shared semantic CSS variables
```

Deployments is intentionally integrated into each Host. Observability and Governance remain independent Remote deployment units in both tracks.

## Design and delivery plan

The full boundary model, login flow, API surface, Remote lifecycle, and delivery steps are in the [architecture plan](PLAN.md). The executable checklist is [TASK.md](TASK.md).

Browser screenshots, console evidence, and cookie-session API results are recorded in the [validation README](docs/validation/README.md).

## Development

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts Fastify, the Vue Host, and the two Vue Remotes. To run the Next Host and its two Remotes instead, run:

```bash
pnpm dev:next
```

Run `pnpm dev:all` when both tracks are needed together.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Runtime boundary

All Remotes are runtime-loaded HTTP assets: Vue Host/Remotes use `3000/3001/3002`; Next Host/Remotes use `4000/4001/4002`. The Host does not iframe these pages or import their source from disk.

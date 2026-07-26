# TASK — AI Platform Federation Shell

> **Architecture:** [`PLAN.md`](PLAN.md)

## Fixed topology

| Track | Host + Deployments | Observability Remote | Governance Remote |
| --- | --- | --- | --- |
| Vue | `3000` | `3001` | `3002` |
| Next.js | `4000` | `4001` | `4002` |

The API remains `8787`. Deployments is Host-owned; the two remaining domain teams are independent HTTP federation Remotes.

## Completed

- [x] Fastify signed HttpOnly session API, login name, capability checks, and API tests.
- [x] Shared credential-free `PlatformContext` contract.
- [x] Vue Host shell, login, persistent sidebar, Host-owned Deployments, and HTTP Remote registry.
- [x] Vue Observability and Governance Remotes.
- [x] Next Host shell with shadcn/ui and HTTP federation configuration.
- [x] Next Observability and Governance Remote applications.
- [x] Match the Vue and Next Hosts' Flight Deck mission rail, login identity, Host Deployments action, and Remote hello interactions with local shadcn primitives.
- [x] Give all six Vue/Next Host and Remote surfaces one Flight Deck CSS contract. `@pilot/design-tokens/platform.css` now owns semantic colors, typography, spacing, responsive metric layout, focus, reduced motion, Shell, and domain-surface rules; each app imports it rather than maintaining a local theme copy.
- [x] Align local Vue and Next button primitives to the same 36px height, 12px horizontal padding, 6px radius, Manrope text, and shared accent/background tokens. Governance no longer substitutes warning yellow for the platform theme.
- [x] Route every visible Vue and Next button through the shared `platform-button` CSS contract, including login, primary actions, mission-rail navigation, and Sign out variants; `pnpm validate:css-parity` compares their computed display, geometry, border, colors, and typography across frameworks.
- [x] Disable Vite federation DTS WebSocket hints and register each Remote once.
- [x] Record browser screenshots and safe console/network evidence.

## Required verification before completion

- [x] Build and typecheck all six applications after the port/topology migration.
- [x] Browser-test Vue `3000 → 3001/3002`: login name, Host Deployments action, both Remote actions.
- [x] Browser-test Next `4000 → 4001/4002`: login name, Host Deployments action, both Remote actions.
- [x] Browser-compare Vue and Next Remote computed styles: background `#111827`, foreground `#dbe6f5`, accent `#39d0b7`, Manrope/JetBrains Mono roles, 20px metric-cell padding, and 36px × 12px × 6px action buttons match.
- [x] Run `pnpm validate:css-parity` against the current Vue and Next servers: Login, active mission-rail navigation, Sign out, and all three domain action buttons have matching computed CSS in both frameworks.
- [x] Verify Host-owned `/observability` and `/governance` Next deep links resolve to the persisted Shell rather than a 404.
- [x] Refresh validation screenshots, logs, README links, and port references.
- [x] Remove the retired Vue Deployments Remote application after verifying it is unused.

## Deliberately deferred

- OIDC/BFF replacement for the local demo login.
- Remote outage/retry and keyboard-navigation browser suites.
- Production remote versioning, integrity policy, and ingress deployment.

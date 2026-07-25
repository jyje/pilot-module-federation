# Spike — latest Next.js Module Federation (`@module-federation/nextjs-mf`)

**Language:** [English](README.md) · [한국어](README-ko.md)

**Verdict: `INVALIDATED`**

## Given / When / Then

**Given**

- Latest Next.js resolved from npm at implementation time: `next@16.2.11`.
- `react@19.2.8`, `react-dom@19.2.8` (Next 16.2.11's declared peer range).
- `@module-federation/nextjs-mf@8.8.71`, whose `peerDependencies` declare
  `next: "^12 || ^13 || ^14 || ^15"` only (confirmed via
  `npm view @module-federation/nextjs-mf peerDependencies --json`).
- Official Module Federation docs and this package's own README state that
  App Router is unsupported, Pages Router is supported, and Next.js support
  in this plugin is ending / in maintenance mode.
- Two disposable minimal Pages Router apps under `host/` (port 3900) and
  `remote/` (port 3901), each with `NextFederationPlugin` wired per the
  documented basic example (`remote` exposes `./PulseWidget`, `host`
  consumes it via `next/dynamic(..., { ssr: false })`).
- `webpack@5.109.0` installed as an explicit devDependency in both apps, as
  required by the plugin's documented setup.

**When**

1. `npm install --legacy-peer-deps` in `remote/` and `host/`.
2. `NEXT_PRIVATE_LOCAL_WEBPACK=true npx next dev --webpack -p 3901` (remote).
3. `NEXT_PRIVATE_LOCAL_WEBPACK=true npx next build --webpack` (remote, then host).

**Then**

- Step 1 fails plain `npm install` with `ERESOLVE` (peer conflict: installed
  `next@16.2.11` vs. plugin's declared `^12 || ^13 || ^14 || ^15`). Requires
  `--legacy-peer-deps` to proceed at all — this alone is evidence the plugin
  is not maintained against current Next.
- Step 2/3 (both `remote` and `host`, both `dev --webpack` and
  `build --webpack`) fail identically and immediately at Next's
  config-loading stage, **before any webpack compilation, before any HTTP
  server response, and before any browser was reached**:

  ```
  ⨯ Failed to load next.config.mjs, see more info here https://nextjs.org/docs/messages/next-config-error
  TypeError: Cannot destructure property 'CachedSource' of 'require(...)' as it is undefined.
      at ignore-listed frames
  ```

- `curl http://localhost:3901/` and
  `curl http://localhost:3901/static/chunks/remoteEntry.js` both returned
  `000` (connection never established) because the dev server's Next.js
  request handler never finished initializing past the config error.

## Exact versions and commands

| Package | Version |
| --- | --- |
| `next` | `16.2.11` |
| `react` / `react-dom` | `19.2.8` |
| `@module-federation/nextjs-mf` | `8.8.71` |
| `webpack` (explicit devDependency) | `5.109.0` |
| Node.js | `v22.22.3` |

```bash
# install (fails without --legacy-peer-deps)
npm install --legacy-peer-deps

# dev — fails at config load
NEXT_PRIVATE_LOCAL_WEBPACK=true npx next dev --webpack -p 3901

# build — fails identically
NEXT_PRIVATE_LOCAL_WEBPACK=true npx next build --webpack
```

Next.js 16 defaults to Turbopack for both `dev` and `build`; the `--webpack`
CLI flag was required to opt back into webpack, as documented at
https://nextjs.org/docs/app/api-reference/turbopack. `next.config.mjs` also
had to set `NEXT_PRIVATE_LOCAL_WEBPACK=true` — without it, the plugin throws
its own explicit error (`process.env.NEXT_PRIVATE_LOCAL_WEBPACK is not set to
true, please set it to true, and "npm install webpack"`) before the
`CachedSource` failure is even reached.

## Root cause (best available evidence)

`NextFederationPlugin`'s construction inside `next.config.mjs`'s exported
`webpack()` hook triggers a `require(...)` that resolves to `undefined`
somewhere in the plugin's internal webpack-internals wiring, then attempts to
destructure `CachedSource` off it. This happens identically for `host` and
`remote`, for both `dev` and `build`, and before any part of the federation
runtime (remote entry, shared scope, container) is reached. This is
consistent with the plugin's peer range topping out at Next 15: Next 16
changed its bundled/compiled webpack internals (Next 16 restructured its
internal webpack bundling as Turbopack became the default bundler), and
`@module-federation/nextjs-mf@8.8.71` — last built against Next ≤15 — no
longer resolves whatever internal module it expects. No component or
runtime-behavior evidence (remote render, hard refresh, console, network,
Playwright) could be collected because the failure occurs before the dev
server can serve a single request.

## Verdict

**`INVALIDATED`**

- Latest Next.js (`16.2.11`) cannot use `@module-federation/nextjs-mf@8.8.71`
  for Pages Router + local webpack Module Federation. The failure is a hard
  config-load crash, not a narrow runtime constraint, so there is no reduced
  "PARTIAL" surface to salvage.
- No silent downgrade to Next 15 was performed to force a pass, per policy.
- Recommendation: the Next track (`next/host`, `next/remote`,
  `next/standalone`) implements **iframe** and **non-composed Standalone**
  composition only. Module Federation is not implemented in the Next track
  for this repository at `next@16.2.11`. The Next Host's composition
  selector must show an evidence-backed "Federation unsupported at this Next
  version" state instead of a working Federation mode.
- A Next 15 compatibility variant remains a possible separate future spike
  but is out of scope for this pilot's main comparison per the plan.

## Disposition

Disposable spike code (`host/`, `remote/`, installed `node_modules/`,
lockfiles) is removed after this verdict per project policy. This README is
the retained evidence record.

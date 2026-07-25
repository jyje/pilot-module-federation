# Spike — Next.js Module Federation via raw `webpack.container.ModuleFederationPlugin`

**Language:** [English](README.md) · [한국어](README-ko.md)

**Verdict: `PARTIAL` — validated and adopted for stateless federated components; hook-based singleton sharing across independently-built Next apps remains unresolved.**

## Why this spike exists

The `spikes/next-latest-federation/` spike (I-006) invalidated
`@module-federation/nextjs-mf@8.8.71` on `next@16.2.11`: the plugin crashed
Next's own config-loading stage before any webpack compilation ran, because
the wrapper's internal patches reach into Next-version-specific webpack
internals that changed after Next ≤15. That verdict is correct and unchanged.

But `nextjs-mf` is not the only way to get Module Federation onto Next.
Webpack 5 ships `ModuleFederationPlugin` as a first-class built-in
(`webpack.container.ModuleFederationPlugin`), and Next bundles its own copy of
webpack 5 internally (confirmed: `next@16.2.11` bundles `webpack@5.98.0`,
exposed at `next/dist/compiled/webpack/webpack.js`, with a working
`.container.ModuleFederationPlugin`). This spike asks a narrower question:
can Next's `next.config.js` `webpack()` hook push the *raw* plugin directly —
bypassing `nextjs-mf` and all of its Next-version-specific patching — and get
a working Remote/Host federation pair on `next@16.2.11`?

## Given / When / Then

**Given**

- `next@16.2.11`, `react@19.2.8`, `react-dom@19.2.8`, no other dependencies.
- Two disposable Pages Router apps, `remote/` (port 3911, exposes
  `./Widget`) and `host/` (port 3910, declares `remotes: { next_remote_spike
  }` and dynamically imports `next_remote_spike/Widget`).
- `ModuleFederationPlugin` obtained directly from
  `require('next/dist/compiled/webpack/webpack').webpack.container`, never
  installed as a separate `webpack` devDependency and never routed through
  `@module-federation/nextjs-mf`.
- Both apps forced to legacy webpack via the `--webpack` CLI flag (Turbopack,
  Next 16's default bundler, does not support webpack plugins at all).

**When** — the debugging path, in order, each step's fix carried forward:

1. `next build --webpack` in `remote/` with only `exposes` configured.
   **Result:** compiles clean, `remoteEntry.js` generated and served —
   already further than `nextjs-mf` ever got.
2. `next build --webpack` in `host/` with `remotes` configured and
   `React.lazy(() => import('next_remote_spike/Widget'))` on the index page.
   **Result:** build fails: `Module not found: Can't resolve
   'next_remote_spike/Widget'` — Next's *server* compiler pass also needs to
   statically resolve the import even though the component is
   `ssr: false`/lazy-only. Fixed by applying the same `ModuleFederationPlugin`
   `remotes` config to both the `isServer` and client compilations.
3. Host builds; browser loads the page; the remote widget never renders
   (`Loading remote widget…` forever, no console error). Root cause: Next
   hardcodes the same chunk-loading global (`self.webpackChunk_N_E`) for
   *every* Next app by default. When the remote's container script executes
   inside the host's page, it pushes onto the host's own chunk array, and the
   remote's inner async chunks (593, 19 in this case) get "resolved" by the
   *host's* chunk-URL map, which has no entry for them → silent stall. Fixed
   with `config.output.uniqueName` set to a distinct string per app, which
   changes each app's chunk-loading global to `webpackChunk<uniqueName>`.
4. Still stalls. Root cause: Next splits its own webpack runtime prelude
   into a *separate* `webpack-*.js` chunk, shared across all of that app's
   own pages. `remoteEntry.js`, loaded standalone inside the host's page,
   never gets that prelude, so `self.webpackChunk<uniqueName>.push` is never
   patched into a real chunk-loading handler. Fixed with
   `config.optimization.runtimeChunk = false` on the remote (and, for
   consistency, the host's client compilation too), which inlines the
   runtime into `remoteEntry.js` itself — verified by the file jumping from
   589 bytes to 6087 bytes.
5. Still stalls in the browser, but manually calling `container.get('./Widget')`
   from the console *succeeds*. Root cause: `remoteEntry.js` has no
   content-hash filename, and Next serves it `Cache-Control: public,
   max-age=31536000, immutable` — the browser never revalidates it, even on
   a hard reload, once it has cached one version. Every fix above was
   invisible in the browser until the cache was defeated (verified with a
   `?v=<timestamp>` cache-busting query param on the host's `remotes` URL
   during this spike).
6. With all of the above, **a stateless exposed component renders correctly,
   live, cross-origin, in a real browser** — see Evidence below.
7. Repeated with a **stateful** exposed component (`useState`). **Result:**
   crashes: `TypeError: Cannot read properties of null (reading 'useState')`
   — the classic "two independent React copies" failure, because no
   `shared` config was declared, so host and remote each bundle and execute
   their own separate copy of `react`.
8. Added `shared: { react: { singleton: true, eager: true }, 'react-dom':
   {...} }` to both configs. **Result:** immediate uncaught
   `ScriptExternalLoadError` client-side exception on load.
9. Removed `eager: true` (async shared consumption, the webpack default) and
   added `Access-Control-Allow-Origin: *` on the remote's `/_next/static/:path*`
   via `next.config.js`'s `headers()` (a real cross-origin MF requirement in
   general, not just for this symptom). **Result:** no more crash, but back
   to the same silent stall as step 3 — `container.get()` still resolves
   fine manually, but the page-level `React.lazy`/`import()` promise the
   host's compiled bundle is awaiting never settles. Not resolved within
   this spike's time-box.

**Then**

- Steps 1–6: fully reproducible, verified live in a real browser (Playwright
  MCP browser pane) with network-request and `container.get()` evidence at
  every stage. A **stateless** Next.js federated component — Remote exposes,
  Host consumes via `React.lazy`, cross-origin, `next@16.2.11`,
  webpack-forced — **works**, independent of and without
  `@module-federation/nextjs-mf`.
- Step 7–9: a **stateful** (hook-using) exposed component does not yet work
  reliably. The failure is isolated to the async shared-React negotiation's
  promise resolution when host and remote are two entirely separate Next
  builds; it is not a repeat of any problem `nextjs-mf` hit, and it looks
  solvable (candidates not yet tried: bundling react/react-dom fully inside
  the remote instead of `shared`-negotiating with the host, given elements
  are plain data across matching React major versions; a hand-written
  synchronous shared-scope handshake instead of relying on webpack's
  generated async negotiation; or eliminating the need for singleton
  sharing altogether by keeping the exposed component fully stateless).

## Evidence — stateless component, live browser

- `curl -sI http://127.0.0.1:3911/_next/static/chunks/remoteEntry.js` → `200`,
  `Content-Type: application/javascript`, body begins with the expected
  webpack container bootstrap (`var next_remote_spike;(...).push(...)`).
- Playwright MCP browser pane, navigating to `http://127.0.0.1:3910/`
  (production preview, `next start --webpack`, cache-busted remote URL):
  page text reads **"Next Host raw-federation spike / Hello from Next
  Remote via raw webpack Module Federation"** — the exposed component's own
  text, rendered inside the Host's own React tree, fetched live from a
  different origin (3911) at request time, not inlined at Host build time.
- Manual console verification: `await window.next_remote_spike.get('./Widget')`
  resolves to `{ default: [Function] }` — the real component factory.

## Adopted resolution for the main repository

- **`next/remote` and `next/host` gain a real Module Federation composition
  mode**, implemented via raw `webpack.container.ModuleFederationPlugin`
  (never `@module-federation/nextjs-mf`), forced to `--webpack`. The
  Federation-specific exposed component is a **stateless, fully
  prop-controlled** variant of the Monitor (`selectedId`/acknowledged state
  owned and passed down by the Host, exactly as the Host already owns
  composition/context state) — this is not a workaround forced by a bug, it
  sidesteps the unresolved shared-React negotiation issue in step 7–9
  entirely and is a legitimate, common architectural choice at federation
  boundaries.
- `@module-federation/nextjs-mf` remains `INVALIDATED` (I-006, unchanged).
  This adopted path does not use it, does not depend on its being fixed, and
  does not conflict with the "do not claim App Router federation support"
  policy — the federation boundary here is a Pages Router page in both
  `next/host` and `next/remote`, exactly as the project plan already
  anticipated for a conditional Federation route.
- The remaining stateful-sharing gap (steps 7–9) is tracked as an open issue
  (LOG.md I-0xx) for a future richer federated surface (e.g. sharing
  Host-driven acknowledgement state back through a truly shared React
  instance); it does not block the stateless implementation adopted now.

## Disposition

Disposable spike code (`host/`, `remote/`, `node_modules/`, `.next/`) is
removed after this verdict per project policy. This README is the retained
evidence record. The adopted implementation lives in `next/host` and
`next/remote` directly.

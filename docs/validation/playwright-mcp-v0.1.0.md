# Microsoft Playwright MCP live QA — `v0.1.0`

**Language:** [English](playwright-mcp-v0.1.0.md) · [한국어](playwright-mcp-v0.1.0-ko.md)

**Date:** 2026-07-25
**Tooling:** `@playwright/mcp@0.0.78` (project-scoped `playwright-project` server), production previews (`vite preview` / `next start`), Node `v22.22.3`.
**Scope:** all 8 target surfaces — {Vue, Next} × {Remote standalone, Standalone baseline, Host+Federation, Host+iframe}.

## Method

Each surface was checked at desktop (`1440×900`), tablet (`768×1024`), and mobile (`390×844`):

- Accessibility snapshot (landmark roles, labelled controls, alert/live regions).
- Keyboard-only interaction: `Tab` through every control, activate with `Enter`, operate Select dropdowns with `ArrowDown`/`Enter`, switch composition tabs with `ArrowLeft`/`ArrowRight` (roving tabindex, not `Enter` — matching the ARIA Tabs pattern).
- `focus-visible` computed style, confirmed at least once per framework.
- Console messages (all severities).
- Network requests for the composed surfaces (remote entry / chunks / CORS).
- Responsive screenshot review at all three breakpoints.
- Remote stop → fallback → retry: not re-driven interactively in this pass (this MCP server's tool surface doesn't expose network-route interception); relied on `e2e/remote-recovery.spec.ts`, which was re-run at the end of this pass and covers this exact scenario for {Vue, Next} × {iframe, Federation} — `4/4` passing.

Note on tooling: an earlier attempt to test keyboard activation via the Claude Code Browser pane's `computer` tool produced false negatives (`Enter`/`Space`/`ArrowRight` appeared not to activate buttons, including on Radix/reka-ui's own well-tested Tabs primitive). Switching to the real Playwright MCP server resolved this immediately — confirmed as a Browser-pane key-dispatch limitation, not an application defect. All keyboard findings below are from Playwright MCP.

## Findings

### Defects found and fixed during this pass

1. **`DataCloneError` on every iframe context sync (Vue Host).** Switching Vue Host to iframe mode threw `Failed to execute 'postMessage' on 'Window': #<Object> could not be cloned` on every render. Root cause: `IframePanel.vue` passes the Host's `context` (a Vue `ref`-wrapped object, therefore a reactive `Proxy`) straight into `postContextToRemote`, and the structured-clone algorithm `postMessage` uses cannot clone a Vue reactive Proxy. Fixed in `vue/host/src/lib/hostFrameAdapter.ts`: `postContextToRemote` now copies the three fields into a fresh plain object before posting. Verified: console errors went from 2 to 0 on the identical interaction after the fix; `48/48` `vue-host` unit tests still pass (the existing test used a plain-object fixture, so it never caught this — a live-browser-only defect class).
2. **Federated component styling silently broken (Next Host, Federation mode).** At `768px`, `REPLICAS` and `P95 LATENCY` labels rendered with **zero gap** (`gap: normal` instead of the intended `32px`), because `next/host`'s Tailwind build only scans `next/host`'s own source — it has no visibility into `next/remote`'s component source, so any Tailwind utility class used only by the federated component (never independently used inside `next/host`) compiles to no rule at all once the JS is loaded across the origin boundary. Module Federation carries JS, not CSS. Fixed by adding `@source` directives to `next/host/app/globals.css` pointing at `next/remote`'s `components/` and `app/` directories, so `next/host`'s Tailwind build pre-emptively includes every utility class the federated component might use. This is a real, generalizable finding for anyone pairing Module Federation with a utility-first CSS framework, not specific to this one class — documented inline in the fix.
3. **Cross-framework breakpoint mismatch (Next Host / Next Standalone).** The two-column → single-column collapse happened at `768px` in Next (Tailwind's default `md:` breakpoint) but `900px` in Vue (a custom `@media` rule matching `docs/design-direction.md`). At exactly `768×1024` — this report's own tablet breakpoint — the two tracks disagreed on layout for the identical scenario. Fixed by changing `md:grid-cols-…` to `min-[900px]:grid-cols-…` in both `next/host/app/page.tsx` and `next/standalone/app/page.tsx`, matching Vue's threshold exactly. Verified visually at `768×1024`: both tracks now show the single-column stacked layout.

All three fixes were verified live (before/after screenshots, console message counts, computed-style checks) and are covered by the existing automated suite: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass (`237/237` unit/component tests), and `pnpm e2e` passes `16/16` after the fixes.

### Non-defects (checked, no action needed)

- **Missing `favicon.ico`** on all six apps (`404` on every page load). Present but trivial; no `favicon.ico` is configured for any of the six scaffolds. Low severity, cosmetic only — noted, not fixed, since it doesn't affect any in-scope functional or accessibility requirement.
- **`[ Federation Runtime ]: The remote "vue_remote" is already registered` warning** when switching back into Federation mode after visiting iframe mode. This is the expected, intentional side effect of `loadFederatedMonitor`'s `force: true` re-registration (documented in that function's own comment — it exists specifically to make retry-after-outage work). Cosmetic console noise, not a functional defect; Federation mode continued to work correctly immediately after.

### Accessibility

- All 8 surfaces exposed correct landmark structure: `main`, `region "Model deployment monitor"`, `list "Deployment pulse rail"`, `group "Deployment context"`, `tablist "Composition mode"` with `tab`/`[selected]` states, `alert` for degraded-deployment and unavailable-Remote states.
- Every pulse-rail button carries a descriptive `aria-label` (e.g. `"Model X — degraded — 2/4 replicas"`) rather than relying on the glyph alone.
- `focus-visible` confirmed identical across both frameworks: `2px solid hsl(var(--platform-accent))` with `2px` offset (verified via computed style on Vue Remote and Next Remote) — the shared `@pilot/design-tokens` rule renders pixel-identical regardless of framework.
- One minor, non-blocking observation: the event-ledger panel (`"Standalone event ledger"` / `"Host event ledger"`) is exposed as a plain `generic` rather than a landmark role in both frameworks. Not required by the current design spec; noted as a possible future polish item.

### Keyboard flow

Full keyboard-only flow was exercised and confirmed working, end-to-end, on every surface:

- **Select controls** (Cluster/Model/Environment): `Enter` opens the listbox, `ArrowDown` moves selection, `Enter` confirms and closes — identical behavior in shadcn-vue and shadcn/ui.
- **Composition tabs**: `ArrowLeft`/`ArrowRight` switch Federation ↔ iframe (roving tabindex — `Enter` is not the correct key for tab switching and was not expected to work here).
- **Pulse-rail selection**: `Tab` reaches each node, `Enter` selects it, updates the Monitor view, and — in composed modes — posts the correct source-tagged event (`iframe` or `federation`) into the Host's event ledger.
- **Acknowledge**: `Tab` + `Enter` dismisses the degraded-deployment alert and posts `alert-acknowledged` to the ledger.

This exercised the same interaction paths as `e2e/*.spec.ts` but with real keyboard input instead of `page.click()`, and is the first time this project verified keyboard-only operability live rather than by assertion.

### Console / network

- Zero errors on every surface after the three fixes above (previously: Vue Host iframe mode had a `DataCloneError` on every context change).
- Federation mode's cross-origin chunks (`remoteEntry.js` and the component's own async chunks) all returned `200` with no CORS failures on both frameworks.
- iframe mode's framed document loaded from its own exact origin with no mixed-content or CORS warnings.

### Responsive (`1440×900` / `768×1024` / `390×844`)

- No horizontal overflow found on any surface at any breakpoint (`document.documentElement.scrollWidth` checked explicitly at the one surface that looked visually tight).
- Both tracks now collapse their two-column composed layout to one column at the same `900px` threshold (see defect #3).
- All text remained legible at `390px`; the only wrapping is the page eyebrow/description copy, which wraps by design.

## Verdict

`v0.1.0` gate item "No unresolved console, network, CORS, accessibility, or responsive defect remains" — **met** for the 8 surfaces and 3 breakpoints exercised in this pass. Two items remain explicitly out of scope for this report and are tracked separately in `TASK.md`: a dedicated keyboard-flow *automated* E2E spec (this pass was manual-live, not scripted), and the `130%` README screenshot capture pass (a separate, presentation-focused exercise from this QA pass).

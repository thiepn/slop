# SLOPOCALYPSE 3.1 — Phase 1 Verification

Date: 2026-11-03. Scope: global interaction foundation; **not** the full proposed 3.1 redesign.

## Preserved

- All original 44 HTML pages are present. Removing the two additive 3.1 tags from each new HTML page yields the byte-identical original 3.0 HTML.
- Existing base.css, s2.css, s3.css, slop-pages.css, slop-expansion.css and all original app/world scripts remain intact.
- Added only `s31.css`, `s31-core.js`, and documentation to the shipped site; original browser storage keys remain unchanged.
- New UI state lives at `slopocalypse:interaction:v31`, separately from `slopocalypse:fictional-internet:v2` and `slopocalypse:internet-collapse:v3`.

## Completed browser tests

- Chromium 144, in-memory execution of the exact HTML/CSS/JS sources, with a test shim for browser-local storage because browser navigation to local file/localhost is blocked in the sandbox.
- **176 checks:** all **44 pages × 4 viewports** (320px, 390px, 768px, 1440px) rendered with one functional 3.1 shell, loaded both legacy world engines, and had no uncaught JavaScript errors or horizontal document overflow.
- Functional: Ctrl+K launcher, all 44 navigable app links, live search filtering, Escape to close, focus restoration, background inertness.
- Functional: actual SlopSearch query -> mission unlocked -> **exactly one** 35-credit claim; cross-page credits and claimed status persisted in the test's simulated storage.
- Functional: 3.0 cascade creation still updates original news UI, shared fictional wallet and new activity panel.
- Functional: Calm and visual Slop Level are still controlled by the original 3.0 engine; 3.1 reduced-motion preference persists across page changes.
- Functional: SlopBook submission unlocks a second mission, claim persists across pages.
- Functional: exported local JSON backup contains all three versioned storage documents; no network requests were required.
- Static audit: original 44 HTML contents are preserved apart from additive CSS/script tags; all app launch destinations and local asset targets exist.

## Limits

- These tests are **not** evidence of a deployed site, actual payment, AI inference, physical-device operation, Safari/Firefox compatibility, or exhaustive interaction coverage of every original page.
- Import selection and confirmation are implemented, but full browser download/upload round-trip recovery is not certified by this suite; use a manual backup before importing on a real browser.
- Phase 2 will address deeper shared world-state consolidation, cross-tab transaction handling, rewards, and deterministic consequence processing.
- Existing page-specific UI continues to have some of the original intentionally cluttered styling; detailed app redesign comes later.

# SLOPOCALYPSE 4.0 — Draft PR implementation and qualification

## Scope and exact baseline

- Baseline: `thiepn/slop` `main` commit `c2d7e3c11076f046b77f5e4354dc51bda9cbdcc7` (Phase 10).
- No existing HTML page is edited or deleted. The existing `s31-core.js` receives only a small additive local-asset loader.
- Added `s40-world.js` and `s40.css`; added reproducible Chromium test scripts.
- No deployment, main update, Pages workflow change, API call, actual AI, payments, or multiplayer service.

## Gameplay delivered

- Three authored branching fictional campaigns: Quantum Mango Crisis, Mars-East-1 Has Feelings, Algorithmic Mayor Election. Each has a first decision, a branch-specific second scene, and a final decision with three distinct endings.
- Eight distinct fictional citizens with goals, traits, trust, energy, mood, reciprocal relationship values, and an eight-entry memory of important actions.
- Seeded deterministic clock and pseudorandom reactions. Manual `+1 hour` and `+1 day` controls plus pause/resume; automatic advance only while the page remains open and visible.
- Persistent timeline, decisions, replay with one-time reward keys, three scenario checkpoint slots and explicit seed selection before gameplay.
- Decisions project into older simulated news/social/court feeds; the originating v2 record simultaneously updates fictional inbox, recent activity, and VIBE price. A durable outbox retries older v3 projections.
- Shared UI entry point from every page via the legacy shell loader; an additional entry on `singularity.html`. Four keyboard-navigable tabs, accessible close behavior and focus restoration.

## Durability and upgrade boundaries

- All 4.0 state is nested in the existing `slopocalypse:fictional-internet:v2` record under `phase40`; **no fifth storage key** was introduced. The four-store backup export and checksum format (`version: 2`) remains unchanged.
- Old Phase 10 backups with no `phase40` initialize a new empty 4.0 simulation without changing the other saved records.
- Three checkpoints snapshot only the fictional 4.0 clock, characters and campaigns. Loading/replaying never erases older mail, marketplace transactions, achievements, credits or external news; completed public effects remain historical.
- Reward grants are one-time per campaign/stage and completion; replaying an alternate branch does not repeat awards.
- The v32 lock coordinates new 4.0 writes and projection attempts when native Web Locks are available. Legacy app transactions that do not participate in that lock can still race in a real multi-tab environment; this remains an open qualification gate.
- A v2 commit is authoritative. If the v3 projection fails, its event stays in a bounded retryable outbox. Successful projections are acknowledged by stable event ID; there is no cross-store atomic transaction guarantee.
- The world engine bounds event history (130), live effects (120), pending effects (30), character memory (8 each), and checkpoints (3). Backups still have the pre-existing 3 MB maximum.

## Test evidence

### Executed

1. `python tests/phase40_qualification.py`: **54 / 54 PASS** in Chromium 144 through `set_content` with inlined repository JS/CSS and simulated localStorage. Included three complete scenarios, alternate endings, reward-repeat protections, markets, mail, news/social/court projections, memory, checkpoint recovery, actual existing v32 backup export/validation/restore, tamper rejection, simulated quota failure, v3 outbox/retry, cross-page hydration, dialog keyboard, and four responsive widths.
2. `python tests/phase40_responsive.py 0 11`, then `11 22`, `22 33`, `33 44`: **176 / 176 PASS** (44 pages x 320, 390, 768, 1440 px). No uncaught browser JavaScript errors or document horizontal overflow in the tested initial state.
3. Two fresh Chromium pages using the identical seed `deterministic-seed-1`, each advancing 24 simulated hours: identical pseudorandom state, clock and six citizen events (**PASS**).
4. `node --check s31-core.js` and `node --check s40-world.js`: **PASS**. Existing 44 HTML pages remain unmodified at the source level.

### Environment and evidence limits

- Chromium's sandbox disallowed `data:`/`localhost` page navigation in this environment. Tests used real headless Chromium DOM interactions but **injected original assets into a same-document `set_content` harness with simulated localStorage and simulated lock API**. Therefore, these tests do **not** verify native Web Locks, BroadcastChannel, same-origin synchronization, persisted browser storage, or actual GitHub Pages runtime navigation.
- Firefox, WebKit, Android/iOS physical devices, screen readers, and exhaustive assistive-technology behavior were **not** verified. The responsive sweep checks initial rendering, not every expanded/dynamic state across all 44 pages.
- Cross-store transaction atomicity cannot be claimed. The design retains an outbox so failures can be retried, but older legacy code may write simultaneously without coordinating.
- An overlay screenshot is a real Chromium in-memory rendering, not a screenshot of deployed production.

## Release disposition

**Draft PR / human review pending.** `main`, GitHub Pages deployment, existing storage schemas and all 44 original HTML files are unchanged. Do not merge/deploy until desired review and native same-origin acceptance are complete.

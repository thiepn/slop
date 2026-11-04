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

## Draft PR #1 hardening continuation (2026-11-04)

**Source of truth:** existing draft PR #1, starting exact head `1e19e487d443b3a57aca1718c85f050aa75a8769`, main `c2d7e3c11076f046b77f5e4354dc51bda9cbdcc7`. No merge or production deployment authorized. All 44 HTML pages and the GitHub Pages workflow remain unchanged.

### Reproduced defects and corrections

1. **Lost form drafts and keyboard focus:** While the Save Slots tab was open, typing `My unfinished typing` and causing a separate legacy `SlopWorld.announce()` update replaced the input with `Checkpoint 1`, cleared the draft and removed focus. `render()` now preserves a focused input's draft, caret, and keyboard focus across simulated world updates, and restores stable focus after action re-renders.
2. **Changing the deterministic seed after starting play:** A user could start the Cloud campaign and then successfully switch seeds before taking the first decision. The seed could also be changed after one simulated hour without an event. Re-seeding now requires a world without begun campaigns or advanced time. Validation failures preserve existing state and report a specific reason.
3. **Checkpoint RNG/seed mismatch:** Old slots saved the pseudorandom state but not the matching seed. Saving a new slot now records the seed; loading it restores both. When a user changes seed, old Phase 4.0 slots that lack a seed are updated in place to retain their previously active seed. Old slots remain loadable. Historic slots whose seed had *already* been changed by a prior build cannot be reconstructed with certainty.
4. **Checkpoint erasing historical discoveries (introduced while adding ending discovery):** Replaying to a second ending and then loading an earlier checkpoint lost the endings archive. Checkpoint loads now preserve discovered endings and the historical completion counter while rewinding the current story, RNG and citizens. Credits and past news/mail are not reversed.

### Gameplay and accessibility improvements

- Every completed campaign now tracks its unique discovered endings (three possibilities per campaign) without granting duplicate completion rewards. The story view shows found endings and masks undiscovered outcomes; replay preserves discoveries.
- Decision history displays authored decision labels and headlines rather than only internal node/option IDs.
- The modal's background and global launcher are inert while open and restored to their prior state on close. Its four tabs now control an explicitly labelled tabpanel; keyboard focus returns to the launcher on Escape.
- No new top-level storage keys, no changed backup checksum format, no backend, no new page, and no edits to legacy 2.0/3.0 engines.

### Executed qualification on the final source

- `python tests/phase40_qualification.py`: **54 / 54 PASS** in headless Chromium DOM via in-memory storage/lock harness (existing suite).
- `python tests/phase40_hardening.py`: **42 / 42 PASS** in the same harness (new targeted real-browser regression suite). Checks include draft/focus restoration; tab semantics and inert background; legacy slot migration; seed locking; two distinct endings; repeat-reward protection; checkpoint discoveries; four-store backup validation; cross-page hydration; quota rollback; and no uncaught JS exceptions.
- `python tests/phase40_responsive.py` run in four page batches: **176 / 176 PASS** across 44 pages and widths 320, 390, 768, 1440 px. No observed overflow or JavaScript exceptions in initial page states.
- `node --check s40-world.js`, `node --check s31-core.js`: **PASS**. Static source preservation: 44/44 existing HTML files unmodified; initial PR loader `s31-core.js` unmodified during this continuation.

### Limits / remaining gates

The in-memory Chromium harness uses actual JavaScript and DOM but simulated `localStorage` and Web Locks. It does not verify native origin/session persistence, true concurrent tabs, BroadcastChannel cross-tab ordering, Firefox/WebKit, physical-device accessibility, or real screen readers. The old v2/v3 cross-store projection outbox remains a retryable best-effort mechanism rather than an atomic distributed transaction. The GitHub Pages workflow only runs on `main`; this draft must not be merged or deployed until explicitly authorized.

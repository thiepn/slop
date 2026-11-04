# SLOPOCALYPSE 3.1 — Phase 7: Hardening and release qualification

## Source and preservation

- Exact source archive: `SLOPOCALYPSE_3_1_Phase6_Legacy_Apps_Final_Qualification.zip` (as delivered in the conversation).
- All **44** HTML routes and all **83** baseline files preserved. No baseline files were removed or renamed.
- Existing Phase 1–6 UI features remain; no production backend, AI inference, account, payments, or external integration was introduced.
- The original v2, v3, v31 and v32 storage keys and backup format were retained. Newly added v2 `rewardBudget`/`revision` metadata is additive and is included automatically in ordinary JSON backups.

## Reproduced defects and precise repairs

1. **Unlimited legacy credits:** 2.0 and 3.0 buttons previously issued the same reward on every click. Confirmed by repeating a `SlopWorld.earn` reward in a real Chromium DOM session. A durable, lifetime **three-reward cap per existing reward reason** is now enforced in the shared v2 wallet; the original one-time Singularity reward has a cap of one. Existing balances are unchanged, and actions still work after their credit promotion is exhausted. This is an ordinary-UI anti-exploit mechanism, not protection against deliberate localStorage edits or developer-console manipulation.
2. **Invisible v2 save failure:** v2 mutations previously swallowed storage exceptions but could still appear successful. All new v2 writes now return a Boolean, verify read-back, restore the previous in-memory snapshot on failure, and show a local failure toast. Phase 3–5 write wrappers now report failed saves instead of announcing a success. Phase 6's existing read-back verification is retained.
3. **v3 phantom credits after quota exhaustion:** 3.0's `save()` now verifies read-back, signals a `slop3:storage-error`, and withholds further 3.0 credit rewards while its storage is unavailable. Its existing in-memory simulation may remain visible until reload when storage fails; a full transactional rewrite of every legacy v3 side effect is intentionally *not* claimed.
4. **Mission rollback defect:** A fault-injection test reproduced a case where a failed v32 ledger write rolled back the wallet on disk but left the mission marked claimed in memory. The failure path now force-refreshes the in-memory v32 ledger from the durable rollback snapshot, refreshes legacy views, and permits a successful retry without double-paying.
5. **World ledger write failure:** `exclusive()` now recovers its in-memory state from durable storage when a write throws. Failed external event projections do not remain visible as phantom awards.
6. **Backup size accounting:** Backup limits use **UTF-8 byte length**, not JavaScript character count. Oversize exports are rejected explicitly, more large collections are checked, and read-only storage health is available.
7. **Small-screen overflow:** The new operational control initially overflowed the 320px top bar. At <=375px the redundant Activity header shortcut is hidden while Activity remains accessible from the launcher. All four viewport widths then passed.
8. **Missing legacy slider names:** Added accessible names to the original Singularity slop-level slider and Generator inception-depth slider.

## New, functional local Data Health dialog

- Available from the new diamond control in the existing top bar on all 44 pages.
- Inspect each storage key's size, total local data, estimated backup bytes, whether the backup validates, and exhausted legacy reward categories.
- Reconcile the versioned event ledger, refresh read-only diagnostics, or export a verified JSON backup.
- `role=dialog`, `aria-modal`, labeled controls, initial focus, focus wrapping, Escape-to-close, focus restoration, and background inertness. Ctrl+K is blocked while this second dialog is active to avoid competing modal overlays.
- Supports mobile layouts and reduced-motion preferences. Imports remain in Control Center → Settings, avoiding a second competing import implementation.
- No automatic history deletion or silent garbage collection. Existing user content is preserved.

## Browser and static qualification

- **80/80** preserved Phase 6 multi-app workflow/recovery assertions passed again.
- **27/27** targeted reward, persistence, cross-app, size, and backup assertions passed.
- **22/22** targeted accessibility and interrupted-restore assertions passed after correcting a test fixture that initially contained no persisted v3 document.
- **8/8** legacy quota-failure and mission-write rollback/retry assertions passed after fixing the in-memory claim rollback defect.
- **5/5** near-limit UTF-8 backup stress checks passed, including a valid ~2.75 MB ASCII snapshot and an oversize multi-byte Unicode snapshot rejected without exporting.
- **176/176** responsive checks passed: all 44 HTML pages at 320, 390, 768, and 1440 CSS pixels, with no detected horizontal overflow or uncaught page errors.
- A focused **44-page accessibility-oriented DOM scan** found 820 visible buttons with accessible names, 163 visible form controls with labels/accessible names, and zero missing `alt` attributes. This is not a full WCAG or assistive-technology audit.
- Local link and anchor audit: **3,432** local href/src references, **108** fragment links, no missing local targets, no duplicate HTML IDs, all baseline files present.
- All shipped `.js` files passed Node syntax checks; release ZIP passed integrity check.

## Environments and limitations

- The actual Chromium browser engine executed in a **real DOM, in-memory HTML/CSS/JS harness with a browser-localStorage shim**, not through genuine HTTP navigation. Direct `http://127.0.0.1` navigation was blocked in the automated Chromium environment (`ERR_BLOCKED_BY_ADMINISTRATOR`), although a Python HTTP server served the files correctly to `curl`.
- Native two-tab Web Locks and BroadcastChannel contention were **not verified**: the in-memory harness has no usable native `navigator.locks` and cannot provide realistic shared-origin localStorage. v32 work remains serialized where Web Locks are available; the synchronous v2/v3 legacy API retains best-effort rebase/BroadcastChannel refresh and cannot guarantee conflict-free simultaneous native writes.
- Firefox, WebKit/Safari, real mobile hardware, screen readers, and complete WCAG success-criteria coverage were **not tested**. Only Chromium is available in this runtime.
- The checksum on JSON backups is FNV-1a for accidental corruption detection, **not a cryptographic authenticity signature**. Users can edit their own fictional local data.
- Storage failures in old v3 workflows are now explicitly signaled and prevent credit awards, but not every legacy cross-app side effect is rolled back as one atomic transaction. Avoid presenting simulated local state as financially secure or suitable for real accounts/data.
- Local progress remains bound to browser origin and port. Export a JSON backup before upgrading, resetting, changing ports, or switching browsers.

## Launch

Extract the ZIP and start `START_WINDOWS.bat` or `START_MAC_LINUX.sh` with Python 3. Open `http://127.0.0.1:8765/index.html`. The game stays local; no network connection is required after extraction.

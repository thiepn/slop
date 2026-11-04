# SLOPOCALYPSE 4.0 — Native wallet/claim hotfix (draft qualification)

**Base**: `main` commit `2057290cbbc5fab688b701ba80959b22f2c09742`. This changes only the proposed hotfix branch; no merger/deployment authorized.

## Reproduced baseline defects (native GitHub Actions #41871115214)

- Chromium: two concurrent mission calls both reported success, awarded +74 instead of +37; only one v32 claim marker remained.
- Chromium/Firefox/WebKit: synchronous two-tab legacy `SlopWorld.earn` lost credits (reported 24 successful calls and final balance less than expected).
- Firefox: a page-error message during the deliberate quota denial (`Could not commit the fictional world. Existing progress was not changed.`). Needs isolation to distinguish an unhandled application exception from error-injection instrumentation.
- awards.html: 320px page overflow (331px document; no element bounding-box offender). Not consistently reproduced by the current local in-memory Chromium harness.

## Changes under test

1. `s2-world.js`: `earn()` uses the existing cross-tab Web Lock (`slopocalypse-v32-write`) when available. Legacy callers may ignore the returned promise; consumers needing confirmation must await it. Without Web Locks, fallback remains legacy best-effort. No persistent key changes.
2. `s32-world.js`: one-time mission claims put an optional `rewardClaimsV32[id]` marker and credits in a **single v2 mutation**. Both the live v32 marker and the v2 marker are checked inside the lock. Existing four-store backup format and old v2 saves remain compatible.
3. `tests/hotfix_regression.py`: targeted in-memory regression for earning, claim deduplication under stale v32/ui views, backup roundtrip validation and save failure. **9/9 PASS** locally.

## Executed local qualification

- All six inherited Chromium functional suites: 54 + 42 + 50 + 51 + 83 + 50 = **330/330 PASS** (the final suite run separately after aggregate runner timeout).
- New focused test `python tests/hotfix_regression.py`: **9/9 PASS**.
- `node --check` on the two changed JS source files: **PASS**.
- Native same-origin localhost navigation is restricted locally (`net::ERR_BLOCKED_BY_ADMINISTRATOR`). GitHub Actions Chromium/Firefox/WebKit qualification is mandatory; the local in-memory test is NOT native concurrency proof.

## Release-blocking limitations

- **General synchronous `SlopWorld.mutate` operations remain best-effort** and cannot be made truly atomic across tabs without moving them to an async transaction API. This change serializes `earn`, not arbitrary direct synchronous credits/holdings mutations. A complete wallet audit and migration to locked asynchronous mutations remains necessary before claiming general cross-tab safety.
- The Firefox injected-quota page error and 320px awards overflow require new native evidence; neither has a verified correction in this initial patch.
- No human or screen-reader/device testing.

## Safety

- Four-store version-2 backup format unchanged; old saved progress and mission rewards never reset or overwritten.
- `main`, original HTML, historical campaign and endings content, and Pages deployment workflow remain untouched.
- Never merge automatically. Native browser failures are meaningful CI blockers; do not weaken tests to obtain a green result.
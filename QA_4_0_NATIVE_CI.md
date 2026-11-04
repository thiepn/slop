# SLOPOCALYPSE 4.0 — PR-native browser qualification

Exact starting PR #1 HEAD: `06dc5b1b37376f4eaa5b3c2e18a0bcdfd03d4e31`.
Main: `c2d7e3c11076f046b77f5e4354dc51bda9cbdcc7`.

This change adds **PR-only test infrastructure**, not production code, HTML, saves, rewards or deployment settings. Workflow has `contents: read` only; the original Pages workflow remains unchanged.

## Local baseline

The six original Chromium in-memory functional suites passed: 54 + 42 + 50 + 51 + 83 + 50 = **330/330** assertions. All 44 original pages at 320, 390, 768 and 1440px passed **176/176** checks in four batches. The local native-origin attempt remained **BLOCKED** by `net::ERR_BLOCKED_BY_ADMINISTRATOR`; a policy-blocked test is never counted as passing.

## GitHub CI

`.github/workflows/pr-native-qualification.yml` checks out the **actual PR head** and runs:

- The six existing Chromium regression suites plus all 176 responsive checks.
- Three separate native jobs using installed Playwright Chromium, Firefox and WebKit.
- The existing `tests/native_qualification.py` on real loopback HTTP, testing genuine localStorage, Web Locks, BroadcastChannel, two-tab claim, legacy concurrent wallet stress, backup checksum, reload and keyboard navigation.
- New `tests/phase40_native_ci.py` on a real loopback origin for two-tab 4.0 clock updates, campaigns, checkpoint rehydration, deterministic replay, four-store backup restore, quota rollback, keyboard semantics and five-page × four-width responsive checks.

The workflow always uploads raw JSON and logs where available. Job failure is meaningful; browser installation alone is not a passing qualification. The legacy synchronous v2 wallet stress is a sample, not a proof of race freedom.

## Outstanding qualification

Until exact-head GitHub Actions have completed, native results remain **PENDING**. Even successful automated browser checks do not substitute for screen-reader evaluation, physical devices, or human gameplay acceptance. PR #1 must stay open and draft; no merge, Pages deployment, live migration or release is authorized.

## First actual GitHub CI findings (run 41870232635)

Real loopback HTTP succeeded in all three browsers. Native Web Locks, BroadcastChannel and shared storage passed. The **six functional suites passed in GitHub CI** (330/330). All three browsers reproduced an existing legacy v2 lost-update hazard during simultaneous synchronous `earn` writes (run remains RED). Firefox also showed a false-positive return value from one concurrent mission claim, although the final wallet had only one credited reward and one marker. A narrow durable-marker recheck has been added in the v32 claim path; it requires requalification on the new exact head. The new 4.0 test initially read `phase40.tick` before the lazily initialized record was persisted, an invalid test precondition; the test now initializes it. The responsive regression reproduced 320px overflow on awards.html in CI; diagnostics now identify the responsible element. No layout change made without evidence.

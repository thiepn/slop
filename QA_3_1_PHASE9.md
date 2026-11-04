# SLOPOCALYPSE 3.1 — Phase 9 Qualification Record

## Outcome: targeted repairs delivered; native qualification **NOT completed**

Phase 8 baseline SHA-256: `338c667a417bf4cd274d0b4a8b26457843c38e72e1fa865aedb8811ad7be8860`.
All **44 existing HTML pages**, previous phases and offline/local-only behavior are retained. Of 92 baseline archive files, 90 are byte-for-byte unchanged; the only modified pre-existing files are **`s2-apps.js` and `s32-world.js`**. No baseline files were removed; the changes preserve the v2/v3/v31/v32 keys and backup format v2. New optional test and QA files were added without requiring them at runtime.

## Reproduced regressions and targeted fixes

1. **External event replay after bounded history overflow** — `s32-world.js`.
   - Phase 8 reproduction: the first `recordExternal('repeatable-action')` was accepted; after 625 unrelated events, the identical ID was incorrectly accepted again, raising influence from **2 to 4**.
   - Fix: optional `externalSeen` in the existing v32 store holds at most 4096 external IDs independently of the 600 recent IDs. The existing source acknowledgement policy remains unchanged. On restore, older v32 files populate acknowledgements from surviving `seen` IDs.
   - New check: **900 subsequent events**, replay rejected, identical influence; persisted across reload and export/import. Backup checksums and quota failure rollback still pass.
   - Residual risk: the new registry is intentionally bounded to 4096 IDs; very old IDs beyond that window may eventually replay. Phase 8 files that already evicted an ID cannot retroactively restore its acknowledgement. No global forever-exactly-once guarantee is claimed.

2. **Legacy SlopCoin purchase could debit without giving tokens** — `s2-apps.js`.
   - Phase 8 reproduction: force the second legacy wallet write to fail; buying 1 SLOP cost 12 credits. The interface showed a **successful trade and receipt**, the balance became **1192 after a later bonus**, but token holdings remained **0**.
   - Fix: token holdings, wallet debit/credit, and transaction receipt now commit in **one checked `SlopWorld.mutate` call**. An unsuccessful write reports failure with no changes. The separate optional capped engagement reward still runs only after a successful trade.
   - New check: an injected quota error leaves wallet **1200**, holdings **0**, receipts **0**, with an error message; normal buy/sell creates correct corresponding balances and receipts.
   - Residual risk: one synchronous localStorage write is coherent on a single tab, but cannot guarantee isolation against simultaneous real-tab writers; that is an outstanding native test and architectural limitation.

## Actual completed validation

| Verification | Outcome | Method |
|---|---|---|
| Targeted Phase 9 checks | **14/14 pass** | Headless Chromium using actual page scripts and an explicit in-memory `localStorage` test double |
| Prior Phase 8 focused regression | **15/15 pass**, run in 4 separate batches | Chromium DOM + test double; 60 successful repeated checks, 15 distinct assertions |
| Full page/viewport sweep | **176/176 pass** | 44 pages × widths 320, 390, 768, 1440px; zero detected uncaught page errors or horizontal overflow |
| Native Chromium local HTTP attempt | **BLOCKED** | HTTP server returns 200, browser reports `net::ERR_BLOCKED_BY_ADMINISTRATOR` |
| Firefox | **UNAVAILABLE** | No Playwright Firefox executable installed |
| WebKit | **UNAVAILABLE** | No Playwright WebKit executable installed |
| Native Web Locks / BroadcastChannel two-tab | **NOT EXECUTED** | Cannot establish a permitted real browser-origin context |
| Accessibility | **PARTIAL** | Chromium CDP `Accessibility.getFullAXTree` exposes interactive roles; Ctrl/⌘+K opens correctly focused dialog, Escape closes; **not** real assistive-technology use |
| Local HTTP status | **PASS** | Index, SlopOS, SlopCoin and SlopNews return HTTP 200 outside the browser |
| Source JavaScript syntax | **PASS** | `node --check` for all site `.js` source files |
| Links and fragments | **PASS** | 3396 local references resolve, zero missing fragments or external dependencies |
| ZIP checksum/integrity | **PASS** | Verified by `ZipFile.testzip()` and complete file list after packaging |
| Real idle/resume and long sessions | **LIMITED** | 900-event accelerated stress plus 3-second real idle/new-page reload, **not** a 4-hour soak |

## Exact evidence files

- `qa_evidence/phase9_targeted.json` — 14 test cases and details
- `qa_evidence/phase9_native_runtime.json` — native browser blocked/unavailable results
- `qa_evidence/phase9_static.json` — changed/unchanged baseline file hashes, links and page count
- `qa_evidence/phase9_pages_results_0_11.json`, `...11_22.json`, `...22_33.json`, `...33_44.json` — four real browser DOM sweeps
- `qa_evidence/phase9_summary.json` — machine-readable release summary
- `qa_evidence/phase9_mobile_smoke.png` — inline-harness mobile screenshot, **not a native HTTP-origin screenshot**

## Native qualification on a suitable developer workstation

An **optional real-origin** executable suite is included in `tests/native_qualification.py`. This is not required for using the site. It launches a local HTTP server, attempts native same-origin two-tab `localStorage`, Web Locks mutual exclusion, BroadcastChannel messaging, simultaneous mission claims, real reload, idle/resume and keyboard navigation, and tries Firefox/WebKit if installed.

Run from `slopocalypse_site/`:

```bash
python -m pip install playwright
python -m playwright install chromium firefox webkit
python tests/native_qualification.py --idle-seconds 5
```

For a true four-hour soak, use `--idle-seconds 14400` on an available machine. By default the test uses an **ephemeral localhost port** so it does not access or mutate production progress stored under port 8765. A nonzero exit code means a blocked, unavailable or failed qualification; inspect `qa_evidence/phase9_native_runtime.json`.

## Release position and Phase 10

**Do not label native cross-browser or Web Locks qualification as passed.** These capabilities are not verified in this environment. Before making concurrency guarantees, run the included script with real allowed same-origin pages in Chromium, Firefox and WebKit; reproduce and repair any lost-update races. Perform actual screen-reader assessment, physical mobile testing and meaningful multi-hour soak independently. There is no deployment, remote account, real money or external AI service in this release.

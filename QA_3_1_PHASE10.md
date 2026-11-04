# SLOPOCALYPSE 3.1 — Phase 10 qualification and repair

**Status: targeted repair delivered; real-origin two-tab and cross-browser qualification NOT completed.**

Baseline is exactly `SLOPOCALYPSE_3_1_Phase9_Native_Qualification.zip`, SHA-256 `6c27725280010d4cca7eb49aca5aa0e6d449a8a63fe4074d19a45181aab4e727`.

All **44 original HTML pages** are included and **unchanged byte-for-byte**. No baseline file was deleted, and the pre-existing save keys (`slopocalypse:fictional-internet:v2`, `slopocalypse:internet-collapse:v3`, `slopocalypse:interaction:v31`, `slopocalypse:world-engine:v32`) and v1/v2 backup compatibility remain intact. The only modified pre-existing files are `s32-world.js` and the optional `tests/native_qualification.py`. Test evidence and three optional test scripts are additive.

## Reproduced defect and minimal repair

- **Long-session replay after 4,096 external event acknowledgements.** The Phase 9 code retained only the newest 4,096 external IDs; after 4,105 later events, a replay of the oldest ID was accepted and repeated its influence reward (5 → 10). See `qa_evidence/phase10_repro_4096_before.json`.
- **Repair.** Keep the existing readable 4,096-ID window, and additionally store a 64-KiB, seven-hash compact membership filter for external event IDs inside the existing v32 state (`externalFilter`, optional). This field is introduced only when a new external event is recorded. A replay after 4,105 newer events is rejected without adding an event or influence (5 → 5). See `qa_evidence/phase10_repro_4096_after.json`.
- **Compatibility.** Old v32 states without `externalFilter` build the filter from surviving exact IDs. v1/v2 backup import, checksum validation, restore journaling, and storage-write failure rollback were exercised. No historical event ID that was *already evicted from a Phase 9 save* can be reconstructed.
- **Limit: probabilistic membership.** A compact membership filter can produce *false positives*, suppressing a previously unseen event. It is **not** a mathematically exact, unlimited-lifetime deduplication mechanism. At very high event counts false-positive risk increases. The exact 4,096-ID window remains; no claims of unlimited exactly-once delivery are made. The filter encodes to 87,384 base64 characters (about 87 KB of additional JSON text). The backup remains beneath the existing 3 MB safety cap in tested states.

## Native browser attempts (actual test runner)

Executed `python tests/native_qualification.py --idle-seconds 2 --output qa_evidence/phase10_native_final.json`, without altering security policy or origin rules:

| Target | Recorded result | What was actually executed |
|---|---|---|
| Chromium same-origin HTTP | **BLOCKED** | Local HTTP server started; browser `page.goto` returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` |
| Firefox | **UNAVAILABLE** | Playwright Firefox browser executable missing |
| WebKit | **UNAVAILABLE** | Playwright WebKit browser executable missing |
| Native two-tab Web Locks, BroadcastChannel, simultaneous mission claims | **NOT EXECUTED** | Browser origin never became accessible |
| Native legacy cross-tab lost-update stress | **NOT EXECUTED** | Optional future native runner now includes repeated paired legacy reward writes |
| Real screen readers and physical mobile devices | **NOT TESTED** | No assistive-technology/device automation in environment |

`qa_evidence/phase10_native_baseline.json` and `phase10_native_final.json` record the actual blocked/unavailable outcomes. Exit code **2** explicitly means *incomplete*, not success. The HTTP server separately returned 200 responses for representative pages, but this does not establish browser origin access.

## Successfully executed tests

| Suite | Result | Scope/limitations |
|---|---|---|
| Phase 10 replay, migration, failure and recovery | **13/13 pass** | Real headless Chromium DOM plus explicit in-memory localStorage double; 4,105-event replay, backup roundtrip, version compatibility, checksum tampering, interrupted restore recovery, near-quota failure, retry, keyboard dialog and native Chromium accessibility-tree roles |
| Re-run of Phase 9 targeted tests | **14/14 pass** | 900-event idempotency, SlopCoin atomic buy/sell and quota failure, 3-second idle simulation, older backup compatibility; same in-memory storage method |
| Original Phase 6 complete workflow regression | **80/80 pass** | 13 legacy app workbenches, rewards, refunds, cross-app consequences and backup restoration through the original browser harness |
| All-page responsive/browser DOM sweep | **176/176 pass** | 44 pages × 320, 390, 768, 1440px; no detected overflow, missing Control Center or uncaught JS page errors |
| 30-second open-tab idle/resume | **PASS** | Chromium DOM stayed open for a real 30 seconds using a localStorage test double; old event stayed acknowledged, new event accepted; **not** a multi-hour, native-origin soak |
| Static/HTTP/syntax audit | **PASS** | 44 HTML pages, all 3,396 local references present, no broken fragment links or remote dependencies, `node --check` for all JavaScript files, representative local HTTP 200 responses |

Evidence: `qa_evidence/phase10_replay_recovery.json`, `phase10_previous_regression.json`, `phase10_pages.json`, `phase10_idle.json`, and `phase10_static.json`. The original Phase 1–9 evidence is preserved. The test suites have not performed actual assistive-technology navigation or Firefox/WebKit execution.

## Repeatable tests on a permitted workstation

These scripts are **optional development checks**; the site itself needs no Playwright dependency.

```bash
cd slopocalypse_site
python -m pip install playwright beautifulsoup4
python -m playwright install chromium firefox webkit
python tests/native_qualification.py --idle-seconds 120 --stress-pairs 20 \
  --output qa_evidence/phase10_native_on_workstation.json
```

The native runner uses a fresh ephemeral localhost port by default so that it does not read or alter an existing user's `:8765` origin. It tests two same-origin real pages, capabilities, storage visibility, BroadcastChannel, Web Locks mutual exclusion, simultaneous mission claims, paired legacy reward-write stress, reload/idle, backup checksum verification, keyboard dismissal and control naming. Its results **must be inspected**; even a passing finite test cannot prove absence of all races. A longer idle soak requires a correspondingly longer run (e.g. `--idle-seconds 14400`) on an available machine.

The headless DOM/test-double regression suites are also provided:

```bash
python tests/phase10_replay_recovery.py
python tests/phase10_pages.py
python tests/phase10_idle.py
```

## Release position and follow-up

This is a valid **targeted Phase 10 reliability update**, not certified native cross-browser concurrency qualification. Native legacy v2 synchronous writes remain susceptible to unverified simultaneous-tab lost updates because they do not use the v32 Web Lock. Do not promise atomicity or advertise production-grade multi-tab safety until a permitted browser-origin environment reproduces and resolves any observed failures. Retain a progress backup before upgrading; keep the same browser and local-server origin when continuity matters. No real financial transactions, accounts, external AI services, or publication are involved.

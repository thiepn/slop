# SLOPOCALYPSE 3.1 — Phase 8: Native Browser & Long-Session Qualification

## Release outcome

**Targeted hardening delivered; native cross-tab and cross-browser qualification remains blocked.** This is **not** a claim that all requested qualification gates passed.

Baseline: `SLOPOCALYPSE_3_1_Phase7_System_Hardening.zip` SHA-256 `d5d6d984ae0dcfe77576a4f09f84a3c3f5357353ea2185c72847d36360157d9e`. All 44 original HTML pages preserved. Of the 87 original files, 83 are byte-for-byte unchanged and exactly four existing JavaScript files have targeted edits. No original file was removed. The backup schema remains format v2 with four stores, and the v32 state remains version 32.

## Reproduced defects, fixes and evidence

1. **Event replay after bounded history overflow** (`s32-world.js`). Reproduction: save a research fact; process it once (1 Citation Crystal); record 625 unrelated external events; run sync. On Phase 7, the old fact reprocessed and produced a **second crystal** because the 600-ID cache evicted its acknowledgement. Fixed with `sourceSeen`, a separately maintained, bounded acknowledgement set for **currently observable legacy source IDs**. After fix: **1 -> 1**, 625 external events; recent-ID cache <=600 and event list <=160. This also survives inclusion in backups. This is not an unbounded lifetime ledger for archived or reintroduced sources.

2. **Mock advertising debit without a saved advertisement** (`s3-world.js`). Reproduction: force a quota error on the 3.0 write; `buyAd(...,50)` originally returned success and deducted 50 credits, with no ad persisted. Added a temporary, recoverable journal and rollback across the existing two stores. After fix: returns failure, **0 credits lost**, **0 phantom ads**, journal cleared. Success case: 75-credit debit, then the existing +4-credit engagement reward (**net -71**), one persisted ad. A simulated interrupted transaction also rolled back on next page initialization. This journal applies to this ad flow, not every legacy cross-store action; true cross-tab races remain a caveat.

3. **Misleading success on legacy storage failures** (`s2-world.js` and `s2-apps.js`). Installing an app or generating a fact could report success when the write failed. Installation/uninstallation now check durable mutations, `hallucinate` returns null on failed storage, and the search results handler avoids dereferencing a failed fact. An unsaved global incident no longer triggers its success notification. Failure injection verified no installed phantom app and no unsaved fact.

## Executed verification

| Test | Completed result |
|---|---|
| Focused functional/recovery tests | **15/15 passed**, repeated in four batch executions (60 successful checks) |
| Responsive browser DOM sweeps | **176/176 passed**, 44 pages x 320, 390, 768, 1440 px |
| Visible-control accessible-name spot check | **209 buttons and 36 form controls** across 9 representative mobile pages; no unnamed controls found |
| Data Health dialog | Role/dialog focus and Escape close verified in Chromium |
| Script syntax | All JavaScript source files passed `node --check` |
| Local references | **3396 references resolve**, zero broken anchors or missing relative files |
| External runtime asset references | None found in the static HTML scan |
| ZIP content | All 44 original HTML pages and unchanged startup scripts retained |
| Backup verification | Valid export/import, checksum-tamper rejection and UTF-8 >3 MB import rejection passed in the in-memory harness |
| Interrupted restore | Failure-injected restore rolled back; torn ad-purchase journal recovered on new page instance |

The browser interaction tests used **Chromium 144.0.7559.96**, `page.set_content`, and an explicitly simulated `localStorage` persistence layer because browser navigation was blocked. This exercises the actual HTML/CSS/JavaScript and DOM but **does not** exercise real same-origin multi-tab APIs.

## Qualification gates not completed

- Real Chromium navigation to `http://127.0.0.1:8765` returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`, despite the server responding HTTP 200 to curl. `file:`, `data:`, and arbitrary HTTPS navigation were also blocked. **Native two-tab Web Locks, BroadcastChannel and storage consistency were not verified.** Neither browser policy nor storage simulation is evidence of native correctness.
- Firefox and WebKit Playwright browser executables are not installed in this environment. No Firefox or WebKit claims are made.
- Screen-reader behavior, WCAG conformance, touch interactions on physical devices and an actual multi-hour idle/resume test were not performed.
- Some older 2.0/3.0 synchronous multi-store transactions remain inherently vulnerable to real concurrent writes; the Phase 8 purchase journal only addresses the reproduced advertising debit path.
- The long-session test processed 625 events in an accelerated browser scenario. It is not evidence from hours of wall-clock use.
- Input label checks do not establish complete accessibility.

## Integrity and use

See `qa_evidence/phase8_results.json`, `qa_evidence/phase8_static.json`, and `qa_evidence/phase8_accessibility.json` for machine-readable evidence.

Extract the archive and launch the existing `START_WINDOWS.bat` or `START_MAC_LINUX.sh` with Python 3. Before upgrading, export your saved progress and **keep the same origin and port**. The launcher listens on 127.0.0.1:8765. No external API, payment, model or network dependency has been introduced.

## Next suggested work (Phase 9)

Execute **true native two-tab and cross-browser qualification on a workstation or CI runner that permits localhost navigation**, verify concurrent mission claims and purchases, BroadcastChannel notifications, localStorage durability, rollback under forced crashes, 4+ hour idle/resume, keyboard + actual screen reader, and Firefox/WebKit regressions. Fix defects only when reproduced. Do not represent this blocked qualification as complete.

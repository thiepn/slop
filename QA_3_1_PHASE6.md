# SLOPOCALYPSE 3.1 — Phase 6: Verification and Limitations

## Scope and provenance

- Exact input archive: `SLOPOCALYPSE_3_1_Phase5_Interactive_Simulations.zip` in this conversation.
- **44 HTML pages preserved**; none renamed or deleted.
- **75/75 baseline files preserved.** 60 baseline files are byte-identical. 15 targeted files changed: 13 legacy HTML pages plus `s31-core.js` and `s32-world.js`.
- Two new runtime assets: `s36-legacy.css`, `s36-legacy.js`. Existing Phase 1–5 application JavaScript/CSS source files are unchanged except the two explicitly noted world/control-center scripts.
- The 13 targeted pages retain original legacy control markup and scripts beneath their new Phase 6 workbenches.

## Implemented workflows

1. **Generator:** local project library, revisions, revision restore, visual mini-preview and standalone HTML export.
2. **Workspace:** task creation, priority, agent assignment, To Do → In Progress → Done, removal.
3. **Agents:** recruit one of eight fictional agents, dispatch and complete/cancel jobs, end contracts.
4. **Support:** tickets, threaded replies and simulated response, escalation, resolution and reopening.
5. **Docs:** offline JSON validation, 200/404 simulated responses, saved history, replay and removal.
6. **Integrations:** permission scope, connect, simulated sync logs, disconnect for 12 fictional providers.
7. **Investors:** pitch deck authoring, skeptical review, fake term sheet and persistent fundraising history.
8. **Pricing:** monthly/annual fake price comparison, simulated plan selection/history without payments.
9. **Careers:** fictional aliases/applications, two-question interview and offer/rejection outcomes.
10. **Awards:** create local certificates, export text files, one-time social sharing.
11. **Merch:** product catalog, quantities, fake Synergy Credit checkout, persistent orders, once-only refund.
12. **Community:** searchable threads, replies, likes, moderation report, one-time social sharing.
13. **Newsroom:** editorial draft → review → fact check → fictional publication, creating a real saved SlopNews item and local notice.

All Phase 6 state lives in the *existing* v2 document under `phase6`. No new top-level storage key, real external service, payment, AI inference, or new user account is introduced. Phase 2 v32 JSON backup/export/import includes the additional data unchanged.

The Control Center shows the Phase 6 collectible inventory and consequence events, and includes **three new one-time missions** (eight total). Phase 6 awards are capped to one per stable milestone identifier and recorded in the existing credit wallet. External world influence is capped to the first three events per action kind. New writes check persistent read-back; a failed write does not credit or publish the action.

## Tests run in this build

- **80/80** browser interaction/persistence/recovery assertions passed across the 13 upgraded workbenches, using real Chromium DOM interactions (clicks, forms, reload-like page changes). Coverage includes generated HTML escaping, durable projects/tasks, the 13 applications, cross-app news/social propagation, credit debits/refunds, one-time task rewards, JSON backup capture and verified restore into a clean simulated storage context, and rejection of altered checksums.
- **176/176** browser page/viewport checks passed: 44 pages × 320, 390, 768, and 1440 CSS pixels. Checks included no detected uncaught JS error, no horizontal overflow, shared Control Center, Phase 6 controls on all 13 upgraded pages, and retained legacy sections.
- **12/12** keyboard/compatibility checks passed, including Enter-driven form submission, Ctrl+K launcher, Escape close, accessible labels on new fields, CSS reduced-motion transition suppression, a **simulated** cross-tab storage event, and loading representative original Phase 3/4/5 workbenches. A legacy SlopSearch query still produced a fictional fact.
- **3/3** new one-time mission claims passed; +35, +40, and +45 fictional credits awarded once (120 total). An initial incorrect mission ID (numeric character prohibited by the existing reward API) was reproduced and corrected before final testing.
- **Simulated quota failure** passed: new project creation rejected and rolled back, no phantom credit award, error displayed in the UI, and existing data unchanged.
- **Static audit:** 44 HTML pages, 3,344 local href/src references, 108 local fragment links, zero missing targets, zero duplicate HTML IDs, zero baseline-file omissions. New JavaScript and modified world/control scripts passed Node syntax checks.
- **ZIP integrity audit:** completed on the deliverable archive.

## Browser environment and material limitations

- Chromium browser automation used real DOM, keyboard and event handling with the actual inlined HTML/CSS/JS files and a browser-localStorage shim. Direct `http://127.0.0.1:8765` page navigation from the automated Chromium environment was blocked with `ERR_BLOCKED_BY_ADMINISTRATOR`; the local HTTP server answered normally to curl. **This is not equivalent to a complete native localhost browser test.**
- Cross-tab synchronization was tested using a *simulated storage event*, **not native two-tab Web Locks/ BroadcastChannel contention**. On browsers without Web Locks the existing rebase fallback is best effort. Actual simultaneous tab writes are not guaranteed conflict-free.
- Native Firefox/WebKit, mobile hardware, assistive screen readers, and exhaustive WCAG testing have **not** been verified. The new forms have labels, focus-visible styles, keyboard-accessible native controls, and reduced-motion behavior; this does not imply WCAG certification.
- The original 2.0 and 3.0 economy still has repeatable rewards from older flows. Phase 6's **new** milestone/reward and refund paths are guarded; a full legacy-economy rebalance is a distinct future task.
- Simulated integrations and API responses never request external data. All prices, funding, credentials, messages and purchases are fictional.
- The Phase 6 state growth is bounded by per-collection limits plus an approximately 1.65 MB v2 document budget. The existing v32 backup validator limits the complete backup to 3 MB. Longer-term stress testing near these limits and interruption across real native browser tabs remain incomplete.

## Run and backup

Extract the complete archive, preserve `slopocalypse_site/`, and start `START_WINDOWS.bat`, `START_MAC_LINUX.sh`, or `python3 START_LOCAL_SERVER.py` with Python 3. The local server binds to `127.0.0.1`. Open the Control Center → Settings → Export before upgrading an earlier saved version. Do not change the local origin/port if you want to keep the existing browser-local progress without importing a backup.

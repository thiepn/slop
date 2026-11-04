SLOPOCALYPSE 3.1 — PHASE 7: SYSTEM HARDENING (CURRENT)
======================================================
Exact baseline: delivered Phase 6 ZIP. All 44 pages and previous features retained.

NEW:
- Lifetime caps on repetitive 2.0/3.0 credit bonuses (three per reward reason;
  one for Singularity); original actions remain interactive after reaching cap.
- Verified v2 and v3 storage writes, explicit quota feedback and blocked phantom
  credit rewards, stronger world-ledger rollback and coordinated mission claims.
- UTF-8 accurate 3 MB backup limit and import/storage-failure hardening.
- A Data Health button in the header showing local storage usage, backup
  validation, exhausted bonuses, and verified backup export.
- Narrow-screen fixes, two legacy slider labels and keyboard-safe modal behavior.

RUN: Extract the ZIP, run START_WINDOWS.bat or START_MAC_LINUX.sh with Python 3,
then visit http://127.0.0.1:8765/index.html. Everything is fictional and local.
Before upgrading, export progress from Control Center → Settings. Use the same
browser origin/port or import the JSON backup on the new origin.

Verification and honest limitations: QA_3_1_PHASE7.md.
Next suggested qualification: PHASE8_NEXT.md.

------------------------------------------------------
PREVIOUS RELEASE NOTES (HISTORICAL)
------------------------------------------------------

SLOPOCALYPSE 3.1 — PHASE 6: LEGACY APPS & RELEASE QUALIFICATION
===============================================================
This complete build contains all 44 existing pages and every previous phase.
Phase 5's ZIP was the exact input baseline; no routes were renamed or removed.

THIRTEEN DEEPER LEGACY WORKBENCHES
---------------------------------
Website Generator   local project library, revisions, preview, HTML export
Workspace           persistent task board, progress, agent assignments
Agents              hire/fire fictional personas, dispatch and complete missions
Support             tickets, replies, escalation, resolution and reopening
Docs                offline JSON API simulator, history and replay
Integrations        simulated scoped connections, sync logs and disconnect
Investors           pitch-deck builder, skeptical Q&A, fictional term sheets
Pricing             selectable fictional plans, annual/monthly, history
Careers             job applications, interactive interviews and fake offers
Awards              configurable certificates, local export and social sharing
Merch               functional fake cart, credits checkout, one-time refunds
Community           searchable threads, replies, likes, reports and sharing
Newsroom            draft → review → fact-check → publish to SlopNews

The Control Center retains the original 5 missions and adds 3 new,
claimable one-time Phase 6 missions (8 total). It displays Phase 6
collectibles, milestones, and world ledger events. The new data lives in
`phase6` inside the existing v2 localStorage document; v32 backup/import
continues to include it, with NO new top-level storage keys.

One-time Phase 6 credit rewards and refund flags are persistent; repeat
credit claims are blocked. Phase 6 simulated influence is capped per action
kind. New writes verify storage read-back, so simulated quota failure is
reported as a failure rather than a saved action. Older modules keep their
historic mechanics, including some repeatable legacy credit earnings.

RUN: extract the ZIP and run START_WINDOWS.bat or START_MAC_LINUX.sh with
Python 3; then open http://127.0.0.1:8765/index.html. Entirely offline,
fictional, no payment, account, API connection, or actual AI inference.
Export a backup from Control Center → Settings before upgrading.

Verification: QA_3_1_PHASE6.md. Next proposed phase: PHASE7_NEXT.md.

---------------------------------------------------------------
OLDER RELEASE NOTES (HISTORICAL; SEE PHASE 6 ABOVE FOR CURRENT)
---------------------------------------------------------------

SLOPOCALYPSE 3.1 — PHASE 4: INTERACTIVE SOCIAL INTERNET
======================================================
This is the complete 44-page website, continuing the exact Phase 3 build.
Only SlopTube, SlopTok, SlopNews, SlopWiki and SlopBook gain new
interactive workbenches; all original app interfaces remain below them.

NEW: real local UI workflows for simulated media players, creator publishing,
searchable feeds, subscriptions/follows, comments, profiles, article reading,
Wiki revisions/diffs, personalized recommendations and cross-app posts.
Published content also appears in the original legacy society feeds.

All new preferences and history are saved under phase4 in the existing v2
browser storage record. The current v32 JSON export/import includes them.
BACK UP progress before upgrading via Control Center -> Settings -> Export.

BEST START: extract this ZIP, run START_WINDOWS.bat (Windows) or
START_MAC_LINUX.sh (macOS/Linux), then visit http://127.0.0.1:8765/index.html.
This is a local-only fictional parody; there is no real video, AI, social,
financial or email service. The Phase 4 player is a simulation, not a video.

Verification details and limitations: QA_3_1_PHASE4.md

------------------------------------------------------
OLDER README DETAILS (PRESERVED)
------------------------------------------------------

SLOPOCALYPSE 3.1 — INTERACTIVITY UPGRADE (PHASE 1)
==================================================
This package contains ALL 44 pages of SLOPOCALYPSE 3.0, unchanged in
functionality. The first 3.1 upgrade adds a compact, accessible interaction
shell to every page. Later phases of the 3.1 roadmap are NOT yet implemented.

NEW IN THIS PHASE
-----------------
- A unified, sticky navigation bar replaces duplicate stacked global bars.
- An accessible 44-app searchable launcher (Ctrl/Command + K or Apps).
- A cross-universe activity panel with a one-click fictional cascade trigger.
- Five earnable missions, rewarding the existing Synergy Credits wallet.
- A progress and achievements dashboard with cross-page mission completion.
- Calm appearance, slop intensity, and reduced-motion controls.
- Export of all three local saved-progress stores to a portable JSON file.
- Validated JSON import with an explicit second confirmation step.
- Original V2 and V3 localStorage state is left in place; new 3.1 interface
  state uses a separate key (slopocalypse:interaction:v31).

QUICK CONTROLS
--------------
- Open app launcher: Ctrl+K on Windows/Linux, Command+K on macOS.
- Open notifications, missions, settings using the top bar icons.
- Change tabs with Left/Right arrow keys; close modal with Escape.
- Missions can be claimed only after their corresponding old-app action.
- Use the included local-only Python launcher for browser-origin-safe
  persistence across the separate HTML files.

IMPORTANT: All news, AI, users, money, courts and purchases are fictional.
This is a local satire and never communicates with real services.

--------------------------------------------------
ORIGINAL 3.0 REFERENCE INFORMATION FOLLOWS
--------------------------------------------------

SLOPOCALYPSE 3.0 — INTERNET COLLAPSE
===================================
44 linked HTML pages: 31 preserved from SLOPOCALYPSE 2.0 + 12 new
fictional services + the Singularity/history control room.

IMPORTANT: This entire site is SATIRE. All AI models, news, publications,
users, videos, cryptocurrency, prices, advertisements, purchases, certificates,
lawsuits, courts, government permits, locations, and incidents are simulated.
No actual media playback, AI inference, emails, accounts, payments, or services.
No third-party assets or network APIs are required.

QUICK START
-----------
1. Extract the ZIP, preserving the slopocalypse_site directory.
2. Open index.html to explore. Portal (portal.html) lists all 44 pages.
3. For cross-page shared progress, use the local server below.

RECOMMENDED LOCAL LAUNCH (ENABLED FOR OFFLINE USE)
-------------------------------------------------
Windows: double-click START_WINDOWS.bat (Python 3 required).
Mac/Linux: run `sh START_MAC_LINUX.sh` (Python 3 required).
Other: run `python3 START_LOCAL_SERVER.py` from slopocalypse_site.
Browse to http://127.0.0.1:8765/index.html.

The server binds to 127.0.0.1 only, not any external address. Python
standard library only. Ctrl+C stops it. Browsers vary in their localStorage
support for file:// pages; this local server is the reliable choice.

THE 12 NEW LOCAL-ONLY SERVICES
------------------------------
sloptube.html         Invented videos, uncanny thumbnail text, simulated views
sloptok.html          Fictional vertical shorts and fake likes
slopnews.html         Invented headlines and global cascade button
slopwiki.html         Contradictory article ledger, local edits
slopbook.html         AI character feeds, followers, feuds and endorsements
slopuniversity.html   Joke exam, impossible scores, self-issued diplomas
slopcloud.html        Imaginary deployment and incident controls
slopmaps.html         Diagram of 6 fictional places; impossible routing
slopcaptcha.html      Cartoon finger-anomaly puzzle and local clearance token
slopgovernment.html   Simulated ministry applications requiring clearance
slopads.html          Fictional ad spending that creates SlopBook posts
slopcourt.html        Simulated legal filings and made-up rulings
singularity.html      World timeline, endgame and 3.0 data reset

HOW THE WORLD ENGINE CONNECTS EVERYTHING
----------------------------------------
- Trigger a cascade: global news, opposing wiki claims, social controversy,
  video and short, sponsored post, imaginary court case, token price shock,
  an unreliable cloud incident, S2 SlopMail notifications, and SlopOS activity.
- SlopSearch 2.0 findings enter the 3.0 newspaper, wiki, and bot society.
- SlopUniversity degrees are sent to your fictional S2 inbox.
- SlopCAPTCHA passes fictional clearance to SlopGovernment.
- SlopAds consumes S2 Synergy Credits and posts campaigns to SlopBook.
- SlopCourt rulings update the persistent local history and mail feed.
- All eight fictional bots have evolving influence, mood, loyalty,
  and friend links. Every step runs on explicit user interaction only.
- Original SLOPOCALYPSE 2.0 functionality remains in place.

THE SLOP SINGULARITY ENDGAME
---------------------------
Go to singularity.html and complete three gates:
* Trigger 3 hallucination cascades.
* Interact with at least 6 different 3.0 apps.
* Render verdicts in at least 2 fictional court cases.
Then select ACTIVATE THE SLOP SINGULARITY. No actual autonomous process
runs; the ending is a saved, scripted, local fictional state.

PERSISTENCE, PRIVACY, AND ACCESSIBILITY
--------------------------------------
- S2 progress: browser localStorage key slopocalypse:fictional-internet:v2
- S3 progress: browser localStorage key slopocalypse:internet-collapse:v3
- No cloud data, analytics, tracking, API calls, requests or remote storage.
- The Singularity page offers a 3.0-only reset, preserving S2 data.
- Visual Slop Control is at the top of every page, with CALM mode enabled
  by default; uncheck it to opt into harsher effects at Slop Level 60+.
- Reduced-motion operating-system settings are honored. No automatic
  flashing or autoplay video. The intentionally absurd text remains legible.
- CSS visual glitches are intentional; broken navigation is not.

MANUAL RESET (browser developer console)
----------------------------------------
localStorage.removeItem('slopocalypse:internet-collapse:v3'); location.reload();
To additionally reset original S2 progress:
localStorage.removeItem('slopocalypse:fictional-internet:v2'); location.reload();

See QA_REPORT.md for verification details and limitations.

SLOPOCALYPSE 3.1 PHASE 2 — SHARED WORLD ENGINE (2026-11-03)
---------------------------------------------------------------
This edition keeps all 44 original pages and their original application
behavior. It adds a new "World" tab to the Slop Control Center on every page.

- Search, social posting, trading, app installs, cascades and court verdicts
  produce deterministic event records, collectible inventory items, and
  fictional influence. Original 2.0->3.0 cross-app reactions remain intact.
- Credits are still held in the original 2.0 wallet. Mission rewards are now
  claimed through the v32 engine, which guards against repeat rewards.
- The World tab shows inventory, concrete consequences and event history.
- Original achievements are displayed as one deduplicated list.
- Export includes all four local stores and an integrity checksum.
- Import validates format, saved versions, collection shapes and checksum,
  then writes with a rollback journal; older Phase 1 backup files work too.
- If the browser closes during a restore or mission claim, the rollback
  journal is checked on the next load before resuming normal use.
- Changes in other tabs are observed through browser storage events and a
  BroadcastChannel. Web Locks coordinate v32 writes when supported.
- All progress stays on this browser and is tied to the local origin/port.
  Running on a different port or directly opening the HTML file may show a
  different storage profile. Use the included local Python server launchers.

BROWSER STORAGE KEYS (do not manually overwrite):
  slopocalypse:fictional-internet:v2
  slopocalypse:internet-collapse:v3
  slopocalypse:interaction:v31
  slopocalypse:world-engine:v32

IMPORTANT LIMITATIONS:
- Events stored by v32 are deterministic; the legacy 2.0/3.0 apps retain
  some intentionally randomized outcomes. This is a local simulated world.
- Concurrent legacy-app mutations cannot be promised to be fully atomic in
  browsers without Web Locks. Keep one tab active for rapid transactions.
- The checksum detects accidental backup changes, not malicious editing.
- None of the market, legal, email, AI, cloud, social or business features
  access actual services. No purchase, trade, or account is real.

See QA_3_1_PHASE2.md for verification and remaining limitations.

===============================================================
SLOPOCALYPSE 3.1 — PHASE 3 CORE APP INTERACTIVITY UPDATE
===============================================================
This archive preserves all 44 prior pages and upgrades the existing
SlopOS, SlopSearch, SlopGPT, SlopMail, SlopCoin and App Store pages.
Each upgraded app displays a new interactive workbench immediately
after the page introduction, with a link to its original controls.

NEW: versioned Phase 3 data is stored inside the existing v2 world
record, included automatically in existing Phase 2 JSON backups.
Back up progress before switching versions, and use the SAME browser
and local-server origin if you want to keep your current progress.

See QA_3_1_PHASE3.md for the full feature and test breakdown.
===============================================================

==========================================================================
SLOPOCALYPSE 3.1 — PHASE 5: INTERACTIVE SIMULATIONS AND MINIGAMES
==========================================================================
This release builds on Phase 4 without removing or renaming any of the 44 pages.

SEVEN NEW WORKBENCHES:
- slopuniversity.html: three playful lessons, exams, attempts and degrees
- slopcloud.html: pretend deployment builder and three-stage outage recovery
- slopmaps.html: interactive fictional map, route saving, reviews
- slopcaptcha.html: tile puzzles, word scramble, arithmetic, mock clearance
- slopgovernment.html: three-stage application, drafts, approval logic
- slopads.html: fictional paid campaigns, pause/resume, reproducible analytics
- slopcourt.html: evidence selection, witness questions, branching verdicts

Your fake credits, collectibles, permits, diplomas and simulation history are
saved in the existing Phase 5 subdocument of the 2.0 world document. The
Control Center World tab also displays Phase 5 accomplishments and events.
Existing backup export/import preserves this data; there are no new top-level
storage keys and no actual online services.

New panels are near the top of each page. Original 3.0 controls remain below.

For verification details, including tested limitations and resolved defects,
read QA_3_1_PHASE5.md.

PHASE 8 — TARGETED HARDENING (2026-11-03)
See QA_3_1_PHASE8.md for reproduced fixes and evidence. True native two-tab testing is still pending because the browser sandbox blocks network navigation.

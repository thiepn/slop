# SLOPOCALYPSE 3.1 — Phase 3: Six Core Applications

All features are deliberately fictional simulations. No external AI, email, market, payment, or user account providers are connected.

## What's new

- **SlopOS**: Browser-only notes/file explorer; create, edit, duplicate, delete (two-click confirmation), filter, theme switching, links to real local Slopverse applications.
- **SlopSearch**: Persistent search history, filter by bookmarks and published status, inspect explicitly fake citations, replay searches, and publish fictional claims to legacy search + the global event ledger.
- **SlopGPT Arena**: Saved per-round debates, thread inspection, votes, pins, configurable stored instructions, branch prompts, and send transcripts to the fictional mailbox.
- **SlopMail**: Persistent folder labels (Inbox/Starred/Archive/Trash), local search, draft creation/load/deletion, and simulated composer integration. Moving to Trash doesn't remove the original mail from the older inbox; this is reversible label metadata.
- **SlopCoin**: Synthetic chart history, escrow-backed buy/sell limit orders, exact-once cancellation refunds, event-triggered settlement, fictional order history, and local price alerts. Does not contact a financial exchange.
- **Slop App Store**: Search/filter by category, favorite apps, fictional product details, locally authored customer reviews, install/uninstall integration with existing SlopOS shortcuts, simulated update history.

## Persistence / backwards compatibility

The enhanced data is under `phase3` (version 1) inside the **existing** `slopocalypse:fictional-internet:v2` storage document. The Phase 2 v32 backup already exports the whole v2 document, so Phase 3 data is automatically included in the existing four-store JSON format, with its checksum and restore journal. No existing application keys were deleted. The other 38 HTML pages have not been modified. All six original app interfaces remain present.

**Save before upgrading**: Use the Slop Control Center → Settings → Export JSON. When running locally, use the bundled launchers and keep the same browser/local origin to retain your existing progress.

## Verification

- All 44 HTML pages and all referenced local CSS/JS/html assets checked: none missing.
- **44 × 4 = 176** Chromium browser viewport checks, in four independent batches (320, 390, 768, 1440px), passed with no detected overflow or missing world-engine controls. The six upgraded pages were checked again after positioning the new workbenches near the top.
- **44 focused interactive assertions** passed across the six upgraded apps, including legacy OS window interactions, creation/edit/reload of files, Search + world ledger propagation, saved GPT debates and branching, mail draft/compose/starring, coin escrow/settlement/cancellation, App Store install/review/update, and backup presence. The initial combined runner exceeded its overall timeout during the subsequent page sweep; independent page sweeps were completed successfully.
- **11 additional tests passed** for checksum validation, tamper rejection, local state persistence, actual backup restore and reload, HTML escaping, and additional mobile overflow checks.
- No uncaught JS exceptions detected in the independent responsive sweep.

### Testing limitations

The environment blocked direct local HTTP navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`). Tests used a real headless Chromium browser with full HTML/CSS/JS injected through an **in-memory page harness**, plus simulated per-page storage with explicit state transfer. This verifies browser behavior, not real HTTP hosting, multi-tab Web Locks coordination, cross-browser behavior, or physical devices. The app is packaged for local Python HTTP server use.

### Future improvements

- Phase 4: deep social/content ecosystem (SlopTube, SlopTok, SlopNews, SlopWiki and SlopBook), with playable publishing/reaction loops.
- Real multi-tab, Web Locks and native browser storage integration tests on an unrestricted local test host.

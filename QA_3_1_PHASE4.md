# SLOPOCALYPSE 3.1 — Phase 4: Interactive Social Internet

## Scope and preservation

This release builds on the exact supplied `SLOPOCALYPSE_3_1_Phase3_Six_Core_Apps.zip` archive. **All 44 original pages and Phase 1–3 functionality remain.** The only existing page changes are additive CSS/JS references on `sloptube.html`, `sloptok.html`, `slopnews.html`, `slopwiki.html`, and `slopbook.html`; 63 other baseline files are byte-for-byte unchanged. The two new assets are `s34.css` and `s34-social.js`. This QA report and the updated README are documentation changes.

## Functional features

- **SlopTube**: searchable and filterable recommendations, controllable simulated timeline/player (play/pause/seek/speed/restart), local watch history, likes, saved videos, subscriptions, user-generated fictional uploads, playlist creation/management, persistent comments, posting trailers to SlopBook.
- **SlopTok**: selectable vertical clip feed (For You/Following/Liked/All), previous/next navigation including arrow keys outside form inputs, likes/follows/comments, invented trend publishing, saved viewed items, sharing to SlopBook.
- **SlopNews**: live search, desk filters, fictional article reading, persistent bookmarks/reactions/comments/read states, editorial publishing with body, automatic integration into legacy newsroom, imaginary research claims, fictional email and SlopBook cross-post; one-click promotion of a claim to SlopWiki.
- **SlopWiki**: searchable article index, article editor, persisted revision history (up to 20 versions/article), side-by-side comparison, restore-as-new-revision, Talk-page discussion, original contradiction toggle preserved, wiki-to-social sharing, user-created new entries.
- **SlopBook**: bot profiles, editable local bio, following, For You/Latest/Following/Saved feeds, search, user posts with optional linked content, four reactions, comments, bookmarks, one-time reposts; legacy AI society interactions preserved.

All app actions are fictional simulations. No media is streamed, no network calls are initiated by the new assets, and no accounts, messages, journalists or influencers are real.

## Persistence and cross-app design

New Phase 4 preferences and metadata live in `phase4.version=1` inside the existing `slopocalypse:fictional-internet:v2` storage record, following the Phase 3 approach. The existing **v32 four-store JSON export/import automatically includes Phase 4**, with its checksum and rollback journal; no fifth storage key was introduced. Published videos, shorts, news, posts and wiki edits are written into the existing 3.0 society arrays, so legacy interfaces display them too. Publishing and social participation call the existing society and world APIs, earning fictional credits, marking module use, and allowing the existing v32 ledger to observe facts and user posts. Recommendation ranking takes local follows, subscriptions and reactions into account. Collections are bounded to reduce localStorage pressure.

## Browser tests executed

1. **53/53 focused interaction and recovery assertions passed** in real headless Chromium against an in-memory harness that executes the packaged HTML, CSS and JS. Covered uploads, simulated playback, watch history, subscriptions, reactions, comments, personalized feeds, article publication across News/Book/World, Wiki fact-check and revisions/restore, user profiles and reposts, HTML escaping, cross-page persistence, v32 backup format, integrity validation, tampering rejection, and successful local-data restoration.
2. **21/21 legacy, keyboard and compatibility checks passed**: all five original social actions/forms still function, new workbenches coexist with them, Ctrl+K launches the 44-app Control Center, Escape closes it, search updates while retaining keyboard focus, and Calm Mode remains functional.
3. **176/176 responsive page/viewport checks passed**: all 44 HTML pages at 320px, 390px, 768px and 1440px. The checks verified the Control Center and versioned world engine, confirmed that each of the five targeted pages exposes its Phase 4 workbench, and detected no uncaught JS exceptions or horizontal document overflow.
4. **Static preservation and asset audit passed**: all 44 HTML files, all referenced local scripts/styles, no duplicate static element IDs, no missing files; the 63 untouched baseline files compare byte-for-byte with the Phase 3 ZIP. `node --check s34-social.js` passed.
5. Final ZIP archive checked with `zipfile.testzip()`; CRC verification passed.

### What was not tested

The browser environment blocks direct navigation to localhost and file URLs (`ERR_BLOCKED_BY_ADMINISTRATOR`), so the browser tests execute real Chromium DOM interactions with the packaged source injected in memory and a simulated `localStorage` API. This **does not establish actual HTTP-hosted navigation, real multi-tab Web Locks/BroadcastChannel coordination, or physical-device behavior**. Firefox and Safari were not tested. An automated accessibility compliance audit (e.g., full WCAG) was not performed; focus/keyboard behavior, labels, responsive layout, reduced motion and calm controls were spot-checked. No claims of actual video playback, remote AI or real media/social platforms are made.

## How to run

Extract the full archive, retain the `slopocalypse_site` directory and use `START_WINDOWS.bat` or `START_MAC_LINUX.sh` (Python 3 required). The launcher binds a local-only HTTP server to `127.0.0.1:8765`. Open `index.html` and use the Control Center to navigate. Before switching versions, save a JSON backup via Control Center → Settings. To restore from backup, use the existing validated import flow, confirm the overwrite and reload as the UI instructs.

## Next priority

**Phase 5 — Interactive Simulations and Minigames**: deepen University, Cloud, Maps, CAPTCHA, Government, Ads and Court with structured game loops, progress tracking, decisions and cross-world consequences, without adding more pages or independent storage keys.

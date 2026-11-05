# SLOPOCALYPSE Authored Adventure v4.1 — Draft Implementation

**Status:** Experimental; feature branch only. Not production-qualified, merged or deployed.

## Current scope

- Nine accessible browser-local episodes mounted through the existing `s31-core.js` loader, after the original 4.0 campaign engine.
- Authentic Mango, Cloud and Election decisions, with source-validated three-decision snapshots and approved/vetoed endings. No manufactured campaign results.
- Branch-specific dialogue, evidence and consent journal, optional investigations, four proposed finale architectures and blocked governance outcomes.
- Fictional news, social and mail reactions queued for idempotent projection; no additional credits or market trades.
- One versioned `phase41` object inside the existing v2 storage key, protected by the existing v32 Web Lock for writes. Legacy v2/v3/v31 and v32 backup payloads remain the outer envelope.
- Free access to the existing 44 pages. Closing the story never prevents use of the original simulator.

## Run locally

`python3 START_LOCAL_SERVER.py`, then navigate to any existing page and open **STORY · 9 EPISODES**. Finish the original campaigns in the **Living Internet 4.0** panel when prompted. The story does not automatically replay completed campaigns.

## Qualification

`node s41-test.cjs` checks the authored graph and four finale/blocked-result paths with synthetic 4.0 fixtures. `python tests/story41_browser.py` exercises the story interface on a disposable synthetic fixture; native acceptance on the actual 44-page site, multi-tab races and backup restore still require separate qualification.

## Known limitations / not yet production-ready

- This is a playable **condensed authored adaptation**, not the full 3–4-hour scripts from the nine screenplay drafts. Expanded scene text, character-specific secondary branches and richer post-finale page content remain outstanding.
- The six-signatory ratification models explicit player-presented qualified terms; institution-specific political negotiation is not yet a complete authored system.
- The evidence files, signatories and CONTINUE records are entirely fictional in-game sources, not independent external records.
- Cross-app narrative reactions are additive and limited to bounded fictional notifications; no real financial or infrastructure changes are performed.
- Existing v32 backup compatibility needs native import/export/restore testing on representative real old saves. Do not deploy without it.
- The open security/reliability PR #2 remains separate and is not silently incorporated.

No destructive reset, forced login, real data profiling, new AI backend, publication or release is part of this branch.
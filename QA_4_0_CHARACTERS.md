# SLOPOCALYPSE 4.0 — character negotiation and autonomous factions

Status: **DRAFT PR #1 only**. No merge, release, or GitHub Pages deployment authorized.

## Exact baseline / preservation
- Repository: `thiepn/slop`, draft PR #1, branch `feat/slopocalypse-4-living-internet`.
- Starting HEAD: `b3f6ae7fe96be0b623115d39721ac53803c848d7`.
- Existing `main`: `c2d7e3c11076f046b77f5e4354dc51bda9cbdcc7`.
- Additive changes only to `s40-world.js`, `s40.css`; add `tests/phase40_characters.py` and this report. Every original HTML page, earlier script, checkpoint type, four-store backup and Pages workflow remains unchanged.
- The historical v2/v3/v31/v32 storage keys are unchanged. Negotiations are nested within the existing v2 `phase40.campaigns[ID]` and default safely for older saves.

## Implemented character interactions
- Nine authored, campaign-specific witness hearings (three pivotal proposals per campaign), with individual dialogue prompts and three actions: **present evidence**, **offer a deal**, or **apply pressure**.
- Personality, trust, past evidence-related decisions, and energy determine acceptance without a random success roll. Acceptance/refusal changes trust, energy, mood, ally bonds, memory and subsequent votes. Different witnesses respond differently to identical approaches.
- Two negotiation opportunities per campaign run, no repeat conversation with the same witness in one run, no credits or token/market price rewards from negotiation. Replaying resets *this run's* dialogue budget but preserves historical achievements and effects.
- Autonomous acts every four simulated hours now derive from eight distinct fictional citizen agendas. They deterministically build alliances or intensify rivalries, alter later proposal support, and publish fictional mail, news/social updates, and occasional simulated court/market effects. State uses the existing seeded RNG, and the historical timeline records each action.
- The existing durable outbox and historical cross-app projections remain in place. The pre-existing final-decision-and-ending projection was checked before and after the patch; **both already worked in the baseline**. It was not counted as a repaired defect.
- The three campaigns and their endings remain available; prior checkpoint snapshots without `diplomacy` and `negotiations` fields normalize to zero/empty arrays rather than resetting the world.

## Executed evidence (actual headless Chromium DOM with in-memory origin shim)
| Suite | Result |
|---|---|
| `python tests/phase40_qualification.py` | 54/54 PASS, zero uncaught JavaScript errors |
| `python tests/phase40_hardening.py` | 42/42 PASS, zero uncaught JavaScript errors |
| `python tests/phase40_factions.py` | 50/50 PASS, zero uncaught JavaScript errors |
| `python tests/phase40_characters.py` | 51/51 PASS, zero uncaught JavaScript errors |
| `python tests/phase40_responsive.py` in four 11-page batches at 320, 390, 768, 1440px | 176/176 PASS in tested states |
| `node --check s40-world.js` | PASS |

New regression covers tailored acceptance/rejection in all three campaigns, one-time diplomatic budget and witness reuse rejection, replay/non-duplicate credits, checkpoint and four-store backup compatibility, tamper-safe import through the existing checker, failed-quota write rollback, seeded 24-hour autonomous determinism, legacy news/social/mail, accessible region/button labels, 320px dialog fit, Escape and focus restoration.

## Limitations and open gates
- Chromium runs the true HTML/CSS/JS with `set_content` and a fake `localStorage` + fake Web Locks. Native localhost navigation is blocked by testing environment policy. **Not proof** of real two-tab Web Locks/BroadcastChannel concurrency or genuine storage quotas.
- No Firefox/WebKit, screen reader, real touch hardware, long-duration human playtest or human-authored editorial approval.
- Cross-store v2→v3 projections are retryable and idempotent via the old outbox but **not atomic**. Browser privacy mode, unavailable local storage, or extreme storage pressure could stop event processing; the UI exposes retry.
- Autonomous progression updates a saved simulated world, not an actual background worker or real AI. No real social networks, purchases, accounts, legal processes or market trading.
- Replaying a scenario or loading a checkpoint rewinds only the 4.0 scenario. It intentionally does **not** roll back externally published fiction or market history. Avoid claiming a global undo.

## Acceptance position
Suitable for **draft PR review**, not publication. Verify native cross-browser persistence/accessibility and user gameplay with actual participants before approval. Do not merge until explicit authorization.

# SLOPOCALYPSE 4.0 — Consequential Factions QA (draft PR #1)

**Baseline:** `thiepn/slop` draft PR #1 at `642016b67c8eb0d7cfbb5c95e402dc9e3655cd8f`; `main` at `c2d7e3c11076f046b77f5e4354dc51bda9cbdcc7`.

**Scope:** Adds consequential social support, alliances, rival opposition, a small strategic council budget, and alternate authored political outcomes. No live release, merge, new HTML page, storage version bump, new localStorage key, external AI, or real network/game economy.

## Before: reproduced defect

In the original draft, support, trust, and relationships were displayed but not consulted by `choose()` or the ending resolver. Real Chromium DOM tests using the existing in-memory localStorage/Web Locks shim reproduced that after starting the Quantum Mango Crisis and then setting Gradientina's trust to **5** versus **95**, the same `hype → pump → brand` sequence reached the **unicorn** ending in both cases. The first attempt to set trust *before* the initial world state had been committed was discarded; the valid reproduction explicitly started the campaign, verified a successful `SlopWorld.mutate` write, then ran the choices.

## After: consequential decisions

- Support scores are deterministic functions of a proposing citizen's trust, their ally's trust, bilateral alliance, rival relationship and opposition, current energy, and personality fit. The exact rule is visible in `s40-world.js`; no random threshold rolls are hidden from the player.
- Nine authored pivotal votes (three per campaign) use a visible **53-point** support threshold and have explicit alternate outcomes if the proposal lacks backing. Normal campaign paths and all original endings remain reachable.
- The player has **two council briefings per active campaign run**. Rally builds trust and an alliance; Challenge weakens that faction and boosts the rival. These choices can reverse a pivotal vote, are logged and saved, and give **no credits**. Briefings reset on campaign replay, without resetting prior rewards or discovered endings.
- Approved/rejected choices produce distinct headlines, memories, alliances, story endings, simulated market changes, fictional news/social posts, and applicable court cases through the existing retryable projection pipeline.
- Existing `version:1` `phase40` documents and older checkpoints lacking `council`/`consultations` normalize safely. Save slots still rewind current faction values without deleting historical achievements or published effects. The original four-store v32 backup remains valid.
- The campaign screen explains support numbers and consequences before submission, while ally briefing buttons receive uniquely descriptive accessible names and action feedback receives keyboard focus after rerendering.

### Verified distinct outcomes

| Situation | Expected | Observed |
| --- | --- | --- |
| Mango brand proposal, Gradientina trust 5 | Veto → `trial` | PASS |
| Same proposal, Gradientina trust 95 | Approved → `unicorn` | PASS |
| Gradientina trust 30 + two rallies | Recovered support → `unicorn` | PASS |
| Default Gradientina + two challenges | Veto → `trial` | PASS |
| Cloud settlement with Attorney Bot trust 4 | Rejected → `chaos` | PASS |
| Election corporate victory with Mango CEO trust 3 | Rejected → `recount` | PASS |
| Original cloud `restart/rollback/settle` | `treaty` | PASS |
| Original election `fair/evidence/independent` | `fair` | PASS |

## Executed tests

| Test | Evidence |
| --- | --- |
| `python tests/phase40_qualification.py` | **54/54 PASS**; original campaign, backup, replay, cross-app, quota, UI checks |
| `python tests/phase40_hardening.py` | **42/42 PASS**; seeds, checkpoints, endings, focus, quotas, replay |
| `python tests/phase40_factions.py` | **50/50 PASS**; low/high support, two briefing strategies, three campaigns, event propagation, tampered and restored backups, deterministic script replay, quotas, keyboard and mobile modal |
| `python tests/phase40_responsive.py 0 11` | **44/44 PASS** |
| `python tests/phase40_responsive.py 11 22` | **44/44 PASS** |
| `python tests/phase40_responsive.py 22 27` and `27 33` | **20/20 + 24/24 PASS** |
| `python tests/phase40_responsive.py 33 38` and `38 44` | **20/20 + 24/24 PASS** |
| `node --check s40-world.js` | PASS |
| Static preservation comparison against previously delivered Phase 4.0 draft ZIP | All **44** original HTML files unchanged, original JS and backup scripts retained. Only `s40-world.js`, `s40.css` changed; this test and this QA file added |

The first combined responsive runner was interrupted after two successful batches by an execution timeout / Playwright driver EPIPE. Remaining batches were re-executed individually and all completed successfully. This interruption was not counted as an application pass.

## Safety/invariants

- No additional credit reward from council operations; original campaign reward keys still one-time only, including across replays and checkpoints.
- Unknown actors, exhausted council budget, invalid strategies, or completed/non-active campaigns reject without modifying saved progress.
- `SlopWorld.mutate` remains the single authoritative v2 save and v32 Web Locks coordinator remains in use. New state is nested inside `phase40` and is included in the existing four-store exported backup.
- Existing older source files and HTML are unchanged. Existing stored user progress is not cleared, renamed, or migrated into a new key.
- All outcomes are labeled fictional. No actual people, finance, election, or legal transactions are simulated as real.

## Not verified / remaining gates

1. **Native same-origin two-tab contention** for Web Locks and BroadcastChannel; browser policy blocks permitted localhost navigation in this environment.
2. Firefox/WebKit browser engines; physical mobile devices; genuine screen readers, full keyboard accessibility audit, and human usability acceptance.
3. Cross-store v2/v3 projection is a retryable outbox, **not an atomic transaction**; external news/social/court events that have already been published are intentionally not undone by checkpoint rewind.
4. A comprehensive user playtest of all nine final vote paths and longer replay sessions. Current deterministic and sampled functional checks are not a replacement for that acceptance.

**Release gate:** Keep PR #1 open and draft. No merge, tag, publication, deployment, or GitHub Pages changes in this update.

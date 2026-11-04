# SLOPOCALYPSE 4.0 — Usability, Pacing & Strategic Clarity Qualification

Status: local implementation validated; GitHub PR #1 remains **draft/open**; not authorized to merge or deploy.

## Exact provenance

- Repository: `thiepn/slop`.
- Verified initial PR #1 head: `ce0837708bdeb0e21898bbfea5d1093104f320b7`.
- Verified main at start: `c2d7e3c11076f046b77f5e4354dc51bda9cbdcc7`.
- Baseline source: byte-verified `SLOPOCALYPSE_4_PR1_Balance_Consequence_Depth.zip`; Git blob SHA of `s40-world.js`: `d74b2c535375428373362d7ca042f1a23d75dd4a` and CSS: `0e1c30da833b4aa6d8c613ba2b98185a73e54f19`.
- Preserved **44/44 original HTML pages byte-for-byte**. No changes to older JavaScript engines, the existing world/backup data schema, historical reward IDs, or the GitHub Pages workflow.
- Changed: `s40-world.js`, `s40.css`; new `tests/phase40_usability.py`, this QA report.

## Reproduced defects and interventions

| Before | Reproduction | Targeted correction | After |
|---|---|---|---|
| Resume did not work | In headless Chromium, click Resume from initial `paused=true`: operation threw `Could not commit the fictional world` | A valid `false` return from `togglePause` no longer cancels the transaction | Resume persists `paused=false`; Pause persists `true` |
| Unseen autonomous activity during unrelated page use | Timer was controlled by `paused` and browser visibility, **not** by whether the modal was open | Automatic clock only runs while dialog is open, page is visible and `paused=false`; closing suspends auto ticks but does not alter preference | Closing the dialog stops automatic ticks; reopening resumes if still unpaused |
| Confusing support scoring | Pivotal vote displayed e.g. `37/53` although score is 0–100 and threshold is 53 | Display `37/100 (requires 53)`, show earlier choices and their signed impact | Exact threshold and route modifiers are visible before commitment |
| Wasted limited negotiations | After `hype → pump`, UI offered “Present evidence” without stating that **no research trail** was present; rejected attempt consumed one of two slots | Shared prereq calculation for engine and UI, readiness/missing-groundwork hints, witness trust/energy, explicit warning of attempt cost; hints linked with `aria-describedby` | Players can inspect whether groundwork exists before spending an attempt; prior rejection behavior and budget unchanged |
| Council trade-offs invisible | Council gave only generic “rally”/“challenge” description | Explain current exact trust, alliance, opposition and energy deltas | Players can assess cost without guessing |
| Long timeline hard to scan | A mixed feed showed up to 65 latest events with no category filter | Client-side All / Story & negotiations / Citizen actions filters; event counts and bounded-history explanation | Filters preserve all saved events and have `aria-pressed` state |
| Automatic tick failure was hidden | Old timer caught an advance failure by trying to flip pause, masking the original error | Stop local interval and report the error in the status panel | No synthetic pause write on failure |

**Scope restrictions:** No rewrites to campaign scenes, faction thresholds, ending definitions, negotiation effects, autonomous probabilities, rewards, inventory, checkpoints, or versioned backup stores. The pacing change intentionally stops automatic generation while the modal is closed; explicit manual advances remain available.

## Executed evidence

All runs used real headless **Chromium DOM execution** of the checked source with an **in-memory localStorage/Web Locks shim**. No direct localhost browser navigation or native multi-tab contention was tested.

| Script | Result |
|---|---:|
| `python tests/phase40_qualification.py` | 54/54 PASS |
| `python tests/phase40_hardening.py` | 42/42 PASS |
| `python tests/phase40_factions.py` | 50/50 PASS |
| `python tests/phase40_characters.py` | 51/51 PASS |
| `python tests/phase40_balance.py` | 83/83 PASS |
| `python tests/phase40_usability.py` | 50/50 PASS |
| `python tests/phase40_responsive.py 0 11` | 44/44 PASS |
| `python tests/phase40_responsive.py 11 22` | 44/44 PASS |
| `python tests/phase40_responsive.py 22 33` | 44/44 PASS |
| `python tests/phase40_responsive.py 33 44` | 44/44 PASS |

**Total:** 330/330 functional assertions and 176/176 responsive checks at 320, 390, 768, 1440 px. Responsive tests detected no horizontal overflow or uncaught JS errors at the tested initial page states. `node --check s40-world.js` PASS. Python test file compiles.

### Specific recovery and usability coverage

- Resume/unpause, automatic timer advancement when open, closed-dialog no-tick, reopen/resume, explicit pause, and bounded event cadence using Playwright's controlled clock.
- Research/deal/pressure readiness, explicit missing-groundwork hints, accessible control names and associated explanatory hints.
- Rally/challenge resource-tradeoff text, 320px accessibility, Escape-close and focus restoration, tab arrow-key navigation.
- Timeline filtering and persistence non-mutation.
- **14 simulated days** of autonomous progression (336 hours): bounded event history (≤130), bounded effects (≤120), pending effects under backpressure limit (≤30), no rewards from autonomous activity.
- Four-store backup version 2 validation, 3-slot checkpoint compatibility, deterministic identical-seed replay, failed quota pause-write rollback, no phantom credits.
- Existing 36-route matrix still 22 approved and 14 vetoed; all nine original endings remain reachable (previous balance suite).

## Remaining gates

- Real same-origin multi-tab Web Locks/BroadcastChannel coordination and lost-update stress **not verified** (blocked browser origin).
- Firefox and WebKit **not executed** in this environment.
- Screen-reader testing and physical device qualification **not performed**; ARIA/keyboard smoke checks do not substitute for those.
- Human player comprehension, enjoyment, long-term retention and difficulty balance **not independently measured**.
- Cross-store v2/v3 projections remain retryable and idempotent rather than one atomic transaction. No live site upgrade or release authorized.

## Suggested human review

Ask 2–3 testers unfamiliar with the system to complete one campaign each. Observe whether they can explain (1) why a vote failed, (2) why a negotiation is risky, (3) what closing the simulator does to autonomous time, and (4) what remains permanent after loading a checkpoint. Do not claim signoff without recorded results.

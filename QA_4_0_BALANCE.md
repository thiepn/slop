# SLOPOCALYPSE 4.0 — Campaign balance and long-session review

**Status:** Draft PR #1 only. No merge, deploy, release, live browser data edits, or GitHub Pages workflow changes.

## Provenance and scope

- Repository: `thiepn/slop`; branch `feat/slopocalypse-4-living-internet`.
- Starting verified PR HEAD: `3222a6432b248e4a143818fd9eef8421c3341982` (open/draft/unmerged when inspected).
- Starting verified `main`: `c2d7e3c11076f046b77f5e4354dc51bda9cbdcc7`.
- Local baseline: complete Phase 4.0 character-interactions ZIP with `s40-world.js` Git blob `9352bc6410060e63bb9936fd204ca823250516c0`, matching the actual PR HEAD.
- All 44 original HTML files remain byte-for-byte identical to that baseline. Legacy JS, CSS, v2/v3/v31/v32 keys, v32 four-store backup format, 3 checkpoint slot format, achievement/reward keys, and the GitHub Pages workflow are unchanged.
- Modified: `s40-world.js`. Added: `tests/phase40_balance.py`, `qa_evidence/phase40_route_matrix.csv`, this report.

## Reproduced balance defects BEFORE changes

1. **36/36 default pivotal decisions approved across twelve representative routes** (4 early-choice routes per campaign × 3 final proposals). The system displayed character trust but early player choices were almost irrelevant: even `mango: hype → pump → truth` and `election: fund → accept → independent` passed. The independent evidence and commercial branding decisions were both fully supported on contradictory paths. Output recorded in `qa_evidence/phase40_route_matrix.csv`.
2. **Unsupported testimony accepted solely by personality.** In an actual Chromium DOM run, `mango: hype → pump`, then `negotiate('truth','evidence')`, returned `accepted: true` despite no audit, lab evidence, or primary research. This also allowed a guaranteed political boost without the story's claimed prerequisites.
3. **Permanent exhaustion.** With all citizens' energy at zero, advancing 24 simulated hours left all eight at zero. The 4-hour autonomous initiative spends energy but had no restoration path, causing eventual permanent low-energy sabotage and blocking successful negotiations.

The above are deterministic implementation problems, not claims about human-player enjoyment or verified human preference.

## Targeted repairs

1. **Authored campaign-context pressure**: pivotal support now incorporates explicit, inspectable +/- contributions from the first two decisions, with total path contribution clamped to [-26, +24]. Supporting credible research boosts research certification; hype undermines it, while improving commercial backing. Cloud negotiations and electoral certification behave similarly. Existing trait, trust, ally/rival, and energy factors still matter, and the established 53-point approval threshold remains unchanged.
2. **Auditable UI**: pivotal choices display the total path modifier *and the actual earlier decisions that produced it*. The resolved decision also records `pathInfluence`, an optional field within the existing version-1 `phase40` state (no migration required).
3. **Negotiation prerequisites and political costs**: credible evidence requires prior investigative groundwork; commercial deals require a story mandate; legal pressure requires a relevant controversy. Personality and trust remain important but can no longer automatically substitute for missing facts. Successful evidence is modest and reconciliatory; deals strengthen a coalition but alienate skeptics; coercion offers stronger short-term support but damages rival relationships. Rejected negotiations still consume one of the existing two opportunities. No new credit sources were introduced.
4. **Deterministic rest**: each citizen recovers 2 energy on each sixth simulated hour. Recovery generates no extra events, market changes, credits, or messages. The existing four-hour autonomous action rhythm remains unchanged.

## Observed results AFTER changes

- The same fixed route matrix now approves **22/36** pivotal decisions and rejects **14/36**, preserving both favorable and unfavorable outcomes.
- All **nine original campaign endings remain reachable**, including mango (`verified`, `unicorn`, `trial`), cloud (`treaty`, `reboot`, `chaos`), and election (`fair`, `ceo`, `recount`). The matrix includes example successful routes and counterfactual vetoes.
- An unsupported research presentation now produces a rejection, a realistic political cost, and a rejected testimony record in both the old mailbox and fictional society feeds. Supported negotiations remain successful in existing character regression scenarios.
- Exhausted citizens recover after 24h and continue to recover after 48h, without mining credits or producing additional autonomous events. A 48-hour run still produces exactly 12 four-hour initiatives.

## Executed tests on final local source

| Test | Result | Scope |
| --- | ---: | --- |
| `python tests/phase40_qualification.py` | **54/54 PASS** | Original campaign flows, rollback, backups, UI |
| `python tests/phase40_hardening.py` | **42/42 PASS** | Replay, storage, focus, previous hardening |
| `python tests/phase40_factions.py` | **50/50 PASS** | Council, faction votes, old saves, reward safety |
| `python tests/phase40_characters.py` | **51/51 PASS** | Negotiations, autonomous characters, quota recovery |
| `python tests/phase40_balance.py` | **83/83 PASS** | 36-route balance matrix, prerequisites, tactical costs, all endings, exhaustion, replay, backup, quota, accessible mobile interaction |
| `python tests/phase40_responsive.py 0 11` | **44/44 PASS** | 11 pages × 320/390/768/1440 |
| `python tests/phase40_responsive.py 11 22` | **44/44 PASS** | Next 11 pages × four widths |
| `python tests/phase40_responsive.py 22 33` | **44/44 PASS** | Next 11 pages × four widths |
| `python tests/phase40_responsive.py 33 44` | **44/44 PASS** | Last 11 pages × four widths |
| `node --check s40-world.js` | **PASS** | JavaScript syntax |
| Original 44 HTML SHA-256 comparison | **44/44 identical** | Preservation |

**Total:** 280/280 functional checks and 176/176 responsive checks. Responsive segments were run separately because the combined process exceeded its execution limit; the last batch was run and passed independently.

Tests used real headless Chromium DOM interaction with inline source and simulated `localStorage` and Web Locks. They do **not** qualify native HTTP navigation, simultaneous two-tab writes, BroadcastChannel contention, Firefox/WebKit, screen readers, touch hardware or actual human strategy preferences. No human signoff is implied. Event projections across v2/v3 still use a retryable outbox rather than cross-store atomic transactions. All nine endings being reachable does not establish perfectly balanced player utility or difficulty.

## Inspectable replay

```bash
python tests/phase40_qualification.py
python tests/phase40_hardening.py
python tests/phase40_factions.py
python tests/phase40_characters.py
python tests/phase40_balance.py
python tests/phase40_responsive.py 0 11
python tests/phase40_responsive.py 11 22
python tests/phase40_responsive.py 22 33
python tests/phase40_responsive.py 33 44
node --check s40-world.js
```

Run these with Python, `playwright`, `beautifulsoup4`, and Chromium available. The `tests/phase40_balance.py` source specifies its test harness and does not claim to exercise native browser storage or locks.

## Outstanding gates

- Human sessions measuring tactical clarity, engagement, pacing and difficulty across player archetypes.
- Genuine same-origin multi-tab save contention and interrupted cross-store outbox recovery.
- Firefox/WebKit/browser support, physical devices and full assistive-technology validation.
- No merge/deploy authorization; PR must remain draft and `main` unchanged.

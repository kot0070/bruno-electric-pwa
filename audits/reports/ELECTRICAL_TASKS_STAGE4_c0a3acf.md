# Electrical Tasks Stage 4 — Independent Audit

AUDITED HEAD SHA: `c0a3acf6308200447c22d53317d025ebc6439b77`

VERDICT: **A — ACCEPT**

P0: 0
P1: 0

## Scope
Independent review of the Stage 4 neutral / equipment-grounding-conductor model and its integration with Stage 2 feeder sizing and Stage 3 raceway fill.

## Findings

### 1. EGC base table
The supported Table 250.122 subset through 1200 A matches NFPA NEC development material for the rows used by the engine, including 300 A = #4 Cu / #2 Al, 400 A = #3 Cu / #1 Al, 600 A = #1 Cu / 2/0 Al, and 1200 A = 3/0 Cu / 250 Al.

The lookup implements the table heading semantics `OCPD ... not exceeding` by selecting the first supported row whose OCPD value is >= the entered OCPD. Inputs above the supported 1200 A subset fail closed.

### 2. Increased ungrounded-conductor sizing
The engine does not publish an upsized-voltage-drop EGC candidate as a final compliance answer. If the selected phase conductor is larger than the minimum same-set ampacity conductor, runtime status becomes `REVIEW REQUIRED`; the proportional-cmil value and candidate size are exposed only as review data, and the final EGC/raceway fields remain null.

This is appropriately conservative for the current master because the full adopted-edition source/provenance audit is Stage 9.

### 3. Parallel raceways
For separate parallel raceways, the model includes one wire-type EGC review candidate in each raceway and explicitly requires review of the applicable parallel-raceway EGC rule and equipment bonding arrangement. It does not claim that Stage 4 independently proves every parallel-conductor condition.

### 4. Neutral semantics
Neutral is never inferred. `UNRESOLVED` blocks a final Stage 4 composition. Supported explicit modes are `FULL_SIZE` and `NONE`. A full-size neutral is separately represented and participates in raceway fill.

### 5. Semantic separation
The runtime keeps these concepts distinct:
- ungrounded phase conductors;
- grounded conductor / neutral;
- equipment grounding conductor (EGC);
- grounding electrode conductor (GEC);
- bonding jumper.

GEC and bonding remain `separate verification required`; neither is derived from the EGC table.

### 6. Raceway recomputation
Stage 4 recomputes conduit fill from the actual included conductor composition through the Stage 3 `sizeConductors()` API rather than adding a guessed raceway delta. Unsupported conductor area or raceway data fails closed.

### 7. Persistence / reload
`ocpdAmps`, `neutralMode`, and `egcMaterial` are part of the Job-scoped Electrical Task input schema. The shared Save Task Draft serialization includes all three and the form-hydration path restores them. Stage 4 UI additionally hydrates the dynamically inserted controls from the active saved task.

No global Stage 4 registry was introduced.

### 8. Regression / CI
Exact candidate CI run #406: SUCCESS.
Deterministic suite: **685/685 PASS**.
`TESTED_HEAD_SHA = EXPECTED_HEAD_SHA = c0a3acf6308200447c22d53317d025ebc6439b77`.

PWA cache: `bruno-electric-v56`, including feeder, raceway, grounding reference/engine and Stage 2/3/4 UI runtimes.

## Reference cross-check used by audit
- NFPA NEC Panel 5 first-draft material for 250.122, including Table 250.122 and increased-size language: `https://docinfofiles.nfpa.org/files/AboutTheCodes/70/70_A2025_NEC_P05_FD_PIResponses.pdf`
- NFPA NEC Second Draft preliminary material for 250.122(F) multiple-raceway parallel EGC semantics: `https://docinfofiles.nfpa.org/files/AboutTheCodes/70/70_A2025_NEC_P05_SD_PrelimSR.pdf`

These audit references do not replace the Stage 9 final adopted-edition/source-provenance gate.

## Non-blocking observations
P2-1: When increased-size review is required, the current Stage 4 UI emphasizes the blocked/review status more than the candidate detail. This is fail-safe rather than misleading, and can be polished in the later field-UX stage.

P2-2: Stage 4 intentionally supports only full-size or absent neutral; reduced neutral engineering is not implemented and must not be inferred.

## Final
No P0/P1 blocker found. Stage 4 may advance to Stage 5 Material Takeoff under the strict master gate.

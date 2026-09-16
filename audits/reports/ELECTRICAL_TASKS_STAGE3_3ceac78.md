# Electrical Tasks Stage 3 — Independent Audit

AUDITED HEAD SHA: `3ceac78e05f193ecc7f3f39441a7ce658b25d156`

VERDICT: **A — ACCEPT**

P0: 0
P1: 0

## Scope audited
- Chapter 9 fill percentage semantics: 1 conductor = 53%, 2 = 31%, >2 = 40%.
- THHN/THWN-2 occupied-area lookup and fail-closed behavior for unsupported insulation types.
- EMT / PVC Schedule 40 / PVC Schedule 80 total internal area lookup and smallest supported raceway search.
- Separate-raceway treatment for parallel feeder sets.
- Explicit rejection of shared-raceway parallel configurations in Stage 3.
- Raceway-by-raceway output, approximate raceway footage, and long-run/pulling warnings.
- Stage boundary: neutral and EGC are not silently invented; result is explicitly provisional and may increase in Stage 4.
- PWA v55 runtime inclusion and stale-cache deletion behavior.
- exact-head CI provenance.

## Independent arithmetic spot checks

### 100 A, 240 V, 1φ, Cu THHN/THWN-2
Feeder result: #3 Cu. Stage 3 includes two ungrounded conductors only.
- conductor area = 0.0973 in²
- occupied = 2 × 0.0973 = 0.1946 in²
- 2-conductor fill limit = 31%
- 3/4 EMT allowed = 0.533 × 0.31 = 0.16523 in² -> FAIL
- 1 EMT allowed = 0.864 × 0.31 = 0.26784 in² -> PASS
Selected 1 EMT is mathematically consistent for the included Stage 3 conductors.

### 300 A, 480 V, 3φ, 1500 ft, 700 kcmil Cu, EMT
Stage 3 includes three phase conductors.
- occupied = 3 × 0.9887 = 2.9661 in²
- >2 conductor limit = 40%
- 2-1/2 EMT allowed = 5.858 × 0.40 = 2.3432 in² -> FAIL
- 3 EMT allowed = 8.846 × 0.40 = 3.5384 in² -> PASS
Selected 3 EMT is consistent for included conductors.

### Same feeder, PVC Schedule 40
- 3 PVC40 allowed = 7.268 × 0.40 = 2.9072 in² -> FAIL
- 3-1/2 PVC40 allowed = 9.737 × 0.40 = 3.8948 in² -> PASS
Selected 3-1/2 PVC40 is consistent.

### Same feeder, PVC Schedule 80
- 3 PVC80 allowed = 6.442 × 0.40 = 2.5768 in² -> FAIL
- 3-1/2 PVC80 allowed = 8.688 × 0.40 = 3.4752 in² -> PASS
Selected 3-1/2 PVC80 is consistent.

### Two parallel 350 kcmil Cu sets, separate EMT raceways
Per raceway:
- occupied = 3 × 0.5242 = 1.5726 in²
- 2 EMT allowed = 3.356 × 0.40 = 1.3424 in² -> FAIL
- 2-1/2 EMT allowed = 5.858 × 0.40 = 2.3432 in² -> PASS
Two separate 2-1/2 EMT raceways is consistent with Stage 3 scope.

## Fail-closed findings
- `XHHW2` does not borrow THHN occupied-area data; it returns `NO SUPPORTED CONFIGURATION`.
- `OTHER` raceway returns `NO SUPPORTED CONFIGURATION`.
- parallel sets with `SHARED_REVIEW` do not receive an invented fill result.
- no supported trade size returns `NO SUPPORTED CONFIGURATION`.

## Stage-boundary review
The engine explicitly labels the result `PHASE_CONDUCTORS_ONLY_STAGE_3`, keeps neutral/EGC unresolved, and warns that the final raceway size can increase. The UI says `PROVISIONAL PASS`, not final compliance. Raceway fill is explicitly distinguished from pulling feasibility.

## CI evidence
GitHub Actions run #381 completed SUCCESS on exact audited SHA.
Deterministic suite: **668/668 PASS**.
`TESTED_HEAD_SHA` matched `EXPECTED_HEAD_SHA`.

## Non-blocking observation
P2: Stage 3 output is intentionally not installation-final until Stage 4 adds neutral/EGC semantics. This is visibly disclosed in runtime and does not constitute a hidden compliance assumption.

## Final
No P0/P1 blocker found. Stage 3 may advance to Stage 4 under the strict master gate.

# AUDIT TASK — Electrical Tasks Stage 2 Feeder / Panel Engine

AUDIT ONLY.

Repository: `kot0070/bruno-electric-pwa`
Audit branch: `audit/electrical-tasks-stage2-c452723`
Pinned production candidate:
`c452723c28dbec9cf001b40c3dcf2bd391955e32`

Expected report path:
`audits/reports/ELECTRICAL_TASKS_STAGE2_c452723.md`

Developer evidence:
`dev-reports/ELECTRICAL_TASKS_STAGE2_FEEDER_ENGINE.md`

## Audit objective
Independently verify Stage 2 of the Electrical Tasks master plan: deterministic Feeder / Panel Run conductor sizing, parallel-set search, voltage-drop sizing, candidate ordering, fail-closed behavior, and integration regressions.

## Mandatory technical checks

1. **Input domain / fail closed**
- blank required fields;
- zero/negative/malformed amps and distance;
- invalid CCC / ambient / terminal rating;
- unsupported voltage/material/installation/conductor type;
- MIXED load basis must not be guessed;
- max conductor size constraint must be honored.

2. **Ampacity path**
Manually verify representative Cu and Al cases against the supported reference-data rows:
- base 90°C adjustment-column ampacity;
- ambient correction factor;
- CCC factor;
- terminal limit;
- allowable ampacity/conductor;
- combined parallel ampacity;
- design-current comparison.

At minimum independently recompute:
- 100 A, 240 V, 1φ, 100 ft Cu;
- 200 A, 480 V, 3φ, 300 ft Cu;
- 300 A, 480 V, 3φ short-run Cu;
- 300 A continuous-load case;
- 600 A parallel case.

3. **Voltage drop**
Confirm formula contract:
- 1φ = `2 × K × I × L ÷ effective CM`;
- 3φ = `√3 × K × I × L ÷ effective CM`;
- `effective CM = conductor CM × parallel sets`;
- load current is used for VD, not 125%-adjusted ampacity current;
- no power-factor reduction of pure resistance-only I×R drop;
- reported percent and load voltage are numerically correct.

Manually verify at minimum:
- 300 A, 480 V, 3φ, 1500 ft Cu, 700 kcmil single;
- same case with max conductor 500 => 2 × 350 kcmil;
- 300 A, 480 V, 3φ, 1500 ft Al => supported parallel result.

4. **Parallel conductors**
- no parallel candidate smaller than 1/0 unless a specifically supported exception exists (none intended in Stage 2);
- combined ampacity is per-conductor allowable × sets;
- identical-set assumptions are disclosed;
- NEC 310.10(G) conditions are not falsely claimed fully verified by the engine;
- equipment termination/listing remains disclosed.

5. **Candidate search / selection semantics**
Verify the ordering policy is exactly and visibly:
`FEWEST_PARALLEL_SETS_THEN_MINIMUM_TOTAL_CIRCULAR_MIL_AREA`

Check that:
- this is clearly a design-selection policy, not an NEC mandate;
- alternatives remain available;
- deterministic ordering is stable;
- no opaque “best” / “winner” claim exists;
- a max-size constraint can intentionally change the selected candidate.

6. **No-supported configuration**
Verify impossible/unsupported combinations return `NO SUPPORTED CONFIGURATION` and do not invent a conductor answer.

7. **Reference-data integrity**
Inspect the Stage-2-supported AWG/kcmil ampacity and CMIL tables used by the engine. Check that the engine cannot silently use a size absent from required reference data.

8. **Stage boundary semantics**
Verify Stage 2 does not falsely claim completion of:
- raceway sizing/fill (Stage 3);
- neutral/EGC/grounding/bonding (Stage 4).
These must remain explicit unresolved items.

9. **Regression / integration**
Check:
- Electrical Tasks remain Job-scoped;
- Save still does not silently mutate Job Materials;
- Stage 0/1 Job A/B isolation remains intact;
- PWA cache is v54 and includes `electric-electrical-task-engine.js` and `electrical-tasks-stage2-ui.js`;
- stale Bruno Electric caches are deleted without touching unrelated caches;
- exact candidate SHA CI run #372 is SUCCESS;
- deterministic suite remains 657/657 on candidate.

## Verdict rules
A ACCEPT — no P0/P1.
B ACCEPT AFTER MINOR FIXES — no P0/P1, only P2/P3.
C REJECT / REWORK REQUIRED — any P0/P1.

Do not change production code. Write the full report only to:
`audits/reports/ELECTRICAL_TASKS_STAGE2_c452723.md`

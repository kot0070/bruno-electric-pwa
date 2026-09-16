# Bruno Electric — Electrical Tasks Stage 2 Feeder / Panel Engine

STATUS: IMPLEMENTED — AUDIT PENDING

## Scope
Stage 2 implements the deterministic Feeder / Panel Run calculation engine required by `dev-plans/ELECTRICAL_TASKS_AUTONOMOUS_MASTER.md`.

Implemented calculation chain:
1. strict input normalization / fail-closed validation;
2. design current from explicit load basis;
3. conductor ampacity using supported Table 310.16 rows;
4. ambient correction and CCC adjustment;
5. terminal-temperature ampacity limit;
6. supported parallel-set search;
7. resistance-only K-method voltage drop using effective total circular-mil area;
8. deterministic candidate search and explicit candidate-selection basis;
9. `NO SUPPORTED CONFIGURATION` when no supported candidate satisfies selected constraints.

## Supported feeder range
The supported candidate table now includes AWG through 4/0 and Cu/Al kcmil rows 250–1000 where present in the reference-data module.

Parallel candidate rule in this stage:
- candidates below 1/0 are not used for parallel sets;
- search allows up to 6 sets when parallel conductors are explicitly allowed;
- identical conductor material/size/length/conditions are assumed and the result warns that NEC 310.10(G) conditions and equipment terminations/listing still require verification.

## Candidate selection policy
The first returned candidate is not presented as a hidden “best” answer.

Current deterministic policy is:
`FEWEST_PARALLEL_SETS_THEN_MINIMUM_TOTAL_CIRCULAR_MIL_AREA`

That policy is explicitly exposed in the result and a warning identifies it as a design-selection policy rather than an NEC requirement.

Examples:
- 300 A, 480 V, 3φ, 1500 ft, Cu, 3% VD, no maximum conductor-size constraint: supported single 700 kcmil is selected because it avoids an additional parallel set while meeting ampacity and VD.
- the same scenario with max conductor size 500 kcmil resolves to 2 parallel sets of 350 kcmil.
- 600 A, 480 V, 3φ, short run, parallel allowed resolves to 2 sets of 350 kcmil rather than a higher-count smaller-conductor arrangement.

## Voltage-drop contract
Voltage drop is calculated with the corrected resistance-only K method:
- 1φ: `2 × K × I × L ÷ effective CM`
- 3φ: `√3 × K × I × L ÷ effective CM`
- parallel sets: `effective CM = conductor CM × number of sets`
- load current is used for voltage drop; the ampacity design-current multiplier is not incorrectly substituted into the VD equation.
- power factor is not used to reduce pure I×R drop.

The engine labels the method `RESISTANCE_ONLY_K` and states that raceway reactance/impedance is not modeled.

## Continuous-load handling
`NONCONTINUOUS` uses entered load current for required ampacity.
`CONTINUOUS` uses `load × 125%` for the Stage-2 supported contract.
`MIXED` fails closed because a dedicated continuous/noncontinuous load breakdown is required; the engine does not guess.

## Intentional unresolved scope
Stage 2 does not claim completion of later master stages. Results explicitly leave unresolved:
- raceway sizing / fill — Stage 3;
- EGC, neutral and grounding/bonding semantics — Stage 4.

## Regression correction during implementation
Initial Stage-2 CI run #367 failed 4 tests:
- two candidate-selection expectations conflicted with the engine ranking policy;
- two stale PWA assertions still expected earlier cache versions.

Corrective work:
- made candidate ordering explicitly prefer fewer parallel sets before total circular-mil area;
- added a regression proving `maxConductorSize` can intentionally force the 300 A / 1500 ft Cu case to 2×350 kcmil;
- updated service-worker and integration assertions to PWA v54 and Stage-2 runtimes.

## Deterministic test evidence
Final pre-audit implementation candidate before this report:
`a6ff61038edc004bb24cb6d03caa6c3959168d01`

GitHub Actions:
- workflow: `Electrical Calculator Tests`
- run: #371
- conclusion: SUCCESS
- exact push-SHA provenance check: PASS
- deterministic suite: **657/657 passed**

Audit must pin the final post-report `main` SHA, not the pre-report SHA above.

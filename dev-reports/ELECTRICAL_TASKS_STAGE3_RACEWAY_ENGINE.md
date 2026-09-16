# Electrical Tasks Stage 3 — Raceway / Conduit Engine

Status: IMPLEMENTED, CI GREEN, pending autonomous audit gate.

Implementation scope:
- `electric-raceway-engine.js` deterministic raceway sizing engine.
- Feeder integration consumes accepted Stage 2 result.
- Generic `sizeConductors()` supports mixed THHN/THWN-2 conductor sizes/counts.
- Chapter 9 fill limits: 53% one conductor, 31% two conductors, 40% more than two.
- Supported raceway data in this stage: EMT and PVC Schedule 40.
- PVC Schedule 80 intentionally fails closed until adopted-edition provenance is independently verified in the source audit stage.
- Parallel feeder sets are supported only as separate raceways in Stage 3.
- Shared-raceway parallel sets fail closed.
- Neutral and EGC are explicitly excluded/unresolved until Stage 4, so feeder-derived raceway output is marked provisional.
- XHHW-2 raceway fill fails closed because Stage 3 has no accepted occupied-area table for that conductor type.
- Raceway fill is explicitly not represented as pulling feasibility; long/large-conductor warnings remain.

Representative verified calculations:
- 100A 240V 1φ Cu: Stage 2 #3 Cu, two phase conductors, 31% fill -> 1 in EMT provisional.
- 300A 480V 3φ 1500ft Cu: single 700 kcmil selected by Stage 2; 3 x 0.9887 = 2.9661 in² -> 3 in EMT.
- Same run constrained to max 500 kcmil: 2 parallel sets of 350 kcmil; each raceway 3 x 0.5242 = 1.5726 in² -> 2-1/2 in EMT, two raceways, 3000 ft approximate raceway footage.
- Single 700 kcmil configuration in PVC40 -> 3-1/2 in PVC40.
- Mixed conductor regression: 3 x 4/0 + 1 x 1/0 + 1 x #3 THHN/THWN-2 = 1.2539 in² total; five conductors use 40% fill -> 2 in EMT.

Fail-closed coverage:
- unsupported conductor type;
- unsupported raceway;
- PVC80 pending provenance;
- shared parallel raceway strategy;
- impossible fill;
- malformed conductor count/size;
- missing feeder pass.

Exact-head CI before this evidence commit:
- candidate: `cab0eca10e8ffa2a3eadf17a7176f0c98feed2dc`
- run #392 / id 35115967863
- SUCCESS
- exact tested SHA matched expected SHA
- deterministic suite: 683/683 PASS

Because this evidence commit moves `main`, a fresh exact-head CI must be green before Stage 3 audit is pinned.
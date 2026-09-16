# Bruno Electric — Electrical Math v52 Corrective Developer Report

Source audit: `audits/reports/ELECTRICAL_MATH_852bf3c.md`
Source audited SHA: `852bf3c88a4f0fc75584b24aa8e68f277e16342e`
Corrective master: `dev-plans/CORRECTIVE_ELECTRICAL_MATH_852bf3c.md`

## Corrected blocker families

### M1 — strict required electrical-input semantics
- Required calculator numeric inputs no longer accept blank string as implicit zero.
- Required temperature ratings no longer default through falsy `0` / blank values.
- Ambient temperatures below the supported correction table range fail closed.
- Explicit optional defaults remain limited to fields whose API contract defines a default.

Primary files:
- `electric-calculators.js`
- `tests/electrical-calculators.test.js`

### M2 — resistance-only K-method voltage drop
- Removed the physically invalid `× powerFactor` multiplier from the resistance-only K-method.
- K-method output is explicitly identified as `RESISTANCE_ONLY_K`.
- Legacy/backward-compatible PF input cannot artificially reduce voltage drop or convert a REVIEW result into PASS.

Primary files:
- `electric-calculators.js`
- `tests/electrical-calculators.test.js`

### M3 — NEC 2026 §120.13 dwelling general branch-circuit floor
Residential Live now keeps two separate bases:
1. code floor based on `3 VA/ft²`, 120 V, and selected 15 A / 20 A branch-circuit rating;
2. Bruno receptacle-grouping design count.

Final modeled general branch circuits are the greater of those two values. Service/load-calculation floor-area load remains a distinct calculation and is not conflated with §120.13 branch-circuit sizing.

Primary files:
- `electric-residential-rules.js`
- `electric-residential-live.js`
- `tests/residential-live.test.js`

### M4 — pricing / T&M numeric-domain fail-closed guard
Added `electric-pricing-domain-guard.js`.

The guard rejects invalid/negative live estimating domains for:
- Job Materials qty / contractor unit cost;
- equipment cost;
- small-tools qty / unit cost;
- subcontractor price;
- labor persons/days/hours including weekend blocks;
- T&M equipment qty/rate;
- T&M labor hours/rate;
- T&M material/subcontractor amounts;
- Method A OH (`>= 0`) and profit (`0 <= p < 1`).

Negative Change Orders remain intentionally valid signed credits.

Invalid pricing state blocks new live Quote approval and live T&M / Quote output actions instead of silently lowering totals. Existing immutable approved fixed-price invoice snapshots remain readable as historical approvals.

Bootstrap dependency chain is ordered:
`Pricing Domain Guard → Quote Lifecycle → Fixed-Price Invoice`.

Primary files:
- `electric-pricing-domain-guard.js`
- `electric-quote-lifecycle.js`
- `sw-register.js`
- `tests/pricing-domain-guard.test.js`
- `tests/workflow-final-integration.test.js`

## PWA
- Cache bumped from `bruno-electric-v51` to `bruno-electric-v52`.
- Pricing domain guard added to the required core shell.
- stale v51 and older owned caches are removed by normal activation behavior.

## Regression coverage
Expanded deterministic coverage includes:
- full Table 310.16 Cu / Al ampacity matrix already present;
- complete temperature-correction rows and boundary transitions;
- CCC boundaries;
- strict blank/zero/invalid calculator inputs;
- resistance-only voltage-drop PF adversarial cases;
- §120.13 1000/2000 ft² and grouping-vs-code-floor scenarios;
- pricing-domain negative/adversarial persisted states;
- Quote bootstrap ordering and fail-closed approval path;
- PWA v52 shell/cache behavior;
- all existing workflow/data-integrity regressions.

Implementation-head CI evidence before documentation commit:
- SHA: `80b7a0deddcb7cecc782a42291449cd5e4f71487`
- workflow run: `#343`
- exact checkout/provenance: PASS
- deterministic tests: **622/622 PASS**

## Freeze rule
This report commit changes branch HEAD. The final audited candidate MUST be the documentation-inclusive branch HEAD after a new exact-head CI succeeds. No further production or documentation commits are permitted on that candidate until independent math re-audit is complete.

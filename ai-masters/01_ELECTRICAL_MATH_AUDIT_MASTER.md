# MASTER 01 — Bruno Electric Electrical Math / Formula Audit

ROLE: `INDEPENDENT AUDIT ONLY`

TARGET_SHA = `TO_BE_PINNED`
REPORT_PATH = `TO_BE_SET_ON_AUDIT_BRANCH`

## Mission
Independently audit every material mathematical path that can affect an electrical result, project estimate, contractor cost, customer price, quote, T&M amount, or displayed engineering value. Do not accept existing tests, comments, developer reports, UI labels or prior audits as mathematical proof.

## Read first
- `electric-calculators.js`
- `electric-reference-data.js`
- `electric-project-calculator-ui.js` / `electrical-project-calculator-ui.js` where applicable
- Residential engine/rules/live/takeoff/levels modules
- Phase 3 equipment/distribution modules
- `electric-bom.js`
- Job Summary/pricing/quote/T&M calculation paths in `index.html` and extracted modules
- all calculator/math tests

## Required audit method
For every formula family:
1. Identify inputs, units, valid domain, null/blank/zero semantics and rounding point.
2. Derive expected result independently from implementation code.
3. Build hand-checkable numerical examples including normal, boundary and invalid cases.
4. Compare engine output, UI output and persisted output.
5. Check unit conversions and dimensional consistency.
6. Check whether rounding occurs at line, bucket, subtotal or final level and whether that matches business semantics.
7. Check JS coercion risks: `Number('')`, `|| 0`, `NaN`, Infinity, negative numbers, strings and missing fields.
8. Verify inputs that are required for a code conclusion fail closed rather than defaulting silently.

## Formula families — minimum scope
### Electrical engineering/calculator math
- Ohm's law / power relationships wherever implemented.
- Single-phase and three-phase power/current relationships.
- Voltage-drop calculations and conductor-length convention.
- Ampacity table lookup and temperature/adjustment/correction logic.
- conductor sizing / terminal temperature constraints where implemented.
- parallel conductors where implemented.
- conduit/raceway fill and area/percentage calculations.
- box/conductor/equipment grounding or other NEC-derived arithmetic where implemented.
- transformer/service/panel/load calculations where implemented.
- equipment/distribution calculations from Phase 3.
- Residential load/takeoff derived quantities and circuit totals.
- wire/cable takeoff routing and waste math.

### Estimating / commercial math
- Job Material extensions: Qty × contractor unit cost.
- unresolved-cost exclusion semantics.
- labor hours and burden calculations.
- overtime/weekend factors if present.
- equipment/small-tools/subcontractor totals.
- overhead/profit Method A:
  `sales = cost × (1 + OH) / (1 − profit)`
- break-even / OH amount / profit amount.
- exact recommended customer price vs rounded quote base.
- approved Change Orders.
- manual Quote adjustment and approval snapshot amount.
- T&M invoice calculations, taxes/fees/helpers where present.
- historical helper-tax calculation consistency.

## Reference-table integrity
Independently validate representative rows and monotonic/structural invariants in embedded/reference tables. Look for:
- shifted columns;
- missing sizes;
- unit mismatch;
- duplicate keys;
- impossible values;
- stale edition metadata;
- lookup fallback to wrong row.

Do not reproduce copyrighted code tables at length in the report; use bounded representative evidence and provenance references.

## Required adversarial cases
At minimum test:
- blank vs 0 vs positive;
- tiny positive decimal;
- negative;
- very large finite;
- malformed string;
- missing key;
- values directly on thresholds;
- just below/above thresholds;
- mixed units;
- repeated recomputation after persistence/reload.

## Severity
P0: arithmetic can cause catastrophic safety/compliance/data failure.
P1: material formula, unit, lookup, rounding, coercion or persistence error that can materially alter design/estimate/price or present unsupported compliant result.
P2: bounded presentation/precision/documentation issue that does not materially alter decisions.

## Deliverable
Report must contain:
- exact SHA;
- formula inventory;
- independent expected-value table with numeric examples;
- table-integrity checks;
- coercion/boundary findings;
- P0/P1/P2 findings;
- test blind spots;
- verdict.

No production edits. No PR/merge actions.

## Next action
- P0/P1 => instantiate `CORRECTIVE_MASTER_TEMPLATE.md` with this report and exact audited SHA.
- no P0/P1 => advance to Master 02 after release/orchestration gate records acceptance.

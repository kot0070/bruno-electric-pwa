# Bruno Electric — Electrical Math / Formula Audit

ROLE: `INDEPENDENT AUDIT ONLY`

AUDITED_HEAD_SHA = `852bf3c88a4f0fc75584b24aa8e68f277e16342e`
REPORT_PATH = `audits/reports/ELECTRICAL_MATH_852bf3c.md`

## Mission
Independently audit every material mathematical path that can affect an electrical result, project estimate, contractor cost, customer price, quote, T&M amount, or displayed engineering value. Existing tests/comments/developer reports are evidence maps only, not mathematical proof.

## Required method
For every formula family:
1. Identify inputs, units, valid domain, blank/zero/null semantics and rounding point.
2. Derive expected values independently.
3. Use hand-checkable numeric normal/boundary/invalid examples.
4. Compare engine/UI/persisted semantics.
5. Check dimensional consistency and conversions.
6. Check JS coercion (`Number('')`, `||0`, NaN, Infinity, negatives, malformed/missing fields).
7. Required inputs for code conclusions must fail closed.

## Scope
- Ohm/power relationships.
- 1φ / 3φ current-power calculations.
- voltage drop and one-way/round-trip length conventions.
- ampacity lookup/correction/adjustment/terminal limitations where implemented.
- conductor sizing, parallel conductors where implemented.
- raceway/conduit fill.
- box/grounding/code-derived arithmetic where implemented.
- transformer/service/panel/load calculations.
- Phase 3 equipment/distribution math.
- Residential load, circuits, takeoff and cable-routing/waste math.
- Job Material Qty × contractor cost and unresolved exclusion.
- labor/burden/OT/weekend calculations.
- equipment/small-tools/subcontractor totals.
- OH/profit Method A: `sales = cost × (1 + OH) / (1 − profit)`.
- break-even/OH/profit amounts and rounding.
- Change Orders, Quote adjustment/approval snapshot.
- T&M totals, fees/taxes/helper semantics and historical helper-tax consistency.
- representative reference-table integrity and lookup boundaries.

## Adversarial cases
Blank; zero; tiny positive; negative; huge finite; malformed string; missing key; threshold; just under/over threshold; mixed units; reload/recompute.

## Severity
P0 catastrophic safety/compliance/data failure.
P1 material formula/unit/lookup/rounding/coercion/persistence error affecting design/estimate/price or unsupported compliant result.
P2 bounded presentation/precision/documentation issue.

## Deliverable
Report exact SHA, formula inventory, numeric expected-value evidence, table checks, coercion/boundary findings, P0/P1/P2, test blind spots and verdict.

No production edits. No PR/merge actions.

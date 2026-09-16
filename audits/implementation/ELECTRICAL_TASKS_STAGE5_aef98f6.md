# Electrical Tasks Stage 5 — Developer Implementation Evidence

Exact production candidate audited: `aef98f62ab7c5c6176eebc9f12c4abbca0e36fbf`

This document is developer evidence only. Auditor must independently verify all claims.

## Scope implemented
- Deterministic Material Takeoff from accepted Stage 4 Feeder/Panel Run composition.
- Phase conductor footage.
- Optional full-size neutral footage.
- EGC footage.
- Raceway footage/count/size.
- Explicit `CALCULATED`, `ALLOWANCE`, and `FIELD_VERIFY` classifications.
- User-entered bounded conductor/raceway allowance percentages (0–20%).
- No automatic numeric fitting/pull-point/label/termination quantities when route/equipment facts are absent.
- Catalog mapping for supported conductor/raceway definitions.
- Explicit Apply action to Job Materials; preview/build does not mutate Job Materials.
- Strict historical Job Material snapshots with source task/revision/takeoff line provenance.

## Stage 4 gate
`electric-electrical-task-material-takeoff.js` calls the accepted Stage 4 grounding/raceway composition.
A non-`PASS` Stage 4 result returns no material lines eligible for Apply. `REVIEW REQUIRED` remains review-required; it is not converted into an installation material plan.

## Cost contract
For applied calculated rows:
- blank Your Cost -> `materialsUnresolved[]`, `unitCost:null`, `costState:'UNRESOLVED'`;
- explicit 0 -> `materialsUsed[]`, numeric zero;
- positive -> `materialsUsed[]`, numeric contractor cost;
- Customer Price is snapshotted separately as `customerUnitPrice` and never substitutes for Your Cost.

## Historical / stale protection
- Apply requires exact saved `sourceTaskId` + `sourceTaskRevision` to still exist in active Job `electricalTasks`.
- Deleted/forged/stale task revision is blocked in engine.
- UI revalidates current live form against active saved task immediately before Apply; unsaved form edits or a changed active revision require rebuild.
- Re-applying same task revision/takeoff line is idempotent by provenance key.
- Later Catalog repricing does not rewrite already-applied snapshots.

## PWA / runtime
Current cache: `bruno-electric-v57`.
Core shell includes:
- `electric-electrical-task-material-takeoff.js`
- `electrical-tasks-stage5-ui.js`
with dependency order after Stage 4.

## Deterministic tests
Exact-head GitHub Actions:
- Workflow: `Electrical Calculator Tests`
- Run number: `424`
- Run id: `35121248756`
- Job id: `104879293590`
- Audited/tested SHA: `aef98f62ab7c5c6176eebc9f12c4abbca0e36fbf`
- Provenance output: `TESTED_HEAD_SHA=aef98f62ab7c5c6176eebc9f12c4abbca0e36fbf`
- Expected output: `EXPECTED_HEAD_SHA=aef98f62ab7c5c6176eebc9f12c4abbca0e36fbf`
- Result: SUCCESS
- Deterministic suite: `697/697 passed`

Stage 5 tests cover representative quantity math, neutral path, allowances, Stage 4 review blocking, unsaved preview blocking, saved-task revision gate, strict blank/zero/positive Your Cost behavior, field-verify exclusion, provenance, and idempotent re-Apply.

## Files of primary interest
- `electric-electrical-task-material-takeoff.js`
- `electrical-tasks-stage5-ui.js`
- `electric-catalog-v1.js`
- `sw-register.js`
- `sw.js`
- `tests/electrical-task-material-takeoff.test.js`
- `tests/electrical-tasks-ui.test.js`
- `tests/service-worker.test.js`
- `tests/run-node.js`

## Known non-authoritative/dormant-file check requested
The audit task explicitly asks the independent auditor to inspect for parallel/obsolete Stage 5 files and verify only one production-loaded Apply path is authoritative. No conclusion is asserted here; that is intentionally left to independent audit.

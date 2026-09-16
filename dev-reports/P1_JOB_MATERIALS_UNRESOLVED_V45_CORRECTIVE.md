# Bruno Electric — P1 Job Materials unresolved-cost corrective / PWA v45

## Source audit
Rejected exact candidate `eb7edb7ecbed209ab4291a247c6eeff3cb9f34c7` because Residential Live correctly produced `YOUR_COST_UNRESOLVED`, but Confirm & Save -> BOM persisted the generated Job Material into `materialsUsed[]` with numeric `unitCost: 0`. The legacy project material calculator then consumed that zero as an ordinary known contractor cost.

## Root cause
`electric-bom.js::prepareReplacement()` collapsed blank/missing/invalid Your Cost into `unitCost: 0` and relied only on `bomStatus:'Unresolved'`. The main app's `calcMaterial()` intentionally treats every `materialsUsed[]` row as numeric project cost and does not inspect `bomStatus`, so unresolved and explicit-zero costs became observationally identical in project totals.

## Corrective contract
Generated BOM pricing now has a hard data-boundary distinction:

- known positive Your Cost -> `materialsUsed[]`, numeric resolved cost;
- explicit Your Cost `0` -> `materialsUsed[]`, numeric known zero;
- blank/missing/invalid Your Cost -> `materialsUnresolved[]`, `unitCost:null`, `costState:'UNRESOLVED'`;
- unmatched Catalog item -> `materialsUnresolved[]`, `unitCost:null`, `unresolvedReason:'CATALOG_UNMATCHED'`.

Because the legacy project material-cost engine reads only `materialsUsed[]`, unresolved generated rows cannot enter `calcMaterial()`, quote/project material totals, or resolved project-cost math.

## Replacement / promotion behavior
Recalculation removes only rows from the same generated source in both `materialsUsed[]` and `materialsUnresolved[]`. Manual and other-source rows remain preserved.

When the user later supplies Your Cost and confirms again, that row is removed from `materialsUnresolved[]` and promoted into `materialsUsed[]` with its known numeric cost. Explicit zero remains a resolved zero and is never moved into the unresolved collection.

## Job Materials UI
Added `electric-job-material-cost-semantics.js`:

- reads `materialsUnresolved[]` from persisted job state;
- injects visible Job Materials rows labeled `UNRESOLVED COST`;
- shows `Unresolved` for Your Cost and `Excluded` for extension;
- adds a warning that unresolved generated materials are blocked from project material-cost totals until Your Cost is supplied and the calculation is confirmed again;
- refreshes after Job Materials rerenders and after Confirm & Save.

This display bridge does not mutate numeric project cost state.

## Regression coverage
`tests/data-integrity.test.js` no longer asserts the defective `unitCost:0 + Unresolved` representation. It now verifies:

- blank Your Cost is absent from `materialsUsed[]` and present in `materialsUnresolved[]` with `unitCost:null`;
- explicit zero remains resolved in `materialsUsed[]`;
- caller status cannot mask unresolved cost;
- unmatched generated material remains unresolved outside numeric cost math;
- unresolved -> known-cost recalculation promotes the row into numeric Job Materials;
- v45 shell and Job Materials unresolved display module are present.

`tests/service-worker.test.js` verifies v44 and older Bruno Electric caches are invalidated while v45 remains, and that the new Job Materials semantics module is a required core-shell asset.

## PWA
Cache bumped to `bruno-electric-v45`. `electric-job-material-cost-semantics.js` is in `CORE_SHELL` and is loaded by `sw-register.js`.

## CI
Code candidate before this report commit: `8ceaf4e371c87a3328b04508b33a7e6faa80b407`.
GitHub Actions `Electrical Calculator Tests`, run #214: SUCCESS on that exact code candidate.

The audit task must pin the final branch HEAD after this report commit and independently verify exact-head CI provenance before acceptance.

## Scope intentionally deferred
Custom / special-order Catalog materials remains the next feature after this corrective PR receives independent acceptance.

## Merge state
PR #13 remains open and must not be merged before independent audit acceptance.

# Bruno Electric — Custom / Special-order Materials v46

## Purpose
Add project-scoped custom Catalog materials for one-off/special-order items and make them directly usable in Job Materials/project cost calculations without violating the accepted blank-vs-zero contractor-cost semantics.

## Implementation
- Added `electric-custom-materials.js`.
- Injects a Catalog card with Description, SKU/Part, Vendor, Unit, Customer Price, Your Cost and Qty.
- Supports `Save to Catalog` and `Save + Add to Job`.
- Existing custom items can be added to Job Materials or removed from Catalog.
- Custom rows are tagged `customMaterial:true`, `materialType:'CUSTOM_SPECIAL_ORDER'`, `projectScoped:true`.

## Cost-state contract
- blank/missing Your Cost => unresolved;
- explicit numeric 0 => known resolved zero;
- positive finite Your Cost => known resolved cost;
- negative prices and nonpositive quantity fail closed.

### Resolved custom material
Persists into `bruno-electric-v1.materialsUsed[]` with numeric `unitCost`, `costState:'RESOLVED'`, catalog traceability and participates in the existing material/project total math.

### Unresolved custom material
Persists into `bruno-electric-v1.materialsUnresolved[]` with `unitCost:null`, `costState:'UNRESOLVED'`, `unresolvedReason:'YOUR_COST_UNRESOLVED'`. It does not enter `materialsUsed[]`, therefore cannot enter legacy `calcMaterial()` / project material totals as a fake $0 cost.

## UI/state synchronization
After Add to Job, the page reloads from persisted `bruno-electric-v1` so the legacy closed-over application state, Job Materials UI, chips and totals immediately reflect the added material.

`electric-job-material-cost-semantics.js` wording was generalized from generated-only materials to all unresolved materials, including manual custom/special-order items.

## Persistence behavior
Deleting a custom Catalog row removes only that Catalog definition; already-added Job Materials history is preserved.

## PWA
- App shell bumped from `bruno-electric-v45` to `bruno-electric-v46`.
- `electric-custom-materials.js` is in `CORE_SHELL`.
- stale owned Bruno Electric caches are invalidated by the existing owned-cache activation rule.

## Tests
Added `tests/custom-materials.test.js` covering:
- custom Catalog persistence and metadata;
- blank Your Cost preservation;
- positive known Your Cost -> `materialsUsed[]`;
- explicit zero -> resolved numeric zero;
- blank Your Cost -> `materialsUnresolved[]` with null unit cost;
- validation of negative price / nonpositive quantity;
- Catalog deletion preserving previously added Job Materials.

Updated service-worker regression to v46 and custom module cache coverage.

## CI
GitHub Actions `Electrical Calculator Tests` was green on the implementation head before this report commit. Re-verify exact final candidate HEAD after this report commit before audit.

## Audit focus
Independently verify real browser/runtime behavior, especially:
- Catalog custom form on phone/tablet/desktop;
- Save to Catalog vs Save + Add to Job;
- blank Your Cost vs explicit 0;
- resolved item affects project material totals exactly once;
- unresolved item is visible as `UNRESOLVED COST / Excluded` and does not affect numeric totals;
- reload/persistence;
- deleting Catalog definition does not rewrite historical Job Materials;
- v45 -> v46 PWA update/offline.

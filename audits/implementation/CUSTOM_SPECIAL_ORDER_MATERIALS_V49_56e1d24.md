# Implementation Evidence — Custom / Special-order Materials v49

Exact production candidate: `56e1d2429e692093f13f039a6abbab7ed4baccce`
PR: #14

## v48 audit blockers addressed

### P1-1 — ordinary Catalog Add bypass
`electric-custom-materials.js` now installs a document-level capture listener for `.cat-add`.

For a selected Custom row:
- ID is resolved against current-job Custom Catalog definitions;
- `preventDefault`, `stopPropagation`, and `stopImmediatePropagation` block the legacy bubbling `.cat-add` handler;
- insertion routes through `routeCatalogAdd()` -> `addToJob()` strict semantics;
- blank Your Cost stays unresolved with `unitCost:null`;
- explicit zero stays resolved zero;
- positive cost uses `yourCost`, not Customer Price;
- traceability snapshot fields are preserved.

Non-Custom Catalog rows are not intercepted.

### P1-2 — global registry / import isolation
The v48 device-global canonical authority was removed.

There is no authoritative `CUSTOM_KEY`, `ensureRegistry()` or `reconcile()` path in the v49 module. Custom definitions live only in the active job's `catalog` under `bruno-electric-v1`.

Therefore replacing/importing Job B replaces the active job and its own Custom definitions without Job A registry injection.

The old key `bruno-electric-custom-materials-v1`, if left on a device by v48, is ignored by v49.

### P1-3 — malformed registry destructive fallback
Because v49 no longer reads the old global registry, malformed JSON or a valid non-array payload in that legacy key cannot alter the current job Catalog.

Regression tests explicitly cover both cases.

## Persistence model
Save/Edit/Delete mutate only current `bruno-electric-v1` and production UI calls immediately request reload/rehydration. The test-only `reload:false` option exists solely for deterministic unit/integration sequencing and is not used by production UI mutation calls.

Add to Job also writes current job state and reloads.

## Qty / history / cost semantics retained
- persisted Catalog Qty;
- Add existing defaults to saved Qty;
- row-specific Add Qty override does not mutate saved Qty;
- stable ID / createdAt on edit;
- historical Job Material snapshots remain immutable after Catalog edit/delete;
- blank / zero / positive Your Cost states remain distinct;
- unresolved items remain outside numeric material-cost math.

## PWA
Current cache: `bruno-electric-v49`.
`electric-custom-materials.js` remains in `CORE_SHELL`.
Owned stale caches are invalidated by the Bruno Electric cache regex; unrelated cache names are preserved.

## Tests / CI
Expanded Custom tests include:
- strict Catalog Add routing for blank / zero / positive Your Cost;
- non-Custom ordinary path remains unclaimed;
- Job A -> Job B isolation;
- stale legacy global-registry data ignored;
- malformed JSON old registry ignored;
- non-array old registry ignored;
- Qty, edit and history regressions.

Exact-head GitHub Actions:
- run #244
- conclusion: SUCCESS
- checkout exact PR head: PASS
- tested-head provenance verification: PASS
- deterministic calculator/integrity test step: PASS

Pinned candidate for audit: `56e1d2429e692093f13f039a6abbab7ed4baccce`.

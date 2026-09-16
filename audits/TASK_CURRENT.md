# TASK_CURRENT — Custom / Special-order Materials v49

Repository: `kot0070/bruno-electric-pwa`
Source PR: #14
Dev branch: `dev/custom-special-order-materials`

AUDITED_HEAD_SHA = `56e1d2429e692093f13f039a6abbab7ed4baccce`

Required audit report path:
`audits/reports/CUSTOM_SPECIAL_ORDER_MATERIALS_V49_56e1d24.md`

Read `audits/PROTOCOL.md` first. Execute AUDIT ONLY.

## Primary re-audit blockers from v48

### 1. Ordinary Catalog Add strict routing
Independently verify that an ordinary legacy `.cat-add` click on a Custom / Special-order Catalog row cannot fall through to the legacy insertion logic.

Verify for the real runtime:
- capture/interception ordering occurs before the legacy bubbling handler;
- Custom rows are detected by ID from current job Catalog;
- event propagation to legacy `.cat-add` logic is stopped;
- blank `Your Cost` routes to `materialsUnresolved[]` with `unitCost:null`;
- explicit `Your Cost = 0` routes to `materialsUsed[]` with resolved numeric zero;
- positive `Your Cost` routes to `materialsUsed[]` using contractor cost, never Customer Price;
- strict insertion preserves `catalogMatchId`, saved Catalog Qty, inserted Qty, Customer Price snapshot, Vendor and timestamp;
- ordinary non-Custom Catalog rows still use the ordinary Catalog path.

### 2. Job/import isolation
v48's global `bruno-electric-custom-materials-v1` registry must no longer be an authority.

Independently verify:
- Custom definitions belong only to the active job's `bruno-electric-v1` Catalog;
- Job A Custom definitions cannot overwrite Job B/imported job Custom definitions;
- importing/replacing a job containing its own Custom rows preserves that job's Custom rows;
- no cross-job/device-global reconciliation reintroduces another job's rows;
- legacy `bruno-electric-custom-materials-v1` data, if present from v48, is ignored as authority.

### 3. Malformed legacy registry fail-safe
Test both:
- malformed JSON in `bruno-electric-custom-materials-v1`;
- valid JSON but non-array payload.

Neither may erase, replace or mutate valid Custom definitions in the active job.

## Re-check persistence/stale-state contract
Save/Edit/Delete now write only the active job and immediately request page reload/rehydration in production UI paths.

Verify:
- Save to Catalog survives reload;
- Edit survives reload;
- Delete survives reload;
- reload is actually invoked by production Save/Edit/Delete paths;
- test-only `{reload:false}` is not used by UI production calls;
- no stale in-memory legacy state can subsequently overwrite the mutation in an ordinary user workflow before rehydration;
- Add to Job also reloads after persistence.

## Full Custom feature regression
Verify:
- persisted Qty;
- Add existing uses saved Qty after reload;
- row-specific Add Qty override without changing saved Qty;
- repeated Add creates independent historical rows;
- Edit Description / SKU / Vendor / Unit / Customer Price / Your Cost / Qty;
- stable ID and `createdAt`; updated `updatedAt`;
- existing Job Materials history is not rewritten after later Catalog edit/delete;
- blank / zero / positive Your Cost semantics;
- unresolved rows excluded from numeric project material cost math;
- Job Materials unresolved display remains explicit;
- phone / tablet / desktop layout remains usable.

## PWA / CI
Verify:
- current cache is `bruno-electric-v49`;
- stale owned Bruno Electric caches are deleted, unrelated caches preserved;
- strict Custom module remains in core shell/offline path;
- GitHub Actions run #244 is SUCCESS;
- the checkout/provenance step tests exactly `56e1d2429e692093f13f039a6abbab7ed4baccce`, not a synthetic merge ref.

## Shared regression sweep
Re-check material areas affected by shared persisted state and Catalog integration:
- Catalog pricing and blank-vs-zero semantics;
- Pricing & Margins strict runtime;
- Residential Live pricing / Confirm & Save / BOM / Job Materials;
- Commercial/Residential isolation;
- Journal historical helper-tax behavior;
- navigation/workspace;
- save/reload/import/export boundaries.

Do not limit the audit to the listed blockers. Independently inspect the whole candidate for P0/P1 regressions.

# Independent Audit — Custom / Special-order Materials v46

## Verdict
**C — REJECT / REWORK REQUIRED**

## Audited production candidate
- Repository: `kot0070/bruno-electric-pwa`
- Exact audited HEAD: `15dacdde3ddbc7895e78c1b057bcc4149d0863d1`
- Source PR: #14 (`dev/custom-special-order-materials` → `main`)
- Audit mode: **AUDIT ONLY**. No production code, PR, or merge state changed.

## P1 blocker

### P1 — Custom Catalog `Qty` is validated but not persisted; reload / repeat Add-to-Job can silently use the wrong quantity

`normalizeDraft()` validates and returns `qty`, but `createCatalogItem()` does not copy `x.qty` into the persisted Catalog row. Therefore `Save to Catalog` drops one of the required user inputs.

The Add-existing UI then calls:

```js
addToJob(id,val('cm-qty')||1)
```

That value comes from the single top-level creation form, not from the selected saved Catalog row. After reload that form initializes to `1`. A custom material saved with Qty `2`, `5`, etc. therefore has no durable quantity and can later be added as Qty `1` unless the user manually re-enters another value in the unrelated form field.

This violates the required Save → reload → Add-existing persistence path and is a P1 data-integrity / primary-workflow defect.

The deterministic custom tests do not catch this because they never assert `catalog[0].qty`; they call `M.addToJob(r.id, suppliedQty)` directly, bypassing the real saved-row/reload UI path.

Required correction before acceptance:
1. Persist normalized `qty` in each custom Catalog row.
2. Make Add-existing consume that row-specific quantity, or provide an explicit row-specific Qty editor.
3. Add regression coverage for `Save(qty=N) → reload/read → Add existing → Job Material qty=N` for both resolved and unresolved costs.
4. Verify repeated Add-to-Job appends a new row without mutating prior rows.

## Independent verification

### Exact production HEAD — VERIFIED
Commit `15dacdde3ddbc7895e78c1b057bcc4149d0863d1` exists, is the PR #14 head, and was the production candidate inspected. The final commit documents the custom-material implementation; production paths were inspected at that exact ref.

### CI provenance — GREEN, BUT NOT AN EXACT-HEAD CHECKOUT
GitHub Actions `Electrical Calculator Tests` run #219 is associated with PR #14 / head SHA `15dacdde3ddbc7895e78c1b057bcc4149d0863d1` and reports success with **502/502 deterministic tests passed**.

However, the runner log shows `actions/checkout@v4` fetched and checked out the synthetic PR merge ref:

`2b26f38bba69b89c8e67b1cf30afc305fbc840af`

with log text:

`Merge 15dacdde3ddbc7895e78c1b057bcc4149d0863d1 into 5e866c61e43a7cce5aa07b9341700b1fcb0ff5cc`

Therefore run #219 is strong regression evidence for the merge candidate, but it is **not proof that the exact head SHA itself was checked out and executed**. The audit does not treat CI green as proof of correctness, and the P1 above remains independently demonstrated from exact-head production source.

### Custom Catalog fields / actions — PARTIAL PASS WITH P1 ABOVE
The production UI exposes Description, SKU / Part #, Vendor, Unit, Customer Price, Your Cost, Qty, Save to Catalog, Save + Add to Job, Add existing custom material to Job, and delete custom Catalog item.

Description is required. Negative prices and nonpositive quantities fail closed. The persisted row is tagged `customMaterial:true`, `materialType:'CUSTOM_SPECIAL_ORDER'`, `projectScoped:true` and does not alter seeded rows except by appending/removing the targeted custom definition.

The blocker is that Qty is not persisted in the custom Catalog object.

### Positive Your Cost → `materialsUsed[]` / project totals — PASS
For a finite non-negative `yourCost`, `addToJob()` appends to `materialsUsed[]` with numeric `unitCost`, `costState:'RESOLVED'`, `catalogMatchId`, custom-material metadata, quantity supplied to the function, part and units traceability.

The custom module does not create a second totals path; resolved rows enter the existing Job Materials numeric path exactly as ordinary `materialsUsed[]` rows. No custom-specific double-count insertion was found.

### Explicit Your Cost `0` — PASS
The known-cost predicate explicitly accepts numeric zero. It routes to `materialsUsed[]` with `unitCost:0` and `costState:'RESOLVED'`, not to unresolved storage.

### Blank Your Cost → `materialsUnresolved[]` — PASS
Blank Your Cost persists as blank in Catalog and routes to `materialsUnresolved[]` with:
- `unitCost:null`
- `costState:'UNRESOLVED'`
- `unresolvedReason:'YOUR_COST_UNRESOLVED'`

It is not inserted into `materialsUsed[]`; therefore it cannot be consumed by the legacy numeric Job Materials path as a fake zero cost. No Customer Price fallback into contractor-cost math was found in the custom path.

### Job Materials unresolved UI — PASS
`electric-job-material-cost-semantics.js` reads `materialsUnresolved[]` and injects rows showing:
- `UNRESOLVED COST`
- unit cost `Unresolved`
- total `Excluded`

The banner wording was generalized from generated-only materials to all unresolved materials.

### Save + Add to Job / state synchronization — PASS EXCEPT PERSISTED QTY
`Save + Add to Job` saves the Catalog definition, then routes the row to resolved or unresolved Job Materials. After Add-to-Job it schedules a page reload so legacy closed-over calculator state is rehydrated from persisted `bruno-electric-v1` rather than remaining stale.

The cost-state routing is sound; the persisted-Qty defect remains.

### Delete Catalog definition / historical Job Materials — PASS
`remove(id)` filters only `job.catalog`. It does not modify `materialsUsed[]` or `materialsUnresolved[]`, so already-added Job Material history is preserved after deleting the custom Catalog definition.

### Repeated Add to Job — APPEND SEMANTICS PASS; REAL UI FLOW FAILS ON QTY
`addToJob()` appends a new Job Material object and does not mutate prior rows. But after reload the saved Catalog row has no quantity, so repeated Add-existing uses the current top-form Qty rather than the saved item quantity. This is part of the P1 blocker.

### Catalog / Pricing & Margins blank-vs-zero regression — PASS IN INSPECTED SEMANTICS
`electric-catalog-cost-semantics.js` intercepts blank `.cat-your` / `.mrg-your` input, persists blank `yourCost:''`, removes stale per-row persisted cost overrides, and marks the input unresolved. Explicit zero is treated as known and continues through the normal numeric path.

The deterministic suite includes Catalog-cost and Pricing & Margins semantics coverage and was green on the PR merge candidate.

### Residential Live / BOM / Job Materials regressions — NO NEW CODE-PATH REGRESSION FOUND
The PR does not modify Residential Live, BOM, or core project-calculator modules. The deterministic runner includes the established residential, pricing, takeoff, live/history/workspace, project calculator, data-integrity and Job Materials-related suites, all green on the PR merge candidate. Exact-head source inspection found no custom module writes into residential-specific state.

### Commercial / Residential isolation — PASS BY SOURCE BOUNDARY + REGRESSION EVIDENCE
The custom feature writes only the shared persisted `bruno-electric-v1` Catalog / Job Materials arrays and does not write residential/commercial calculator-specific structures. Existing cross-workspace regression coverage remained green on the PR merge candidate.

### Journal historical helper-tax — PASS BY UNCHANGED SOURCE BOUNDARY + REGRESSION EVIDENCE
The custom feature does not modify journal logic. The existing dispatch-journal regression suite remained green on the PR merge candidate; no new helper-tax coupling was introduced by the changed files.

### PWA v45 → v46 / offline cache — PASS BY SOURCE + SERVICE-WORKER REGRESSION
`sw.js` bumps the cache to `bruno-electric-v46`, keeps the owned-cache matcher `^bruno-electric-v\d+$`, and includes `electric-custom-materials.js` in `CORE_SHELL`. Existing activation logic removes stale owned Bruno Electric caches. `sw-register.js` dynamically loads the custom module for the main application. Persisted custom/job state remains in `localStorage`, independent of shell-cache replacement.

The service-worker regression was updated for v46 and was green on the PR merge candidate.

### Phone / tablet / desktop — RESPONSIVE RISK NOT COVERED BY CI
The injected custom form uses an inline seven-column grid:

```css
grid-template-columns:2fr 1fr 1fr .7fr 1fr 1fr .7fr
```

The custom module itself provides no breakpoint. The Node test environment does not render this UI at phone/tablet/desktop widths. This requires real-browser responsive verification before release; it is not used as the primary blocker because the deterministic persisted-Qty failure already requires rejection.

## Blockers
1. **P1 — Custom Catalog Qty is not persisted.** Save/reload loses the intended quantity; Add-existing reads the unrelated top-form Qty (default `1` after reload), allowing silent quantity corruption.

## Verdict
**C — REJECT / REWORK REQUIRED**

The positive / zero / unresolved contractor-cost routing, unresolved exclusion semantics, Catalog-delete history boundary, v46 cache wiring, and shared regressions are materially sound in the inspected candidate. Acceptance is blocked by the saved-Qty data-integrity defect; exact-head CI checkout should also be made explicit in future verification rather than relying on the PR synthetic merge ref.
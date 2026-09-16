# Independent Audit — Custom / Special-order Materials v46

## Verdict
**C — REJECT / REWORK REQUIRED**

## Audited production candidate
- Repository: `kot0070/bruno-electric-pwa`
- Exact audited HEAD: `15dacdde3ddbc7895e78c1b057bcc4149d0863d1`
- Source PR identified by task: PR #14 (`dev/custom-special-order-materials` → `main`)
- Audit mode: **AUDIT ONLY**. No production code, PR, or merge state changed.

## P1 blocker

### P1 — Custom Catalog `Qty` is validated but not persisted; reload / repeat Add-to-Job silently loses the intended quantity

**Required by TASK_CURRENT**
- Custom Catalog creation includes `Qty`.
- Save → reload preserves the custom Catalog row.
- Add existing custom material to Job must preserve quantity / traceability.
- Repeated Add to Job must not silently mutate prior/intended material data.

**Exact production implementation** — `electric-custom-materials.js`

`normalizeDraft()` correctly reads and validates `qty`:

```js
return {
  item:item,
  part:text(d.part),
  vendor:text(d.vendor)||'Special order',
  units:text(d.units)||'EA',
  unitCost:nonneg(d.customerPrice,false),
  yourCost:nonneg(d.yourCost,true),
  qty:qty(d.qty==null?1:d.qty)
}
```

But `createCatalogItem()` drops `x.qty` entirely:

```js
return {
  id:uid(),
  item:x.item,
  part:x.part,
  vendor:x.vendor,
  units:x.units,
  unitCost:x.unitCost,
  yourCost:x.yourCost==null?'':x.yourCost,
  crew:1,
  prod:0,
  prodUnit:'EA',
  customMaterial:true,
  materialType:'CUSTOM_SPECIAL_ORDER',
  projectScoped:true,
  createdAt:now,
  updatedAt:now
}
```

Therefore `Save to Catalog` does **not** persist the quantity entered by the user.

The existing-row `Add to Job` UI compounds the failure:

```js
if (b.classList.contains('cm-add-existing')) {
  addToJob(id,val('cm-qty')||1);
}
```

That quantity comes from the single top-level creation form, not from the selected Catalog row. After reload the form initializes `cm-qty` to `1`, so a material originally saved with Qty `2`, `5`, etc. is later added as Qty `1` unless the user happens to re-enter another value in the unrelated form control. The selected row itself has no persisted quantity from which to recover the intended value.

This is a production-blocking data-integrity / primary-workflow defect because the persisted Catalog definition does not contain one of the required material inputs and repeat/reload behavior can silently create a Job Material with a different quantity than the one saved.

**Why CI did not catch it**

`tests/custom-materials.test.js` creates Catalog items with a qty but never asserts `catalog[0].qty`. Its Add-to-Job tests manually pass quantities into the API:

```js
M.addToJob(r.id,3)
M.addToJob(r.id,2)
```

So the tests validate `addToJob(id, suppliedQty)` but do not test the real persisted flow: `Save to Catalog → reload → Add existing custom row`.

**Required correction before acceptance**
1. Persist normalized `qty` in each custom Catalog row.
2. Make Add-existing use the selected row's persisted quantity, or provide an explicit row-specific quantity editor whose value is unambiguously used.
3. Add deterministic regression coverage for `Save to Catalog(qty=N) → reload/read → Add existing → materialsUsed/materialsUnresolved qty=N`.
4. Cover repeated Add-to-Job without mutating prior rows.

---

## Independent verification of the remaining critical paths

### Exact HEAD / CI provenance — PASS
- Exact commit exists and resolves to `15dacdde3ddbc7895e78c1b057bcc4149d0863d1`.
- GitHub Actions run `Electrical Calculator Tests` run `#219` is attached to this exact SHA and completed `success`.
- Job `calculator-tests` completed successfully.
- Workflow runs `node tests/run-node.js`, which includes the calculator/integrity, navigation, residential estimator/pricing/takeoff/live/history/workspace, dispatch journal, project calculator, service-worker, catalog-cost, pricing-margins and custom-material suites.
- CI is supporting evidence only; it does not invalidate the P1 above because the missing persisted-Qty scenario is absent from the tests.

### Custom Catalog fields / actions — PARTIAL PASS WITH P1 ABOVE
Production UI exposes:
- Description
- SKU / Part #
- Vendor
- Unit
- Customer Price
- Your Cost
- Qty
- Save to Catalog
- Save + Add to Job
- Add existing custom material to Job
- Delete custom Catalog item

Description is required; negative prices fail closed; nonpositive qty fails closed.

However, Qty is not stored in the custom Catalog object, so the field is not actually durable across Save/reload.

### Positive Your Cost routing — PASS
`addToJob()` treats finite non-negative `yourCost` as known. Positive values are written to `materialsUsed[]` with:
- numeric `unitCost`
- `costState:'RESOLVED'`
- `catalogMatchId`
- `customMaterial:true`
- `materialType:'CUSTOM_SPECIAL_ORDER'`
- quantity supplied to `addToJob()`
- part / units traceability

Legacy `calcMaterial()` iterates `materialsUsed[]`, multiplying `qty × unitCost`, so a resolved custom row participates in project material totals through the same numeric path as existing Job Materials.

No evidence was found of a second custom-specific totals insertion path; therefore the resolved row is not intentionally double-counted by this module.

### Explicit Your Cost `0` — PASS
The known-cost predicate explicitly accepts `0`:

```js
c.yourCost!=='' && Number.isFinite(Number(c.yourCost)) && Number(c.yourCost)>=0
```

It routes to `materialsUsed[]` with numeric `unitCost:0` and `costState:'RESOLVED'`, not to unresolved storage.

### Blank Your Cost — PASS
Blank Your Cost is persisted in Catalog as `''` and routes to:
- `materialsUnresolved[]`
- `unitCost:null`
- `costState:'UNRESOLVED'`
- `unresolvedReason:'YOUR_COST_UNRESOLVED'`

It is not inserted into `materialsUsed[]`. Since legacy `calcMaterial()` reads `materialsUsed[]`, the unresolved custom row is excluded from numeric project material-cost math rather than being coerced to a fake `$0` contractor cost.

### Job Materials unresolved UI — PASS
`electric-job-material-cost-semantics.js` reads `materialsUnresolved[]` and injects Job Materials rows with:
- visible `UNRESOLVED COST`
- unit cost display `Unresolved`
- total display `Excluded`

The banner wording was generalized to `material(s)` rather than generated-only wording and states that unresolved materials are blocked from project material-cost totals.

### Delete custom Catalog item vs Job history — PASS
`remove(id)` only filters the custom row from `job.catalog`. It does not modify `materialsUsed[]` or `materialsUnresolved[]`.

The custom-material regression test also verifies that a previously added resolved Job Material remains after its Catalog definition is removed.

### Repeated Add to Job — FAIL because of P1 Qty persistence
`addToJob()` itself appends new objects and does not mutate prior Job Material rows. However, repeat/reload UI behavior is not correct because the saved Catalog row has no qty and the Add-existing button uses the top creation-form qty instead of a row-specific persisted value.

### Catalog / Pricing blank-vs-zero boundary — PASS in inspected cost semantics
`electric-catalog-cost-semantics.js` protects `.cat-your` / `.mrg-your` blank input before the legacy editor can coerce it to zero. Persisted blank Your Cost remains blank/unresolved; explicit zero continues through the normal numeric path.

The exact-head deterministic suite includes both `catalog-cost-semantics.test.js` and `pricing-margins-semantics.test.js` and passed.

### Residential Live / BOM / project-calculator regressions — PASS by exact-head deterministic suite
The exact-head runner includes:
- residential estimator
- residential pricing
- residential takeoff
- residential live
- residential live levels
- residential live history
- residential live workspace
- project calculator
- data integrity
- BOM/calculator modules loaded by the runner

All completed successfully on the exact audited SHA.

### Commercial / Residential isolation — PASS by existing exact-head regression suite
The shared exact-head deterministic regression suite completed successfully. No custom-material production code writes to residential-specific state keys or commercial/residential calculation modules; the feature is scoped to persisted `bruno-electric-v1` catalog/job-material arrays.

### Journal historical helper-tax stability — PASS by exact-head regression suite
`tests/dispatch-journal-v2.test.js` is included in the exact-head runner and completed successfully. The custom-material change does not directly modify the journal module.

### PWA v45 → v46 / cache — PASS by code + exact-head service-worker regression
`sw.js` has:
- `CACHE = 'bruno-electric-v46'`
- owned-cache regex `^bruno-electric-v\d+$`
- activation deletion of older owned Bruno Electric caches
- `electric-custom-materials.js` in `CORE_SHELL`
- install-time `cache.addAll(CORE_SHELL)`
- cache/network handling that preserves the updated shell offline after successful installation

Custom Catalog / Job state is in `localStorage` (`bruno-electric-v1`), so service-worker cache replacement does not itself erase persisted material data.

`tests/service-worker.test.js` is included in the exact-head test run and passed.

### Phone / tablet / desktop — NOT ACCEPTABLE AS RELEASE PROOF; source-level risk remains
The custom creation form is injected with an inline fixed seven-column grid:

```css
grid-template-columns:2fr 1fr 1fr .7fr 1fr 1fr .7fr
```

No custom-module breakpoint is present in the inspected implementation. Because this is an inline declaration, ordinary page media-query rules do not automatically replace that grid-template declaration unless they target it with sufficient override semantics. The exact CI runner uses a stubbed `document` (`getElementById() => null`) and therefore does **not** render or exercise the custom Catalog UI at phone/tablet/desktop widths.

This is a real responsive-risk item and should receive browser verification/fix, but the release is already rejected on the deterministic P1 persisted-Qty defect above.

## Final blocker list
1. **P1 — Custom Catalog Qty is not persisted.** Save/reload loses it, and Add-existing uses the unrelated top-form Qty (defaulting to `1` after reload), causing silent quantity corruption in the primary custom-material workflow.

## Final verdict
**C — REJECT / REWORK REQUIRED**

The cost-state work (positive / explicit zero / blank unresolved), Job Materials exclusion semantics, delete-history boundary, exact-head CI and v46 service-worker changes are materially sound in the inspected candidate. The persisted-Qty defect is a P1 data-integrity/primary-workflow failure and blocks acceptance until corrected and regression-tested through the real Save → reload → Add-existing path.

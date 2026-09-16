# Independent Audit — Pricing & Margins unresolved Your Cost / PWA v44

## Verdict
**C — REJECT / REWORK REQUIRED**

## Audited candidate
- Exact production candidate HEAD: `eb7edb7ecbed209ab4291a247c6eeff3cb9f34c7`
- Audit mode: AUDIT ONLY
- Production code / PR / merge state were not modified.
- Source PR provenance: PR #13, candidate HEAD matches the requested SHA.
- GitHub Actions check `calculator-tests` completed successfully for exact head `eb7edb7ecbed209ab4291a247c6eeff3cb9f34c7`; CI green is treated as evidence, not proof.

## Executive result
The latest strict Pricing & Margins corrective fixes the original direct renderer defect: blank/missing `Your Cost` is modeled as unresolved, explicit numeric `0` remains a known zero, strict aggregates exclude unresolved rows, and the strict tbody takeover is performed synchronously by `sw-register.js` before the document `DOMContentLoaded` phase can invoke the legacy renderer.

However, the required end-to-end Residential Live → Confirm & Save → BOM → Job Materials path still violates the same pricing-integrity contract. An unresolved contractor cost is converted into numeric `unitCost: 0` when generated Job Materials are prepared. The main application then computes Job Materials extensions and material totals from `unitCost` with no `bomStatus`/unresolved guard. The result is a resolved-looking zero contractor cost entering project material-cost math even though the source Catalog `Your Cost` is unknown.

This is a **P1 production-blocking data-integrity/pricing defect** and requires rejection.

---

## P1 BLOCKER — unresolved Residential contractor cost becomes numeric zero in Job Materials and enters project cost math

### Required contract
The task requires:
- blank/missing `Your Cost` = unresolved;
- explicit `0` = known zero;
- unresolved rows must not enter resolved contractor-cost / gross-profit / margin math;
- Confirm & Save → BOM → Job Materials must preserve unresolved Your Cost rather than silently resolving it.

### Actual runtime/data path
1. `electric-residential-pricing.js::priceRows()` correctly treats a positive Customer Price plus blank/missing `yourCost` as:
   - `status: 'YOUR_COST_UNRESOLVED'`
   - `yourUnitCost: null`
   - `yourTotal: null`
   - `materialGrossProfit: null`
   - the row is excluded from resolved contractor-cost/gross-profit/margin aggregates.

2. Residential Live `saveConfirmed()` calls `BrunoResidentialLiveHistory.confirmAtomic(...)` with the generated live BOM.

3. `electric-residential-live-history.js::confirmAtomic()` calls `BrunoElectricBOM.prepareReplacement(...)` before committing the updated job/archive pair.

4. `electric-bom.js::prepareReplacement()` determines `hasYourCost` from the Catalog row, but for missing/blank contractor cost it executes the equivalent of:
   - `price = 0`
   - `bomStatus = 'Unresolved'`
   - `unitCost = price`

   Therefore an unresolved contractor cost is persisted in `bruno-electric-v1.materialsUsed[]` as **numeric `unitCost: 0`**.

5. The main `index.html` application material engine (`calcMaterial`) later calculates each Job Material row using:
   - `q = Number(row.qty) || 0`
   - `c = Number(row.unitCost) || 0`
   - `extension = q * c`
   - sum of all extensions

   It does not inspect `bomStatus`, `catalogMatchId`, or any unresolved marker before adding the row to material totals.

6. `renderMaterials()` likewise displays/calculates extension directly from numeric `unitCost`; there is no unresolved-cost UI/math guard in the legacy Job Materials path.

### Concrete failing state transition
For a Catalog row such as:
- Customer Price = `$100`
- Your Cost = blank/unresolved

Residential Live pricing correctly reports unresolved Your Cost. After Confirm & Save, the generated Job Material contains `unitCost: 0` plus `bomStatus: 'Unresolved'`. The project material calculation then consumes `0` as an ordinary numeric cost. This is observationally indistinguishable in the material-cost calculation from an explicitly known `$0` contractor cost.

### Why existing tests do not catch it
`tests/data-integrity.test.js` explicitly asserts the current defective representation:
- blank Your Cost → generated BOM `unitCost === 0`
- `bomStatus === 'Unresolved'`

That test proves no Customer Price fallback occurs, but it does **not** prove fail-closed downstream behavior. The production Job Materials calculator ignores `bomStatus`, so the test suite allows unresolved and explicit-zero contractor costs to collapse to the same numeric value at the exact boundary that matters for project totals.

`tests/residential-catalog-bridge.test.js` verifies positive/zero pricing and generated catalog match metadata, but it does not exercise unresolved generated material through the main Job Materials cost calculator.

### Required correction
Preserve a first-class unresolved representation through generated Job Materials and all downstream calculations. At minimum:
- unresolved generated material must not be persisted/consumed as an ordinary numeric contractor cost;
- explicit zero must remain separately representable as known zero;
- `calcMaterial`, Job Materials rendering, project totals, and any quote/margin consumers must exclude or visibly fail closed on unresolved generated contractor-cost rows;
- add an end-to-end deterministic regression proving: positive Customer Price + blank Your Cost → Confirm & Save → reload → Job Materials remains unresolved and does not contribute `$0` as a resolved contractor cost.

Severity: **P1**.

---

## Pricing & Margins strict runtime findings

### Legacy renderer takeover
PASS for the targeted takeover mechanism.

`sw-register.js` is the final external script after the large inline application script. Although the legacy application registers/contains its renderer first, `sw-register.js` calls `prepareStrictMarginsRuntime()` synchronously while the document is still being parsed, before `DOMContentLoaded` fires. It removes `#margins-body`, creates `#margins-body-strict`, and marks `#panel-margins` with strict-v2/legacy-disabled attributes. When the legacy renderer later runs, its first lookup for `#margins-body` returns null and it exits.

The strict module binds/renderers against `#margins-body-strict` only.

### Blank / explicit-zero semantics
PASS within `electric-pricing-margins-semantics.js`:
- blank/missing → `{ known:false, value:null }` / unresolved row;
- explicit `0` → known zero;
- known positive → resolved numeric cost;
- unresolved row gross difference/margin are null;
- explicit zero can legitimately produce 100% material margin with positive Customer Price.

### Aggregates
PASS within strict Pricing & Margins:
- unresolved rows increment `unresolvedCount` but do not enter `resolvedCostTotal`, `resolvedGrossDifference`, or resolved margin denominator;
- UI appends `N unresolved` to contractor-cost/gross-difference/margin summary values instead of presenting a fully resolved-looking total.

### Required persistence transitions
PASS for the strict Pricing & Margins persistence implementation and direct tests:
- blank → save → reload remains unresolved;
- known positive → blank removes the row from all discovered `*-catalog-costs-v1` maps;
- blank → explicit `0` persists zero in job state and primary map;
- explicit `0` → blank removes persisted zero map entry;
- blank discount/% delegates to unresolved Your Cost;
- explicit discount/% deterministically computes a known Your Cost.

`writeKnownMap()` enumerates all localStorage keys ending in `-catalog-costs-v1`, deletes the affected row from each, and writes known values only to the primary map. This prevents a user-cleared current row from being immediately resurrected by a stale secondary cost-map entry.

---

## Catalog `.cat-your` findings

The legacy Catalog editor still renders blank `yourCost` initially using Customer Price and its native `applyCatalogYourCost()` coerces invalid/blank input to zero. The new `electric-catalog-cost-semantics.js` is therefore essential, not optional decoration.

The guard installs capture-phase input/change handlers, persists blank directly to `bruno-electric-v1`, deletes matching entries from every `*-catalog-costs-v1` map, stops the legacy event before bubble-phase coercion, and synchronizes `.cat-your` inputs whose persisted row is blank.

Direct blank versus explicit-zero protection is therefore present. The service worker includes the semantics module in the v44 core shell.

No separate P1 was established here after tracing the guard ordering, but this remains a fragile compatibility layer: a semantics-script load failure falls back to legacy coercive behavior.

---

## Residential Live pricing findings

PASS for the live pricing engine itself:
- blank/missing Your Cost → `YOUR_COST_UNRESOLVED`;
- explicit zero → resolved zero;
- positive known cost → normal resolved calculation;
- Customer Price never substitutes as Your Cost;
- resolved contractor-cost/gross-profit/margin aggregates use resolved rows only;
- exact matching is tried before the explicit alias table;
- unsupported items remain unmatched rather than fuzzy-guessed.

The P1 occurs after this correct live-pricing result, at the generated Job Materials persistence/calculation boundary described above.

---

## Catalog bridge / persisted maps

`electric-residential-catalog-bridge.js` overlays supported persisted customer-price and contractor-cost maps before Residential pricing/BOM use. It preserves explicit zero and blank-map values distinctly via `knownCost()`.

The strict Pricing & Margins and Catalog blank guards remove a cleared row from every localStorage key ending in `-catalog-costs-v1`, which addresses the required current-edit stale-map resurrection path.

No additional blocker was proven in the tested transition path.

---

## Confirm & Save / archive / preservation

PASS:
- Residential Live Confirm & Save uses rollback-protected `confirmAtomic()`;
- manual and other-source Job Materials are preserved while only same-source generated rows are replaced;
- `catalogMatchId` is retained for generated matches;
- archive structure stores BOM/design quantities and reprices from current Catalog instead of freezing stale pricing.

FAIL (P1): unresolved generated contractor cost is persisted as numeric zero and then consumed by the legacy Job Materials calculator as resolved numeric cost.

---

## PWA v44 / offline findings

PASS for the examined cache migration logic:
- cache name is `bruno-electric-v44`;
- owned-cache regex targets `bruno-electric-vN` only;
- activation deletes older owned Bruno caches while leaving unrelated caches untouched;
- `electric-pricing-margins-semantics.js` and `electric-catalog-cost-semantics.js` are core-shell entries;
- install waits on all core-shell files and uses `skipWaiting()`;
- activation uses `clients.claim()`;
- prior v43/v42/v41 and older matching Bruno cache names are invalidated by the owned-cache regex;
- navigation uses network-first with cached fallback; shell assets use cache-first with network refresh.

No additional P1 was established in the v44 cache code.

---

## Regression coverage reviewed

The exact candidate contains deterministic coverage for calculator, data integrity, navigation shell, Residential estimator/pricing/takeoff/live/levels/history/workspace, Dispatch Journal v2, Project Calculator, Phase 3 equipment, service worker, Residential Catalog bridge, Catalog-cost semantics, and Pricing & Margins semantics.

Exact-SHA GitHub Actions provenance is green for `calculator-tests` on `eb7edb7ecbed209ab4291a247c6eeff3cb9f34c7`.

Commercial/Residential shared-shell/navigation and Journal regression tests remain present. No new blocker was established in those areas from the candidate inspection and exact-SHA CI evidence. These do not override the end-to-end pricing-integrity P1 above.

---

## Final blocker list

### P1-1 — Generated unresolved Your Cost collapses to numeric zero in Job Materials cost math
Residential Live correctly identifies unresolved Your Cost, but Confirm & Save persists the generated material with `unitCost: 0`; the main Job Materials calculator then totals that value without an unresolved guard. Blank/unresolved and explicit known zero therefore collapse at the project material-cost boundary, violating the required fail-closed pricing semantics.

## Final verdict
**C — REJECT / REWORK REQUIRED**

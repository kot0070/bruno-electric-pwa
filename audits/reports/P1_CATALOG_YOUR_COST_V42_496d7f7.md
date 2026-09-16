# Independent Audit — Catalog Your Cost Semantics / PWA v42

## VERDICT
**C — REJECT / REWORK REQUIRED**

## AUDITED HEAD
`496d7f7070d3116e93c209c430f88a3a71d6b7dc`

Audit mode: **AUDIT ONLY**. Production code, `main`, PR state and merge state were not modified.

## BLOCKERS

### P1 — Pricing & Margins still computes resolved numeric cost/margin from Customer Price when `Your Cost` is unresolved

The corrective capture guard successfully prevents the legacy `.mrg-your` input/change handler from coercing a cleared field to numeric zero, and it rewrites the visible input to blank when persisted `yourCost` is blank. However, the active Pricing & Margins renderer itself still applies legacy fallback semantics before the guard can correct the input element:

```js
var cust = Number(c.unitCost) || 0;
var yours = (c.yourCost != null && c.yourCost !== '') ? (Number(c.yourCost) || 0) : cust;
var diff = cust - yours;
var pct = cust > 0 ? (diff / cust) * 100 : 0;
sumCust += cust; sumCost += yours; n++;
```

For a Catalog row with positive Customer Price and blank/missing `yourCost`, this means:

- the underlying Pricing & Margins calculation sets `yours = cust`;
- row gross difference becomes numeric `0`;
- row margin becomes numeric `0%`;
- aggregate `sumCost` includes Customer Price as if contractor cost were known;
- the generated `.mrg-your` input is initially rendered with that numeric `yours` value;
- `electric-catalog-cost-semantics.js` subsequently blanks the input via `syncBlankInputs()`, but it does **not** recompute or invalidate the already-rendered row/aggregate cost and margin values.

Thus the screen can show an unresolved/blank `Your Cost` input while simultaneously presenting resolved-looking numeric cost/margin outputs derived from Customer Price. This is a pricing/data-integrity ambiguity and directly violates the required contract that blank/missing `Your Cost` is unresolved. It also violates the task requirement to independently verify both active editing surfaces, including Pricing & Margins.

The same legacy fallback is also present in `catalogDiscPct(c)`:

```js
var yours = (c.yourCost != null && c.yourCost !== '') ? (Number(c.yourCost) || 0) : cust;
```

This continues to model unresolved contractor cost as Customer Price for discount/margin-derived behavior.

**Required corrective direction:** Pricing & Margins must preserve a first-class unresolved state for blank/missing `yourCost`; it must not substitute Customer Price, zero, or any other numeric value. Row and aggregate cost/profit/margin outputs must either exclude unresolved rows or explicitly display unresolved state. Existing explicit `0` must remain a valid known zero and positive finite values must remain known.

## INDEPENDENT FINDINGS

### 1. Exact-head provenance / CI

- Audited production candidate SHA is exactly `496d7f7070d3116e93c209c430f88a3a71d6b7dc`.
- GitHub Actions run `35045297909` / workflow `Electrical Calculator Tests`, run number `195`, is attached to exact `head_sha=496d7f7070d3116e93c209c430f88a3a71d6b7dc` and completed with `conclusion=success`.
- CI green was treated only as supporting evidence, not proof.
- A local clone/test execution was attempted independently but the audit runtime had no DNS access to `github.com`; therefore exact-head source inspection and exact-head GitHub Actions provenance were used instead of claiming a locally executed suite.

### 2. Catalog `Your Cost` capture semantics

`electric-catalog-cost-semantics.js` correctly distinguishes:

- blank/missing -> `{known:false,value:''}`;
- explicit `0` -> known zero;
- positive finite input -> known numeric cost;
- invalid/negative -> unresolved rather than known zero.

For `.cat-your` and `.mrg-your`, the guard installs capture-phase `input` and `change` listeners. For unresolved input it calls `stopImmediatePropagation()`, persists `yourCost=''` in `bruno-electric-v1`, removes matching entries from all localStorage keys ending `-catalog-costs-v1`, visually blanks the input, and on `change` triggers reload. This ordering blocks the known coercive bubbling handlers from subsequently applying `parseFloat(blank)||0`.

### 3. blank -> save -> reload / known -> blank -> reload / explicit-zero boundaries

For a normal persisted Catalog row present in `bruno-electric-v1`:

- known -> blank: guard writes `yourCost=''`, removes persistent cost-map override, blocks legacy handlers, then reloads;
- blank -> explicit `0`: guard treats `0` as known and permits native handler to persist numeric zero and rebuild the cost map;
- explicit `0` -> blank: guard returns the row to `''` and deletes the cost-map entry;
- positive finite -> blank follows the same unresolved path;
- invalid/negative cannot silently become known zero through the protected Your Cost handlers.

The distinction is therefore correctly persisted at the state/map boundary, subject to the Pricing & Margins renderer blocker above.

### 4. `bruno-electric-v1` and persisted cost maps

`persistBlank(id)` updates the saved Catalog object in `bruno-electric-v1` and `removePersistedCost(id)` enumerates localStorage and deletes the id from every key matching `/-catalog-costs-v1$/`.

`electric-residential-catalog-bridge.js` now uses `knownCost(raw)` and preserves blank/missing as unresolved when overlaying `bruno-electric-catalog-costs-v1`, `bruno-job-catalog-costs-v1`, and `bruno-catalog-costs-v1`. Explicit numeric zero remains known.

No fuzzy Catalog matching was introduced: resolution remains exact normalized item match plus explicit alias table only.

### 5. Starter Catalog

`electric-catalog-v1.js` now seeds starter electrical Catalog rows with `yourCost:''`, not `yourCost:0`. `mergeMissing()` preserves existing rows and adds only missing ids/names, so existing user-edited rows and historical explicit zeros are not overwritten by catalog completion.

### 6. Residential Live Customer Price / Your Cost / material margin

`electric-residential-pricing.js` correctly distinguishes pricing states:

- positive Customer Price + blank/missing Your Cost -> `YOUR_COST_UNRESOLVED`, `yourUnitCost:null`, `yourTotal:null`, `materialGrossProfit:null`, unresolved count incremented;
- positive Customer Price + explicit Your Cost `0` -> resolved `PRICED`, legitimate zero contractor material cost and 100% material margin for that row;
- positive known Your Cost -> normal resolved cost/profit/margin;
- Customer Price is not substituted for missing Your Cost inside the Residential pricing engine;
- overall gross profit/margin uses fully resolved customer value only (`resolvedCustomerMaterialTotal`), while known customer totals may still include rows with unresolved contractor cost.

This engine behavior is correct and separate from the legacy Pricing & Margins UI blocker.

### 7. Confirm & Save -> BOM -> Job Materials

`electric-bom.js` / catalog bridge behavior remains fail-closed for generated rows:

- exact/explicit-alias matched Catalog row with blank/missing Your Cost -> generated Job Material has `bomStatus:'Unresolved'` and numeric storage `unitCost:0` only as a storage placeholder paired with unresolved status;
- explicit known zero -> resolved zero and does not become `Unresolved`;
- positive known cost propagates numerically;
- rows generated by a different source and manual rows are preserved because replacement removes only rows whose `generatedBy.source` equals the active source tag;
- `catalogMatchId` is retained for traceability.

### 8. PWA v41 -> v42 update / offline

`sw.js` uses `CACHE='bruno-electric-v42'` and `OWNED_CACHE_RE=/^bruno-electric-v\d+$/`. Activation deletes every owned Bruno Electric versioned cache except v42, covering v41 and older versioned app-shell caches.

`electric-catalog-cost-semantics.js` is present in `CORE_SHELL`, so successful v42 installation requires it to cache with the rest of the core shell. `skipWaiting()` and `clients.claim()` are used, and same-origin shell fetches are refreshed into v42. This is sufficient for installed clients to move off v41 after successful worker installation/activation and for subsequent offline reloads to have the corrective module available.

### 9. Commercial / Residential, Journal, persistence, navigation regressions

The exact-head CI suite is green and the corrective diff from the previously rejected candidate is tightly scoped to Catalog cost semantics, starter Catalog defaults, Residential Catalog overlay behavior, service-worker versioning/bootstrap, and associated tests. No new production change in this corrective sequence alters the previously audited Commercial/Residential isolation, Residential/Commercial switching, Journal worker/helper-tax schema/history logic, calculator/BOM navigation, archive repricing, or responsive navigation modules.

Independent review of the exact tree confirms those modules remain present at the pinned HEAD and are included in the v42 core shell where applicable. No additional P0/P1 regression was identified in those unchanged paths during this pass.

## ACCEPTANCE CONDITIONS

Rework is required before acceptance:

1. Remove Customer Price fallback from unresolved `Your Cost` in the active Pricing & Margins runtime (`renderMargins()` and any shared helper such as `catalogDiscPct`).
2. Represent unresolved rows explicitly in row-level and aggregate Pricing & Margins calculations/UI.
3. Preserve explicit numeric zero as known zero.
4. Add a runtime-oriented regression test proving that a row with positive Customer Price + blank Your Cost does not produce resolved numeric cost/margin in Pricing & Margins, including after save/reload and after known->blank / zero->blank transitions.
5. Re-run CI on the new exact candidate SHA and submit that exact SHA for independent audit.

## FINAL VERDICT

**C — REJECT / REWORK REQUIRED**

**Blockers: 1 × P1** — Pricing & Margins continues to treat unresolved `Your Cost` as Customer Price for derived cost/margin calculations, creating contradictory and materially misleading resolved-looking pricing output despite the blank-input persistence fix.

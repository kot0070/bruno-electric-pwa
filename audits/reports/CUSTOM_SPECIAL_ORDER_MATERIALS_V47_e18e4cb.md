# Independent Audit — Custom / Special-order Materials v47

## VERDICT
**C — REJECT / REWORK REQUIRED**

## AUDITED HEAD
`e18e4cbd6778363e8cd5d3737bfad738d2c92f25`

Source PR: #14 (`dev/custom-special-order-materials` → `main`).

Audit mode: **AUDIT ONLY**. Production code, PR state, development branch and merge state were not changed.

---

## Executive result

The v47 corrective closes the previous persisted-Qty defect at the isolated `BrunoCustomMaterials` module level. Saved `qty`, row-specific Add Qty override, edit fields, stable ID/`createdAt`, historical Job Material snapshots, blank-vs-zero-vs-positive contractor-cost routing, responsive CSS rules, and PWA v47 cache declarations are present.

However, the complete runtime has a production-blocking state-coherency defect: `electric-custom-materials.js` writes the authoritative `bruno-electric-v1` object directly in `localStorage`, while the legacy inline application keeps a separate closed-over `state` object. Save/Edit/Delete Catalog operations do **not** synchronize or reload that legacy state. Any subsequent legacy action that calls the normal `save()` serializes the stale `state` back over `bruno-electric-v1`, silently erasing a newly saved/edited custom item or resurrecting a deleted one.

This violates the required persistence/app-state synchronization contract and makes the primary Save/Edit/Delete workflows non-durable during an ordinary same-session workflow.

A second release-evidence issue was found: GitHub Actions run #227 is green, but its checkout log shows it executed the PR merge ref `cffc2c0153c08cc9cb37cc8cbded357b1d64d2ea`, not the pinned audited commit as the checked-out HEAD. It therefore cannot be accepted as exact-head CI provenance for `e18e4cbd...` under the audit protocol.

---

# BLOCKERS

## P1-1 — Custom Catalog Save/Edit/Delete can be overwritten by stale legacy application state

### Severity
**P1 — production-blocking persistence / data-integrity / primary-workflow failure**

### Relevant implementation
`electric-custom-materials.js` owns its own storage helpers:

```js
var JOB_KEY='bruno-electric-v1';
function read(){ ... root.localStorage.getItem(JOB_KEY) ... }
function write(j){root.localStorage.setItem(JOB_KEY,JSON.stringify(j));return j}
```

`saveCatalogItem()`, `updateCatalogItem()` and `remove()` all read/write `localStorage` directly. None of those paths updates the inline app's closed-over `state`, dispatches a synchronization event consumed by the inline app, or reloads the page.

Only `addToJob()` schedules a page reload:

```js
write(j);
if(root.document&&root.location&&typeof root.location.reload==='function'&&typeof root.setTimeout==='function')
  root.setTimeout(function(){root.location.reload()},60);
```

The legacy inline application independently keeps:

```js
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { }
}
```

with `STORAGE_KEY = 'bruno-electric-v1'`.

Therefore there are two unsynchronized in-memory authorities for the same persisted object.

### Deterministic failure trace

#### A. Save to Catalog can be silently lost
1. App initializes and inline `state.catalog` is loaded.
2. User chooses **Save to Catalog** for a new custom item.
3. `BrunoCustomMaterials.saveCatalogItem()` reads `bruno-electric-v1`, appends the row and writes the new object to `localStorage`.
4. The inline legacy `state.catalog` still does **not** contain that new row.
5. User performs any normal legacy action whose handler calls `save()` / `softRefresh()` / `refresh()` and then `save()` (for example editing ordinary job data).
6. Legacy `save()` serializes stale `state` back to the same `bruno-electric-v1` key.
7. The just-created custom Catalog row disappears from persisted state.
8. Reload confirms the saved custom row was lost.

#### B. Edit can be silently reverted
1. Existing custom row is loaded in both persisted state and legacy inline state.
2. User edits Description/SKU/Vendor/Unit/Customer Price/Your Cost/Qty through v47 UI.
3. `updateCatalogItem()` writes edited values only to `localStorage`.
4. Legacy `state.catalog` still contains the pre-edit row.
5. A subsequent legacy save writes the old row back over the edited persisted row.
6. Reload shows the edit was reverted.

#### C. Delete can be silently undone / item resurrected
1. User deletes a custom Catalog row.
2. `remove()` deletes the persisted row only.
3. Legacy `state.catalog` still contains the row.
4. A later normal legacy save serializes it back to `bruno-electric-v1`.
5. Reload resurrects the supposedly deleted item.

### Why current tests do not catch it
`tests/custom-materials.test.js` seeds `localStorage` and invokes `BrunoCustomMaterials` in isolation. It never hosts the real inline application's closed-over `state` concurrently and never performs a legacy `save()` after custom Save/Edit/Delete. Thus the tests validate the module's internal localStorage behavior but not the real dual-state end-to-end integration required by `TASK_CURRENT`.

### Required correction
There must be one coherent authority for mutation of `bruno-electric-v1`.

Acceptable implementation directions include either:
- route custom Catalog mutations through the main application state/persistence API; or
- after every custom Save/Edit/Delete, perform an intentional state synchronization/reload before any stale legacy save can run; or
- expose a supported bridge that replaces/patches the legacy state and refreshes dependent UI before returning control.

The correction must be covered by integration tests that reproduce the stale-write sequence, not only direct module tests.

Minimum regression cases:
- Save Custom → legacy state mutation/save → reload → custom row still exists;
- Edit Custom → legacy state mutation/save → reload → edited values persist;
- Delete Custom → legacy state mutation/save → reload → deleted item remains deleted;
- same coverage for blank, zero and positive `Your Cost` rows.

---

## P1-2 — Claimed “exact-head CI #227” is not exact-head checkout provenance

### Severity
**P1 release-gate / audit-evidence blocker under the required protocol**

GitHub Actions run #227 reports success and 507/507 deterministic tests passed. However the checkout log shows:

```text
git fetch ... +cffc2c0153c08cc9cb37cc8cbded357b1d64d2ea:refs/remotes/pull/14/merge
...
git checkout ... refs/remotes/pull/14/merge
...
HEAD is now at cffc2c0 Merge e18e4cbd6778363e8cd5d3737bfad738d2c92f25 into 5e866c61e43a7cce5aa07b9341700b1fcb0ff5cc
...
git log -1 --format=%H
cffc2c0153c08cc9cb37cc8cbded357b1d64d2ea
```

So run #227 tests the generated PR merge commit `cffc2c015...`, not `e18e4cbd...` as the checked-out HEAD.

This does not mean the tests themselves are failing; they are green. It means the audit's required **exact-head CI provenance** is not established by run #227.

Required correction: provide a workflow/run that explicitly checks out and tests `e18e4cbd6778363e8cd5d3737bfad738d2c92f25` (or the next pinned candidate SHA) as HEAD, and record that SHA in the test output/provenance.

---

# FULL SCOPE REVIEW

## 1. Persisted Custom Catalog model

### PASS at isolated module/storage level
`createCatalogItem()` / `saveCatalogItem()` persist:
- Description / `item`;
- SKU / `part`;
- Vendor;
- Unit / `units`;
- Customer Price / `unitCost`;
- Your Cost / `yourCost`;
- Qty / `qty`;
- generated custom ID;
- `customMaterial:true`;
- `materialType:'CUSTOM_SPECIAL_ORDER'`;
- `projectScoped:true`;
- `createdAt` / `updatedAt`.

`qty()` rejects non-finite and `<= 0` quantities. `nonneg()` rejects negative prices. Saved Qty is now physically stored on the Catalog row.

### BLOCKED end-to-end durability
The model can be overwritten by the stale legacy state path described in P1-1.

---

## 2. Add-to-Job quantity semantics

### PASS in v47 module logic
- Add-existing defaults to `c.qty` when no override is supplied.
- Row-specific override is parsed through `qty(q)`.
- Override does not mutate `c.qty`.
- Snapshot stores `catalogQty` separately from inserted `qty`.
- Repeated Adds push independent objects.
- Save + Add passes the saved row's persisted `row.qty` into `addToJob()`.

The prior v46 Qty blocker is therefore corrected at the implementation level.

### Note
`addToJob()` is the one custom mutation path that intentionally reloads after storage write, which closes the legacy-state gap after successful insertion. The unresolved gap is Save/Edit/Delete before reload.

---

## 3. Edit existing Custom material

### PASS in field coverage
`updateCatalogItem()` supports:
- Description;
- SKU / Part;
- Vendor;
- Unit;
- Customer Price;
- Your Cost;
- Qty.

It mutates the located Catalog object rather than replacing it, so `id` stays stable. `createdAt` is retained. `updatedAt` is set to a new ISO timestamp.

### Historical boundary — PASS in module logic
Already-added Job Material rows are separate snapshots; update does not traverse/rewrite `materialsUsed[]` or `materialsUnresolved[]`.

### BLOCKED durability
Edit persistence is vulnerable to stale legacy `state` overwrite (P1-1).

### Minor test gap
The regression suite checks stable ID/`createdAt`, but does not assert that `updatedAt` is strictly later than its previous value. This is non-blocking relative to P1-1, but the stated contract should be tested explicitly.

---

## 4. Pricing-integrity contract

### PASS in custom insertion routing
`addToJob()` computes `known` from `c.yourCost`, not Customer Price.

- positive `Your Cost` → `materialsUsed[]`, numeric `unitCost`, `costState:'RESOLVED'`;
- explicit `0` → `materialsUsed[]` with numeric zero;
- blank `Your Cost` → `materialsUnresolved[]`, `unitCost:null`, `costState:'UNRESOLVED'`, `unresolvedReason:'YOUR_COST_UNRESOLVED'`.

Customer Price is snapshotted separately as `customerUnitPrice`; it is not substituted into `unitCost` by this module.

### Project cost math — PASS by runtime trace
The inline `calcMaterial(state)` iterates `state.materialsUsed` only. Since unresolved custom rows are routed to `materialsUnresolved[]`, they do not enter that numeric material-cost loop.

Resolved custom rows enter `materialsUsed[]` exactly once per successful Add operation and therefore participate in the ordinary material total once.

### Job Materials unresolved visibility — PASS by bridge implementation
`electric-job-material-cost-semantics.js` renders unresolved rows into `#mat-used-body` with:
- `UNRESOLVED COST`;
- cost cell `Unresolved`;
- total cell `Excluded`;
- a banner stating the rows are blocked from project material-cost totals.

---

## 5. History / deletion / traceability

### PASS snapshot design
Insertion preserves:
- `catalogMatchId`;
- `catalogQty`;
- inserted `qty`;
- `customerUnitPrice`;
- `vendor`;
- item / part / unit;
- `addedAt`;
- last source price timestamp.

Later Catalog edit/delete does not mutate existing Job Material arrays in the custom module.

### BLOCKED Catalog-delete durability
A deleted Catalog row can be resurrected by stale legacy save (P1-1). Historical Job Materials themselves are not deleted by `remove()`.

---

## 6. Responsive UI

### PASS by CSS/layout inspection
The custom form uses:
- desktop: seven-column grid;
- tablet `<1200px`: two-column grid;
- phone `<768px`: one-column grid.

Row actions use flex + wrap. On phone the material row changes to column layout and action area is full width. Row Add Qty gets a dedicated width. Edit/Add/Delete remain separate controls.

No fixed full-row width was found that would inherently make the primary workflow unusable at the specified breakpoints.

### Audit limitation
This conclusion is based on exact-code CSS/DOM inspection; no production browser screenshot was used as proof. The identified P1 state defect independently requires rework before release.

---

## 7. Persistence / app-state synchronization

### FAIL — P1-1
This is the principal release blocker.

The app has two concurrent authorities over `bruno-electric-v1`:
- inline `state` + `save()`;
- Custom Materials `read()`/`write()` directly against localStorage.

Add-to-Job reloads and therefore eventually rehydrates inline state; Save/Edit/Delete do not.

The requirement that Save/edit/Add/reload use authoritative app state coherently is therefore not met.

### Duplicate insertion/event ordering
`addToJob()` writes synchronously then schedules reload after 60 ms. The Add button is not disabled during that interval, so a very fast/double click can intentionally execute `addToJob()` more than once before reload. This is a secondary UX/data-duplication risk, but P1-1 already blocks release. A one-shot pending guard or button disable would harden this path.

---

## 8. PWA v47 / offline cache

### PASS by service-worker implementation
`sw.js` declares:

```js
const CACHE = 'bruno-electric-v47';
const OWNED_CACHE_RE = /^bruno-electric-v\d+$/;
```

Activation deletes only matching stale Bruno Electric version caches and preserves unrelated cache names.

`CORE_SHELL` includes:
- `electric-custom-materials.js`;
- `electric-job-material-cost-semantics.js`;
- catalog/pricing strict semantics modules;
- residential and workspace modules.

The fetch strategy is network-first for navigation and cache-first/fallback behavior for shell resources, with v47 cache update for successful network responses.

### Loader integration — PASS
Although `index.html` only includes `sw-register.js` as an external script at the end, `sw-register.js` dynamically loads both `electric-job-material-cost-semantics.js` and `electric-custom-materials.js` on `DOMContentLoaded`, so the new modules are part of the runtime rather than cache-only dead files.

---

## 9. Regressions / CI / broader contracts

### Deterministic test suite
Run #227 reports **507/507 passed**.

Custom-material tests cover:
- persisted Qty;
- list/read after persistence;
- Add-existing default Qty;
- one-time Qty override;
- repeated Add independence;
- edit fields and stable identity;
- history boundary;
- positive / zero / blank Your Cost routing;
- validation;
- delete preserving existing Job Materials.

Service-worker tests cover v47 ownership invalidation and core-shell membership.

### CI provenance — FAIL audit requirement
As detailed in P1-2, run #227 checked out the PR merge commit `cffc2c015...`, not the pinned candidate `e18e4cbd...` as HEAD.

### Regression areas not implicated by changed implementation
No changed production file directly alters Commercial/Residential calculation engines, Journal helper-tax logic, BOM engine, navigation engine, or core quote formulas. The new module integrates through the shared persisted state and Job Material arrays. Existing green deterministic coverage provides useful regression evidence, but it does not cure the P1 dual-state persistence defect.

---

# Required re-audit target

Do not merge PR #14 on this candidate.

A new candidate should, at minimum:
1. eliminate stale-state overwrite after Custom Save/Edit/Delete;
2. add integration regressions proving those mutations survive subsequent legacy app saves before reload;
3. preserve the now-correct Qty / edit / history / blank-zero-positive semantics;
4. provide exact-candidate-head CI provenance;
5. rerun the complete regression suite and PWA tests.

## FINAL VERDICT
**C — REJECT / REWORK REQUIRED**

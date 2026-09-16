# Independent Audit — Custom / Special-order Materials v48

**Mode:** AUDIT ONLY  
**Source PR:** #14 (`dev/custom-special-order-materials` -> `main`)  
**Audited production candidate:** `09145eda17cfe4d161fcc3ab32d6cadacb755b1c`  
**Verdict:** **C — REJECT / REWORK REQUIRED**

## Executive result

The prior stale-write correction and exact-head CI correction are materially improved, but the pinned candidate still has release-blocking data/cost-integrity defects in the real runtime paths. I found **three P1 blockers**. No production code, source PR, dev branch, `main`, merge state, or release state was changed by this audit.

## P1-1 — Ordinary Catalog `+` bypasses Custom-material cost semantics

### Finding
Custom / Special-order definitions are stored in the same `state.catalog` array as ordinary Catalog rows. The normal Catalog renderer does not exclude `customMaterial === true` / `materialType === 'CUSTOM_SPECIAL_ORDER'` rows, so after reload those rows are rendered in the ordinary category table with the ordinary `+` Add button.

The ordinary `cat-add` handler then inserts the selected Catalog row directly into `state.materialsUsed` with:

- `qty: 1`;
- `unitCost: c.unitCost`;
- no unresolved routing;
- no `materialsUnresolved[]` path;
- no custom traceability snapshot (`catalogMatchId`, `catalogQty`, `customerUnitPrice`, `addedAt`).

For Custom materials, however, `c.unitCost` is the **Customer Price**, while `c.yourCost` is the contractor cost. Therefore the ordinary Catalog Add path can:

1. turn blank `Your Cost` into a resolved numeric material using **Customer Price**;
2. turn explicit `Your Cost = 0` into Customer Price instead of resolved zero;
3. turn positive `Your Cost` into Customer Price instead of the actual contractor cost;
4. bypass the required custom history/traceability fields.

The `electric-catalog-cost-semantics.js` guard protects blank editing of `.cat-your` / `.mrg-your`, but it does not intercept or replace the normal `.cat-add` insertion path.

### Why this is P1
This violates the required fail-closed rule: **Customer Price must never substitute for missing Your Cost**, and it affects a primary user-facing Catalog workflow. It can directly inflate project material-cost math and incorrectly mark unresolved cost as resolved.

### Required correction
Either remove Custom rows from the legacy/ordinary Catalog Add path or route every Add of a Custom row through the same strict `BrunoCustomMaterials.addToJob()` semantics, including blank/zero/positive handling and traceability snapshots.

---

## P1-2 — Canonical Custom registry is device-global, not job/project scoped; import/switch can overwrite another job's Custom catalog

### Finding
The new canonical authority is a single fixed key:

`bruno-electric-custom-materials-v1`

`ensureRegistry()` reads that single registry independently of which job is being loaded/imported. The persistence guard intercepts every later write to `bruno-electric-v1` and `reconcile()` removes all incoming Custom rows and replaces them with the registry rows.

The application explicitly supports Export/Import of an individual job with its Catalog embedded in that job. `applyJobPayload()` replaces runtime `state` with the imported job. However, the Custom registry is not replaced or namespaced to that imported job. Consequently, on the next guarded `bruno-electric-v1` save, the imported job's own Custom definitions are removed and replaced by whatever Custom definitions were already in the device-global registry from the previous job.

This is deterministic from the data path:

`imported job state` -> later legacy `save()` -> guarded `localStorage.setItem('bruno-electric-v1', ...)` -> `reconcile(incoming, ensureRegistry())` -> incoming Custom rows stripped -> global registry rows appended.

The same design also conflicts with the feature's own `projectScoped:true` marker: one global registry is an authority across job boundaries rather than an authority scoped to the active job/project.

### Why this is P1
This is a release-blocking persistence/archive isolation defect. It can silently replace the Custom catalog carried by an imported/archived job with definitions from a different job while preserving unrelated fields, making the corruption non-obvious.

### Required correction
Scope the canonical registry to the job/project identity, or make job import/switch atomically rebind/synchronize the registry to the incoming job before any guarded save. Add independent regressions covering Job A -> Job B/import -> save/reload -> Job B Custom catalog remains Job B only.

---

## P1-3 — Malformed registry is treated as authoritative empty data and can erase existing Custom definitions

### Finding
`readRegistry()` returns `[]` whenever `bruno-electric-custom-materials-v1` is malformed JSON or parses to a non-array. `ensureRegistry()` only seeds from the current job when the registry key is **absent** (`raw == null`). If malformed content exists, it returns that empty array instead of repairing/reseeding from valid Custom rows already present in the current job.

The next reconciliation then removes every current Custom row from `job.catalog` and appends the empty registry. A subsequent guarded save persists the job with those valid Custom definitions gone.

Ordinary/non-Custom Catalog rows are preserved, so this failure is easy to miss, but the Custom definitions themselves are destructively lost.

### Why this is P1
TASK_CURRENT explicitly requires malformed custom-registry storage to fail safely. Silent deletion of valid saved Custom definitions is a persistence/data-integrity failure.

### Required correction
Distinguish `missing registry` from `malformed registry`. On malformed registry, fail closed without rewriting Custom rows, or recover atomically from valid current-job Custom rows before reconciliation. Add regressions for malformed JSON and valid-non-array registry payloads.

---

## Re-verification of prior blockers

### Prior P1: same-session stale legacy writes
**Corrected for the nominal same-job path.**

The v48 module installs a guarded `localStorage.setItem` for `bruno-electric-v1`. Incoming legacy state is reconciled against the canonical registry before persistence. Save/Edit/Delete synchronize the registry before writing the job, and internal raw writes avoid recursive interception. The dedicated tests cover stale Save/Edit/Delete and blank/zero/positive Your Cost cases.

This does not clear P1-2/P1-3 above because those defects concern registry authority across job boundaries and malformed authority state.

### Prior P1: exact-head CI provenance
**Corrected.**

PR #14 was open and unmerged at audit time; its source head was exactly `09145eda17cfe4d161fcc3ab32d6cadacb755b1c`.

GitHub Actions run **#236** (`run_id 35053809934`) reports the same exact `head_sha`, event `pull_request`, and conclusion `success`. Its only job (`calculator-tests`, job `104659637012`) also reports the same exact `head_sha`; `Checkout exact PR head` passed; `Verify tested HEAD provenance` passed; and the deterministic test step passed.

The audited workflow explicitly uses:

`ref: ${{ github.event.pull_request.head.sha }}`

and then compares `git rev-parse HEAD` against that expected PR-head SHA before running tests.

The connector exposed the run/job metadata and successful provenance step but did not expose the textual ZIP job log body, so I could not independently quote the emitted `TESTED_HEAD_SHA=...`, `EXPECTED_HEAD_SHA=...`, or printed `511/511` line. The workflow logic plus successful provenance/test steps and exact run/job `head_sha` are sufficient to establish that the synthetic merge ref was not used. The developer's stated `511/511` count was not used as sole evidence for acceptance.

---

## Other required checks

### Custom workflow / snapshots
The dedicated strict Custom path correctly supports Description, SKU/Part, Vendor, Unit, Customer Price, Your Cost, Qty; persisted saved Qty; row-level Add Qty override; repeated independent history rows; stable `id` / `createdAt` on edit; `updatedAt`; immutable previously-added rows on Catalog edit/delete; and Custom snapshots including Catalog identity, saved Qty, inserted Qty, Customer Price, Vendor and timestamp.

These checks do not mitigate P1-1 because the same Custom definition remains reachable through the separate ordinary Catalog Add path.

### Cost semantics
The strict Custom path correctly separates:

- blank Your Cost -> `materialsUnresolved[]`, `unitCost:null`, `UNRESOLVED`;
- explicit numeric zero -> `materialsUsed[]`, resolved zero;
- positive Your Cost -> `materialsUsed[]`, numeric contractor cost.

`electric-job-material-cost-semantics.js` renders unresolved rows as `UNRESOLVED COST` and `Excluded`. Existing strict Catalog/Pricing modules preserve blank-versus-zero editing semantics. The deterministic suite includes Residential Live, BOM/Job Materials, pricing/margins, project calculator, journal, navigation, and related regression modules.

P1-1 is specifically a bypass around these strict semantics.

### PWA / offline cache
Static service-worker verification passes:

- current owned cache is `bruno-electric-v48`;
- activation deletes only keys matching `^bruno-electric-v\d+$` other than v48;
- unrelated caches are preserved;
- `electric-custom-materials.js` and strict cost runtimes are in `CORE_SHELL`;
- install waits for the current core shell before `skipWaiting()`;
- navigation has network-first/current-cache fallback; shell resources are available from v48 after successful install.

The service-worker tests explicitly cover stale owned-cache deletion and core-shell membership.

### Responsive UI
The Custom card uses a seven-column desktop grid, switches to two columns below 1200 px, and one column below 768 px; row actions wrap and become vertically safe on phone widths. No separate P0/P1 responsive blocker was found by static/UI-path inspection.

### Broader regressions
The exact-head deterministic harness loads and executes the project's data-integrity, navigation/workspace, Residential estimator/pricing/takeoff/live/history/workspace, dispatch journal, project calculator, service worker, Catalog bridge, Catalog cost semantics, Pricing & Margins semantics, and Custom materials suites. The exact-head CI deterministic step succeeded.

No additional P0/P1 was identified in those shared paths during this audit beyond the three blockers above.

## Final verdict

**C — REJECT / REWORK REQUIRED**

Release blockers:

1. **P1:** ordinary Catalog Add bypasses strict Custom cost routing and can substitute Customer Price for Your Cost;
2. **P1:** global Custom registry violates project/job isolation and can overwrite imported job Custom definitions;
3. **P1:** malformed registry is treated as authoritative empty state and can erase valid Custom definitions.

PR #14 should remain unmerged until these are corrected and independently re-audited on a newly pinned exact head.
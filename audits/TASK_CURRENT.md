# AUDIT ONLY — Custom / Special-order Materials v48 corrective

## Pinned production candidate
- Repository: `kot0070/bruno-electric-pwa`
- Source PR: #14 `dev/custom-special-order-materials` -> `main`
- `AUDITED_HEAD_SHA = 09145eda17cfe4d161fcc3ab32d6cadacb755b1c`
- PR must remain unmerged during audit.

## Prior audit blockers to independently re-test
Previous audit of `e18e4cbd6778363e8cd5d3737bfad738d2c92f25` found:
1. P1 dual-state persistence: Custom Save/Edit/Delete wrote `bruno-electric-v1` directly while legacy closed-over `state` could later overwrite/revert/resurrect those changes.
2. P1 exact-head CI provenance: CI tested the synthetic PR merge commit instead of the pinned audited head.

## Required primary verification

### A. Persistence authority / stale-write protection
Independently trace `electric-custom-materials.js` and real runtime storage behavior.

Verify:
- canonical custom registry `bruno-electric-custom-materials-v1` is initialized/migrated safely from current job custom rows;
- Save Custom -> stale legacy `localStorage.setItem('bruno-electric-v1', oldState)` -> custom row still exists;
- Edit Custom -> stale legacy save -> edited row remains edited;
- Delete Custom -> stale legacy save -> deleted row does not resurrect;
- blank / explicit 0 / positive `Your Cost` survive stale legacy writes without semantic collapse;
- non-custom Catalog rows and unrelated job fields from the incoming legacy state are preserved;
- custom rows are not duplicated by reconciliation;
- existing custom rows from pre-v48 state are migrated once and remain stable;
- malformed custom-registry storage fails safely and does not destroy ordinary Catalog rows;
- immediate reload after Save/Edit/Delete/Add correctly rehydrates runtime UI/state;
- no recursive `localStorage.setItem` loop or storage-write storm occurs.

### B. Custom material workflow
Verify end-to-end:
- create Description / SKU-Part / Vendor / Unit / Customer Price / Your Cost / Qty;
- Save to Catalog;
- Save + Add to Job;
- persisted Qty across reload;
- Add-existing defaults to saved Qty;
- row-specific Add Qty override affects only inserted Job row, not saved Catalog Qty;
- repeated Add creates independent history rows and does not mutate earlier rows;
- full Edit existing preserves ID and `createdAt`, updates edited fields and `updatedAt`;
- Catalog edit/delete never rewrites already-added `materialsUsed[]` / `materialsUnresolved[]` history;
- delete removes only Catalog definition, not historical Job rows;
- traceability snapshots remain correct: Catalog ID, saved Catalog Qty, actual inserted Qty, Customer Price snapshot, Vendor, timestamp.

### C. Cost semantics
Verify independently:
- blank Your Cost -> `materialsUnresolved[]`, `unitCost:null`, excluded from project material-cost math;
- explicit numeric 0 -> `materialsUsed[]`, resolved zero;
- positive Your Cost -> `materialsUsed[]`, normal project cost math;
- Customer Price never substitutes for missing Your Cost;
- Job Materials displays unresolved custom rows as `UNRESOLVED COST` / `Excluded`;
- Pricing & Margins blank-vs-zero regression remains intact;
- Residential Live -> BOM -> Job Materials regressions remain intact.

### D. Exact-head CI provenance
This is a release gate. Do not accept a synthetic merge checkout.

For exact candidate `09145eda17cfe4d161fcc3ab32d6cadacb755b1c`, independently inspect GitHub Actions run #236 and its job log.
Required evidence:
- checkout `ref` is exactly `09145eda17cfe4d161fcc3ab32d6cadacb755b1c`;
- `git rev-parse HEAD` equals the same SHA;
- `TESTED_HEAD_SHA` equals the same SHA;
- `EXPECTED_HEAD_SHA` equals the same SHA;
- provenance gate passed;
- deterministic suite completed successfully (expected 511/511 on this candidate).

Also inspect `.github/workflows/electrical-calculators.yml` and confirm PR runs explicitly checkout `github.event.pull_request.head.sha`.

### E. PWA / cache
Verify:
- current cache is `bruno-electric-v48`;
- v47 and older owned Bruno Electric caches are invalidated;
- unrelated caches are not deleted;
- `electric-custom-materials.js` remains in core shell;
- offline reload uses current code after successful v48 install.

### F. Responsive / broader regressions
Recheck phone/tablet/desktop Custom Materials UI and all high-risk shared regressions:
- Commercial / Residential isolation;
- Project Calculator -> Residential Live -> BOM -> Job Materials;
- Journal historical helper-tax behavior;
- Catalog / Pricing & Margins;
- navigation and workspace;
- persistence / archive behavior;
- PWA/offline.

## Audit boundaries
AUDIT ONLY.
Do not change production code, source PR, dev branch, main, or merge state.
Write only the designated report on this audit branch:

`audits/reports/CUSTOM_SPECIAL_ORDER_MATERIALS_V48_09145ed.md`

## Verdict rubric
- A — ACCEPT: no P0/P1.
- B — ACCEPT AFTER MINOR FIXES: no P0/P1; only minor issues.
- C — REJECT / REWORK REQUIRED: one or more P0/P1.

## Chat response format
Return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

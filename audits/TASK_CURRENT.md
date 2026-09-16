# TASK_CURRENT — Independent Audit: Custom / Special-order Materials v47

## MODE
AUDIT ONLY. Follow `audits/PROTOCOL.md`.

## AUDITED_HEAD_SHA
`e18e4cbd6778363e8cd5d3737bfad738d2c92f25`

## SOURCE PR
PR #14 — `dev/custom-special-order-materials` → `main`.

## PREVIOUS AUDIT
Candidate `15dacdde3ddbc7895e78c1b057bcc4149d0863d1` was rejected because Custom Catalog `Qty` was validated but not persisted. After reload, Add-existing used the unrelated top-form Qty/default 1, allowing silent quantity corruption.

## PRIMARY AUDIT SCOPE
Audit the complete v47 block independently, not only the previous blocker.

### 1. Persisted Custom Catalog model
Verify creation and persistence of:
- Description / item;
- SKU / Part;
- Vendor;
- Unit;
- Customer Price;
- Your Cost;
- Qty;
- unique/stable custom ID;
- `CUSTOM_SPECIAL_ORDER` / project-scoped markers;
- created/updated timestamps.

Required:
- Save to Catalog(qty=N) -> reload/read -> same row still has qty=N;
- no fallback to unrelated global/top-form Qty after reload;
- negative price / nonpositive quantity fail closed.

### 2. Add-to-Job quantity semantics
Verify all paths:
- Save + Add to Job uses the persisted saved Qty;
- Add existing after reload defaults to that selected row's persisted Qty;
- row-specific Add Qty override uses that explicit value for one insertion only;
- row-specific override must not mutate the Catalog's saved Qty;
- repeated Add-to-Job creates independent historical rows and does not mutate earlier rows.

### 3. Edit existing Custom material
Verify editing an existing custom Catalog row can change:
- Description;
- SKU / Part;
- Vendor;
- Unit;
- Customer Price;
- Your Cost;
- Qty.

Required:
- ID remains stable;
- `createdAt` remains stable;
- `updatedAt` advances;
- edited values persist after reload;
- editing the Catalog row must NOT retroactively rewrite already-added Job Materials history;
- subsequent Add-to-Job uses the newly edited Catalog state.

### 4. Pricing-integrity contract
Independently verify:
- positive Your Cost -> `materialsUsed[]`, numeric resolved `unitCost`, participates once in project material totals;
- explicit Your Cost `0` -> resolved known zero in `materialsUsed[]`;
- blank/missing Your Cost -> `materialsUnresolved[]`, `unitCost:null`, `costState:'UNRESOLVED'`;
- unresolved rows do not enter `calcMaterial()` / project material totals / quote cost math;
- Job Materials visibly shows `UNRESOLVED COST` / `Excluded`;
- Customer Price never substitutes for missing Your Cost.

### 5. History / deletion / traceability
Verify:
- inserted Job Materials preserve `catalogMatchId` and useful snapshot traceability;
- later Catalog edit does not rewrite historical Job rows;
- deleting custom Catalog item does not delete or mutate prior resolved/unresolved Job Materials history;
- duplicate/repeated Add paths remain independent.

### 6. Responsive UI
Independently inspect/render implications at:
- phone < 768px;
- tablet 768–1199px;
- desktop >=1200px.

Verify:
- creation/edit form does not overflow unusably;
- row actions and row-specific Add Qty remain usable;
- no horizontal clipping that blocks the primary workflow;
- Edit / Add / Delete remain distinguishable and operable.

### 7. Persistence / app-state synchronization
Verify:
- Save, edit, Add-to-Job, reload all read/write authoritative `bruno-electric-v1` correctly;
- the legacy closed-over application state does not continue displaying stale Job Material totals after insertion;
- no duplicate accidental insertion occurs because of reload scheduling/event order.

### 8. PWA v47
Verify:
- `bruno-electric-v47` is current cache;
- v46/v45 and older owned Bruno Electric caches are invalidated;
- unrelated caches remain untouched;
- `electric-custom-materials.js` and strict cost-semantics modules are in the core shell;
- offline reload after successful update uses v47 behavior.

### 9. Full regressions
Re-check at minimum:
- Catalog `.cat-your` blank vs explicit zero;
- Pricing & Margins strict runtime;
- Residential Live pricing;
- Confirm & Save -> BOM -> Job Materials unresolved routing;
- Commercial / Residential isolation;
- historical Journal helper-tax stability;
- navigation/workspace;
- project material totals / quote cost math;
- service-worker tests and exact-head CI provenance.

## EVIDENCE REQUIREMENTS
- Audit exact production candidate SHA, not audit-branch metadata commits.
- Do not rely on developer report or CI alone.
- Exercise the real persisted flow `Save Catalog(qty=N) -> reload -> Add existing -> Job Materials`.
- Exercise `Edit -> reload -> Add again` and compare historical vs new rows.
- Exercise blank -> zero -> positive Your Cost boundaries where relevant.
- Fail closed on pricing/data-integrity ambiguity.

## REPORT_PATH
`audits/reports/CUSTOM_SPECIAL_ORDER_MATERIALS_V47_e18e4cb.md`

## CHAT RESPONSE
Return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

Do not modify production code, PR, or merge state.

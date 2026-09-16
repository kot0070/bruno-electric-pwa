# TASK_CURRENT — Independent Audit: Custom / Special-order Materials v46

## MODE
AUDIT ONLY. Follow `audits/PROTOCOL.md`.

## AUDITED_HEAD_SHA
`15dacdde3ddbc7895e78c1b057bcc4149d0863d1`

## SOURCE PR
PR #14 — `dev/custom-special-order-materials` → `main`.

## PRIMARY AUDIT SCOPE
Independently verify the complete candidate, not developer claims or tests.

### 1. Custom Catalog creation
Verify the real Catalog UI exposes Custom / Special-order material creation with:
- Description required;
- SKU / Part #;
- Vendor;
- Unit;
- Customer Price;
- Your Cost;
- Qty;
- Save to Catalog;
- Save + Add to Job.

Verify persisted Catalog rows are project-scoped custom rows, remain editable through existing Catalog/Pricing surfaces where applicable, and do not corrupt seeded Catalog rows.

### 2. Cost-state semantics
Exercise all required states:
- positive Customer Price + blank Your Cost;
- explicit Your Cost `0`;
- positive known Your Cost;
- negative/invalid price;
- zero/negative quantity.

Required behavior:
- blank Your Cost remains unresolved;
- explicit `0` is a known resolved zero;
- positive Your Cost is resolved;
- invalid/negative values fail closed rather than silently coercing to known zero.

### 3. Add to Job / project calculation path
Trace Save + Add to Job and Add existing custom material to Job through persisted `bruno-electric-v1`.

Required:
- known positive Your Cost -> `materialsUsed[]` with numeric contractor `unitCost` and enters project material totals exactly once;
- explicit zero -> `materialsUsed[]` as a legitimate known zero;
- blank Your Cost -> `materialsUnresolved[]` with `unitCost:null`, explicit unresolved metadata, and MUST NOT enter `materialsUsed[]` / `calcMaterial()` / project cost / quote-cost math;
- custom material preserves `catalogMatchId` / custom material metadata / quantity / units / part traceability;
- page-state synchronization after Add to Job must show current Job Materials and totals, not stale pre-add state.

### 4. Job Materials UI
For unresolved custom materials verify:
- visible `UNRESOLVED COST` state;
- explicit `Excluded` behavior;
- unresolved banner/message is accurate for custom/manual rows, not generated-only wording;
- resolved custom material appears as a normal Job Material after reload.

### 5. Persistence / history boundaries
Verify:
- Save -> reload preserves custom Catalog row;
- Add to Job -> reload preserves correct resolved/unresolved routing;
- deleting a custom Catalog definition does not rewrite/remove already-added Job Materials history;
- adding the same custom material again does not silently mutate prior material rows;
- existing manual, generated and other-source Job Materials remain preserved.

### 6. Existing pricing boundaries
Re-check:
- Catalog `.cat-your` blank vs explicit zero;
- strict Pricing & Margins unresolved semantics;
- Residential Live unresolved / resolved pricing;
- `materialsUsed[]` vs `materialsUnresolved[]` separation;
- no Customer Price fallback into contractor-cost math.

### 7. PWA / offline
Verify `bruno-electric-v46`:
- v45 and older owned Bruno Electric caches are invalidated;
- `electric-custom-materials.js` is in the core shell;
- existing installed clients can receive the custom-material feature;
- offline reload after successful update retains the module and custom-material persisted data.

### 8. Regression
Independently repeat shared regressions relevant to the changed paths:
- Project Calculator / Residential Live / BOM / Job Materials;
- Commercial / Residential isolation;
- Journal historical helper-tax stability;
- Catalog / Pricing & Margins;
- navigation on phone/tablet/desktop;
- persistence and PWA/offline behavior;
- exact candidate CI provenance.

## EVIDENCE REQUIREMENTS
- Audit exact production candidate SHA, not the audit-branch commits.
- Trace actual persisted state transitions.
- Exercise blank -> reload, explicit zero -> reload, positive known cost -> reload.
- Verify project total behavior, not only object shape.
- CI green is evidence only, not proof.
- Fail closed on pricing/data-integrity ambiguity.

## REPORT_PATH
`audits/reports/CUSTOM_SPECIAL_ORDER_MATERIALS_V46_15dacdd.md`

## CHAT RESPONSE
Return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

Do not modify production code, PR, or merge state.

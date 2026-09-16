# Bruno Electric — TASK_CURRENT — Full Workflow Overhaul v50 Independent Audit

## Mode
`AUDIT ONLY`

## Exact target
- Repository: `kot0070/bruno-electric-pwa`
- PR: `#14`
- Dev branch: `dev/custom-special-order-materials`
- `AUDITED_HEAD_SHA = 5852749be6cd240b6e52bac15cacf4ffbfa6a288`
- Runtime implementation freeze before documentation-only commits: `cd474824c1a45bcc1edaf655a30a26880f00bc05`
- Final exact-head CI expected for audited SHA: GitHub Actions run `#298` SUCCESS.
- Developer report: `dev-reports/WORKFLOW_OVERHAUL_V50_FINAL.md`
- Master plan: `dev-plans/WORKFLOW_OVERHAUL_MASTER_PLAN.md`
- `REPORT_PATH = audits/reports/WORKFLOW_OVERHAUL_V50_5852749.md`

Do not audit a moving branch head. Every correctness claim must correspond to the exact audited SHA above.

## Primary objective
Independently determine whether PR #14 is production-safe after the complete workflow overhaul. Do not limit the audit to Custom Materials. Reconstruct the user flow from navigation through calculation, Save, Apply, Job costing, Quote approval, Catalog/Job Materials, persistence, import/export and PWA behavior.

## 1. Navigation / deep links
Independently verify:
- canonical five-section navigation behavior across main Job app and Electrical Tools;
- exact-tab deep links restore the intended tab;
- hashchange/back/forward do not lose route intent;
- no duplicate/fallback IA silently diverges;
- phone/tablet/desktop navigation remains usable.

## 2. Residential wire/cable takeoff
Verify detailed takeoff and all unit/math paths, including:
- circuit/routing assumptions and displayed detailed wire totals;
- 12/2 vs 14/2 separation;
- waste percentage math;
- invalid/negative inputs fail closed;
- Quick ft² estimator is explicitly budget-only / NOT NEC;
- quick budget metadata cannot silently substitute exact cable-type Job Material rows;
- takeoff metadata persists through save/archive/reload/duplicate as intended.

## 3. Save Calculation / archive
Trace the actual runtime boundary:
- live edits do not autosave;
- Save Calculation persists an archive snapshot;
- unchanged repeat Save is idempotent and does not generate duplicate archive identities;
- changed calculation gets a new identity while old snapshot remains immutable;
- Duplicate/Load creates an editable separate identity;
- Delete removes only the selected archive record;
- reload persistence works;
- failed paired writes/rollback paths do not leave split Job/archive state.

## 4. Save vs Apply-to-Job transaction
This is P1-sensitive. Verify independently:
- Save Calculation alone does not mutate `materialsUsed[]` or `materialsUnresolved[]`;
- Apply requires a saved calculation and applies its archived BOM, not dirty live inputs;
- Apply stores calculation ID/name/timestamps/source version/provenance;
- same-domain re-Apply replaces only prior Residential-applied rows;
- manual and non-Residential generated Job Materials are preserved;
- legacy Residential generated rows migrate cleanly;
- live edits after Apply do not mutate Job until explicit Save + Apply/Update;
- Quick ft² wire estimate cannot drive exact BOM rows.

## 5. Contractor-cost semantics
For generated and Custom materials verify all three cases with independent examples:
- positive `Your Cost` -> resolved numeric contractor cost;
- explicit `Your Cost = 0` -> resolved intentional zero;
- blank/missing/invalid `Your Cost` -> first-class unresolved row with `unitCost:null`, excluded from numeric contractor-cost/profit math.

Verify unresolved rows cannot re-enter numeric cost through:
- Job Materials rendering/editing;
- Summary;
- top Job totals;
- Pricing & Margins;
- Quote lifecycle;
- reload/import/export;
- Catalog edit/delete.

## 6. Job totals / Summary parity
Verify business meaning and arithmetic independently:
- Material contractor cost;
- Labor contractor cost;
- Equipment contractor cost;
- Estimated Job Cost;
- Recommended Customer Price exact;
- rounded base quote;
- Approved Change Orders;
- Customer Quote Total.

Recompute representative cases independently from runtime code. Confirm header and Summary use the same authoritative calculation path and cannot silently disagree. Verify incomplete material cost is clearly disclosed and not represented as complete.

## 7. Quote approval / manual adjustment / Invoice boundary
Trace persisted state, not only UI text:
- blank manual adjustment uses live recommended price;
- positive manual adjustment creates explicit manual price source;
- explicit zero/negative/invalid manual adjustment fails closed;
- approval creates immutable snapshot with approval ID/revision/time/customer amount/recommended-at-approval/COs/unresolved-cost condition/quote metadata/applied-calculation provenance;
- post-approval Calculator edits do not mutate approved snapshot;
- post-approval Catalog edits do not mutate approved snapshot;
- post-approval Job Materials edits do not mutate approved snapshot;
- re-approval creates a new revision and preserves prior approval history;
- fixed-price Invoice basis is unavailable before approval;
- fixed-price Invoice basis reads only the approved quote snapshot, never moving live recommendation;
- unresolved contractor cost at approval remains disclosed/snapshotted rather than converted to zero.

## 8. Custom / Special-order Catalog materials
Verify the complete runtime workflow:
- Description / SKU-Part / Vendor / Unit / Customer Price / Your Cost / Qty;
- Save to Catalog;
- Save + Add to Job;
- persisted Catalog Qty after reload;
- row-specific Add Qty override without mutating saved Catalog Qty;
- Edit preserves stable ID and createdAt;
- Customer Price / Your Cost / Qty changes persist;
- existing Job Material snapshots do not change after Catalog edit;
- deleting Custom Catalog definition does not delete/rewrite already-added Job Materials;
- ordinary legacy Catalog `+` for Custom rows cannot bypass strict Custom routing;
- repeated Add behavior is additive and does not corrupt previous snapshots;
- blank / zero / positive Your Cost cases remain distinct;
- nonpositive Qty fails closed.

## 9. Catalog vs Job Materials semantics / isolation
Verify:
- Catalog row is a definition, Job Material is a job snapshot;
- row-level Catalog / Used-on-Job / Custom markers reflect actual persisted usage;
- Job Material source badges match Custom/Catalog/Generated/Manual origin;
- Custom definitions are scoped to active `bruno-electric-v1` Job state;
- old device-global `bruno-electric-custom-materials-v1` data is non-authoritative;
- Job A -> Job B replacement/import does not leak Job A Custom definitions;
- malformed/non-array legacy registry data cannot erase active-job Custom rows.

## 10. Import / export / new-job persistence
Independently inspect actual import/export/new-blank-job implementation and verify that current workflow state behaves intentionally for:
- Custom Catalog definitions;
- Job Materials resolved/unresolved stores;
- Residential saved/applied provenance;
- Quote approval/history;
- Catalog and pricing state;
- Company/worker data isolation where designed separately.

Flag any field silently lost or cross-job leaked as P1 if it changes pricing/history/current-job semantics.

## 11. Commercial / Residential isolation
Re-run the prior P1 regression:
- Commercial selection/state must not be rewritten by Residential selection/state and vice versa;
- duplicate-selector-removal or navigation changes must not collapse mode isolation;
- shared state/import paths must preserve intended mode boundaries.

## 12. Journal historical helper-tax
Re-run the prior P1 regression:
- historical journal/helper-tax result must be based on the stored historical snapshot;
- changing current/global helper-tax setting must not rewrite historical entries.

## 13. NEC / code and estimating assumptions
Review all touched Residential/project-calculator paths for unsafe code claims:
- code-derived requirements vs estimating assumptions must be clearly distinguished;
- insufficient inputs must fail closed where a code conclusion is claimed;
- Quick ft² wire estimate must not be presented as NEC-derived sizing;
- no stale/incorrect NEC edition label may silently change math.

Do not infer current law/code adoption merely from labels in the app; audit the software semantics at the pinned SHA.

## 14. Responsive UX
Inspect phone (<768), tablet, and desktop behavior for all new/changed workflows:
- Residential Save/Apply controls;
- archive list;
- Quote lifecycle adjustment/approval controls;
- Catalog Custom form and row Add Qty override;
- Catalog/Job source badges;
- top totals and navigation.

Treat a primary action hidden/unusable on a common viewport as P1.

## 15. PWA / offline / cache migration
Verify exact `sw.js` behavior:
- cache is `bruno-electric-v50`;
- every required runtime module is in CORE_SHELL;
- stale owned `bruno-electric-v*` caches are deleted;
- unrelated caches are preserved;
- install is not poisoned by optional icon failure;
- offline navigation/runtime behavior does not serve a mixed old/new workflow shell.

## 16. CI provenance / tests
- Verify final exact PR HEAD equals `AUDITED_HEAD_SHA`.
- Verify exact-head checkout/provenance gate passed for that SHA.
- Verify Actions run #298 is SUCCESS for the exact audited SHA.
- Inspect tests for tautological/string-only blind spots. Do not treat tests as proof without runtime/data-path inspection.
- Re-run or reason through all critical cases independently.

## 17. Developer report skepticism requirement
Read `dev-reports/WORKFLOW_OVERHAUL_V50_FINAL.md` only as an implementation claim map. For every major claim you rely on, independently verify the corresponding runtime/data path. If report and implementation disagree, implementation wins and the discrepancy must be reported.

## Deliverable
Write the complete audit only to:

`audits/reports/WORKFLOW_OVERHAUL_V50_5852749.md`

The report must include:
- exact audited SHA and CI provenance;
- audit method;
- P0/P1/P2 findings with reproduction/evidence;
- math verification cases;
- persistence/history results;
- responsive/PWA results;
- regression results;
- final verdict and blockers.

Chat response must contain only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

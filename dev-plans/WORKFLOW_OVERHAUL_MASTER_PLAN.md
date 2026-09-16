# Bruno Electric — Workflow Overhaul Master Plan

**Branch:** `dev/custom-special-order-materials`  
**Execution mode:** STRICT SEQUENTIAL  
**Audit mode:** ONE INDEPENDENT FULL AUDIT AFTER ALL STAGES  
**Current stage:** `STAGE_7_CATALOG_JOB_MATERIALS_CUSTOM`  
**Overall state:** `IN_PROGRESS`

## NON-NEGOTIABLE EXECUTION RULES
1. Work on exactly one `CURRENT_STAGE` at a time.
2. DO NOT start the next stage until every acceptance criterion and required regression for the current stage is GREEN.
3. After finishing each stage, RE-READ THIS FILE from the repository before changing any code for the next stage.
4. Update this file after each completed stage with status, implementation SHA(s), tests/evidence, follow-up risks and next `Current stage`.
5. If a stage fails CI or an acceptance criterion, remain on that stage until corrected.
6. Do not silently weaken an acceptance criterion to advance.
7. Do not merge PR #14 during this plan.
8. Do not create an independent audit task after intermediate stages. The independent audit is created only after `STAGE_8_FINAL_INTEGRATION_GATE` is GREEN.
9. Preserve existing accepted safety contracts: blank `Your Cost` != explicit `0`; unresolved cost never enters numeric project material-cost math; historical Job Materials are immutable snapshots; Residential/Commercial isolation remains intact; historical helper-tax semantics remain intact; exact-head CI must test the real PR head SHA.
10. Any navigation, storage, import/export, archive, quote, or invoice change must be tested for phone/tablet/desktop and reload persistence where applicable.

---
## STAGE 1 — NAVIGATION / DEEP-LINK CORRECTNESS
**Status:** `DONE`
Implemented explicit-tab routes, canonical hash parser/default resolution, immediate exact-tab restore, preserved hash and hashchange/back-forward support.
**Evidence:** CI #249 SUCCESS.

---
## STAGE 2 — RESIDENTIAL WIRE / CABLE TAKEOFF
**Status:** `DONE`
Implemented detailed routing takeoff, 12/2 vs 14/2 totals, waste, quick ft² budget mode explicitly NOT NEC, validation and archive persistence.
**Evidence:** CI #254 SUCCESS.

---
## STAGE 3 — SAVE CALCULATION / ARCHIVE UX
**Status:** `DONE`
Implemented explicit Save workflow, dirty/saved state, archive overview, idempotent unchanged-save identity, archive immutability, duplicate/delete isolation and no autosave.
**Evidence:** CI #262 SUCCESS.

---
## STAGE 4 — APPLY CALCULATION TO JOB / PROVENANCE
**Status:** `DONE`
Implemented separate Save vs Apply boundaries, strict BOM Apply transaction, applied provenance, Residential-only re-Apply replacement, unresolved/zero/positive cost semantics, and saved/applied/newer-saved UX.
**Evidence:** final exact-head CI #276 SUCCESS on `61b69fd9398c8e6260f123de47a6a95d2e3c144f`.

---
## STAGE 5 — JOB TOTALS / QUOTE PRICE CLARITY
**Status:** `DONE`
Added semantic/validation layer over the authoritative legacy calculation path, explicit contractor-cost vs recommended/customer quote labels, unresolved-cost disclosure, applied-calculation reference and header↔Summary parity guard without duplicating OH/profit math.
**Evidence:** exact-head CI #281 SUCCESS on `1e9425dad863fc12708626d8399d3cd52e437728`.

---
## STAGE 6 — QUOTE APPROVAL / MANUAL CUSTOMER-PRICE OVERRIDE / INVOICE BOUNDARY
**Status:** `DONE`

### Implemented
- Added `electric-quote-lifecycle.js` with explicit fixed-price lifecycle: `Estimated Job Cost → Recommended Customer Price → Manual Quote Adjustment (optional) → Approved Quote snapshot → Invoice basis`.
- Blank manual adjustment means use live recommended price; positive manual amount is explicit `MANUAL_ADJUSTMENT`; explicit zero/negative/invalid values fail closed.
- Approval persists immutable snapshot with approval ID, revision, approval timestamp, customer amount, recommended-at-approval amount, manual override, approved CO amount, unresolved-cost condition, quote metadata and applied-calculation provenance.
- Post-approval calculator/Catalog/Job edits do not mutate approved amount or approval-time cost/provenance fields.
- Re-approval increments revision and preserves prior approval in history.
- Fixed-price invoice basis is unavailable before approval and is sourced only from `APPROVED_QUOTE_SNAPSHOT`, never from moving live recommendation.
- Quote UX explicitly labels LIVE RECOMMENDED / MANUAL ADJUSTED / APPROVED SNAPSHOT and exposes immutable invoice basis.

### Acceptance criteria
- [x] Manual override is explicit and blank-safe.
- [x] Zero override policy is fail-closed.
- [x] Approval is persisted immutable snapshot.
- [x] Unresolved material cost is disclosed and snapshotted rather than coerced to zero.
- [x] Applied-calculation provenance is snapshotted.
- [x] Re-approval has distinct revision/history.
- [x] Invoice basis depends on approved snapshot only.

### Completion evidence
- Implementation/test/bootstrap SHAs include `3399908bb0a39a497032383b02bbfbf20db9af32`, `00a5f05d1a71dbb5c65a2f05240afa3625d966a4`, `ff4ed617acfe340df1a67ff4b4b7555c47127b33`, `3aa18cf6ce3d3529dfc0b75ce99b9975c1511f1c`.
- Exact-head CI run #286 — SUCCESS on `3aa18cf6ce3d3529dfc0b75ce99b9975c1511f1c`.

---
## STAGE 7 — CATALOG / JOB MATERIALS UX CLARITY + CUSTOM MATERIAL COMPLETION
**Status:** `IN_PROGRESS`

### Required implementation
- Explicit row-level `CATALOG`, `USED ON JOB`, `CUSTOM / SPECIAL ORDER`, and Job Material source semantics.
- Clarify that Catalog definitions and Job Material snapshots are different records.
- Keep Custom Material creation/editing discoverable at the top of Catalog.
- All Custom Catalog Add paths must route through strict custom cost semantics.
- Project-scoped Custom definitions must remain isolated to the active imported/new job state; no device-global custom registry may leak between jobs.
- Preserve blank vs explicit zero vs positive Your Cost semantics and strict positive Qty semantics.
- Editing/deleting Catalog definitions must never rewrite historical Job Material snapshots.
- Responsive phone/tablet/desktop controls must remain usable.

### Required regressions
- custom create/edit/delete/add;
- Catalog Add guard for custom rows;
- blank/zero/positive Your Cost;
- saved Qty vs row-specific Add Qty override;
- repeated Add behavior;
- historical snapshot immutability after Catalog edit/delete;
- import/new-job isolation;
- row-level Catalog/Used/Custom/source UX markers;
- phone/tablet/desktop CSS breakpoints.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---
## STAGE 8 — FINAL INTEGRATION GATE / PWA / EXPORT-IMPORT / EXACT-HEAD CI
**Status:** `PENDING`
Required: full end-to-end tests, isolation/regressions, responsive verification, final PWA cache/core shell update, exact-head CI, frozen candidate, developer report, then one full independent audit.

---
# FINAL AUDIT SCOPE
1. Calculator navigation/deep links.
2. Residential wire/cable takeoff and quick estimate labeling/math.
3. Save/archive UX and persistence.
4. Apply-to-Job transaction/provenance.
5. Job top totals and unresolved-cost disclosure.
6. Quote override/approval/invoice boundary.
7. Catalog/Job Materials clarity and Custom materials semantics.
8. Import/export/job isolation.
9. Residential/Commercial isolation.
10. Journal historical helper-tax behavior.
11. Responsive phone/tablet/desktop.
12. PWA/offline/cache migration.
13. Exact-head CI provenance.
14. Shared regressions and data-integrity paths.

**Audit verdict rules:** `A ACCEPT` no P0/P1; `B ACCEPT AFTER MINOR FIXES` no P0/P1; `C REJECT / REWORK REQUIRED` one or more P0/P1.

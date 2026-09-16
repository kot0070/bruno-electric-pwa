# Bruno Electric — Workflow Overhaul Master Plan

**Branch:** `dev/custom-special-order-materials`  
**Execution mode:** STRICT SEQUENTIAL  
**Audit mode:** ONE INDEPENDENT FULL AUDIT AFTER ALL STAGES  
**Current stage:** `STAGE_3_SAVE_ARCHIVE_UX`  
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

Implemented canonical explicit-tab routes, hash parser/default resolution, immediate exact-tab restore and hashchange/back-forward support.

**Evidence:** SHAs `3f9071e36498b6472506f0b541bda9651434cdbb`, `63f084389b3f79a7db0c02cfe7bb6ea3133a4f69`, `17c3ca827976646779b83efc3b5d6a8ab4e66f4d`, `871b12c54d7014852ad67e47a9408b03090a6fd4`; CI run `#249` SUCCESS.

---

## STAGE 2 — RESIDENTIAL WIRE / CABLE TAKEOFF
**Status:** `DONE`

### Implemented
- Added dedicated `electric-residential-wire-takeoff.js` strict estimating module.
- Visible `Wire / Cable Takeoff` UI injected into Residential Live before the main result block.
- Detailed routing estimate exposes scope rows and grouped cable totals (`12/2`, `14/2` when applicable).
- Editable waste/routing allowance with strict 0–100 validation.
- Optional `Quick budget by ft²` mode with editable ft cable / ft² coefficient.
- Quick mode is explicitly labeled estimating/budget only and `NOT an NEC minimum`.
- Detailed and Quick modes are independent; quick calculation never mutates the Residential Live result.
- Selected wire model/settings/results are attached to active/archive calculation metadata after Save and restored on archive load.
- Added runtime loader through `sw-register.js` (final offline core-shell cache update remains reserved for Stage 8).

### Acceptance criteria
- [x] Total cable footage visible without reading BOM rows.
- [x] Cable type split visible.
- [x] Quick estimate clearly labeled as estimating/budget only.
- [x] Detailed and quick modes remain separate.
- [x] No square-footage-derived NEC minimum claim.
- [x] Invalid/negative waste/coefficient fails closed.
- [x] Archive metadata persistence path exists for selected wire model.

### Required regressions
- [x] detailed routing math;
- [x] waste allowance math;
- [x] 12/2 vs 14/2 type split;
- [x] quick ft² estimate math;
- [x] mode non-mutation;
- [x] invalid settings fail-closed;
- [x] archive metadata persistence hooks.

### Completion evidence
- Implementation SHAs: `3c7efe11bc0054da3ed10fcf0a08844b4e1d5867`, `2a089aac1f37049a8cd260c302170363b81d06dc`, `53891291b7a749afccec42d96d88e72d5bb2ec9f`, `e8f18a383917f70e15b910dea5fbce5884aa4f6d`
- CI: GitHub Actions run `#254` — SUCCESS on exact PR head `e8f18a383917f70e15b910dea5fbce5884aa4f6d`; exact-head checkout/provenance and deterministic suite steps passed.
- Follow-up risk reserved for Stage 4: selected wire purchase model is archived now; Apply-to-Job must decide explicitly whether to use archived purchase takeoff vs legacy BOM footage and must not silently mix them.

---

## STAGE 3 — SAVE CALCULATION / ARCHIVE UX
**Status:** `IN_PROGRESS`

### Problem
Archive engine exists, but Save/Archive behavior is not obvious enough and users can reach the bottom of the calculator believing calculations cannot be saved.

### Required implementation
- Make `Save Calculation` a prominent explicit action in Residential Live.
- Distinguish live unsaved calculation, saved calculation/archive record, and calculation applied to Job.
- Archive list must show name, saved timestamp, area, principal takeoff totals and live-pricing status.
- Preserve Load/Duplicate/Delete semantics.
- Add visible saved/unsaved state indicator.
- Save action must be idempotent/intentional: no accidental duplicate archive rows from ordinary input changes.

### Acceptance criteria
- A first-time user can find Save without scrolling through ambiguous output.
- Reload retains archived calculations.
- Editing live inputs does not mutate an archived calculation.
- Duplicate creates a new editable calculation identity.
- Delete affects only intended archive item.

### Required regressions
- save/reload;
- duplicate identity;
- delete isolation;
- archive immutability;
- active calculation restore;
- no autosave duplication.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---

## STAGE 4 — APPLY CALCULATION TO JOB / PROVENANCE
**Status:** `PENDING`

Required: explicit Apply to Job transaction; persisted calculation provenance; strict BOM replacement; manual/other-source preservation; same-source re-apply; no silent calculator→Job mutation; unresolved/zero/positive semantics.

---

## STAGE 5 — JOB TOTALS / QUOTE PRICE CLARITY
**Status:** `PENDING`

Required: clarify cost vs customer price vs approved quote; unresolved disclosure; applied calculation reference; eliminate ambiguous `Sales (Exact)`/`Quote Total`; header/summary parity.

---

## STAGE 6 — QUOTE APPROVAL / MANUAL CUSTOMER-PRICE OVERRIDE / INVOICE BOUNDARY
**Status:** `PENDING`

Required flow: `Estimated Job Cost → Recommended Customer Price → Manual Quote Adjustment (optional) → Approved Quote → Invoice`, persisted approval/override provenance and no silent post-approval calculator mutation.

---

## STAGE 7 — CATALOG / JOB MATERIALS UX CLARITY + CUSTOM MATERIAL COMPLETION
**Status:** `PENDING`

Required: explicit `Used N · Catalog M`; used-on-job meaning; Catalog vs Job Materials separation; discoverable Custom Material UI; strict Custom Add path; job/import isolation; blank/zero/positive cost and Qty semantics.

---

## STAGE 8 — FINAL INTEGRATION GATE / PWA / EXPORT-IMPORT / EXACT-HEAD CI
**Status:** `PENDING`

Required: complete end-to-end deterministic regression, job/archive isolation, Commercial/Residential and Journal regressions, responsive verification, final PWA cache/core shell update, exact-head CI, frozen candidate, developer report, then independent full audit only.

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

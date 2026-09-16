# Bruno Electric — Workflow Overhaul Master Plan

**Branch:** `dev/custom-special-order-materials`  
**Execution mode:** STRICT SEQUENTIAL  
**Audit mode:** ONE INDEPENDENT FULL AUDIT AFTER ALL STAGES  
**Current stage:** `STAGE_8_FINAL_INTEGRATION_GATE`  
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
**Status:** `DONE` — CI #249 SUCCESS.

## STAGE 2 — RESIDENTIAL WIRE / CABLE TAKEOFF
**Status:** `DONE` — CI #254 SUCCESS.

## STAGE 3 — SAVE CALCULATION / ARCHIVE UX
**Status:** `DONE` — CI #262 SUCCESS.

## STAGE 4 — APPLY CALCULATION TO JOB / PROVENANCE
**Status:** `DONE` — exact-head CI #276 SUCCESS on `61b69fd9398c8e6260f123de47a6a95d2e3c144f`.

## STAGE 5 — JOB TOTALS / QUOTE PRICE CLARITY
**Status:** `DONE` — exact-head CI #281 SUCCESS on `1e9425dad863fc12708626d8399d3cd52e437728`.

## STAGE 6 — QUOTE APPROVAL / MANUAL CUSTOMER-PRICE OVERRIDE / INVOICE BOUNDARY
**Status:** `DONE` — exact-head CI #286 SUCCESS on `3aa18cf6ce3d3529dfc0b75ce99b9975c1511f1c`.

## STAGE 7 — CATALOG / JOB MATERIALS UX CLARITY + CUSTOM MATERIAL COMPLETION
**Status:** `DONE`

### Implemented
- Existing Custom / Special-order workflow remains first-class at top of Catalog with create/edit/delete, persisted Catalog Qty, row-specific Add Qty override and strict Add-to-Job routing.
- Added `electric-catalog-job-ux-semantics.js` to expose row-level `CATALOG`, `CUSTOM / SPECIAL ORDER`, and `USED ON JOB ×qty` semantics.
- Job Material resolved rows receive source markers distinguishing `CUSTOM SNAPSHOT`, `CATALOG SNAPSHOT`, `GENERATED · source`, and `MANUAL JOB SNAPSHOT`.
- Catalog and Job Materials now carry explicit explanatory legends: Catalog rows are definitions; Job Materials are historical snapshots.
- Project-scoped Custom definitions remain inside active `bruno-electric-v1` job state; prior device-global Custom registries are non-authoritative and cannot leak between imported/replaced jobs.
- strict blank / explicit zero / positive Your Cost semantics and positive Qty enforcement remain covered.
- Catalog edit/delete preserves already-added Job Material history.
- Responsive semantic badge styling includes phone breakpoint and existing Custom form retains phone/tablet/desktop layouts.

### Completion evidence
- UX/bootstrap/test SHAs include `16c91cdf51c63ad2fe3732c33f4e5ce4d2efbaca`, `913cdcee9d015a180255bd7c2ebf143bf61946aa`, `ed307f61880132a3e88ac7faf901711fe16f1242`, `f8e1d4d4339bacbd4c6e6f07a17427fdc056d2c9`.
- Exact-head CI run #291 — SUCCESS on `f8e1d4d4339bacbd4c6e6f07a17427fdc056d2c9`.

---
## STAGE 8 — FINAL INTEGRATION GATE / PWA / EXPORT-IMPORT / EXACT-HEAD CI
**Status:** `IN_PROGRESS`

### Required implementation
- Final PWA cache/core-shell version bump including every new runtime module.
- Validate stale owned-cache cleanup and unrelated-cache preservation.
- Full import/export/new-job isolation across Custom definitions, applied Residential provenance and Quote approval lifecycle.
- Full deterministic suite across all prior stages plus legacy shared regressions.
- Responsive phone/tablet/desktop static/runtime contract verification for newly introduced controls.
- Preserve Residential/Commercial isolation and historical helper-tax behavior.
- Freeze exact PR candidate SHA only after all code/tests/docs are complete.
- Produce developer implementation report tied to frozen exact SHA and exact-head CI run.
- Create one independent `AUDIT ONLY` branch with `audits/TASK_CURRENT.md` + `audits/PROTOCOL.md` pinned to the frozen candidate.
- Do not merge PR #14 before independent audit acceptance.

### Completion evidence
- Candidate SHA: `PENDING`
- CI/test evidence: `PENDING`
- Developer report: `PENDING`
- Independent audit task: `PENDING`

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

# Bruno Electric — Workflow Overhaul Master Plan

**Branch:** `dev/custom-special-order-materials`  
**Execution mode:** STRICT SEQUENTIAL  
**Audit mode:** ONE INDEPENDENT FULL AUDIT AFTER ALL STAGES  
**Current stage:** `COMPLETE_AWAITING_INDEPENDENT_AUDIT`  
**Overall state:** `IMPLEMENTATION_COMPLETE / DO_NOT_MERGE_BEFORE_AUDIT`

## NON-NEGOTIABLE EXECUTION RULES
1. Do not merge PR #14 before independent audit acceptance.
2. Preserve accepted safety contracts: blank `Your Cost` != explicit `0`; unresolved cost never enters numeric project material-cost math; historical Job Materials are immutable snapshots; Residential/Commercial isolation remains intact; historical helper-tax semantics remain intact; exact-head CI must test the real PR head SHA.
3. Independent audit must use the exact SHA pinned in `audits/TASK_CURRENT.md` and must not modify production code, PR metadata, or merge state.

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
**Status:** `DONE` — exact-head CI #291 SUCCESS on `f8e1d4d4339bacbd4c6e6f07a17427fdc056d2c9`.

## STAGE 8 — FINAL INTEGRATION GATE / PWA / EXPORT-IMPORT / EXACT-HEAD CI
**Status:** `DONE`

### Implemented
- Final PWA cache bumped to `bruno-electric-v50`.
- v50 CORE_SHELL includes all new workflow runtime modules: Job summary semantics, Quote lifecycle, Catalog/Job UX semantics, Custom materials, Residential wire takeoff, Apply-to-Job and Save/archive UX.
- Owned stale Bruno Electric caches are deleted while unrelated caches remain untouched.
- Final integration tests verify bootstrap↔PWA runtime parity, Save/Apply/Approval boundaries, unresolved-cost continuity, project-scoped data authority and responsive contracts.
- Custom definitions remain inside active Job state and are isolated across Job replacement/import.
- Applied Residential provenance and Quote approval lifecycle remain persisted in active Job state.
- Existing Residential/Commercial isolation, historical helper-tax and shared calculator regressions remain in the deterministic suite.
- Developer implementation report created at `dev-reports/WORKFLOW_OVERHAUL_V50_FINAL.md`.
- Production/runtime implementation is frozen at `cd474824c1a45bcc1edaf655a30a26880f00bc05`; later commits are documentation/evidence only.

### Completion evidence
- PWA/test/runtime SHAs include `fc8881807f3bf92e0d26e55dd066027ecef3ce5d`, `28d70127c83d44a30c5667574fd8618d848fc274`, `01cef4e23f244bc58531f7208e6e1b7c0047d039`, `cd474824c1a45bcc1edaf655a30a26880f00bc05`.
- Runtime exact-head CI #296 — SUCCESS on `cd474824c1a45bcc1edaf655a30a26880f00bc05`.
- Developer report commit: `183f9529e1988f39acde09243b89357962ad1f35`.
- Final metadata HEAD created by this commit must receive one final exact-head CI SUCCESS before audit branch creation.

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

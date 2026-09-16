# Bruno Electric — Workflow Overhaul Master Plan

**Branch:** `dev/custom-special-order-materials`  
**Execution mode:** STRICT SEQUENTIAL  
**Audit mode:** ONE INDEPENDENT FULL AUDIT AFTER ALL STAGES  
**Current stage:** `STAGE_6_QUOTE_APPROVAL_INVOICE_BOUNDARY`  
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
**Evidence:** SHAs `3f9071e36498b6472506f0b541bda9651434cdbb`, `63f084389b3f79a7db0c02cfe7bb6ea3133a4f69`, `17c3ca827976646779b83efc3b5d6a8ab4e66f4d`, `871b12c54d7014852ad67e47a9408b03090a6fd4`; CI #249 SUCCESS.

---
## STAGE 2 — RESIDENTIAL WIRE / CABLE TAKEOFF
**Status:** `DONE`
Implemented visible detailed routing takeoff, 12/2 vs 14/2 totals, selectable waste, optional quick ft² budget mode explicitly NOT NEC, validation, archive metadata persistence/restore.
**Evidence:** SHAs `3c7efe11bc0054da3ed10fcf0a08844b4e1d5867`, `2a089aac1f37049a8cd260c302170363b81d06dc`, `53891291b7a749afccec42d96d88e72d5bb2ec9f`, `e8f18a383917f70e15b910dea5fbce5884aa4f6d`; CI #254 SUCCESS.

---
## STAGE 3 — SAVE CALCULATION / ARCHIVE UX
**Status:** `DONE`
Implemented prominent explicit save workflow, dirty/saved state, richer archive overview, idempotent unchanged-save identity, archive immutability, duplicate/delete isolation and no autosave.
**Evidence:** SHAs `489d009847e37edf0ae0c52d4213dfbb1af73438`, `9167976ff975c21f46fe00d8d3396faefbb7233c`, `7a249467e95dcc4c606fd0ae10751c9ba4bd304f`, `67c38822d3535c3b2444eb2b93fa3790bba89108`, `ac795a5280482c9599f4383523c09b06efe67dd2`, `3146d69d166b459d7ffb0d43ad449eb53cd90b7b`, `dcfe721158c77daba27686da7653766ffbf03b1e`; CI #262 SUCCESS.

---
## STAGE 4 — APPLY CALCULATION TO JOB / PROVENANCE
**Status:** `DONE`

### Implemented
- Save Calculation and Apply to Job are distinct persisted intent boundaries.
- `electric-residential-live-history.js::confirmAtomic()` remains only as compatibility SAVE boundary and does not mutate Job Materials.
- Explicit `electric-residential-apply-job.js::applyActive()` transaction applies the saved calculation through strict BOM semantics.
- Applied provenance persists calculation ID/name, timestamps, source type/version/tag, row counts and wire-takeoff metadata.
- Re-Apply replaces Residential-generated rows only; manual and non-Residential rows remain untouched.
- blank / explicit zero / positive Your Cost semantics remain strict.
- Quick ft² wire budget remains metadata only and cannot silently replace exact archived BOM quantities.
- Calculator UX and Job workspace distinguish saved, applied, dirty and newer-saved/not-applied states.

### Completion evidence
- Final Stage 4 exact-head CI run `#276` — SUCCESS on `61b69fd9398c8e6260f123de47a6a95d2e3c144f`.

---
## STAGE 5 — JOB TOTALS / QUOTE PRICE CLARITY
**Status:** `DONE`

### Implemented
- Added `electric-job-summary-semantics.js` as a semantic/validation layer over the existing authoritative `calcAll() -> updateChips/renderSummary` path; no duplicate pricing formula engine was introduced.
- Header labels now explicitly distinguish Material/Labor/Equipment contractor cost, Estimated Job Cost, Recommended Customer Price exact, Approved Change Orders and Customer Quote Total.
- `materialsUnresolved[]` produces first-class `INCOMPLETE MATERIAL COST` disclosure; unresolved rows remain excluded from numeric contractor-cost/profit math.
- Summary disclosure shows applied Residential calculation provenance when present.
- Added runtime parity guard comparing header vs Summary for material cost, total contractor cost and recommended exact customer price; mismatch produces `METRIC PARITY WARNING` and `data-summary-parity=FAIL`.
- Stage 5 test suite verifies semantic labels, unresolved disclosure, parity endpoints/provenance, exact-vs-rounded quote semantics and absence of a duplicate OH/profit formula implementation.

### Acceptance criteria
- [x] Top metrics have unambiguous business meaning.
- [x] Contractor cost, recommended customer price, approved CO and quote total are semantically distinct.
- [x] Unresolved material cost cannot present contractor cost as complete.
- [x] Applied-calculation provenance is visible near Summary state.
- [x] Header/Summary parity is actively checked.
- [x] No second sales/OH/profit calculation engine was introduced.

### Completion evidence
- Core/test/bootstrap SHAs include `0a16d340951ec863965cdb482cee7a649dff38eb`, `f60a0d52e8a652c26cc82fbf19eb8c6ce7e1b748`, `ee99d5f3407445ef911021156ed3dab8fd855d54`, `1e9425dad863fc12708626d8399d3cd52e437728`.
- Exact-head CI run `#281` — SUCCESS on `1e9425dad863fc12708626d8399d3cd52e437728`.

---
## STAGE 6 — QUOTE APPROVAL / MANUAL CUSTOMER-PRICE OVERRIDE / INVOICE BOUNDARY
**Status:** `IN_PROGRESS`

### Required implementation
- Establish explicit flow: `Estimated Job Cost → Recommended Customer Price → Manual Quote Adjustment (optional) → Approved Quote → Invoice`.
- Manual customer-price override must be explicit, persisted and attributable; blank override means use recommended price, not numeric zero.
- Approve Quote must snapshot the customer amount and material/job/calculation provenance at that moment.
- Calculator/Catalog/Job edits after approval must never silently rewrite the approved quote snapshot.
- Invoice must reference an approved quote snapshot (plus explicit approved post-quote changes where supported), never a moving live recommended price.
- Re-approval must create/update an explicit approval event rather than masquerading as the original approval.
- Approval must disclose unresolved contractor-cost condition without converting unresolved cost to zero.
- Quote/Invoice UX must clearly show LIVE RECOMMENDED vs MANUAL ADJUSTED vs APPROVED SNAPSHOT state.

### Required regressions
- no manual override / manual positive override / explicit zero policy;
- approve + reload persistence;
- post-approval calculator edit isolation;
- post-approval Catalog price edit isolation;
- applied-calculation provenance snapshot;
- unresolved-cost disclosure on approval;
- re-approval version/timestamp behavior;
- invoice consumes approved snapshot, not current live recommendation;
- phone/tablet/desktop control visibility.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---
## STAGE 7 — CATALOG / JOB MATERIALS UX CLARITY + CUSTOM MATERIAL COMPLETION
**Status:** `PENDING`
Required: explicit Used/Catalog badges, used-on-job meaning, Catalog vs Job Materials separation, discoverable Custom Material UI, strict Custom Add path, job/import isolation, blank/zero/positive cost and Qty semantics.

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

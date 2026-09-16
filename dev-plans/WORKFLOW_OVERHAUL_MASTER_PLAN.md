# Bruno Electric — Workflow Overhaul Master Plan

**Branch:** `dev/custom-special-order-materials`  
**Execution mode:** STRICT SEQUENTIAL  
**Audit mode:** ONE INDEPENDENT FULL AUDIT AFTER ALL STAGES  
**Current stage:** `STAGE_5_JOB_TOTALS_QUOTE_CLARITY`  
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
- Save Calculation and Apply to Job are now distinct persisted intent boundaries.
- `electric-residential-live-history.js::confirmAtomic()` is retained as a compatibility entry point but performs SAVE ONLY and asserts Job Materials are unchanged.
- Added `electric-residential-apply-job.js` with explicit `applyActive()` transaction from the currently saved calculation.
- Apply requires saved calculation identity/BOM, uses strict `BrunoElectricBOM.prepareReplacement()` cost semantics and stores applied provenance.
- Provenance includes calculation ID/name, saved timestamp, applied timestamp, source type/version/tag, BOM line count, resolved/unresolved row counts and wire-takeoff metadata.
- Prior legacy `residential-live-takeoff` rows and prior Residential applied-calculation rows are migrated/replaced; manual and non-Residential generated rows remain untouched.
- blank Your Cost remains `materialsUnresolved[]`; explicit zero remains resolved numeric zero; positive cost remains resolved.
- Quick ft² wire model is stored only as estimating/provenance metadata; Apply uses archived BOM rows and cannot silently replace exact cable-type BOM quantities.
- Residential workflow UX now exposes `Apply to Job` / `Update Job from Calculation` separately from Save.
- Apply is disabled when live inputs are dirty; live edits after Apply do not mutate Job until Save + Apply again.
- UX states now distinguish `LIVE · NOT SAVED`, `LIVE CHANGES · NOT SAVED`, `SAVED · NOT APPLIED`, and `SAVED · APPLIED TO JOB`.
- Job workspace top chip now represents the APPLIED calculation, not merely the active saved calculation; it flags `SAVED_NEWER_NOT_APPLIED` when a newer saved calculation exists.
- Live Catalog pricing remains informational context only when saved/applied identities match; this does not mutate Job state.

### Acceptance criteria
- [x] Save alone leaves Job Materials unchanged.
- [x] Explicit Apply/Update transaction exists.
- [x] Applied calculation provenance survives persisted Job state/reload.
- [x] Manual/other-source Job Materials are preserved.
- [x] Re-Apply replaces prior Residential generated rows only.
- [x] unresolved / explicit zero / positive Your Cost semantics preserved.
- [x] Live edits after Apply do not silently mutate Job.
- [x] Quick budget wire estimate cannot replace archived BOM quantities.
- [x] Calculator UI distinguishes saved/applied state.
- [x] Job workspace shows applied calculation and newer-saved/not-applied state.

### Required regressions
- [x] save-only material non-mutation;
- [x] Apply saved calculation;
- [x] same-domain re-apply;
- [x] legacy Residential row migration;
- [x] manual/other-source preservation;
- [x] unresolved/zero/positive Your Cost;
- [x] provenance persistence structure;
- [x] saved edit after Apply remains Job-stable;
- [x] quick wire budget does not alter BOM quantity;
- [x] Job workspace applied/newer-saved provenance UI.

### Completion evidence
- Core/UX/test SHAs include: `b669ebe5fd3cc5921c53a7aec213e13e2886d167`, `748c76f574af98897179660773ef9b59fb1f43c1`, `3772c2bdb3de7e5394799153de7bc917957f021d`, `5faf4d68188aada0db511f79030429a90663debd`, `ff4d1a4ac697b5e3f7d61757038f0566bb5ec4de`, `23e99175238518c8f47fa4026597797671955ef2`, `8d3d8d9becde0f199ac407cd5b0e25116d72df76`, `c38b0b69a003f632d5478ea4231c72b59a64c383`, `0083f6a6bb4ea7a959e357ecea525cb81a23be67`, `87ff001656bcbafca4ba9807fc62c8f270744b9f`, `014bfc5c97da526fcde4d3993033e070f081f342`, `61b69fd9398c8e6260f123de47a6a95d2e3c144f`.
- CI #273 passed the core Apply boundary at exact head `0083f6a6bb4ea7a959e357ecea525cb81a23be67`.
- CI #275 exposed two legacy workspace assumptions; production semantics were retained and live-pricing context was restored without weakening applied provenance.
- Final Stage 4 exact-head CI run `#276` — SUCCESS on `61b69fd9398c8e6260f123de47a6a95d2e3c144f`.

---
## STAGE 5 — JOB TOTALS / QUOTE PRICE CLARITY
**Status:** `IN_PROGRESS`

### Required implementation
- Clarify top Job metric labels and calculation provenance.
- Separate contractor cost from customer selling/recommended price.
- Display whether material cost is complete or has unresolved exclusions.
- Show applied Residential calculation reference near Job summary metrics when applicable.
- Remove or rename ambiguous duplicate concepts such as `Sales (Exact)` vs `Quote Total` unless their difference is explicitly defined in UI.
- Ensure top metrics and detailed Summary consume the same authoritative calculation path.

### Acceptance criteria
- Every top metric has one unambiguous business meaning.
- Contractor cost, recommended/customer price, approved quote and change orders are visually/semantically distinct.
- Any unresolved material cost prevents a misleading “complete contractor cost” presentation.
- Applied-calculation provenance is visible near summary state.
- Header metrics and Summary cannot disagree for the same persisted Job state.

### Required regressions
- material/labor/equipment/job-cost formulas;
- unresolved-cost disclosure;
- approved change-order handling;
- Summary/header parity;
- applied-calculation provenance display;
- responsive phone/tablet/desktop metric labels.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---
## STAGE 6 — QUOTE APPROVAL / MANUAL CUSTOMER-PRICE OVERRIDE / INVOICE BOUNDARY
**Status:** `PENDING`
Required flow: `Estimated Job Cost → Recommended Customer Price → Manual Quote Adjustment (optional) → Approved Quote → Invoice`, persisted approval/override provenance and no silent post-approval calculator mutation.

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

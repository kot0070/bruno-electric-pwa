# Bruno Electric — Workflow Overhaul Master Plan

**Branch:** `dev/custom-special-order-materials`  
**Execution mode:** STRICT SEQUENTIAL  
**Audit mode:** ONE INDEPENDENT FULL AUDIT AFTER ALL STAGES  
**Current stage:** `STAGE_4_APPLY_TO_JOB`  
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
**Reserved rule for Stage 4:** Quick ft² mode is budget reference only and must never silently replace exact cable-type Job Material rows.

---
## STAGE 3 — SAVE CALCULATION / ARCHIVE UX
**Status:** `DONE`

### Implemented
- Added prominent sticky `Residential Calculation` workflow card with `Save Calculation` action.
- Explicit live states: `LIVE · NOT SAVED`, `LIVE CHANGES · NOT SAVED`, `SAVED CALCULATION`.
- Ordinary input changes mark dirty but never autosave/archive.
- Save remains user-intent boundary and failed saves do not mark calculation saved.
- Archive overview now shows calculation name, saved timestamp, area, circuits, wire estimate, LIVE Customer materials and LIVE Your Cost.
- Existing Duplicate/Load/Delete semantics retained through bridge to existing archive controls.
- History engine now performs idempotent save identity: repeated unchanged save/confirm reuses current active archive ID rather than creating duplicate rows.
- Changed core calculation creates a new archive identity and leaves the old archived snapshot immutable.
- Delete isolation and existing transaction rollback retained.
- `sw-register.js` loads the new save/archive UX module; final PWA offline shell update remains Stage 8.

### Acceptance criteria
- [x] Save action is prominent at top of Residential workflow.
- [x] Reload-persisted archive engine retained.
- [x] Live edits do not mutate archived rows automatically.
- [x] Explicit Duplicate creates separate editable identity.
- [x] Delete affects only selected archive row.
- [x] Repeated unchanged Save does not generate archive duplicates.
- [x] Saved/dirty/unsaved states are visible.

### Required regressions
- [x] save/reload existing persistence path;
- [x] idempotent repeated save;
- [x] changed calculation versioning + archive immutability;
- [x] duplicate identity;
- [x] delete isolation;
- [x] atomic rollback retained;
- [x] no autosave in dirty handler;
- [x] archive summary fields and workflow state UI.

### Completion evidence
- Implementation/test SHAs: `489d009847e37edf0ae0c52d4213dfbb1af73438`, `9167976ff975c21f46fe00d8d3396faefbb7233c`, `7a249467e95dcc4c606fd0ae10751c9ba4bd304f`, `67c38822d3535c3b2444eb2b93fa3790bba89108`, `ac795a5280482c9599f4383523c09b06efe67dd2`, `3146d69d166b459d7ffb0d43ad449eb53cd90b7b`, `dcfe721158c77daba27686da7653766ffbf03b1e`.
- Initial run #261 found one stale formatting-sensitive bootstrap assertion; production ordering was correct. Test was hardened to validate semantic ordering independent of whitespace.
- Exact-head CI run `#262` — SUCCESS on `dcfe721158c77daba27686da7653766ffbf03b1e`.

---
## STAGE 4 — APPLY CALCULATION TO JOB / PROVENANCE
**Status:** `IN_PROGRESS`

### Required implementation
- Separate Save Calculation from Apply to Job; saving alone must not mutate Job Materials.
- Add explicit `Apply to Job` / `Update Job from calculation` transaction for a saved active calculation.
- Persist provenance: calculation/archive ID, name, applied timestamp, source type/version.
- Apply generated BOM through strict BOM cost semantics.
- Preserve manual and non-Residential generated Job Materials.
- Re-apply replaces only Residential applied-calculation rows, not manual/other-source rows.
- blank Your Cost -> unresolved store; explicit 0 -> resolved zero; positive -> resolved cost.
- Calculator edits after Apply must not mutate Job until explicit Save + Apply/Update.
- Quick ft² wire mode is budget reference only and must not silently drive exact Job Material cable rows; Apply uses the saved calculation BOM/detailed material structure unless an explicit exact cable-type model exists.
- Job/Calculator UI must show which calculation is currently applied and whether live changes are newer than applied state.

### Required regressions
- Save-only leaves Job Materials unchanged;
- Apply saved calculation;
- same-source re-apply;
- manual/other-source preservation;
- unresolved/zero/positive Your Cost;
- provenance persistence/reload;
- calculator edit after Apply does not auto-mutate Job;
- quick wire budget does not replace exact cable-type BOM rows.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---
## STAGE 5 — JOB TOTALS / QUOTE PRICE CLARITY
**Status:** `PENDING`
Required: cost vs customer price vs approved quote clarity, unresolved disclosure, applied-calculation reference, remove ambiguous Sales/Quote labels, header/summary parity.

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

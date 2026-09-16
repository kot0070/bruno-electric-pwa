# Bruno Electric — Corrective Master after v50 Full Audit

**Source audit:** `audits/reports/WORKFLOW_OVERHAUL_V50_5852749.md`  
**Source audited SHA:** `5852749be6cd240b6e52bac15cacf4ffbfa6a288`  
**Execution:** STRICT SEQUENTIAL  
**Current stage:** `FINAL_REAUDIT_PREP`  
**Overall state:** `IMPLEMENTATION_GREEN`

## Rules
1. Fix exactly one P1 stage at a time.
2. Do not advance until deterministic regressions and exact-head CI for the current stage are GREEN.
3. Re-read this file between stages.
4. Do not merge PR #14.
5. After C2, run final integration CI, freeze new candidate, write corrective evidence, then create one re-audit branch/task.

## C1 — Job-scoped Residential archive
**Status:** `DONE`

**Original blocker:** device-global `bruno-residential-live-library-v1` leaked Job A archives into Job B/imported jobs.

### Implemented
- Added `electric-residential-history-job-scope.js` as the authoritative Residential archive runtime.
- Authoritative archive is now `bruno-electric-v1.residentialLiveArchive`.
- Job JSON export/import naturally carries archive records because they live inside current Job state.
- Job A -> Job B replacement/import exposes only Job B archive state.
- Legacy `bruno-residential-live-library-v1` remains raw/preserved and non-authoritative.
- Added explicit `legacyList()` + `importLegacyToCurrent(ids)` recovery path; recovery creates new IDs and provenance rather than silently assigning ambiguous ownership.
- Added compatibility virtualization for preloaded legacy closures so legacy reads/writes of the old archive key are mapped into current Job archive without modifying the raw recovery source.
- Strengthened load order in `electrical-tools.html`: job-scope runtime loads immediately after legacy history API and before `electrical-residential-live-ui.js`, so normal UI closures capture the corrected API rather than relying on the compatibility adapter.
- save/list/remove/duplicate/active/reprice operate on current Job archive.
- malformed legacy data cannot erase valid current-job archive.

### Regression evidence
- `tests/residential-history-job-scope.test.js`: Job A -> Job B isolation, Job export/import archive persistence, raw legacy preservation, explicit recovery, legacy closure virtualization, malformed legacy safety.
- C1 exact-head gate: CI #307 SUCCESS on `e8d2eb05cbfba54523cf57dd5ecc407d159efb66`.
- Final load-order/integration coverage added in `tests/workflow-final-integration.test.js`.

## C2 — Fixed-price approved Quote -> real Invoice
**Status:** `DONE`

**Original blocker:** actual Print Invoice path remained T&M and did not consume `APPROVED_QUOTE_SNAPSHOT`.

### Implemented
- Added `electric-fixed-price-invoice.js` with a distinct fixed-price Invoice workflow.
- `buildInvoiceModel()` consumes only `BrunoQuoteLifecycle.invoiceBasis()` and requires `source = APPROVED_QUOTE_SNAPSHOT`.
- Fixed-price invoice is unavailable before Quote approval.
- Invoice model/document carries frozen amount, approval ID/revision/time, quote metadata, applied-calculation provenance, price source, and approval-time unresolved-cost state.
- Fixed-price print path never reads moving `q-total` / `chip-quote` values.
- Added dedicated `Print Fixed-Price Invoice` action in Quote lifecycle UI.
- Existing invoice controls are explicitly relabeled `Print T&M Invoice` / `Print T&M Invoice (PDF)` so T&M and fixed-price invoicing cannot be confused.
- Post-approval live calculator/Catalog/Job edits cannot mutate the fixed invoice basis because document generation rebuilds from immutable approved snapshot.

### Regression evidence
- `tests/fixed-price-invoice.test.js` covers approved-snapshot source, frozen amount/provenance, pre-approval fail-closed, T&M separation, and prohibition on live quote DOM reads.
- CI #314 SUCCESS on `bf88df0591a0c619687513edaa627cae56cada54` after correcting one bad test assertion; the failed #313 was a test bug, not production logic.

## Final integration / PWA gate
**Status:** `GREEN`

- PWA bumped to `bruno-electric-v51`.
- CORE_SHELL includes `electric-residential-history-job-scope.js` and `electric-fixed-price-invoice.js` plus prior workflow-overhaul runtimes.
- stale owned caches v38-v50 are removed; v51 and unrelated caches are retained.
- `electrical-tools.html` statically loads job-scope history before Residential Live UI closure capture.
- temp/debug files removed from release branch.
- full integration assertions updated for v51 corrective paths.
- CI #319 SUCCESS on `6b32c7100ded4f99a479d7eea829581722316e2e`.

## Final re-audit preparation
1. Write corrective developer report.
2. Freeze final PR candidate after documentation commits.
3. Run exact-head CI on that final SHA.
4. Update PR #14 body with v51 corrective evidence.
5. Create one separate `AUDIT ONLY` re-audit branch pinned to final SHA.
6. Re-audit both original P1 reproductions plus full shared regression scope.
7. Do not merge before accepted audit verdict.

# Bruno Electric — Corrective Master after v50 Full Audit

**Source audit:** `audits/reports/WORKFLOW_OVERHAUL_V50_5852749.md`  
**Source audited SHA:** `5852749be6cd240b6e52bac15cacf4ffbfa6a288`  
**Execution:** STRICT SEQUENTIAL  
**Current stage:** `REAUDIT`  
**Overall state:** `FROZEN_FOR_REAUDIT`

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
- Added `electric-residential-history-job-scope.js` as authoritative Residential archive runtime.
- Authoritative archive: `bruno-electric-v1.residentialLiveArchive`.
- Job JSON export/import naturally carries archive records.
- Job A -> Job B replacement/import exposes only Job B archive state.
- Legacy `bruno-residential-live-library-v1` remains raw/preserved and non-authoritative.
- Explicit `legacyList()` + `importLegacyToCurrent(ids)` recovery path; recovered rows receive new IDs and provenance.
- Compatibility virtualization maps preloaded legacy closure access to the current Job archive without rewriting the raw legacy recovery source.
- `electrical-tools.html` loads the job-scope runtime after legacy API definition but before `electrical-residential-live-ui.js`, so normal UI closures capture corrected authority.
- save/list/remove/duplicate/active/reprice operate on current Job archive.
- malformed legacy data cannot erase valid current-job archive.

### Regression evidence
- `tests/residential-history-job-scope.test.js` covers Job A -> Job B isolation, Job export/import archive persistence, raw legacy preservation, explicit recovery, legacy closure virtualization, malformed legacy safety.
- C1 exact-head gate: CI #307 SUCCESS on `e8d2eb05cbfba54523cf57dd5ecc407d159efb66`.

## C2 — Fixed-price approved Quote -> real Invoice
**Status:** `DONE`

**Original blocker:** actual Invoice path remained T&M and did not consume `APPROVED_QUOTE_SNAPSHOT`.

### Implemented
- Added `electric-fixed-price-invoice.js` with distinct fixed-price Invoice workflow.
- `buildInvoiceModel()` consumes only `BrunoQuoteLifecycle.invoiceBasis()` and requires `APPROVED_QUOTE_SNAPSHOT`.
- Fixed-price Invoice unavailable before Quote approval.
- Invoice carries frozen amount, approval ID/revision/time, quote metadata, applied-calculation provenance, price source and approval-time unresolved-cost state.
- Fixed-price print path never reads moving `q-total` / `chip-quote` values.
- Dedicated `Print Fixed-Price Invoice` action added to Quote lifecycle UI.
- Existing controls explicitly relabeled `Print T&M Invoice` / `Print T&M Invoice (PDF)`.
- post-approval live calculator/Catalog/Job edits cannot mutate fixed Invoice basis.

### Regression evidence
- `tests/fixed-price-invoice.test.js` covers snapshot source, frozen amount/provenance, pre-approval fail-closed, T&M separation and prohibition on live quote DOM reads.
- CI #314 SUCCESS on `bf88df0591a0c619687513edaa627cae56cada54`.

## Final integration / PWA gate
**Status:** `GREEN`

- PWA `bruno-electric-v51`.
- CORE_SHELL includes both corrective runtimes plus prior workflow-overhaul modules.
- stale owned caches v38-v50 removed; v51 and unrelated caches retained.
- Electrical Tools static load order guarantees job-scope history before Residential Live UI capture.
- temp/debug files removed.
- full v51 integration assertions included.
- pre-report integration gate CI #319 SUCCESS.

## Frozen re-audit candidate
- **FINAL CANDIDATE SHA:** `3501d94a3e10fc121e7034653956ec307964f329`
- **Exact-head CI:** run #321 — SUCCESS.
- `TESTED_HEAD_SHA=3501d94a3e10fc121e7034653956ec307964f329`
- `EXPECTED_HEAD_SHA=3501d94a3e10fc121e7034653956ec307964f329`
- deterministic suite: `593/593 passed`.
- Developer evidence: `dev-reports/WORKFLOW_OVERHAUL_V51_CORRECTIVE.md`.

## Re-audit gate
- Create separate `AUDIT ONLY` branch from the frozen SHA.
- Reproduce both original P1s independently.
- Re-run full shared workflow regression scope.
- Do not merge before accepted audit verdict.

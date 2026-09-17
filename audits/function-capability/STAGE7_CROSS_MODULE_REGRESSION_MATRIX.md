# Bruno Electric — Stage 7 Cross-Module Regression Matrix

STATUS: ACTIVE
STAGE: 7 — Cross-Module Regression Matrix
ENTRY_ACCEPTANCE_SHA: `485b3efd448f6757bdc3283f8ad3a34923c9bf10`
ENTRY_CI: Electrical Calculator Tests #714 / run id `35284021486` / SUCCESS
ENTRY_DETERMINISTIC: `822/822 passed`
ENTRY_PLAYWRIGHT: `168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed`

## Contract
Stage 7 is accepted only when each required cross-module boundary has executable evidence for both the intended mutation and the forbidden mutation. A green isolated module test is insufficient where the risk is an interaction between modules. Existing accepted evidence may be reused only when it actually crosses the boundary.

| Pair | Required invariant | Executable evidence | Current classification |
|---|---|---|---|
| Catalog ↔ Job Materials | Catalog definitions feed Job material snapshots; blank Your Cost remains unresolved; explicit zero remains resolved; recalculation can promote unresolved rows without duplicating unrelated rows | `tests/data-integrity.test.js`; `tests/catalog-job-ux-semantics.test.js`; browser `E2E-03` | PASS — EXISTING EXECUTABLE EVIDENCE |
| Job Materials ↔ Quote | Quote recommendation/cost completeness consumes current Job economics; unresolved contractor cost is disclosed rather than silently treated as zero | `tests/job-summary-semantics.test.js`; `tests/pricing-domain-guard.test.js`; `tests/quote-lifecycle.test.js`; `tests/workflow-final-integration.test.js` | PASS — EXISTING EXECUTABLE EVIDENCE |
| Quote ↔ Approved Quote | Approval snapshots current quote amount/provenance; later live edits do not mutate approved snapshot; reapproval preserves history | `tests/quote-lifecycle.test.js`; browser `E2E-08` | PASS — EXISTING EXECUTABLE EVIDENCE |
| Approved Quote ↔ Invoice | Fixed-price invoice basis comes only from immutable approved snapshot and never from moving live quote DOM; preview precedes print | `tests/fixed-price-invoice.test.js`; `tests/quote-lifecycle.test.js`; browser `E2E-08` | PASS — EXISTING EXECUTABLE EVIDENCE |
| Electrical Tasks ↔ Job Materials | Save/Calculate/Build Takeoff do not mutate Job Materials; explicit Apply does; later task edit leaves applied rows unchanged until explicit Update; update archives prior revision | `tests/electrical-task-material-takeoff.test.js`; `tests/electrical-task-archive.test.js`; browser `E2E-05`, `HUMAN-CALC-04` | PASS — EXISTING EXECUTABLE EVIDENCE |
| Residential ↔ Job Materials | Save Calculation does not mutate Job Materials; Apply replaces only residential-generated rows and preserves manual/other-source rows; provenance survives reload | `tests/residential-apply-job.test.js`; `tests/residential-save-archive-ux.test.js`; browser `E2E-04`, `HUMAN-CALC-10` | PASS — EXISTING EXECUTABLE EVIDENCE |
| Custom Materials ↔ Pricing | Customer Price and Your Cost remain distinct; blank Your Cost is unresolved; explicit zero is valid resolved cost; historical Job rows are not silently rewritten by later Catalog definition edits | `tests/custom-materials.test.js`; `tests/catalog-cost-semantics.test.js`; `tests/pricing-margins-semantics.test.js`; browser `E2E-03` | PASS — EXISTING EXECUTABLE EVIDENCE |
| Job switching ↔ scoped archives | Residential archives, Electrical Tasks and task material history remain inside the active Job and do not contaminate replacement/imported Job state | `tests/residential-history-job-scope.test.js`; `tests/electrical-task-data-integrity-master.test.js`; browser `E2E-02`, `E2E-05` | PASS — EXISTING EXECUTABLE EVIDENCE |
| Import/Export ↔ history/provenance | Export/import preserves supported Job/app state and provenance rather than rebuilding a lossy current-state approximation; invalid restore remains fail-closed | `tests/app-backup-dispatch.test.js`; browser `STAGE4-APP-BACKUP-01`, `E2E-09`, `STAGE5-FAULT-01..06` | PASS — EXISTING EXECUTABLE EVIDENCE |
| PWA update/lifecycle ↔ stored Job data | Service-worker cache lifecycle/offline/update operations must not delete or rewrite `bruno-electric-v1`; Job survives cache deletion + SW unregister/re-register + reload | new browser `STAGE7-XMOD-01` in `tests/e2e/stage7-cross-module.spec.js` plus `tests/service-worker.test.js` cache ownership | PENDING NEW EXECUTABLE EVIDENCE |

## High-risk forbidden interactions retained
- Catalog seeding may not overwrite user price/vendor metadata.
- Generated BOM replacement may not erase manual or other-source Job Materials.
- Save is not Apply for Residential or Electrical Tasks.
- Live quote changes may not rewrite Approved Quote snapshots.
- Fixed-price Invoice may not read live moving quote totals.
- Job replacement/import may not retain prior Job-scoped Electrical Tasks/materials as if they belonged to the new Job.
- Service-worker activation/cache cleanup may not touch persisted Job data.

## Stage 7 work remaining
1. Add `STAGE7-XMOD-01` as a real Chromium lifecycle journey proving stored Job data survives service-worker/cache reinstallation behavior.
2. Run the full exact-head deterministic + Chromium matrix after the new browser evidence lands.
3. If green, update this matrix to exact-head evidence status and create a separate exact-SHA Stage 7 independent audit branch.
4. Any discovered P0/P1 must be corrected on `main`, rerun exact-head CI, and independently re-audited before Stage 8 unlocks.

# Bruno Electric — Stage 7 Cross-Module Regression Matrix

STATUS: AUDIT_ACCEPTED_PENDING_AUTHORITATIVE_SYNC
STAGE: 7 — Cross-Module Regression Matrix
ENTRY_ACCEPTANCE_SHA: `485b3efd448f6757bdc3283f8ad3a34923c9bf10`
ENTRY_CI: Electrical Calculator Tests #714 / run id `35284021486` / SUCCESS
ENTRY_DETERMINISTIC: `822/822 passed`
ENTRY_PLAYWRIGHT: `168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed`
IMPLEMENTATION_SHA: `e7ac30404bf17698507ad6ea17b14f3a6fcafcf6`
IMPLEMENTATION_CI: Electrical Calculator Tests #722 / run id `35286879122` / SUCCESS
IMPLEMENTATION_DETERMINISTIC: `826/826 passed`
IMPLEMENTATION_PLAYWRIGHT: `171 scheduled / 89 passed / 82 explicit viewport-contract skips / 0 failed`
INDEPENDENT_AUDIT_BRANCH: `audit/function-capability-stage7-e7ac304`
INDEPENDENT_AUDIT_REPORT: `audits/function-capability/FUNCTION_CAPABILITY_STAGE7_AUDIT_e7ac304.md`
INDEPENDENT_AUDIT_VERDICT: `A_ACCEPT`
P0_OPEN: `0`
P1_OPEN: `0`

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
| PWA update/lifecycle ↔ stored Job data | Service-worker cache lifecycle/offline/update operations must not delete or rewrite `bruno-electric-v1`; Job survives cache deletion + SW unregister/re-register + reload | browser `STAGE7-XMOD-01` in `tests/e2e/stage7-cross-module.spec.js`; `tests/service-worker.test.js` cache ownership | PASS — NEW EXACT-HEAD EXECUTABLE EVIDENCE |

## High-risk forbidden interactions retained
- Catalog seeding may not overwrite user price/vendor metadata.
- Generated BOM replacement may not erase manual or other-source Job Materials.
- Save is not Apply for Residential or Electrical Tasks.
- Live quote changes may not rewrite Approved Quote snapshots.
- Fixed-price Invoice may not read live moving quote totals.
- Job replacement/import may not retain prior Job-scoped Electrical Tasks/materials as if they belonged to the new Job.
- Service-worker activation/cache cleanup may not touch persisted Job data.

## Stage 7 exact-head evidence
The first Stage 7 lifecycle attempt at SHA `699fc26164debde5071c8a217ff45c0b2ce6d029` correctly failed browser CI because the new test fabricated an incomplete approved-Quote lifecycle object and compared a pre-normalized seed with post-normalization storage. That was a harness defect, not a product acceptance.

At SHA `e7ac30404bf17698507ad6ea17b14f3a6fcafcf6`, the browser journey was strengthened rather than relaxed: the approved Quote is created through the real Quote UI, the persisted fully normalized Job is captured, owned Bruno caches are removed, service workers are unregistered, the app is reloaded/re-registered, and the complete parsed Job plus key cross-module provenance fields are verified unchanged. Exact-head CI #722 passed with `826/826` deterministic tests and `171 scheduled / 89 passed / 82 explicit viewport-contract skips / 0 failed` Playwright entries.

## Independent audit
Separate branch `audit/function-capability-stage7-e7ac304` was created from the exact implementation SHA. The independent report `audits/function-capability/FUNCTION_CAPABILITY_STAGE7_AUDIT_e7ac304.md` records verdict `A_ACCEPT`, P0=0, P1=0, and confirms that the PWA/service-worker path owns caches only and has no localStorage mutation path.

## Stage 7 remaining administrative gate
Synchronize authoritative `FUNCTION_CAPABILITY_AUDIT_STATE.json` and `FUNCTION_CAPABILITY_AUDIT_MASTER.md`, then run the resulting exact-head CI before Stage 8 is treated as unlocked. Until that synchronization is green, Stage 8 remains locked.
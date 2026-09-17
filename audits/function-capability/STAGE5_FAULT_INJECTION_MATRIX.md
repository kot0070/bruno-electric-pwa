# Bruno Electric — Stage 5 Negative / Fault-Injection Matrix

STATUS: PRE_AUDIT_READY
STAGE: 5 — Negative / Fault Injection
ENTRY_BASELINE_SHA: `eaf0f4d096d0b207cc27f17675e384e6d6a4099b`
ENTRY_ACCEPTANCE_CI: Electrical Calculator Tests #611 / run id `35244328100` / SUCCESS
IMPLEMENTATION_EVIDENCE_SHA: `7c009e6c049b751f9c71bfd356ed3a7984895a8b`
EXACT_HEAD_CI: Electrical Calculator Tests #621 / run id `35255969691` / SUCCESS
DETERMINISTIC: `806/806 passed`
BROWSER_REGRESSION_GATE: `105 scheduled / 41 passed / 64 explicit viewport-contract skips / 0 failed`

## Purpose
Stage 5 verifies that malformed, partial, stale, unsupported and fault-injected operations fail closed, preserve valid current state, or perform an explicit no-op/recovery. This matrix reuses strong executable negative evidence from accepted earlier stages where the exact failure contract already exists, and adds Stage 5-specific fault injection where prior evidence was insufficient. It does not unlock Stage 6 until the documentation SHA passes exact-head CI and an independent exact-SHA Stage 5 audit returns P0=0/P1=0.

## Required fault classes

| Fault class | Expected contract | Executable evidence | Stage 5 status |
|---|---|---|---|
| Malformed full-app JSON | Reject before mutation; current Job/app state remains intact | `tests/e2e/fault-injection-stage5.spec.js` · `STAGE5-FAULT-01` | VERIFIED_GREEN |
| Wrong import type | Reject app-vs-job mismatch without mutation | `tests/e2e/fault-injection-stage5.spec.js` · `STAGE5-FAULT-02`; import type guards in `index.html` | VERIFIED_GREEN |
| Incomplete full-app backup | Missing saved Job is invalid; reject and preserve current state | `tests/app-backup-dispatch.test.js`; `STAGE5-FAULT-03` | CORRECTIVE_VERIFIED_GREEN |
| Partial local-storage write failure during app restore | Restore behaves transactionally; rollback prior writes and preserve old state | `tests/app-backup-dispatch.test.js` injected storage failure | CORRECTIVE_VERIFIED_GREEN |
| Invalid app sub-block shape | Reject before any write | `tests/app-backup-dispatch.test.js` invalid `dispatchJournalV3` block | VERIFIED_GREEN |
| User cancels valid app restore | Explicit no-op; no state mutation/reload | `STAGE5-FAULT-04` | VERIFIED_GREEN |
| Oversized app backup | Reject >8 MB before parsing or mutation | `STAGE5-FAULT-05` | VERIFIED_GREEN |
| Malformed single-Job JSON | Reject malformed Job JSON and preserve current Job | `STAGE5-FAULT-06` | VERIFIED_GREEN |
| Repeated valid app restore | Idempotent state; no duplication/drift | `tests/app-backup-dispatch.test.js` repeated restore | VERIFIED_GREEN |
| Failed Electrical Task Update | Roll back active materials/history; no partial mutation | `tests/electrical-task-archive.test.js` · `failed Update Job rolls back active materials/history transaction` | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Stale/missing task ID | Reject invalid active-Job lookup and preserve active Job scope | `tests/electrical-task-archive.test.js`, task CRUD/integrity tests, accepted E2E-10 | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Unsupported/impossible raceway | Return `NO SUPPORTED CONFIGURATION`; never invent a supported result | `tests/electrical-raceway-engine.test.js`: impossible fill, PVC80, XHHW2, OTHER, unsupported shared strategy | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Unsupported calculator/configuration inputs | Input error / unsupported review state rather than successful-looking defaults | calculator/Phase 3/task-engine negative suites + accepted Stage 4 rendered blank/unsupported evidence | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Optional service-worker asset failure | Optional icon/cache failure must not abort core-shell install | `tests/service-worker.test.js` Stage 5 optional asset fault | VERIFIED_GREEN |
| Core service-worker shell failure | Installation must reject; do not activate incomplete new shell | `tests/service-worker.test.js` Stage 5 core-cache failure | VERIFIED_GREEN |
| Stale cache cleanup | Delete only owned stale Bruno Electric caches; preserve current/unrelated caches | `tests/service-worker.test.js` activation cache ownership test; E2E-12 | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Repeated BOM/source replacement | Idempotent source replacement; preserve manual/other-source rows | `tests/electric-bom.test.js` | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Repeated task material apply | Idempotent reapply with revision/provenance guards | `tests/electrical-task-material-takeoff.test.js` | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Cross-Job/stale revision material apply | Reject rather than mutate wrong Job or stale task revision | task material takeoff/data-integrity suites | EXISTING_EXECUTABLE_EVIDENCE_GREEN |

## Current Stage 5 corrective
The initial fault-injection review found a real full-app restore integrity gap: a structurally app-typed payload could omit the saved Job, and storage writes were not transactional if local storage failed after one or more keys were written. Stage 5 corrective work now requires a valid Job/state object before any restore, validates optional backup blocks before mutation, and performs all local-storage writes through rollback-capable transactional logic. The real browser import path reloads only after successful completion.

Corrective production commit: `bed87c9134c0341e72f9bbe0c7b5f4c7693ff10f`.

## Browser harness integrity
Stage 5 import fault tests seed local state once per browser context using a session marker. An unexpected production reload therefore cannot silently reseed the expected state and hide a destructive import defect.

Two intermediate red runs were harness-only and are not accepted evidence:
- #619 serialized an 8+ MB Playwright `Buffer` through `setInputFiles` and timed out before Bruno Electric handled the file;
- #620 moved the file creation into the browser but deadlocked because the synchronous oversized-file `alert()` blocked `page.evaluate()` before the test could accept the dialog.

The expectation was never weakened. The final harness creates the >8 MB `File` browser-side, registers and accepts the dialog before dispatch, and proves the production size guard preserves state. Exact-head #621 is green with this contract.

## Exact-head implementation evidence
Electrical Calculator Tests #621 / run id `35255969691` executed the exact implementation SHA `7c009e6c049b751f9c71bfd356ed3a7984895a8b` with matching tested/expected provenance.

- deterministic: `806/806 passed`;
- Playwright: `105 scheduled / 41 passed / 64 explicit viewport-contract skips / 0 failed`;
- all six Stage 5 import fault journeys passed on their desktop-owned browser contract;
- the existing Stage 3/4 browser regressions remained green in the same run.

## Remaining gate
- Synchronize the authoritative state/master with this evidence.
- Run deterministic + full Chromium Playwright suite on that documentation SHA.
- Create a separate exact-SHA Stage 5 independent audit branch only after the documentation SHA is green.
- Correct every P0/P1 and re-audit before Stage 6 unlock.

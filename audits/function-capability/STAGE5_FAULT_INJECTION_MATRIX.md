# Bruno Electric — Stage 5 Negative / Fault-Injection Matrix

STATUS: ACTIVE
STAGE: 5 — Negative / Fault Injection
ENTRY_BASELINE_SHA: `eaf0f4d096d0b207cc27f17675e384e6d6a4099b`
ENTRY_ACCEPTANCE_CI: Electrical Calculator Tests #611 / run id `35244328100` / SUCCESS

## Purpose
Stage 5 verifies that malformed, partial, stale, unsupported and fault-injected operations fail closed, preserve valid current state, or perform an explicit no-op/recovery. This matrix reuses strong executable negative evidence from accepted earlier stages where the exact failure contract already exists, and adds Stage 5-specific fault injection where prior evidence was insufficient. It does not unlock Stage 6 until exact-head CI and an independent Stage 5 audit return P0=0/P1=0.

## Required fault classes

| Fault class | Expected contract | Executable evidence | Stage 5 status |
|---|---|---|---|
| Malformed full-app JSON | Reject before mutation; current Job/app state remains intact | `tests/e2e/fault-injection-stage5.spec.js` · `STAGE5-FAULT-01` | NEW_EVIDENCE_PENDING_EXACT_HEAD_CI |
| Wrong import type | Reject app-vs-job mismatch without mutation | `tests/e2e/fault-injection-stage5.spec.js` · `STAGE5-FAULT-02`; existing import type guards in `index.html` | NEW_EVIDENCE_PENDING_EXACT_HEAD_CI |
| Incomplete full-app backup | Missing saved Job is invalid; reject and preserve current state | `tests/app-backup-dispatch.test.js`; `STAGE5-FAULT-03` | CORRECTIVE_IMPLEMENTED_PENDING_EXACT_HEAD_CI |
| Partial local-storage write failure during app restore | Restore behaves transactionally; rollback prior writes and preserve old state | `tests/app-backup-dispatch.test.js` injected storage failure | CORRECTIVE_IMPLEMENTED_PENDING_EXACT_HEAD_CI |
| Invalid app sub-block shape | Reject before any write | `tests/app-backup-dispatch.test.js` invalid `dispatchJournalV3` block | NEW_EVIDENCE_PENDING_EXACT_HEAD_CI |
| User cancels valid app restore | Explicit no-op; no state mutation/reload | `STAGE5-FAULT-04` | NEW_EVIDENCE_PENDING_EXACT_HEAD_CI |
| Repeated valid app restore | Idempotent state; no duplication/drift | `tests/app-backup-dispatch.test.js` repeated restore | NEW_EVIDENCE_PENDING_EXACT_HEAD_CI |
| Failed Electrical Task Update | Roll back active materials/history; no partial mutation | `tests/electrical-task-archive.test.js` · `failed Update Job rolls back active materials/history transaction` | EXISTING_EXECUTABLE_EVIDENCE |
| Stale/missing task ID | Reject invalid active-Job lookup and preserve active Job scope | `tests/electrical-task-archive.test.js`, task CRUD/integrity tests, accepted E2E-10 | EXISTING_EXECUTABLE_EVIDENCE |
| Unsupported/impossible raceway | Return `NO SUPPORTED CONFIGURATION`; never invent a supported result | `tests/electrical-raceway-engine.test.js`: impossible fill, PVC80, XHHW2, OTHER, unsupported shared strategy | EXISTING_EXECUTABLE_EVIDENCE |
| Unsupported calculator/configuration inputs | Input error / unsupported review state rather than successful-looking defaults | calculator/Phase 3/task-engine negative suites + accepted Stage 4 rendered blank/unsupported evidence | EXISTING_EXECUTABLE_EVIDENCE |
| Optional service-worker asset failure | Optional icon/cache failure must not abort core-shell install | `tests/service-worker.test.js` Stage 5 optional asset fault | NEW_EVIDENCE_PENDING_EXACT_HEAD_CI |
| Core service-worker shell failure | Installation must reject; do not activate incomplete new shell | `tests/service-worker.test.js` Stage 5 core-cache failure | NEW_EVIDENCE_PENDING_EXACT_HEAD_CI |
| Stale cache cleanup | Delete only owned stale Bruno Electric caches; preserve current/unrelated caches | `tests/service-worker.test.js` activation cache ownership test; E2E-12 | EXISTING_EXECUTABLE_EVIDENCE |
| Repeated BOM/source replacement | Idempotent source replacement; preserve manual/other-source rows | `tests/electric-bom.test.js` | EXISTING_EXECUTABLE_EVIDENCE |
| Repeated task material apply | Idempotent reapply with revision/provenance guards | `tests/electrical-task-material-takeoff.test.js` | EXISTING_EXECUTABLE_EVIDENCE |
| Cross-Job/stale revision material apply | Reject rather than mutate wrong Job or stale task revision | task material takeoff/data-integrity suites | EXISTING_EXECUTABLE_EVIDENCE |

## Current Stage 5 corrective
The initial fault-injection review found a real full-app restore integrity gap: a structurally app-typed payload could omit the saved Job, and storage writes were not transactional if local storage failed after one or more keys were written. Stage 5 corrective work now requires a valid Job/state object before any restore, validates optional backup blocks before mutation, and performs all local-storage writes through rollback-capable transactional logic. The real browser import path reloads only after successful completion.

## Browser harness integrity
Stage 5 import fault tests seed local state once per browser context using a session marker. An unexpected production reload therefore cannot silently reseed the expected state and hide a destructive import defect.

## Remaining gate
- Run deterministic + full Chromium Playwright suite on one exact current `main` SHA.
- Resolve any red result without weakening fault expectations.
- Refresh this matrix/state with exact run counts only after green CI.
- Create a separate exact-SHA Stage 5 independent audit branch.
- Correct every P0/P1 and re-audit before Stage 6 unlock.

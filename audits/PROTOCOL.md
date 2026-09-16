# Bruno Electric — Independent Audit Protocol

MODE: AUDIT ONLY

The auditor must independently inspect the pinned production HEAD and may write only the designated audit report on this audit branch.

## Prohibited
- No production-code edits.
- No writes to `main` from audit role.
- No PR creation/edit/merge from audit role.
- Do not accept developer reports, prior audits, or green CI as proof.

## Required method
1. Verify exact `AUDITED_HEAD_SHA` from `TASK_CURRENT.md`.
2. Independently trace runtime/data paths.
3. Verify exact-head CI provenance and deterministic suite result.
4. Reproduce/trace every prior P0/P1 family listed in the task.
5. Verify save/reload/import/export/Job A-B boundaries where relevant.
6. Re-check quote/customer-price/document paths against immutable snapshots.
7. Re-check PWA/bootstrap/shared regressions touched by prior corrective work.

## Verdict
- A — ACCEPT: no P0/P1.
- B — ACCEPT AFTER MINOR FIXES: no P0/P1, only bounded P2.
- C — REJECT / REWORK REQUIRED: one or more P0/P1.

Write complete evidence to REPORT_PATH. Audit chat/handoff output is only verdict, audited SHA, blockers, report path.

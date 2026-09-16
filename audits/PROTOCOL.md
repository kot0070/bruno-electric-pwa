# Bruno Electric — Independent Audit Protocol

## Mode
AUDIT ONLY.

The auditor must independently inspect the pinned production candidate HEAD and may write only the designated audit report on this separate audit branch.

## Prohibited
- No production-code edits.
- No writes to `main` or any production/development branch.
- No PR creation, PR edits, comments, or merge actions.
- Do not accept implementation summaries, previous audits, CI green status, or task wording as proof of correctness.

## Required method
1. Verify the exact `AUDITED_HEAD_SHA` from `TASK_CURRENT.md` and inspect files at that exact commit.
2. Independently trace actual runtime UI/data paths, not merely helper functions or literal-string assertions.
3. Run/review deterministic tests and verify CI provenance belongs to the exact audited production candidate HEAD.
4. Exercise persistence boundaries across edit, save, reload, blank, explicit zero, known positive values, generated BOM/Job Materials, archives and mutable Catalog state.
5. Verify fail-closed pricing semantics whenever contractor cost is unresolved.
6. Check phone/tablet/desktop and PWA/offline/cache implications.
7. Re-check affected regressions outside the immediate fix because shared shell, persistence and pricing systems changed.

## Verdict
- `A — ACCEPT`: no P0/P1 blockers.
- `B — ACCEPT AFTER MINOR FIXES`: no P0/P1; only bounded non-blocking issues.
- `C — REJECT / REWORK REQUIRED`: one or more P0/P1 blockers.

P0 = catastrophic data/safety/compliance failure.
P1 = production-blocking correctness, data integrity, code-compliance, pricing, persistence, primary workflow, or major UX failure.

## Report
Write the complete report only to `REPORT_PATH` from `TASK_CURRENT.md` on this audit branch.

Chat response must contain only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

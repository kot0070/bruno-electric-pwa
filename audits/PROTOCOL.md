# Bruno Electric — Independent Audit Protocol

## Mode
AUDIT ONLY.

The auditor must independently inspect the pinned production HEAD and may write only the designated audit report on this separate audit branch.

## Prohibited
- No production-code edits.
- No writes to `main`, `dev/custom-special-order-materials`, or any production/dev branch.
- No PR creation, PR edits, PR comments, review comments, or merge actions.
- Do not accept the developer report, previous audits, CI green status, master-plan wording, or test names as proof of correctness.
- Do not weaken acceptance criteria to obtain a passing verdict.

## Required method
1. Verify the exact `AUDITED_HEAD_SHA` from `TASK_CURRENT.md` and inspect runtime files at that exact commit.
2. Independently trace real production UI/data paths, persistence boundaries, and calculation flows. Literal-string assertions alone are insufficient.
3. Inspect deterministic tests for blind spots; verify GitHub Actions tested the exact audited PR HEAD.
4. Recompute representative mathematical cases independently from implementation code where practical.
5. For NEC/code semantics, distinguish actual code-derived requirements from estimating/design assumptions and verify fail-closed behavior when required inputs are missing.
6. Exercise Save/Reload/Duplicate/archive/import/new-job boundaries and mutable Catalog/settings/helper changes.
7. Verify unresolved cost never silently becomes numeric zero in contractor cost/profit paths.
8. Verify historical snapshots remain immutable when live Catalog/calculator data changes.
9. Verify phone/tablet/desktop usability and PWA/offline/cache migration implications.
10. Re-check shared regressions outside the immediate feature because navigation, persistence, Job totals, Quote lifecycle and service worker are shared systems.
11. If a finding is P0/P1, identify the exact runtime path, reproducible condition, affected data/state, and why it blocks production.

## Severity / Verdict
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

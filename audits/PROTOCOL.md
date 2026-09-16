# Bruno Electric — Independent Audit Protocol

## Mode
AUDIT ONLY.

The auditor must independently inspect the pinned production candidate HEAD and may write only the designated audit report on the separate audit branch.

## Prohibited
- No production-code edits.
- No writes to `main` or any development branch.
- No PR creation, PR edits, comments, or merge actions.
- Do not accept developer summaries, previous audits, CI green status, or task wording as proof of correctness.

## Required method
1. Verify the exact `AUDITED_HEAD_SHA` from `TASK_CURRENT.md` and inspect files at that exact commit.
2. Trace real runtime/data paths independently, not merely helper functions or literal-string assertions.
3. Verify deterministic tests and CI provenance belong to the exact audited HEAD.
4. Exercise persistence across Save, reload, edit, repeat Add-to-Job, delete, import/export-relevant job state, and Catalog changes.
5. Preserve the pricing-integrity contract: blank/missing Your Cost is unresolved; explicit numeric 0 is known zero; unresolved cost must not enter project/quote cost math.
6. Re-check shared regressions where changed modules touch Catalog, Job Materials, project totals, navigation, persistence, responsive UI, and PWA/offline behavior.
7. Treat phone/tablet/desktop behavior as part of the release contract for the custom-material UI.

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

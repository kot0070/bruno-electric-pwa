# Bruno Electric — Independent Audit Protocol

## Mode
AUDIT ONLY.

The auditor must independently inspect the pinned production HEAD and may write only the designated audit report on the separate audit branch.

## Prohibited
- No production-code edits.
- No writes to `main` or dev branches.
- No PR creation/edit/comment/merge.
- Do not accept developer report, previous audit, or green CI as proof.

## Required method
1. Verify exact `AUDITED_HEAD_SHA` from `TASK_CURRENT.md` and inspect that commit.
2. Independently trace runtime/data/math paths, not only literal-string tests.
3. Verify exact-head CI provenance and deterministic suite result.
4. Reproduce every prior P1 blocker directly.
5. Verify persisted/imported malformed and adversarial state where applicable.
6. Re-check shared pricing, Quote, Invoice, Residential Live, PWA/cache and regression contracts affected by the fixes.
7. Distinguish NEC/code-driven math from Bruno estimating assumptions.

## Verdict
- `A — ACCEPT`: no P0/P1 blockers.
- `B — ACCEPT AFTER MINOR FIXES`: no P0/P1; only bounded non-blocking issues.
- `C — REJECT / REWORK REQUIRED`: one or more P0/P1 blockers.

P0 = catastrophic data/safety/compliance failure.
P1 = production-blocking correctness, data-integrity, pricing, persistence, primary-workflow, code-compliance, or major UX failure.

## Report
Write the complete report only to `REPORT_PATH` from `TASK_CURRENT.md` on this audit branch.

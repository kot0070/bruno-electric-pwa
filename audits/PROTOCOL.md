# Independent Audit Protocol — Bruno Electric

## Mode
AUDIT ONLY.

The auditor must inspect the pinned production candidate independently and must not implement fixes.

## Pinned SHA discipline
- Audit only the exact `AUDITED_HEAD_SHA` defined in `audits/TASK_CURRENT.md`.
- Do not substitute PR merge refs, branch tips, later commits, or local assumptions.
- Confirm the commit exists and inspect its exact code.

## CI discipline
- CI success is supporting evidence, not a substitute for runtime/data-path inspection.
- When exact-head provenance is required, inspect the checkout/job logs and confirm the actual checked-out HEAD equals the pinned audited SHA.
- A green synthetic PR merge commit does not satisfy an exact-head requirement.

## Required audit method
Independently trace:
- UI event path;
- state mutation path;
- persisted storage path;
- reload/rehydration path;
- calculation consumers;
- history/archive boundaries;
- cache/service-worker path.

Test the negative/failure cases as well as nominal cases. Do not rely solely on developer tests or report claims.

## Persistence / pricing safety
Fail closed on unresolved contractor costs. Explicit numeric zero is distinct from blank/missing cost. Customer Price must never silently substitute for unresolved Your Cost.

For data-integrity features, verify same-session stale-state writes, reload behavior, repeat operations, and historical immutability.

## Regression scope
Recheck relevant shared behavior including Commercial/Residential isolation, Project Calculator, Residential Live, BOM/Job Materials, Catalog/Pricing, Journal history, responsive navigation, and PWA/offline cache behavior.

## Allowed writes
The auditor may write only the report path designated by `TASK_CURRENT.md` on the audit branch.

## Prohibited actions
Do not:
- modify production code;
- modify the source dev branch;
- write to `main`;
- create/edit/merge/close the source PR;
- merge any branch;
- change production data or release state.

## Severity / verdict
- P0: catastrophic/security/destructive blocker.
- P1: release-blocking correctness, data-integrity, primary-workflow, regulatory, persistence, or required-release-evidence defect.
- P2/P3: non-blocking minor/improvement issue.

Verdict:
- A — ACCEPT: no P0/P1.
- B — ACCEPT AFTER MINOR FIXES: no P0/P1.
- C — REJECT / REWORK REQUIRED: at least one P0/P1.

## Required chat response
Return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

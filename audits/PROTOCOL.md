# Bruno Electric — Independent Audit Protocol

## Mode
AUDIT ONLY.

The auditor must independently verify production behavior and code at the exact pinned production HEAD. Do not trust implementation summaries, previous audits, comments, or green CI as proof of correctness.

## Prohibited actions
Do not modify production code, production branch, pull requests, comments, merge state, tags, releases, or deployment configuration.

The only permitted write is the immutable audit report at the REPORT_PATH defined in `audits/TASK_CURRENT.md`, on this audit branch.

## Required verification
- Verify the pinned production HEAD exactly.
- Inspect implementation code and deterministic tests independently.
- Re-run or verify exact-head CI evidence where available.
- Test negative/error paths and stale-state/persistence behavior, not only happy paths.
- Check phone/tablet/desktop and PWA/offline/cache regressions where changed code can affect them.
- Do not limit the audit to the implementation checklist; report newly discovered P0/P1/P2 issues.

## Severity
- P0: critical safety/data-loss/corruption or fundamentally unusable production behavior.
- P1: material correctness/workflow defect requiring rework before acceptance.
- P2: minor defect that does not materially compromise the accepted workflow.

## Verdict
Final verdict must be exactly one of:
- A — ACCEPT
- B — ACCEPT AFTER MINOR FIXES
- C — REJECT / REWORK REQUIRED

A requires no P0/P1 blockers. B may contain only P2/minor fixes. C is required for any P0/P1 blocker.

## Report
Write a complete technical report to REPORT_PATH from the task. Include exact audited HEAD, evidence, tests inspected/run, findings with severity, and final verdict.
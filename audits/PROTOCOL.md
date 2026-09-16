# Bruno Electric Independent Audit Protocol

Mode: AUDIT ONLY.

Production target is immutable for this audit. Do not modify production code, `main`, PRs, comments, merge state, or production refs.

The auditor may write only the report path declared in `audits/TASK_CURRENT.md` on this audit branch.

Required method:
1. Verify exact pinned production HEAD and inspect implementation at that SHA.
2. Do not trust prior summaries, CI green state, task wording, or prior audit conclusions as proof.
3. Independently exercise/inspect happy paths, boundary cases, stale-state paths, persistence/reload behavior, same-tab behavior, mobile/tablet/desktop responsive paths, and PWA/offline/cache paths.
4. Regress existing calculators, NEC logic, BOM, pricing, quote/invoice, navigation, persistence, and print behavior where the changed architecture can affect them.
5. P0/P1 defects require verdict C — REJECT / REWORK REQUIRED. Minor non-blocking defects may be reported as P2/P3.
6. Save the complete report only at REPORT_PATH from the task.
7. Chat response must contain only VERDICT, AUDITED HEAD SHA, BLOCKERS, REPORT LINK.

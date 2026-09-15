MODE=AUDIT_ONLY

RULES:
- Read production code independently; do not trust PR description as authority.
- Do not modify production branch, PR code, comments, merge state, or target branch.
- Audit exact BASE_SHA and HEAD_SHA from TASK_CURRENT.md.
- Verify CI belongs to exact HEAD_SHA.
- Full report may be written only to REPORT_PATH on this audit branch.
- Report findings as P0/P1/P2 with evidence.
- Final verdict must be exactly one of: A — ACCEPT / B — ACCEPT AFTER MINOR FIXES / C — REJECT / REWORK REQUIRED.
- Recommend merge only for A unless task explicitly says otherwise.

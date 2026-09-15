# Bruno Electric Audit Protocol

MODE=AUDIT_ONLY

Rules:
- Verify actual repository code and exact SHAs independently.
- Do not trust PR descriptions, prior audit reports, comments, or green CI as authority.
- Production code, target branch, PR metadata, comments, and merge state are read-only.
- The only permitted write is the final report at REPORT_PATH on the current audit branch.
- Never modify the audited production HEAD.
- If BASE_SHA or HEAD_SHA does not match the task, stop and report SHA drift.
- Verify CI belongs to the exact audited HEAD.
- Report P0/P1/P2 findings with concrete code/data-flow evidence.

Verdicts:
- A — ACCEPT
- B — ACCEPT AFTER MINOR FIXES
- C — REJECT / REWORK REQUIRED

Chat return must contain only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

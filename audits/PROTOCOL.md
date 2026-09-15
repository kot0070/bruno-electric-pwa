# Bruno Electric Audit Protocol

MODE=AUDIT_ONLY

Rules:
- Verify actual repository state and production code independently.
- Do not trust PR descriptions, prior audit summaries, comments, or green CI as authority.
- Do not modify production code, target branch, PR metadata/comments, merge state, or release state.
- Audit exact base/head SHAs from TASK_CURRENT.md.
- If exact SHA contract does not match, stop and return SHA mismatch.
- Full reports are immutable and stored only in the designated audit branch/report path.
- Verdicts: A — ACCEPT; B — ACCEPT AFTER MINOR FIXES; C — REJECT / REWORK REQUIRED.
- A requires zero P0/P1 blockers.
- Report concise evidence for each acceptance invariant and identify regression risks.

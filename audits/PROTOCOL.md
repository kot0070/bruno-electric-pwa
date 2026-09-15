MODE=AUDIT_ONLY

RULES:
- READ production PR/code/tests/CI independently.
- DO NOT write production code.
- DO NOT modify PR metadata/comments/reviews.
- DO NOT merge.
- DO NOT change target or feature branches.
- The only permitted write is the final audit report to REPORT_PATH on the current audit branch.
- Verify exact BASE_SHA and HEAD_SHA before auditing.
- Treat implementation, not PR description or prior summaries, as authority.
- Verify CI belongs to exact HEAD_SHA.
- Report P0/P1/P2 findings with concrete evidence.

VERDICTS:
- A — ACCEPT
- B — ACCEPT AFTER MINOR FIXES
- C — REJECT / REWORK REQUIRED

CHAT_RETURN:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

REPORT:
- Save one immutable Markdown report at TASK REPORT_PATH.
- Include SHA integrity, scope verification, findings, regression/CI status, final verdict, final merge recommendation.

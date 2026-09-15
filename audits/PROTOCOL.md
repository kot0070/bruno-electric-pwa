# BRUNO ELECTRIC — INDEPENDENT AUDIT PROTOCOL

MODE=AUDIT_ONLY

RULES:
- Production code is READ ONLY.
- Target PR/branch is READ ONLY.
- Do not commit to production/dev branches.
- Do not edit PR title/body/comments/review state.
- Do not merge.
- Verify actual code and exact SHAs independently; PR descriptions, prior summaries and green CI are evidence, not authority.
- The only permitted write is the immutable full audit report at TASK_CURRENT.REPORT_PATH on the current audit branch.
- If exact BASE_SHA or HEAD_SHA do not match task contract, stop with VERDICT=C and report SHA drift.

SEVERITY:
- P0 = catastrophic / unsafe / data-loss / unusable.
- P1 = acceptance blocker or material functional/architectural defect.
- P2 = minor/non-blocking issue.

VERDICT:
- A — ACCEPT: no P0/P1, acceptance contract satisfied.
- B — ACCEPT AFTER MINOR FIXES: no P0/P1 but material P2 cleanup remains.
- C — REJECT / REWORK REQUIRED: any P0/P1 or SHA/scope integrity failure.

REPORT_REQUIREMENTS:
- exact audited base/head
- files/diff independently inspected
- acceptance matrix PASS/FAIL
- P0/P1/P2 findings with evidence
- CI exact-head verification
- regression/scope assessment
- final verdict and merge recommendation

CHAT_OUTPUT_ONLY:
VERDICT=<A|B|C + label>
AUDITED_HEAD_SHA=<sha>
BLOCKERS=<none or compact blockers>
REPORT_LINK=<github link>

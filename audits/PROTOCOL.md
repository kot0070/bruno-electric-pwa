# AUDIT PROTOCOL

MODE=AUDIT_ONLY

Rules:
- Production PR branch, production code, PR metadata/comments, target branch and merge state are READ ONLY.
- Auditor may write only the immutable report requested by TASK_CURRENT.md on this audit branch.
- Verify exact base SHA and exact production HEAD SHA before evaluating.
- If production HEAD drifted from required HEAD, verdict C.
- Do not trust PR description, previous summaries, previous audits, comments, or green CI as authority; independently inspect implementation and exact-head CI.
- Independently verify current official Texas TDLR requirements relevant to proposals, invoices and written contracts.
- Discover and inspect every customer-facing document/print/form path in the repository, not only previously reported defects.
- Severity: P0 critical/blocking, P1 acceptance blocker, P2 minor/non-blocking.
- Verdict A = accept, no P0/P1 blockers.
- Verdict B = accept after minor fixes; do not merge until fixed and re-audited.
- Verdict C = reject/rework required.
- In chat return only VERDICT, AUDITED HEAD SHA, BLOCKERS, REPORT LINK.

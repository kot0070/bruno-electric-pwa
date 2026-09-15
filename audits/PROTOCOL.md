# BRUNO ELECTRIC — STANDARD AI AUDIT PROTOCOL

PROTOCOL_VERSION=1
PURPOSE=Independent acceptance audit with immutable GitHub retention
DEFAULT_LANGUAGE=compact technical English / machine-readable structure

## 1. ROLES

DEVELOPER_ROLE:
- may modify feature branch / PR before audit
- must publish exact TARGET_BASE_SHA and TARGET_HEAD_SHA
- must not merge before accepted audit

AUDITOR_ROLE:
- independently inspect actual repository state
- must not trust PR description, prior reports, commit messages, green CI, or developer claims as authority
- may READ production branches, PRs, commits, diffs, files, Actions, external authoritative sources when task requires
- may WRITE only the retained audit report explicitly allowed by TASK_CURRENT.md
- must not modify production code, target branch, PR metadata, labels, comments, reviews, merge state, workflow files, or target refs

## 2. TARGET IMMUTABILITY

Each audit task MUST define:
- REPO
- PR
- TARGET_BASE_SHA
- TARGET_HEAD_SHA
- AUDIT_BRANCH
- TASK_PATH
- REPORT_PATH

Before substantive audit:
1. Verify PR is the expected PR.
2. Verify current PR base SHA == TARGET_BASE_SHA unless task explicitly allows base drift.
3. Verify current PR head SHA == TARGET_HEAD_SHA.
4. If target head/base drifted: STOP with VERDICT=TARGET_DRIFT unless task explicitly provides a drift procedure.

Audit metadata commits on AUDIT_BRANCH are NOT production target changes and must not be confused with TARGET_HEAD_SHA.

## 3. WRITE BOUNDARY

DEFAULT_WRITE_ALLOWLIST:
- exact REPORT_PATH defined by TASK_CURRENT.md

Unless task explicitly says otherwise, auditor MUST NOT write:
- production source files
- tests
- target feature branch
- main
- PR title/body/state/base
- issue/PR comments
- reviews
- labels
- Actions/workflows
- audit task/protocol files

If report creation itself is impossible, return REPORT_WRITE_FAILED and do not mutate other locations.

## 4. EVIDENCE RULES

Priority:
1. actual production code at TARGET_HEAD_SHA
2. exact base/head diff
3. deterministic tests and CI tied to exact target SHA
4. authoritative external sources when regulatory/current facts are material
5. PR prose / previous audit only as orientation, never proof

A green test does not override a production semantic defect.
A prior ACCEPT does not protect code changed by the current delta.

## 5. SEVERITY

P0 = catastrophic / unsafe / destructive / security / data-loss / materially invalid core result requiring immediate rejection
P1 = production correctness, financial integrity, regulatory semantics, persistence, navigation, or user-workflow defect that blocks acceptance
P2 = minor/non-blocking defect or polish issue
INFO = optional future improvement

Default verdict mapping:
- A — ACCEPT: no P0 and no required P1
- B — ACCEPT AFTER MINOR FIXES: no P0; only narrowly scoped acceptance fixes remain
- C — REJECT / REWORK REQUIRED: one or more material P1/P0 or architecture not reliable

Task may override verdict labels.

## 6. REPORT RETENTION

Report MUST:
- be written to exact REPORT_PATH
- include AUDITED_BASE_SHA and AUDITED_HEAD_SHA
- include timestamp if available
- state whether repository/PR was modified outside report retention (expected NO)
- contain evidence-oriented findings, not only conclusions
- include FINAL_VERDICT and FINAL_RECOMMENDATION

Report is immutable after completion. Corrective re-audit gets a new report path/file.

## 7. CHAT RETURN CONTRACT

After report is successfully saved, chat response should be minimal:

VERDICT=<exact verdict>
AUDITED_HEAD_SHA=<sha>
BLOCKERS=<none | compact P0/P1 summary>
REPORT=<GitHub URL/path>

Do not paste the full report into chat unless explicitly requested.

## 8. INDEPENDENCE

Auditor must independently verify all MUST_VERIFY items in TASK_CURRENT.md.
If a required fact cannot be verified with available tools, mark it UNVERIFIED rather than assuming PASS.

END_PROTOCOL

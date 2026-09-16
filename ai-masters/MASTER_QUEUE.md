# Bruno Electric — Autonomous AI Master Queue

## Purpose
This branch is planning/orchestration only. It MUST NOT modify PR #14 production code or invalidate an accepted/frozen candidate.

## Current accepted candidate
`7da0d0ef02858bf891e8f327e02312f7a80f6751`

Accepted math re-audit:
`audit/electrical-math-v52-7da0d0e/audits/reports/ELECTRICAL_MATH_V52_7da0d0e.md`

Math exact-head CI:
- run #345
- 622/622 deterministic tests PASS
- tested SHA = expected SHA = accepted candidate

PR #14 state: OPEN / NOT MERGED.
Merge remains a user decision.

## Execution state machine
`WORKFLOW_OVERHAUL -> WORKFLOW_CORRECTIVE -> WORKFLOW_REAUDIT -> ELECTRICAL_MATH_AUDIT -> MATH_CORRECTIVE -> MATH_REAUDIT -> NEC_DOCUMENTS_AUTONOMOUS_MASTER -> DATA_INTEGRITY_PERSISTENCE_MASTER -> RESPONSIVE_PWA_UX_MASTER -> NEXT_PRODUCT_MASTER`

## Completed masters
- Workflow overhaul/corrective/re-audit: ACCEPTED.
- Electrical Math Audit + Corrective + exact-SHA Re-Audit: **A ACCEPT** on `7da0d0ef02858bf891e8f327e02312f7a80f6751`.

## CURRENT MASTER
`05_NEC_DOCUMENTS_SOURCES_AUTONOMOUS_MASTER_V52.md`

Current stage inside that master:
`ND1_CLAIM_INVENTORY`

Start target SHA:
`7da0d0ef02858bf891e8f327e02312f7a80f6751`

## Handoff contract
Every AI chat must leave enough state in GitHub for another chat to continue without asking the user to restate context. Every master/report must include:
- ROLE: IMPLEMENT / AUDIT ONLY / CORRECTIVE / RE-AUDIT / AUTONOMOUS CYCLE
- repository + branch
- exact TARGET_SHA
- immutable scope and exclusions
- inputs/read-first files
- invariants
- required runtime/data-path checks
- required tests/evidence
- output/report path
- next action on PASS/BLOCKER
- explicit merge policy

## Strict continuation rule
1. Read this file.
2. Read the CURRENT MASTER.
3. Execute only its `CURRENT_STAGE`.
4. Finish its gate and leave evidence.
5. Reread the master before advancing.
6. Do not send stage-by-stage user reports when the master says consolidated-report-only.
7. Never merge automatically.

## Queued masters
1. `05_NEC_DOCUMENTS_SOURCES_AUTONOMOUS_MASTER_V52.md` — CURRENT
   Full autonomous claim/source/edition/jurisdiction/fail-closed audit cycle with corrective and re-audit stages if needed.
2. `03_DATA_INTEGRITY_PERSISTENCE_AUDIT_MASTER.md`
   Cross-job, import/export, archive, historical snapshot, migrations and localStorage schema integrity.
3. `04_RESPONSIVE_PWA_UX_AUDIT_MASTER.md`
   Phone/tablet/desktop primary workflows, offline shell, cache migration, accessibility and action discoverability.
4. `CORRECTIVE_MASTER_TEMPLATE.md`
   Generic developer remediation contract.
5. `RE_AUDIT_MASTER_TEMPLATE.md`
   Generic independent exact-SHA re-audit contract.

## Historical templates
- `01_ELECTRICAL_MATH_AUDIT_MASTER.md` — executed/superseded by accepted math cycle.
- `02_NEC_DOCUMENTS_SOURCES_AUDIT_MASTER.md` — superseded by the stricter autonomous Master 05.

## Merge policy
No autonomous master may merge PR #14 or write to `main` unless the user explicitly requests the merge.

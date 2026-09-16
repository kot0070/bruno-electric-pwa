# Bruno Electric — Autonomous AI Master Queue

## Purpose
This branch is planning/orchestration only. It MUST NOT modify PR #14 production code or invalidate the pinned v50 audit candidate.

Current release candidate under independent audit:
`5852749be6cd240b6e52bac15cacf4ffbfa6a288`

Current audit branch:
`audit/workflow-overhaul-v50-5852749`

## Execution state machine
`CURRENT_RELEASE_AUDIT -> CORRECTIVE_MASTER (only if blockers) -> RE_AUDIT -> MERGE DECISION -> ELECTRICAL_MATH_AUDIT_MASTER -> CORRECTIVE -> RE_AUDIT -> NEC_DOCUMENTS_SOURCES_AUDIT_MASTER -> CORRECTIVE -> RE_AUDIT -> DATA_INTEGRITY_PERSISTENCE_MASTER -> CORRECTIVE -> RE_AUDIT -> RESPONSIVE_PWA_UX_MASTER -> CORRECTIVE -> RE_AUDIT -> NEXT_PRODUCT_MASTER`

## Handoff contract
Every AI chat must leave enough state in GitHub for another chat to continue without asking the user to restate context. Every master/report must include:
- ROLE: IMPLEMENT / AUDIT ONLY / CORRECTIVE / RE-AUDIT
- repository + branch
- exact TARGET_SHA or explicit `TO_BE_PINNED`
- immutable scope and exclusions
- inputs/read-first files
- invariants
- required runtime/data-path checks
- required tests/evidence
- output/report path
- next action on PASS/BLOCKER
- explicit merge policy

## Current gate
DO NOT start code-changing follow-up work while PR #14 is under audit. Planning masters may be prepared here. If v50 audit returns P0/P1, execute `CORRECTIVE_MASTER_TEMPLATE.md` first. If audit returns A (or clean B after bounded fixes), merge decision occurs before the next code-changing domain master is instantiated against the accepted release SHA.

## Queued masters
1. `01_ELECTRICAL_MATH_AUDIT_MASTER.md`
   Independent audit of calculator formulas, units, rounding, boundaries, numeric coercion and table/data integrity.
2. `02_NEC_DOCUMENTS_SOURCES_AUDIT_MASTER.md`
   Independent provenance/document/code-source audit: NEC vs estimating assumptions, Texas/AHJ adoption metadata, source freshness, citations and fail-closed claims.
3. `03_DATA_INTEGRITY_PERSISTENCE_AUDIT_MASTER.md`
   Cross-job, import/export, archive, historical snapshot, migrations and localStorage schema integrity.
4. `04_RESPONSIVE_PWA_UX_AUDIT_MASTER.md`
   Phone/tablet/desktop primary workflows, offline shell, cache migration, accessibility and action discoverability.
5. `CORRECTIVE_MASTER_TEMPLATE.md`
   Developer remediation contract consuming an audit report.
6. `RE_AUDIT_MASTER_TEMPLATE.md`
   Independent exact-SHA re-audit contract after corrective work.

## Rule for target SHA
The queued domain masters are templates until the prior release gate is accepted. Before execution, replace `TARGET_SHA = TO_BE_PINNED` with the exact accepted production/dev candidate SHA and create a separate audit branch from that exact SHA.

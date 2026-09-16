# Bruno Electric — Autonomous AI Handoff Protocol

**Purpose:** allow independent ChatGPT/AI sessions to continue development, audit, correction and re-audit through GitHub without requiring the user to relay context manually.

## MACHINE-READABLE CONTROL BLOCK

```yaml
project: Bruno Electric
repo: kot0070/bruno-electric-pwa
active_pr: 14
active_dev_branch: dev/custom-special-order-materials
primary_plan: dev-plans/WORKFLOW_OVERHAUL_MASTER_PLAN.md
mode: autonomous-sequential
merge_policy: never_merge_without_explicit_user_instruction
current_cycle: implementation_master
handoff_medium: github_files
required_exact_sha: true
```

## EXECUTION LOOP

Every large workstream follows this cycle:

1. `IMPLEMENTATION_MASTER`
   - read the current master plan;
   - execute sequential gates;
   - update exact SHA and CI evidence after every completed gate;
   - do not weaken invariants to get green tests.

2. `FULL_AUDIT_MASTER`
   - created only after implementation candidate is frozen;
   - auditor works on a separate audit branch;
   - audit exact pinned SHA independently;
   - no production edits, PR edits, comments or merge from auditor role;
   - findings are written to GitHub report file.

3. `CORRECTIVE_MASTER`
   - developer reads the audit report directly from GitHub;
   - converts every P0/P1 and relevant P2 into explicit corrective tasks;
   - fixes code/tests/docs on development branch;
   - records root cause, exact fix SHA and regression evidence.

4. `RE_AUDIT_MASTER`
   - new exact SHA;
   - fresh audit branch/task/report;
   - never rely on previous verdict for changed code.

5. `NEXT_DOMAIN_MASTER`
   - after acceptance of the prior workstream, create the next large thematic plan rather than stopping.

## REQUIRED GITHUB HANDOFF FILES

Each cycle must leave enough context for a fresh AI session to continue without chat history:

- `dev-plans/*MASTER*.md` — implementation scope, current stage, invariants, acceptance gates, next stage.
- `dev-reports/*.md` — developer evidence, root cause, implementation details, exact candidate SHA, CI.
- `audits/TASK_CURRENT.md` — exact audit assignment and pinned candidate SHA.
- `audits/PROTOCOL.md` — audit-only restrictions and verdict rules.
- `audits/reports/*.md` — independent evidence and blockers.
- optional `dev-plans/*CORRECTIVE*.md` — machine-readable repair plan when audit rejects candidate.

## AI-TO-AI HANDOFF FORMAT

Every master/report should end with this block:

```yaml
handoff:
  role_completed: DEVELOPER | AUDITOR | CORRECTIVE_DEVELOPER
  exact_head_sha: <sha>
  verdict_or_gate: <value>
  blockers:
    - <id/severity/short statement>
  files_to_read_next:
    - <repo path>
  next_role: <role>
  next_action: <single unambiguous instruction>
  prohibited_actions:
    - merge_without_user_instruction
    - infer_unverified_state
```

The next AI session must read `files_to_read_next` before changing code.

## PERMANENT SAFETY / DATA INVARIANTS

These invariants survive every master plan and audit:

- blank `Your Cost` is unresolved and is not numeric zero;
- explicit `Your Cost = 0` is a known numeric zero;
- unresolved material cost must not enter numeric contractor cost/profit/margin math;
- historical Job Material rows are snapshots and must not be silently rewritten by later Catalog edits;
- Save Calculation and Apply to Job are separate intent boundaries;
- archived calculations are immutable snapshots unless explicitly duplicated into a new editable identity;
- Residential and Commercial paths remain isolated;
- historical helper-tax semantics remain frozen to the saved record;
- imports cannot inherit unrelated current-job local state;
- exact-head CI must prove the exact PR head tested;
- PWA cache/core-shell changes are verified when client runtime changes;
- no independent auditor may modify production code, PR metadata or merge state.

## LARGE DOMAIN MASTER QUEUE

After the current workflow overhaul reaches accepted state, continue autonomously with new large masters. Default queue:

### A. ELECTRICAL MATH / FORMULA AUDIT MASTER
Independent end-to-end audit of all calculations and numeric semantics, including conductor ampacity/derating, voltage drop, residential service/load calculations, demand factors, circuit counts, labor/equipment/material extensions, margins/markup/quote/invoice arithmetic, rounding, unit conversions, boundary inputs and fail-closed behavior. Every formula must be traced to authoritative source or explicitly labeled business-estimating logic.

Expected cycle:
`MATH_AUDIT_MASTER → MATH_CORRECTIVE_MASTER → MATH_REAUDIT_MASTER`.

### B. NEC / DOCUMENT / SOURCE AUDIT MASTER
Audit all NEC/code references, Texas modifications, table/article citations, edition/version metadata, source authority, UI wording that distinguishes code requirement from Bruno estimating assumption, stale references and unsupported claims. Current regulatory claims must be verified against authoritative sources.

Expected cycle:
`NEC_SOURCE_AUDIT_MASTER → NEC_SOURCE_CORRECTIVE_MASTER → NEC_SOURCE_REAUDIT_MASTER`.

### C. DATA INTEGRITY / PERSISTENCE MASTER
Audit storage schema, migrations, job switching, blank/reset, import/export, archive isolation, generated-vs-manual provenance, historical snapshots, corruption recovery and legacy state migration.

### D. UX / RESPONSIVE / PWA MASTER
Audit phone/tablet/desktop workflows, keyboard/touch behavior, discoverability, route restoration, offline core shell, cache migration, stale assets, first-load behavior and accessibility-critical state labels.

### E. RELEASE CANDIDATE MASTER
Cross-domain integration gate after accepted domain audits: exact-head CI, frozen candidate, changelog, release risks, rollback path and one final independent release audit.

## AUTONOMOUS DECISION RULES

- If CI fails: remain on current gate, inspect logs, fix root cause, rerun.
- If audit returns P0/P1: automatically create/read corrective master and continue; do not ask user for permission to fix.
- If audit returns only P2/P3: evaluate against current acceptance rules; document what is fixed/deferred and why.
- If exact candidate changes after audit task is pinned: invalidate that audit candidate and create a new audit task for the new SHA.
- Never merge merely because audit passes. Merge remains an explicit user decision unless the user later changes this policy.
- Never stop simply because one master plan ended. Read this file and start the next queued domain master unless blocked by a decision that materially requires the user.

## CURRENT HANDOFF

```yaml
handoff:
  role_completed: ORCHESTRATOR
  exact_head_sha: READ_CURRENT_PR_HEAD
  verdict_or_gate: STAGE_4_APPLY_TO_JOB_IN_PROGRESS
  blockers: []
  files_to_read_next:
    - dev-plans/WORKFLOW_OVERHAUL_MASTER_PLAN.md
    - dev-plans/AUTONOMOUS_AI_HANDOFF_PROTOCOL.md
  next_role: DEVELOPER
  next_action: Complete STAGE_4_APPLY_TO_JOB, pass CI, update master plan, then continue sequentially through Stage 8. After final workflow audit cycle, create the ELECTRICAL MATH / FORMULA AUDIT MASTER.
  prohibited_actions:
    - merge_without_user_instruction
    - skip_stage_gate
```

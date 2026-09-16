# Bruno Electric — New Chat Handoff: Function / Capability Audit

Use this file as the authoritative handoff for a fresh ChatGPT session. Do not rely on chat memory; GitHub `main` is authoritative.

## Repository
- Repo: `kot0070/bruno-electric-pwa`
- Production branch: `main`
- Development policy for this workstream: continue directly on `main` unless the current master explicitly says audit-only branch for independent audit evidence.
- Exact-head CI provenance is mandatory.

## Current workstream
Primary master:
`dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md`

Machine-readable state:
`dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json`

Browser E2E requirements were initially introduced in:
`dev-plans/FUNCTION_CAPABILITY_BROWSER_E2E_AMENDMENT.md`

Important: the parent master was corrected so Browser E2E is NOT optional. Playwright-based real-browser verification is a mandatory completion gate for critical user-facing capabilities.

## Why this master exists
Previous code/math/source audits could pass while the user later opened the app and found UI/workflow behavior broken or different from what had been agreed. This master audits USER CAPABILITIES end-to-end, not only source functions.

Core proof chain:
`PLAN/SPEC -> UI -> HANDLER -> RUNTIME -> RESULT -> PERSISTENCE/SIDE EFFECT -> RELOAD -> CROSS-JOB / CROSS-MODULE REGRESSION -> REAL BROWSER E2E`

A function existing in source or a Node test being green is not enough for capability PASS.

For high-risk user-facing capability:
`PASS = CONTRACT_TRACEABILITY + DETERMINISTIC_RUNTIME + INTEGRATION/PERSISTENCE + REAL_BROWSER_E2E`

## Current authoritative baseline discovered before handoff
At the start of the capability audit the then-current main was:
`41ba3758fd358ad159645e46b42c472d9fcb4157`

Exact-head CI run:
- workflow: Electrical Calculator Tests
- run #525
- run id: `35156821715`
- conclusion: SUCCESS
- logs proved `TESTED_HEAD_SHA=41ba3758fd358ad159645e46b42c472d9fcb4157`
- deterministic suite: `767/767 passed`

After that, the master itself was corrected because it still called Browser E2E merely “recommended”. The correction commit was:
`8e3979aeccf6ecce99e26b65498fd0c3311b9345`

Then Stage 0 work started and two audit files were created on main. Therefore, BEFORE doing anything, fetch current `main` again and treat its current SHA as authoritative.

## Stage 0 status at handoff
Stage 0 = Baseline + requirements index.

Already established:
1. Finished Electrical Tasks master is authoritative accepted history:
   - `dev-plans/ELECTRICAL_TASKS_AUTONOMOUS_MASTER.md`
   - status `MASTER_COMPLETE`
2. Existing autonomous handoff protocol is stale in places and must NOT override the new capability master where they conflict:
   - `dev-plans/AUTONOMOUS_AI_HANDOFF_PROTOCOL.md`
   - it still references old PR/branch/workflow context.
3. Browser-test infrastructure baseline:
   - no Playwright infrastructure was found in repo at the time of inspection;
   - no `package.json` was found at repo root;
   - GitHub code search for Playwright returned 0 results;
   - current `.github/workflows` contained only `electrical-calculators.yml`.
   This is not a product bug by itself, but it is a required infrastructure gap that must be closed before final capability certification.
4. Stage 0 must index requirements from GitHub files, not chat memory.
5. Capability inventory floor includes app shell/nav, Job lifecycle/isolation, Journal/Dispatch, Catalog, Custom Materials, Residential, Electrical calculators/tasks/templates, solver, Quote/Approved Quote/Invoice, T&M, pricing semantics, Import/Export, malformed/legacy state, PWA/offline, responsive layouts, NEC/source surfaces, plus anything additionally discovered on current main.

## Files created immediately before handoff
Two Stage 0 audit files were created on main after the master correction. Fetch current main and list/read `audits/function-capability/` to identify their exact names/content before continuing. Do not guess their contents from this handoff.

## Mandatory browser E2E scope
Playwright must become part of repo + CI and eventually cover at least:
- app shell / navigation / representative back-forward-deep link;
- Job A/B isolation;
- Catalog standard material + Custom/Special-order material;
- blank Your Cost vs explicit zero;
- Residential calculate/save/reload/apply;
- Electrical Tasks calculate/save/reload/recalculate/apply/edit/changed-since-apply/update-job;
- every supported advanced task template: Branch, EVSE, HVAC, Motor, Transformer Feed, Generator/Feeder, Generic Long Run;
- Professional Task Solver explicit-fact extraction with no hidden auto-save/apply;
- Quote -> Approved Quote immutability -> fixed-price Invoice, with T&M kept separate;
- Import/Export representative full workflow;
- reload/storage resilience;
- phone 360–430, tablet 768–1024, desktop >=1200 action reachability;
- PWA/offline/service-worker behavior where deterministic browser testing supports it.

CI must ultimately require:
`DETERMINISTIC_SUITE_GREEN && PLAYWRIGHT_E2E_GREEN`
on the exact tested commit SHA.

## Capability audit rules
Canonical statuses:
- PASS
- PARTIAL
- FAIL
- UNTESTED
- NOT_APPLICABLE

Severity:
- P0 destructive/release blocker
- P1 broken promised workflow/contract violation
- P2 important non-blocking gap
- P3 improvement

Do not complete master with open P0/P1.

Permanent invariants include:
- BLANK != ZERO
- UNKNOWN != ZERO
- Your Cost != Customer Price
- Save != Apply
- live calculation != Approved Quote
- Job A must never contaminate Job B
- Residential != Commercial
- historical snapshots must not silently mutate
- unsupported configurations fail closed
- no PASS without reproducible evidence

## Execution instructions for the new chat
1. Connect to GitHub immediately.
2. Fetch current `main` exact SHA.
3. Read in this order:
   - `dev-plans/NEW_CHAT_FUNCTION_CAPABILITY_AUDIT_HANDOFF.md`
   - `dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md`
   - `dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json`
   - `dev-plans/FUNCTION_CAPABILITY_BROWSER_E2E_AMENDMENT.md`
   - `dev-plans/ELECTRICAL_TASKS_AUTONOMOUS_MASTER.md`
   - current contents of `audits/function-capability/`
4. Continue Stage 0 autonomously from actual repository state; do not restart completed work and do not ask the user to repeat context.
5. Reconfirm exact-head CI after any main change.
6. Follow strict sequential gates. Do not skip to Playwright implementation before Stage 0/1 evidence allows it, but Browser E2E remains mandatory later.
7. When audit discovers P0/P1, freeze evidence first, then create corrective work and regression tests; re-audit changed exact SHA.
8. Persist all important state/evidence to GitHub so another fresh chat can continue.
9. User does not want routine confirmation questions or excessive progress chatter. Continue autonomously unless a true external blocker requires user input.
10. Never claim UI capability PASS purely from source inspection or Node tests.

## User intent
The user specifically wants to prevent this failure mode:
“code audit says everything is fine, then I open the app and something does not work or behaves differently from what we discussed.”
The audit must therefore test what a real user can actually do, not only what the code appears to support.

## Next action
Continue Stage 0 from current main, finish authoritative requirements/capability index, update state, pass exact-head CI, then enter Stage 1 according to the master. Do not stop merely because a stage is complete; continue sequentially until a true blocker or whole master completion.

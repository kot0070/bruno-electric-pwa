# Bruno Electric — Function Capability Requirements Index

STATUS: STAGE_0_BASELINE
AUTHORITY: repository `main`; chat memory is non-authoritative

## Baseline observations

- Prior exact-head deterministic baseline before this audit master alignment: `41ba3758fd358ad159645e46b42c472d9fcb4157`.
- CI: Electrical Calculator Tests run #525 / id `35156821715` SUCCESS.
- CI provenance log proved `TESTED_HEAD_SHA=41ba3758fd358ad159645e46b42c472d9fcb4157`.
- Deterministic suite at that baseline: `767/767 passed`.
- Function Capability Audit master was subsequently corrected so Browser E2E is mandatory in the parent master. Therefore the Stage 0 acceptance SHA will be newer and must receive a fresh exact-head CI run.
- Browser E2E infrastructure baseline: ABSENT. No root `package.json`; GitHub code search for `playwright` returned no repository hits; only `.github/workflows/electrical-calculators.yml` exists as an explicit repository workflow at baseline inspection.

## Requirement source precedence

When sources conflict, use this order:
1. current `dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md` and `FUNCTION_CAPABILITY_AUDIT_STATE.json` for this audit's execution contract;
2. current production runtime on exact audited `main` SHA for what actually exists;
3. completed accepted domain master/state ledgers for intended accepted contracts;
4. accepted audit/developer evidence referenced by those ledgers;
5. older/incomplete plans only as LEGACY context, never as current truth without confirmation from current runtime/master.

## CURRENT requirement sources

### Function Capability Audit
- `dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md` — ACTIVE authoritative audit contract; real Browser E2E is mandatory for high-risk user-facing capabilities.
- `dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json` — machine-readable stage/gate ledger.
- `dev-plans/FUNCTION_CAPABILITY_BROWSER_E2E_AMENDMENT.md` — retained as historical rationale; superseded by the integrated browser rules in the parent master where wording conflicts.

### Completed Electrical Tasks product contract
- `dev-plans/ELECTRICAL_TASKS_AUTONOMOUS_MASTER.md` — `MASTER_COMPLETE`; accepted functional contract for Electrical Tasks and protected surrounding behavior.
- `dev-plans/ELECTRICAL_TASKS_MASTER_STATE.json` — accepted exact-SHA ledger for Stages 0–12 and referenced independent audit reports.
- `dev-reports/ELECTRICAL_TASKS_FINAL_RELEASE_CANDIDATE.md` and stage developer reports — evidence/context, not a substitute for executable validation in this master.

### Permanent invariants still current
From accepted masters and current audit master:
- BLANK != ZERO; UNKNOWN != ZERO.
- Your Cost != Customer Price.
- Save != Apply.
- live calculation != Approved Quote.
- Job A != Job B state.
- Residential != Commercial state.
- approved/historical snapshots must not silently mutate.
- unsupported calculation/configuration must fail closed.
- current exact SHA must be tested; changed code invalidates affected older audit evidence.

## LEGACY / stale governance sources

### `dev-plans/AUTONOMOUS_AI_HANDOFF_PROTOCOL.md`
Classification: LEGACY/STale control block, useful only for general workflow principles.
Reason: its machine-readable block still points to `active_pr: 14`, `dev/custom-special-order-materials`, `WORKFLOW_OVERHAUL_MASTER_PLAN.md`, and an old current cycle. These fields do not describe current `main` or the current Function Capability Audit. Do not use them to select current branch/stage.
Still-valid generic principles may be reused only when they do not conflict with current master: exact-SHA audits, separate auditor role, P0/P1 corrective cycle, no silent requirement rewriting.

### `dev-plans/WORKFLOW_OVERHAUL_MASTER_PLAN.md`
Classification: LEGACY historical workflow-plan context. It is not the authoritative current audit master.

### prior corrective masters/reports
Classification: HISTORICAL ACCEPTED EVIDENCE when explicitly linked from an accepted state ledger; otherwise LEGACY context. They do not automatically prove current browser functionality.

## Browser E2E requirement classification

CURRENT REQUIRED:
- Playwright repository setup;
- deterministic local web server;
- Chromium CI;
- phone/tablet/desktop profiles;
- critical journey execution through real UI;
- reload/localStorage checks;
- exact-SHA browser CI provenance;
- diagnostic trace/screenshots/report on failures where supported;
- page/runtime error gate;
- responsive action reachability;
- PWA/offline browser validation where deterministic.

CURRENT BASELINE STATUS: `ABSENT`.
This is an infrastructure gap to implement in Stage 3, not grounds to falsely classify current user capabilities PASS.

## Initial capability domains
Stable IDs are defined in `audits/function-capability/capabilities.json`. Initial registry covers:
- navigation/app shell;
- Job lifecycle/isolation;
- Dispatch/Journal;
- Catalog and custom materials;
- Your Cost/quantity semantics;
- Residential calculate/archive/apply/history;
- electrical calculators;
- Electrical Tasks shell and all supported templates;
- raceway and grounding semantics;
- material takeoff/archive/apply/update;
- deterministic Task Solver;
- Quote/Approved Quote/Invoice/T&M;
- pricing/margin;
- import/export;
- malformed/legacy data;
- PWA/offline/upgrade;
- responsive field UX;
- NEC/jurisdiction/source provenance.

## Requirement classification rules
- CURRENT: explicitly supported by current master/runtime/accepted product contract.
- LEGACY: historical plan or stale governance statement not governing current behavior.
- DISCOVERED_RUNTIME: behavior found in current runtime without a clear current plan source; Stage 1 must decide whether to formalize or classify infrastructure/obsolete.
- UNSUPPORTED_DEFERRED: explicitly outside supported scope; must not appear as a successful supported result.

## Stage 0 gate checklist
- [x] deterministic baseline SHA and CI provenance recorded;
- [x] deterministic baseline count recorded (767);
- [x] current and stale master/governance sources classified;
- [x] Browser E2E baseline explicitly classified ABSENT;
- [x] initial stable capability registry created;
- [ ] fresh exact-head CI after Stage 0 repository evidence commits;
- [ ] independent exact-SHA Stage 0 audit;
- [ ] P0/P1=0 and Stage 0 ACCEPT before Stage 1.

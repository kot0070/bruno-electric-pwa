# Bruno Electric — Function / Capability Audit Master

MASTER_STATUS: ACTIVE
CURRENT_STAGE: STAGE_3_EXECUTABLE_CORE_WORKFLOWS_PLAYWRIGHT_FOUNDATION
EXECUTION_MODE: STRICT_SEQUENTIAL
IMPLEMENTATION_BRANCH: main
AUDIT_BRANCH_POLICY: separate exact-SHA audit branches
AUTHORITATIVE_SOURCE: this file + `dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json`
PRIMARY_GOAL: prove that declared product capabilities actually work end-to-end and match their governing plans/specifications

## Mission
Audit Bruno Electric by USER CAPABILITY, not by source-file existence. A capability is only accepted when its requirement, reachable UI, runtime behavior, persistence/integration effects and real-browser execution agree.

Example chain:
`Create Job -> Electrical Tasks -> calculate -> Save -> reload -> Apply to Job -> verify Job material provenance -> edit task -> prove Job unchanged -> explicit Update Job from Task`.

A function existing in JavaScript, a green unit test, or a static source review is not enough to mark a user-facing workflow PASS.

## Binding browser policy
Browser E2E is mandatory, not optional. `dev-plans/FUNCTION_CAPABILITY_BROWSER_E2E_AMENDMENT.md` is retained only as historical rationale; if wording conflicts, THIS master controls.

For a high-risk user-facing capability:
`PASS = CONTRACT_TRACEABILITY + DETERMINISTIC_RUNTIME + INTEGRATION/PERSISTENCE + REAL_BROWSER_E2E`.

Required browser implementation:
- Playwright test runner in repository;
- deterministic local static server;
- Chromium mandatory in CI;
- phone viewport 360–430 px;
- tablet viewport 768–1024 px;
- desktop viewport >=1200 px;
- isolated browser state except persistence tests;
- pageerror/uncaught/fatal required-load failures fail critical journeys;
- trace/screenshots/report on failure where CI permits;
- exact tested SHA printed and checked;
- Browser E2E green is required together with deterministic CI green.

Mandatory browser journeys:
1. app shell/navigation/deep-link/back-forward;
2. Job A/B isolation;
3. Catalog + standard/custom material + blank/zero Your Cost + reload;
4. Residential calculate/save/reload/load/apply/history;
5. Electrical Tasks Feeder calculate/save/reload/apply/edit/changed-since-apply/update/history;
6. Branch Circuit, EVSE, HVAC, Motor, Transformer Feed, Generator/Feeder, Generic Long Run;
7. Professional Task Solver explicit extraction/no guessing/no auto-save/apply;
8. Quote -> Approved Quote immutability -> Fixed-price Invoice, with T&M separate;
9. Export/import representative supported Job;
10. reload/storage resilience and stale identifiers;
11. responsive action reachability at phone/tablet/desktop;
12. service-worker/offline/upgrade assertions where deterministic browser execution supports them.

If a browser limitation blocks a specific assertion, that assertion is `UNTESTED` unless another deterministic layer proves it; it is never silently PASS.

## Non-negotiable invariants
- PLAN CLAIM != IMPLEMENTED BEHAVIOR.
- IMPLEMENTED CODE != REACHABLE UI.
- REACHABLE UI != CORRECT RESULT.
- CORRECT RESULT != CORRECT PERSISTENCE.
- UNIT TEST PASS != E2E PASS.
- BLANK != ZERO; UNKNOWN != ZERO.
- Your Cost != Customer Price.
- Save != Apply.
- Live calculation != Approved Quote.
- Residential != Commercial.
- Job A must never contaminate Job B.
- unsupported configuration fails closed.
- approved/historical snapshots are not silently rewritten.
- changed production SHA invalidates affected audit evidence.
- no P0/P1 may be deferred to complete the master.

## Capability evidence model
Each capability has a stable ID and records at least:
`capability_id, domain, name, governing_requirement, source_file/section, ui_entry, runtime_entry, modules, input_contract, expected_output, expected_side_effects, forbidden_side_effects, persistence_scope, job_isolation_required, historical_snapshot_required, offline_requirement, responsive_requirement, deterministic_test_ids, integration_test_ids, browser_e2e_required, browser_e2e_test_ids, negative_test_ids, exact_sha, status, severity_if_failed, finding_ids, notes`.

Statuses: `PASS`, `PARTIAL`, `FAIL`, `UNTESTED`, `NOT_APPLICABLE`.
Severities: P0 destructive/release-blocking; P1 functional/contract blocker; P2 important non-blocking; P3 improvement.

## Four-layer proof
L1 Contract/plan traceability.
L2 Deterministic runtime and calculation/state semantics.
L3 Workflow/persistence integration and forbidden-side-effect checks.
L4 Real browser execution through the actual UI. High-risk user-facing capabilities require all applicable layers.

## Minimum domains
App navigation; Job lifecycle/isolation; Dispatch/Journal; Catalog; custom/special-order materials; Your Cost/quantity semantics; Residential estimator/takeoff/archive/history/apply; electrical calculators; Electrical Tasks shell/templates; Feeder; Branch; EVSE; HVAC; Motor; Transformer; Generator; Long Run; raceway; grounding/neutral/EGC; task takeoff; task archive/save/recalculate/apply/update; Task Solver; Quote; Approved Quote; Invoice; T&M; pricing/margin; import/export; malformed/legacy data; PWA/offline/upgrade; responsive layouts; NEC/jurisdiction/provenance. Runtime-discovered domains must be added.

# STRICT STAGE LOOP
For every stage:
`DISCOVER -> DEFINE EXPECTED CONTRACT -> IMPLEMENT TEST/AUDIT HARNESS AS NEEDED -> RUN DETERMINISTIC TESTS -> RUN EXACT-HEAD CI -> INDEPENDENT AUDIT -> CORRECT EVERY P0/P1 -> EXACT-HEAD CI -> RE-AUDIT -> ACCEPT`.

Audit role cannot modify production behavior or weaken expectations to match current runtime.

---

# STAGE 0 — Baseline + Requirements Index + Browser Baseline
STATUS: DONE_ACCEPTED

Accepted evidence:
- initial audit exact production SHA: `31a303dd28b752f5823be78512ee975902295d44`;
- initial audit branch: `audit/function-capability-stage0-31a303d`;
- finding `FCA-S0-P1-001`: per-capability governing source traceability missing;
- corrective production SHA: `846e8cd55aaa7a1fbeb28536dab008f21c8cc6b4`;
- exact-head deterministic CI: Electrical Calculator Tests run #532 / id `35159627641`, SUCCESS;
- independent re-audit branch: `audit/function-capability-stage0-reaudit-846e8cd`;
- re-audit verdict: `A_ACCEPT`, P0=0, P1=0;
- Browser E2E baseline: `ABSENT`, intentionally to be implemented at Stage 3, never treated as capability PASS evidence.

Gate: ACCEPTED.

---

# STAGE 1 — Runtime Capability Inventory
STATUS: DONE_ACCEPTED
Map current UI controls/routes -> handlers -> runtime -> storage/services; identify dead/unreachable runtime, visible actions without a valid runtime path, duplicate/conflicting implementations, dormant prototypes and service-worker loading paths. Deliver `RUNTIME_CAPABILITY_MAP.md` and expand `capabilities.json`. Every user action must map to a Capability ID or infrastructure-only classification.

Accepted Stage 1 evidence:
- runtime inventory/registry expansion exact SHA: `138b3de84f158d57ec0046d6dbed80049c1ba299`;
- exact-head CI at inventory SHA: run #536 / id `35160109516`, SUCCESS;
- initial audit branch: `audit/function-capability-stage1-138b3de`;
- initial audit report: `audits/reports/FUNCTION_CAPABILITY_STAGE1_AUDIT_138b3de.md`;
- initial verdict: `A_REJECT_CORRECTIVE_REQUIRED`, P0=0, P1=1;
- `FCA-S1-P1-001`: full app backup omitted current visible Dispatch Journal v3 standalone data/settings;
- corrective code SHA: `7b39a8fb55be5a525cf157124fcb14e42903c758`;
- corrective CI: run #543 / id `35163156620`, SUCCESS, 770/770 tests;
- independent re-audit exact SHA: `c04a1c6807ab40e142eea25d8fe40405ff139b86`;
- re-audit CI: run #545 / id `35163241400`, SUCCESS;
- re-audit branch: `audit/function-capability-stage1-reaudit-c04a1c6`;
- re-audit report: `audits/reports/FUNCTION_CAPABILITY_STAGE1_REAUDIT_c04a1c6.md`;
- re-audit verdict: `A_ACCEPT`, P0=0, P1=0;
- `FCA-S1-P1-001`: `VERIFIED_CLOSED`;
- `FCA-S1-P2-001`: dual Dispatch persistence models retained as a later architectural classification item, not a Stage 1 blocker.

Capability status boundary: Stage 1 acceptance does not mark high-risk user-facing capabilities PASS; browser proof remains mandatory later.

Gate: ACCEPTED.

---

# STAGE 2 — Requirement-to-Runtime Gap Audit
STATUS: DONE_ACCEPTED
For every capability compare `PLAN/SPEC -> UI -> RUNTIME -> TEST -> STORAGE/SIDE EFFECT -> RESULT`. Classify exact/different-valid/partial/missing/unreachable/undocumented/obsolete. Auditor does not fix production. Freeze findings with exact SHA.

Accepted Stage 2 evidence:
- Stage 2 entry exact SHA: `16f725d56f034d55a6ae2e5e46acf67a08f95d05`;
- entry exact-head CI: run #547 / id `35163361606`, SUCCESS;
- initial audit branch: `audit/function-capability-stage2-16f725d`;
- initial audit report: `audits/reports/FUNCTION_CAPABILITY_STAGE2_AUDIT_16f725d.md`;
- initial verdict: `A_REJECT_CORRECTIVE_REQUIRED`, P0=0, P1=1;
- `FCA-S2-P1-001`: Stage 1 registry/runtime-map evidence was stale after the accepted Dispatch backup corrective;
- corrective evidence SHA: `b246300e215dc1241434aef9c341e7a12397c29e`;
- corrective exact-head CI: run #549 / id `35163662864`, SUCCESS;
- corrective re-audit branch: `audit/function-capability-stage2-reaudit-b246300`;
- corrective re-audit report: `audits/reports/FUNCTION_CAPABILITY_STAGE2_CORRECTIVE_REAUDIT_b246300.md`;
- corrective verdict: `A_ACCEPT_CORRECTIVE`; `FCA-S2-P1-001` -> `VERIFIED_CLOSED`;
- full exact-SHA matrix branch: `audit/function-capability-stage2-matrix-b246300`;
- full matrix: `audits/function-capability/REQUIREMENT_RUNTIME_GAP_MATRIX.md`;
- final audit report: `audits/reports/FUNCTION_CAPABILITY_STAGE2_AUDIT_b246300.md`;
- final verdict: `A_ACCEPT`, P0=0, P1=0;
- all registered Capability IDs classified across PLAN/SPEC -> UI -> RUNTIME -> TEST -> STORAGE/SIDE EFFECT -> RESULT;
- no MISSING registered current capability identified; no source/runtime-proven UNREACHABLE registered current capability identified;
- no user-facing capability PASS was granted by Stage 2.

Explicit non-blocking P2 carry:
- `FCA-S2-P2-001`: visible Journal v3 standalone persistence coexists with legacy Job-scoped `state.dispatch`; long-term persistence/isolation/migration contract remains to be normalized;
- `FCA-S2-P2-002`: `CAP-ET-016` registry metadata under-classifies an Electrical Tasks Stage 6 requirement already present in the accepted master;
- `FCA-S2-P2-003`: several reachable secondary product surfaces lack independent current PLAN/SPEC granularity;
- `FCA-S2-P2-004`: Electrical Tasks Stage 11 v67 is historical accepted evidence; current Function Capability runtime is v68 after the later Dispatch backup corrective.

Gate: ACCEPTED.

---

# STAGE 3 — Executable Core Workflows + Playwright Foundation
STATUS: ACTIVE
Implement Playwright infrastructure and mandatory journeys. Retain deterministic integration tests. Minimum journeys include Job/materials isolation, Residential, Electrical Tasks, advanced templates, Task Solver, Quote/Approved Quote/Invoice, Import/Export and reload resilience. Binding browser policy requires the full mandatory set `E2E-01` through `E2E-12` to be represented. CI must require deterministic suite GREEN AND Playwright GREEN against the same exact SHA.

Stage 3 implementation requirements:
- root Playwright project configuration;
- deterministic local static server serving the repository application without external application credentials;
- Chromium mandatory in CI;
- page errors / uncaught browser errors / fatal required asset-load failures fail critical journeys;
- isolated browser storage by default with explicit persistence/reload tests where required;
- desktop, phone and tablet viewport projects/coverage as required by journey semantics;
- trace, screenshots and report retained on failure where CI supports artifacts;
- exact checkout SHA must equal the SHA reported/tested by the workflow;
- existing deterministic Node suite remains a required same-SHA gate;
- browser tests must drive the real rendered UI for user-facing actions, not replace UI proof with direct module calls.

Gate: exact-head deterministic + Playwright CI, independent exact-SHA Stage 3 audit, correction of every P0/P1, re-audit, then ACCEPT.

---

# STAGE 4 — Function-Level Deterministic Audit
STATUS: LOCKED
Inventory exported/public high-value functions: directly tested, integration-tested, trivial plumbing, dead/unreachable, untested high-risk. Add targeted branch/boundary/invalid/rollback/stale-ID/blank-zero/unsupported tests. Coverage metrics may locate gaps but never prove correctness.

---

# STAGE 5 — Negative / Fault Injection
STATUS: LOCKED
Test malformed JSON/partial records, stale/missing IDs, unsupported calculations, impossible raceway/configurations, failed Apply/Update rollback, incomplete imports, repeated actions, optional asset failures, stale caches and browser-reproducible negative flows. Expected fail-closed/preserve/no-op behavior must be explicit.

---

# STAGE 6 — UI Action Wiring Audit
STATUS: LOCKED
For every actionable control verify reachability, correct handler, correct domain action, disabled/hidden states, no handler override, truthful feedback, keyboard/touch where applicable, no mobile navigation obstruction. Real Browser E2E evidence is required for materially user-facing actions.

---

# STAGE 7 — Cross-Module Regression Matrix
STATUS: LOCKED
Required pairs include Catalog<->Job Materials, Job Materials<->Quote, Quote<->Approved Quote, Approved Quote<->Invoice, Electrical Tasks<->Job Materials, Residential<->Job Materials, Custom Materials<->pricing, Job switching<->all scoped archives, Import/Export<->history/provenance, PWA update<->stored Job data. Record PASS/PARTIAL/FAIL/UNTESTED with evidence.

---

# STAGE 8 — Responsive / PWA Browser Audit
STATUS: LOCKED
Run Playwright phone/tablet/desktop profiles. Verify critical actions reachable, no critical horizontal overflow, bottom navigation not covering required controls, long forms/tables usable. Run service-worker/offline/upgrade scenarios where deterministic. Browser limitations are recorded, not guessed away.

---

# STAGE 9 — Corrective Master
STATUS: LOCKED
Freeze Stages 0–8 findings, create corrective tasks for every P0/P1 and selected P2, group by root cause, fix on `main`, add deterministic and browser regressions. Finding lifecycle: `OPEN -> FIXED_PENDING_REAUDIT -> VERIFIED_CLOSED`; findings are never deleted from ledger.

---

# STAGE 10 — Independent Re-Audit
STATUS: LOCKED
New exact-SHA audit branch. Re-run affected deterministic + Playwright scenarios and protected regression matrix; verify corrective findings independently, exact-head CI provenance and zero new P0/P1.

---

# STAGE 11 — Final Capability Certification
STATUS: LOCKED
Requires all capabilities classified; P0=0; P1=0; all current requirements mapped or explicitly unsupported; critical workflows have deterministic + browser evidence; Job isolation / Save-vs-Apply / approved snapshot invariants green; exact final SHA; deterministic CI green; Playwright E2E green; final independent A_ACCEPT.

Final deliverables:
- `audits/function-capability/CAPABILITY_MATRIX.md`
- `audits/function-capability/capabilities.json`
- `audits/function-capability/FUNCTION_COVERAGE_MAP.md`
- browser test report/artifact references
- `audits/reports/FUNCTION_CAPABILITY_FINAL_AUDIT.md`
- corrective report if needed
- final state JSON.

MASTER_COMPLETE only after final exact-SHA re-audit has 0 P0/P1 and both deterministic and mandatory Browser E2E gates are green.

## Autonomous user-intervention policy
Playwright setup, dependencies, static server, test fixtures, selectors, CI, traces/screenshots and audit execution are autonomous repository work. Ask the user only for a genuine external blocker such as unavailable third-party credentials; local/PWA Bruno Electric workflows do not require user participation.

## Handoff
```yaml
handoff:
  role_completed: ORCHESTRATOR
  exact_head_sha: READ_CURRENT_MAIN_AT_EXECUTION
  verdict_or_gate: STAGE_3_ACTIVE
  blockers: []
  files_to_read_next:
    - dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md
    - dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json
    - audits/function-capability/REQUIREMENT_RUNTIME_GAP_MATRIX.md
    - audits/function-capability/RUNTIME_CAPABILITY_MAP.md
    - audits/function-capability/capabilities.json
    - .github/workflows/electrical-calculators.yml
  next_role: IMPLEMENTER
  next_action: Implement the Playwright foundation and mandatory E2E-01..E2E-12 journeys against the real UI, require deterministic Node tests and Chromium browser tests on the same exact SHA in CI, then create a separate exact-SHA Stage 3 audit branch. Correct every P0/P1 before Stage 3 acceptance.
  prohibited_actions:
    - mark_capability_pass_without_evidence
    - silently_change_requirement_to_match_runtime
    - substitute_direct_module_calls_for_required_real_browser_ui_proof
    - skip_p0_p1_corrective_cycle
```

# Bruno Electric — Function / Capability Audit Master

MASTER_STATUS: ACTIVE
CURRENT_STAGE: STAGE_8_RESPONSIVE_PWA_BROWSER_AUDIT
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
- exact-head deterministic CI: Electrical Calculator Tests #532 / id `35159627641`, SUCCESS;
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
- exact-head CI at inventory SHA: #536 / id `35160109516`, SUCCESS;
- initial audit branch/report: `audit/function-capability-stage1-138b3de` / `audits/reports/FUNCTION_CAPABILITY_STAGE1_AUDIT_138b3de.md`;
- initial verdict `A_REJECT_CORRECTIVE_REQUIRED`, P0=0, P1=1;
- `FCA-S1-P1-001`: full app backup omitted current visible Dispatch Journal standalone data/settings;
- corrective SHA `7b39a8fb55be5a525cf157124fcb14e42903c758`, CI #543 / id `35163156620`, 770/770;
- independent re-audit SHA `c04a1c6807ab40e142eea25d8fe40405ff139b86`, CI #545 / id `35163241400`;
- re-audit branch/report: `audit/function-capability-stage1-reaudit-c04a1c6` / `audits/reports/FUNCTION_CAPABILITY_STAGE1_REAUDIT_c04a1c6.md`;
- verdict `A_ACCEPT`, P0=0, P1=0; `FCA-S1-P1-001` VERIFIED_CLOSED;
- `FCA-S1-P2-001`: dual Dispatch persistence models retained as a later architectural classification item, not a Stage 1 blocker.

Capability status boundary: Stage 1 acceptance does not mark high-risk user-facing capabilities PASS; browser proof remains mandatory later.

Gate: ACCEPTED.

---

# STAGE 2 — Requirement-to-Runtime Gap Audit
STATUS: DONE_ACCEPTED
For every capability compare `PLAN/SPEC -> UI -> RUNTIME -> TEST -> STORAGE/SIDE EFFECT -> RESULT`. Classify exact/different-valid/partial/missing/unreachable/undocumented/obsolete. Auditor does not fix production. Freeze findings with exact SHA.

Accepted Stage 2 evidence:
- entry SHA `16f725d56f034d55a6ae2e5e46acf67a08f95d05`, CI #547 / id `35163361606`, SUCCESS;
- initial audit `A_REJECT_CORRECTIVE_REQUIRED`, P0=0, P1=1; `FCA-S2-P1-001` was stale registry/runtime-map evidence after Dispatch backup corrective;
- corrective SHA `b246300e215dc1241434aef9c341e7a12397c29e`, CI #549 / id `35163662864`, SUCCESS;
- corrective re-audit branch/report: `audit/function-capability-stage2-reaudit-b246300` / `audits/reports/FUNCTION_CAPABILITY_STAGE2_CORRECTIVE_REAUDIT_b246300.md`, `A_ACCEPT_CORRECTIVE`;
- full matrix branch `audit/function-capability-stage2-matrix-b246300`, matrix `audits/function-capability/REQUIREMENT_RUNTIME_GAP_MATRIX.md`;
- final report `audits/reports/FUNCTION_CAPABILITY_STAGE2_AUDIT_b246300.md`, verdict `A_ACCEPT`, P0=0, P1=0;
- all registered Capability IDs classified across PLAN/SPEC -> UI -> RUNTIME -> TEST -> STORAGE/SIDE EFFECT -> RESULT.

Explicit non-blocking P2 carry:
- `FCA-S2-P2-001`: visible Journal standalone persistence coexists with legacy Job-scoped `state.dispatch`;
- `FCA-S2-P2-002`: `CAP-ET-016` registry metadata under-classifies an accepted Electrical Tasks requirement;
- `FCA-S2-P2-003`: several reachable secondary product surfaces lack independent current PLAN/SPEC granularity;
- `FCA-S2-P2-004`: prior Electrical Tasks plan evidence is historical relative to later runtime changes.

Gate: ACCEPTED.

---

# STAGE 3 — Executable Core Workflows + Playwright Foundation
STATUS: DONE_ACCEPTED
Implement Playwright infrastructure and mandatory journeys. Retain deterministic integration tests. CI requires deterministic GREEN and Playwright GREEN against the same exact SHA.

Accepted Stage 3 evidence:
- implementation SHA `a86f38937d82399b1d37cfe9ca49405b0633d1be`;
- exact-head CI #585 / id `35225679044`, SUCCESS;
- deterministic `787/787`; Playwright `66 scheduled / 28 passed / 38 explicit skips / 0 failed`;
- Chromium viewports desktop 1440, phone 390, tablet 820;
- mandatory `E2E-01` through `E2E-12` represented through rendered UI;
- initial audit found `FCA-S3-P1-001` authoritative state stale;
- corrective SHA `2778550057a785802b869e4b0d411215c689d239`, CI #586 / id `35226418000`, SUCCESS;
- re-audit branch/report: `audit/function-capability-stage3-reaudit-2778550` / `audits/reports/FUNCTION_CAPABILITY_STAGE3_REAUDIT_2778550.md`;
- verdict `A_ACCEPT`, P0=0, P1=0; finding VERIFIED_CLOSED.

Gate: ACCEPTED.

---

# STAGE 4 — Function-Level Deterministic Audit
STATUS: DONE_ACCEPTED
Inventory exported/public high-value functions: directly tested, integration-tested, trivial plumbing, dead/unreachable, untested high-risk. Add targeted branch/boundary/invalid/rollback/stale-ID/blank-zero/unsupported tests. Coverage metrics may locate gaps but never prove correctness.

Accepted Stage 4 evidence:
- coverage map `audits/function-capability/FUNCTION_COVERAGE_MAP.md`;
- implementation/test SHA `efb02bf1f867787e5bf7251d9045be2931eeb6d3`, CI #606 / id `35243084444`, SUCCESS, `800/800`, Playwright `87/35/52/0`;
- audited SHA `ad468ae53e32cd0d9515c02a3ea1b912ebe65a6f`, CI #608 / id `35243527176`, exact provenance green;
- independent branch/report `audit/function-capability-stage4-ad468ae` / `audits/reports/FUNCTION_CAPABILITY_STAGE4_AUDIT_ad468ae.md`, `A_ACCEPT`, P0=0, P1=0;
- final administrative acceptance SHA `eaf0f4d096d0b207cc27f17675e384e6d6a4099b`, CI #611 / id `35244328100`, SUCCESS, `800/800`, Playwright `87/35/52/0`;
- acceptance validation `audit/function-capability-stage4-acceptance-eaf0f4d` / `audits/reports/FUNCTION_CAPABILITY_STAGE4_ACCEPTANCE_VALIDATION_eaf0f4d.md`, `VALIDATED`;
- no known `UNTESTED_HIGH_RISK` exported business/state API remains in Stage 4 map.

Gate: ACCEPTED.

---

# STAGE 5 — Negative / Fault Injection
STATUS: DONE_ACCEPTED
Test malformed JSON/partial records, stale/missing IDs, unsupported calculations, impossible raceway/configurations, failed Apply/Update rollback, incomplete imports, repeated actions, optional asset failures, stale caches and browser-reproducible negative flows. Expected fail-closed/preserve/no-op behavior must be explicit.

Accepted Stage 5 evidence:
- entry basis Stage 4 acceptance SHA `eaf0f4d096d0b207cc27f17675e384e6d6a4099b`;
- fault matrix `audits/function-capability/STAGE5_FAULT_INJECTION_MATRIX.md`;
- full-app restore requires a valid saved Job, validates optional blocks before mutation and rolls back prior local-storage writes on mid-restore failure;
- locale-formatted Call Journal helper metrics use numeric summary state and do not reparse localized currency;
- customer-facing calculator, Call Journal and fixed-price invoice documents are preview-before-output;
- missing required company identity is visible in Journal invoice preview and blocks final customer PDF;
- current-shell bootstrap is protected against visible legacy-header flash; dark disabled/readonly controls are covered across supported viewports;
- synchronized exact production SHA `2f0e7083353008a6bee4d0e294b404f71106331a`;
- exact-head CI #709 / id `35283187090`, SUCCESS, exact provenance green;
- deterministic `818/818`; Playwright `168 scheduled / 88 passed / 80 explicit skips / 0 failed`;
- independent audit `audit/function-capability-stage5-2f0e708` / `audits/reports/FUNCTION_CAPABILITY_STAGE5_AUDIT_2f0e708.md`, `A_ACCEPT`, P0=0, P1=0.

Gate: ACCEPTED.

---

# STAGE 6 — UI Action Wiring Audit
STATUS: DONE_ACCEPTED
For every actionable control verify reachability, correct handler, correct domain action, disabled/hidden states, no handler override, truthful feedback, keyboard/touch where applicable, no mobile navigation obstruction. Real Browser E2E evidence is required for materially user-facing actions.

Accepted Stage 6 evidence:
- entry Stage 5 `A_ACCEPT` at `2f0e7083353008a6bee4d0e294b404f71106331a`;
- action matrix `audits/function-capability/STAGE6_UI_ACTION_WIRING_MATRIX.md`;
- accepted SHA `485b3efd448f6757bdc3283f8ad3a34923c9bf10`;
- exact-head CI #714 / id `35284021486`, SUCCESS, exact provenance green;
- deterministic `822/822`; Playwright `168 scheduled / 88 passed / 80 explicit skips / 0 failed`;
- independent audit `audit/function-capability-stage6-485b3ef` / `audits/reports/FUNCTION_CAPABILITY_STAGE6_AUDIT_485b3ef.md`, `A_ACCEPT`, P0=0, P1=0;
- deterministic wiring inventory found no duplicate/orphan base actionable ID; rendered-browser evidence remained authoritative for materially user-facing actions.

Gate: ACCEPTED.

---

# STAGE 7 — Cross-Module Regression Matrix
STATUS: DONE_ACCEPTED
Required pairs include Catalog<->Job Materials, Job Materials<->Quote, Quote<->Approved Quote, Approved Quote<->Invoice, Electrical Tasks<->Job Materials, Residential<->Job Materials, Custom Materials<->pricing, Job switching<->all scoped archives, Import/Export<->history/provenance, PWA update<->stored Job data. Existing tests may be reused only where they prove the interaction boundary; missing cross-module edges require new deterministic or Playwright evidence.

Accepted Stage 7 evidence:
- entry basis Stage 6 `A_ACCEPT` at `485b3efd448f6757bdc3283f8ad3a34923c9bf10`, P0=0, P1=0;
- matrix `audits/function-capability/STAGE7_CROSS_MODULE_REGRESSION_MATRIX.md`;
- new PWA lifecycle browser journey `STAGE7-XMOD-01` creates a valid Approved Quote through the live Quote UI, captures the fully normalized persisted Job, deletes owned Bruno caches, unregisters service workers, reloads/re-registers, and proves the complete parsed Job plus Electrical Tasks/material/archive/Residential/Quote provenance survives unchanged;
- implementation SHA `e7ac30404bf17698507ad6ea17b14f3a6fcafcf6`;
- implementation exact-head CI #722 / id `35286879122`, SUCCESS, `826/826` deterministic, Playwright `171 scheduled / 89 passed / 82 explicit viewport-contract skips / 0 failed`;
- independent audit branch/report `audit/function-capability-stage7-e7ac304` / `audits/function-capability/FUNCTION_CAPABILITY_STAGE7_AUDIT_e7ac304.md`, verdict `A_ACCEPT`, P0=0, P1=0;
- evidence synchronization SHA `dbaeb3459b9e0da0fd7ff9b7ee5527abf7d63a88`;
- synchronization exact-head CI #723 / id `35287548626`, SUCCESS;
- exact provenance `TESTED_HEAD_SHA == EXPECTED_HEAD_SHA == dbaeb3459b9e0da0fd7ff9b7ee5527abf7d63a88`;
- synchronization deterministic `826/826`; Playwright `171 scheduled / 89 passed / 82 explicit viewport-contract skips / 0 failed`;
- acceptance validation branch/report `audit/function-capability-stage7-acceptance-dbaeb34` / `audits/function-capability/FUNCTION_CAPABILITY_STAGE7_ACCEPTANCE_VALIDATION_dbaeb34.md`, result `VALIDATED`;
- no P0/P1 remains open.

Gate: ACCEPTED.

---

# STAGE 8 — Responsive / PWA Browser Audit
STATUS: ACTIVE
Entry basis: Stage 7 `A_ACCEPT`, exact-head synchronization CI #723 green, independent audit and acceptance validation complete, P0=0/P1=0.

Run Playwright phone/tablet/desktop profiles. Verify critical actions reachable, no critical horizontal overflow, bottom navigation not covering required controls, long forms/tables usable. Run service-worker/offline/upgrade scenarios where deterministic. Browser limitations are recorded, not guessed away.

Required Stage 8 contract:
- viewports: phone 390 px, tablet 820 px, desktop 1440 px, while honoring master ranges 360–430 / 768–1024 / >=1200;
- every critical workflow entry and required terminal action remains visible/reachable without hidden overlap;
- no critical page/workspace produces document-level horizontal overflow that makes required controls/results unreachable;
- fixed/sticky navigation must not cover the focused field, primary action, result, confirmation, modal action or final table rows;
- long forms and wide tables must remain operable by intentional local scrolling/wrapping rather than accidental page clipping;
- PWA offline shell must load deterministically after a successful install;
- service-worker update/cache replacement may delete only owned stale Bruno caches and must preserve persisted user Job/application state;
- required load failures/page errors/uncaught exceptions fail the journey;
- viewport-specific skips require an explicit contract reason and may not hide a responsive defect;
- high-risk responsive/PWA acceptance requires exact-head deterministic + Playwright CI and separate exact-SHA independent audit.

Required deliverable: `audits/function-capability/STAGE8_RESPONSIVE_PWA_MATRIX.md`.

### Stage 8 architecture corrective substage — ACTIVE

#### Binding production-tree hygiene
- `main` is the current production tree, not executable history.
- superseded UI/runtime/renderer/patch files that own the same capability must be physically removed after replacement is proven; omission from the main loader alone is insufficient;
- Git history is the default backup for removed implementations; any exceptional human-readable archive must live outside runtime paths and must never be loaded or cached as executable application code;
- completed one-shot repair workflows are removed after application; durable CI only remains under `.github/workflows`;
- a replacement requires repository-wide search for retired filenames, handlers, selectors, storage writers, dynamic loaders and stale version literals;
- Stage 8 cannot be accepted while multiple executable generations of the same user-facing capability remain in the production tree;
- visible build version must have one runtime authority and must remain stable after delayed DOM mutations, Journal navigation, invoice preview and reload.

Real-device testing discovered runtime generation flicker and duplicate ownership. Before Stage 8 acceptance, perform architecture cleanup under `audits/function-capability/STAGE8_RUNTIME_ARCHITECTURE_CLEANUP.md`: physically remove retired duplicate invoice/Journal writers, enforce one bootstrap + one visible build version source, prohibit dynamic resurrection of retired business modules, and inventory remaining legacy monolith ownership in `index.html`. Version stability must be proven in real Browser E2E after reload, delayed mutations, Journal entry and invoice preview.


Gate: ACTIVE — discover responsive/PWA gaps, define explicit invariants, add executable browser evidence, correct every P0/P1, then exact-head CI and independent audit.

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
  role_completed: STAGE_7_ACCEPTANCE_VALIDATOR
  exact_head_sha: READ_CURRENT_MAIN_AT_EXECUTION
  next_role: IMPLEMENTER
  next_stage: STAGE_8_RESPONSIVE_PWA_BROWSER_AUDIT
  branch_policy: separate_exact_sha_audit_branch_after_green
  do_not_advance_without_accept: true
```

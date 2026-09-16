# Bruno Electric — Function / Capability Audit Master

MASTER_STATUS: READY
CURRENT_STAGE: STAGE_0_BASELINE_AND_REQUIREMENTS_INDEX
EXECUTION_MODE: STRICT_SEQUENTIAL
IMPLEMENTATION_BRANCH: main
AUDIT_BRANCH_POLICY: separate exact-SHA audit branches
PRIMARY_GOAL: prove that declared product capabilities actually work end-to-end and match their governing plans/specifications

## Mission

Perform a full functional/capability audit of Bruno Electric.

This audit is not limited to checking whether functions or files exist. It must prove, with reproducible evidence, that every declared capability:

1. exists in the intended UI/workflow;
2. reaches the intended runtime implementation;
3. accepts valid inputs and rejects invalid/unsupported inputs correctly;
4. produces the expected deterministic result;
5. persists or mutates data only when the workflow says it should;
6. preserves Job isolation and historical provenance;
7. survives reload/import/export/PWA boundaries where applicable;
8. does not silently break adjacent workflows;
9. matches the governing Master plan, accepted audit records and current product contract;
10. has an explicit status: PASS / PARTIAL / FAIL / UNTESTED / NOT_APPLICABLE.

The audit unit is a USER CAPABILITY, not merely a JavaScript function.

Example capability chain:
`Create Job -> open Electrical Tasks -> calculate -> Save -> reload -> Apply to Job -> verify material provenance -> edit task -> confirm Job is unchanged until explicit Update Job from Task`.

A JavaScript function existing in source code is not evidence that the capability works.

---

# Non-negotiable principles

- PLAN CLAIM != IMPLEMENTED BEHAVIOR.
- IMPLEMENTED CODE != REACHABLE UI.
- REACHABLE UI != CORRECT RESULT.
- CORRECT RESULT != CORRECT PERSISTENCE.
- UNIT TEST PASS != END-TO-END CAPABILITY PASS.
- CURRENT STATE != HISTORICAL SNAPSHOT.
- Save != Apply.
- Blank != zero.
- Unknown != zero.
- Your Cost != Customer Price.
- Live calculation != Approved Quote.
- Residential != Commercial.
- Job A state must never contaminate Job B.
- Unsupported configuration must fail closed.
- No capability may be marked PASS without evidence.
- Any changed production SHA invalidates an audit pinned to an older SHA.

---

# Audit evidence model

Every capability receives a Capability ID and one row in the canonical matrix.

Required fields:

```text
capability_id
product_domain
capability_name
governing_requirement
requirement_source_file
requirement_source_section
ui_entry
runtime_entry
primary_modules
input_contract
expected_output
expected_side_effects
forbidden_side_effects
persistence_scope
job_isolation_required
historical_snapshot_required
offline_requirement
responsive_requirement
unit_test_evidence
integration_test_evidence
manual_or_browser_evidence
negative_test_evidence
exact_sha
status
severity_if_failed
finding_ids
notes
```

Canonical statuses:

- `PASS` — requirement is proven end-to-end.
- `PARTIAL` — meaningful portion works but requirement is incomplete.
- `FAIL` — behavior contradicts requirement or is broken.
- `UNTESTED` — implementation may exist but evidence is insufficient.
- `NOT_APPLICABLE` — capability is intentionally outside current supported scope and this is documented.

No `UNKNOWN = PASS` shortcut is allowed.

---

# Severity model

## P0 — Release blocker / destructive
Examples:
- cross-Job data contamination;
- silent destructive migration;
- approved quote mutation;
- materially wrong electrical calculation presented as valid;
- silent cost-domain substitution;
- Apply/Update action mutating the wrong Job;
- data loss without explicit destructive user action.

## P1 — Functional blocker / contract violation
Examples:
- advertised function cannot be completed;
- UI action is disconnected from runtime;
- Save behaves like Apply;
- import/export loses supported data;
- required workflow state cannot be restored;
- plan claims a completed capability that current runtime does not provide;
- required fail-closed behavior instead returns a fabricated result.

## P2 — Important non-blocking gap
Examples:
- weak error explanation;
- missing secondary negative test;
- incomplete responsive optimization where workflow remains usable;
- missing observability/evidence for a low-risk path.

## P3 — Improvement
Examples:
- wording, discoverability, minor redundancy, developer ergonomics.

Master cannot complete with any P0/P1 open.

---

# Four-layer proof rule

A capability should be tested at four layers when applicable.

### L1 — Contract / plan traceability
Prove the feature is actually required, optional or unsupported.
Sources may include:
- accepted Master plans;
- current state JSON files;
- accepted audit reports;
- current developer reports;
- current UI wording and explicitly documented product contract.

### L2 — Runtime / deterministic behavior
Prove modules, functions and calculations behave correctly with deterministic tests.
Include valid, boundary, blank, zero, malformed and unsupported inputs where relevant.

### L3 — Workflow / persistence integration
Prove the user action reaches the correct runtime and causes exactly the intended side effects.
Examples:
- Save only saves;
- Apply creates Job material snapshots;
- Quote approval freezes the approved snapshot;
- invoice uses the approved snapshot;
- switching Jobs changes the active task/material/archive scope correctly.

### L4 — UI / field execution
Prove the user can actually reach and complete the workflow on supported layouts and PWA state.
Prefer browser automation or reproducible DOM/runtime harnesses where available.
When real-device automation is unavailable, status must explicitly distinguish automated evidence from source/static evidence.

A high-risk capability cannot receive PASS solely from L1 + L2 if L3 or L4 is materially required.

---

# Canonical capability domains

The audit must inventory at least these domains before testing begins:

1. App shell / primary navigation / deep links / back-forward behavior
2. Job lifecycle / Job switching / Job isolation
3. Dispatch / Journal
4. Catalog
5. Custom / Special-order materials
6. Material quantity and Your Cost semantics
7. Residential estimator
8. Residential takeoff / archive / history / apply-to-job
9. Electrical core calculators
10. Electrical Tasks shell and templates
11. Feeder / Panel Run
12. Branch Circuit
13. EVSE
14. HVAC
15. Motor
16. Transformer Feed
17. Generator / Feeder
18. Long-distance voltage drop
19. Raceway engine
20. Grounding / neutral / EGC semantics
21. Electrical Task material takeoff
22. Electrical Task save/archive/recalculate/apply/update workflow
23. Professional Task Solver
24. Quote lifecycle
25. Approved Quote immutability
26. Fixed-price Invoice
27. T&M separation
28. Pricing / markup / margin semantics
29. Import / Export
30. Legacy / partial / malformed data behavior
31. PWA install/cache/offline/upgrade behavior
32. Responsive phone/tablet/desktop usability
33. NEC / jurisdiction / source provenance surfaces

Additional domains discovered from current `main` must be added; this list is a floor, not a ceiling.

---

# STAGE 0 — Baseline + requirements index
STATUS: READY

Goal: establish an authoritative exact-head baseline and build a requirements inventory before evaluating behavior.

Required work:
- pin exact current `main` SHA;
- confirm exact-head CI baseline and deterministic test count;
- index all active Master plans, accepted state JSON, developer reports and accepted audit reports;
- identify stale plans that no longer describe current product state;
- create `audits/function-capability/REQUIREMENTS_INDEX.md`;
- create initial capability registry with stable IDs;
- explicitly separate CURRENT REQUIREMENT, LEGACY REQUIREMENT and UNSUPPORTED/DEFERRED scope.

Gate:
- exact baseline SHA recorded;
- no requirement is silently inferred from chat memory;
- every capability has at least one traceable source or is explicitly classified as discovered runtime functionality.

---

# STAGE 1 — Runtime capability inventory
STATUS: LOCKED

Goal: inventory what the current product can actually execute.

Required work:
- map UI controls/routes to runtime handlers;
- map runtime handlers to storage/calculation/services;
- identify dead/unreachable runtime functions;
- identify visible UI actions with no working runtime path;
- identify duplicated or conflicting implementations;
- identify dormant prototype files not loaded into production;
- map service-worker/core-shell loading paths.

Deliverables:
- `audits/function-capability/RUNTIME_CAPABILITY_MAP.md`
- machine-readable `audits/function-capability/capabilities.json`

Gate:
Every current user-facing action belongs to a Capability ID or is documented as infrastructure-only.

---

# STAGE 2 — Requirement-to-runtime gap audit
STATUS: LOCKED

For every capability compare:

`PLAN / SPEC -> UI -> RUNTIME -> TEST -> STORAGE/SIDE EFFECT -> RESULT`

Classify:
- implemented exactly;
- implemented differently but valid and documented;
- partially implemented;
- missing;
- unreachable;
- implemented but undocumented;
- obsolete plan claim.

Do not fix production code in the audit role.

Deliverable:
`audits/reports/FUNCTION_CAPABILITY_STAGE2_TRACEABILITY.md`

Any discovered P0/P1 remains a blocker and becomes a corrective item after audit evidence is frozen.

---

# STAGE 3 — Core workflow executable scenarios
STATUS: LOCKED

Create deterministic end-to-end scenario tests for critical user journeys.

Minimum scenarios:

### Job + materials
- create/use Job A;
- add standard material;
- add custom material;
- blank Your Cost remains unresolved;
- explicit zero remains zero;
- switch to Job B and prove isolation;
- switch back to Job A and prove restoration.

### Residential
- valid residential calculation;
- save/archive;
- reload;
- apply to Job;
- verify historical snapshot;
- update current calculation and prove prior applied snapshot does not mutate silently.

### Electrical Tasks
- Feeder task calculation;
- Save;
- reload;
- Recalculate;
- Apply to Job;
- edit task;
- verify `CHANGED_SINCE_APPLY`;
- explicit Update Job from Task;
- verify material history/provenance.

### Quote / Invoice
- build quote from current Job state;
- approve quote;
- mutate live Job after approval;
- prove approved quote is unchanged;
- create fixed-price invoice from approved snapshot;
- verify T&M path remains separate.

### Import / Export
- export representative Job containing current supported records;
- import into clean state;
- prove supported records survive;
- prove unrelated active-job state is not inherited.

Each scenario must assert both intended side effects and forbidden side effects.

---

# STAGE 4 — Function-level deterministic audit
STATUS: LOCKED

Goal: complement capability testing with lower-level executable coverage.

Build a production-function inventory for high-value modules and classify each exported/public function:
- directly tested;
- indirectly tested through integration;
- trivial accessor/pure plumbing;
- unreachable/dead;
- untested high-risk.

Important: 100% function-call coverage alone is NOT the acceptance criterion.

For deterministic calculation and persistence modules, add targeted tests for:
- branches;
- invalid inputs;
- boundary values;
- rollback/error paths;
- duplicate IDs/stale IDs;
- blank/zero distinctions;
- unsupported configurations.

Deliverables:
- `audits/function-capability/FUNCTION_COVERAGE_MAP.md`
- coverage metrics if a safe instrumentation method is introduced.

A coverage percentage may be reported, but it must never replace semantic assertions.

---

# STAGE 5 — Negative / fault-injection audit
STATUS: LOCKED

Prove the app behaves safely when things go wrong.

Test at least:
- malformed top-level storage JSON;
- malformed partial records;
- missing referenced task/material IDs;
- stale active IDs;
- unsupported calculator inputs;
- impossible raceway/configuration result;
- failed Apply/Update with rollback;
- import with incomplete optional fields;
- service-worker offline fallback;
- stale cache upgrade;
- unavailable optional assets;
- duplicate/repeated user action where idempotency matters.

Expected behavior must be explicit: fail closed, preserve prior data, explain unresolved state, or safely no-op depending on contract.

---

# STAGE 6 — UI action wiring audit
STATUS: LOCKED

Goal: find buttons, selectors, links or controls that look functional but do not complete the promised action.

For each actionable control verify:
- visible/reachable in intended project mode;
- handler is bound;
- handler reaches intended domain action;
- disabled/hidden states are correct;
- no accidental double-handler override;
- action feedback reflects actual result;
- keyboard/touch activation works where automation permits;
- navigation does not hide required final action.

Special attention:
- dynamic Stage UI overlays;
- onchange reassignment;
- mobile bottom navigation;
- task-type switching;
- Save / Apply / Update distinctions;
- modal/select interactions.

Deliverable:
`audits/reports/FUNCTION_CAPABILITY_STAGE6_UI_WIRING.md`

---

# STAGE 7 — Cross-module regression matrix
STATUS: LOCKED

Run a matrix proving changes or actions in one domain do not corrupt another.

Required pairs include:
- Catalog <-> Job Materials
- Job Materials <-> Quote
- Quote <-> Approved Quote
- Approved Quote <-> Invoice
- Electrical Tasks <-> Job Materials
- Residential <-> Job Materials
- Custom Materials <-> pricing/margin math
- Job switching <-> every saved/archive domain
- Import/Export <-> archive/history/provenance
- PWA update <-> stored Job data

Every pair receives PASS/PARTIAL/FAIL/UNTESTED with evidence.

---

# STAGE 8 — Responsive / PWA executable audit
STATUS: LOCKED

Validate supported layout contracts:
- phone target 360–430 px;
- tablet 768–1024 px;
- desktop >=1200 px.

Verify critical actions are reachable and not hidden behind fixed navigation.
Verify long forms/results do not suffer critical horizontal overflow.
Verify offline core shell and service-worker upgrade behavior.

If real-device or screenshot automation is unavailable, explicitly record the evidence limit; do not claim visual PASS beyond available proof.

---

# STAGE 9 — Corrective master generation
STATUS: LOCKED

After Stages 0–8 freeze findings:
- create a corrective master from every P0/P1 and selected P2;
- group corrections by root cause, not by symptom;
- production fixes go to `main` under the repository's current development policy;
- every correction gets deterministic regression tests;
- run exact-head CI after corrections.

No finding may disappear from the ledger. It moves from OPEN -> FIXED_PENDING_REAUDIT -> VERIFIED_CLOSED.

---

# STAGE 10 — Independent re-audit
STATUS: LOCKED

Create a new exact-SHA audit branch.
The re-auditor must:
- verify each corrective finding independently;
- rerun affected capability scenarios;
- run protected regression matrix;
- confirm no new P0/P1;
- verify exact-head CI provenance.

Changed code invalidates prior PASS evidence for affected capabilities until re-tested.

---

# STAGE 11 — Final capability certification
STATUS: LOCKED

Completion requires:
- every inventoried capability classified;
- zero P0;
- zero P1;
- every declared current requirement mapped to implementation or explicitly unsupported scope;
- critical workflows have executable evidence;
- Job isolation matrix green;
- Save/Apply/Approved snapshot invariants green;
- exact final SHA + exact-head CI green;
- final independent audit A_ACCEPT.

Final deliverables:
- `audits/function-capability/CAPABILITY_MATRIX.md`
- `audits/function-capability/capabilities.json`
- `audits/function-capability/FUNCTION_COVERAGE_MAP.md`
- `audits/reports/FUNCTION_CAPABILITY_FINAL_AUDIT.md`
- `dev-reports/FUNCTION_CAPABILITY_CORRECTIVE_REPORT.md` if corrections were required
- final master state JSON.

MASTER_COMPLETE only after final re-audit has 0 P0/P1.

---

# Recommended automation architecture

Use three complementary test layers:

1. **Node deterministic tests** — calculation, normalization, persistence, state transitions.
2. **DOM/workflow harness** — load app modules in controlled DOM/localStorage environment and activate real UI handlers.
3. **Browser E2E** — recommended for the highest-value workflows when a browser automation runner is introduced; verify actual navigation, click/type flows, reload and responsive breakpoints.

Optional later enhancement:
- instrument test-only function/branch coverage with a standard JS coverage tool;
- publish coverage artifact from CI;
- use coverage only to locate untested code, never as proof of correctness.

---

# Audit execution loop

For each stage:

`DISCOVER -> SPECIFY EXPECTED BEHAVIOR -> TEST -> COLLECT EVIDENCE -> CLASSIFY -> AUDIT -> CORRECT P0/P1 -> EXACT-HEAD CI -> RE-AUDIT -> ACCEPT`

Independent auditor restrictions:
- no production code edits;
- no weakening tests;
- no changing expected result merely to match current runtime;
- no PASS without reproducible evidence;
- findings must reference exact SHA, files/modules, Capability ID and failed contract.

---

# Handoff

```yaml
handoff:
  role_completed: ORCHESTRATOR
  exact_head_sha: READ_CURRENT_MAIN_AT_EXECUTION
  verdict_or_gate: FUNCTION_CAPABILITY_AUDIT_MASTER_READY
  blockers: []
  files_to_read_next:
    - dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md
    - dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json
    - dev-plans/ELECTRICAL_TASKS_AUTONOMOUS_MASTER.md
    - dev-plans/AUTONOMOUS_AI_HANDOFF_PROTOCOL.md
  next_role: AUDIT_ORCHESTRATOR
  next_action: Execute Stage 0 against current main, build authoritative requirements index and capability registry, then continue sequentially without skipping gates.
  prohibited_actions:
    - mark_capability_pass_without_evidence
    - silently_change_requirement_to_match_runtime
    - skip_p0_p1_corrective_cycle
```

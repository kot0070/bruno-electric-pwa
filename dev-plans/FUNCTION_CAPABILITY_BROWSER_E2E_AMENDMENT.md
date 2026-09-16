# Bruno Electric — Function Capability Audit: Mandatory Browser E2E Amendment

STATUS: BINDING
PARENT_MASTER: `dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md`
EXECUTION_POLICY: this amendment is part of the parent master completion gate and overrides any wording that described Browser E2E as optional/recommended.

## Purpose

The Function / Capability Audit must prove that supported user workflows work in a real browser, not only in source, unit tests, or DOM harnesses.

A capability that materially depends on user interaction, navigation, browser storage, reload, responsive layout, service-worker behavior, or UI state MAY NOT receive final `PASS` without Browser E2E evidence unless it is explicitly classified `NOT_APPLICABLE` with a written reason.

## Required implementation

Introduce Playwright-based Browser E2E into the repository and CI without requiring user interaction.

Required baseline:
- Playwright test runner and pinned project configuration;
- deterministic local static server for the PWA/app under test;
- Chromium as mandatory CI browser;
- phone viewport profile in the 360–430 px target range;
- tablet viewport profile in the 768–1024 px target range;
- desktop viewport >=1200 px;
- isolated browser context/localStorage per scenario unless persistence is the explicit subject of the test;
- screenshots, trace, console output, and test report retained on failure when CI artifact support permits;
- exact-head provenance: Browser E2E must run against the same tested commit SHA as the deterministic suite;
- Browser E2E failure blocks capability certification for the affected workflow.

## Mandatory E2E journeys

### E2E-01 App shell / navigation
- load application from a clean browser context;
- verify primary navigation renders;
- navigate across supported major workspaces;
- verify Electrical Tools opens;
- verify back/forward/deep-link behavior for representative routes;
- assert no uncaught page errors during the journey.

### E2E-02 Job A / Job B isolation
- create or select Job A;
- create Job-specific data;
- switch to Job B;
- prove Job A data is absent from Job B;
- create different Job B data;
- switch back to Job A;
- prove Job A state restores unchanged.

### E2E-03 Catalog / standard material / custom material
- add a catalog material to the active Job;
- add a custom/special-order material;
- verify quantity editing;
- verify blank Your Cost remains unresolved;
- verify explicit zero remains numeric zero;
- reload browser and confirm persisted state.

### E2E-04 Residential workflow
- enter supported residential inputs;
- calculate;
- save/archive;
- reload;
- load saved calculation;
- apply to Job;
- verify expected Job-side effect and historical snapshot behavior.

### E2E-05 Electrical Tasks core
- open Electrical Tasks;
- select Feeder / Panel Run;
- enter representative valid inputs;
- calculate and verify result surface appears;
- Save;
- reload;
- load saved task;
- Apply to Job;
- modify task;
- verify applied Job snapshot does not silently change;
- verify changed-since-apply state;
- explicitly Update Job from Task;
- verify new provenance/history state.

### E2E-06 Advanced Electrical Task templates
At minimum execute one valid browser journey for each supported template entry:
- Branch Circuit;
- EVSE;
- HVAC;
- Motor;
- Transformer Feed;
- Generator / Feeder;
- Generic Long Run.

The browser test must prove that the selected UI template reaches the intended task type/runtime and does not accidentally execute a different template path.

### E2E-07 Professional Task Solver
- type a supported natural-language input;
- extract known facts;
- verify unresolved fields remain unresolved rather than guessed;
- use known facts in form;
- prove no automatic calculation/save/apply occurred;
- complete remaining inputs and calculate through the normal explicit action.

### E2E-08 Quote / Approved Quote / Invoice
- create representative Job content;
- generate quote;
- approve quote;
- modify live Job afterward;
- prove approved quote remains immutable;
- create fixed-price invoice from approved snapshot;
- verify T&M workflow remains distinct.

### E2E-09 Import / Export
- create representative supported Job state;
- export;
- clear/replace browser state in a controlled test context;
- import exported data;
- verify supported records restore correctly;
- verify unrelated active-job state is not inherited.

### E2E-10 Reload / storage resilience
For representative workflows verify:
- reload after data entry;
- reload after Save;
- reload after Apply;
- stale active identifiers fail safely;
- no cross-job contamination after reload.

### E2E-11 Responsive action reachability
Execute critical workflows at:
- phone viewport;
- tablet viewport;
- desktop viewport.

Verify:
- no critical horizontal overflow;
- primary actions are visible/reachable;
- bottom navigation does not cover required action controls;
- long result tables/forms remain usable;
- task solver actions remain reachable.

### E2E-12 PWA / offline / service-worker
Where Playwright/service-worker environment allows deterministic execution:
- register service worker;
- confirm core shell becomes available;
- simulate offline after successful warm load;
- reload/navigate to supported core shell;
- verify offline fallback;
- verify owned-cache upgrade does not delete unrelated caches.

If a browser limitation prevents a specific service-worker assertion, that item must be recorded as `UNTESTED` or separately proven by deterministic service-worker tests. It must not be silently marked PASS.

## Browser evidence requirements

Each Browser E2E test must have a stable Capability ID linkage.

For each tested journey record:
- capability IDs covered;
- exact SHA;
- browser/project profile;
- viewport;
- start state;
- user actions;
- expected visible result;
- expected storage/side effect;
- forbidden side effect;
- PASS/FAIL;
- trace/screenshot artifact path on failure where available.

## Console/runtime error gate

During critical Browser E2E journeys, unexpected:
- `pageerror`;
- uncaught promise rejection;
- fatal console error;
- failed required script load;
- failed required service-worker/core-shell load

must fail the E2E scenario unless explicitly allowlisted with a documented reason.

## Selector policy

Do not build fragile tests around arbitrary text or CSS structure when a stable semantic selector can be added safely.

Preferred order:
1. accessible role/name;
2. existing stable ID;
3. stable `data-testid`/domain-specific data attribute added for testability;
4. CSS selector only when semantically stable.

Test-only selectors must not change product behavior.

## CI gate

Create a Browser E2E workflow or extend the existing CI so release/capability acceptance requires both:

`DETERMINISTIC_SUITE_GREEN && PLAYWRIGHT_E2E_GREEN`

The workflow must expose the tested exact SHA and reject provenance mismatch.

No final Capability Audit `A_ACCEPT` is permitted while mandatory Browser E2E is red or absent.

## Relationship to parent master stages

This amendment changes the parent master gates as follows:

- Stage 0: detect current browser-test infrastructure and establish E2E baseline.
- Stage 1: capability registry gains `browser_e2e_required` and `browser_e2e_test_ids`.
- Stage 3: core workflow executable scenarios MUST include Playwright implementations for the mandatory journeys above.
- Stage 5: browser-level negative/fault paths are added where realistically reproducible.
- Stage 6: UI action wiring requires Browser E2E evidence for user-facing controls.
- Stage 8: responsive/PWA audit runs Playwright viewport projects and available offline/service-worker scenarios.
- Stage 9: any failed Browser E2E finding becomes corrective P0/P1/P2 according to impact.
- Stage 10: re-audit reruns affected Browser E2E scenarios against the corrective exact SHA.
- Stage 11: final certification requires mandatory Playwright E2E green on exact final SHA.

## Updated PASS rule

For a user-facing high-risk capability:

`PASS = CONTRACT_TRACEABILITY + DETERMINISTIC_RUNTIME + INTEGRATION/PERSISTENCE + REAL_BROWSER_E2E`

Static source evidence or unit tests alone are insufficient.

## User intervention policy

The Playwright setup, tests, CI workflow, test data, local server, traces and audit execution are to be implemented autonomously from the repository.

User intervention is required only if an external blocker exists that cannot be resolved from repository/CI context, such as unavailable required credentials for an external third-party service. Current Bruno Electric local/PWA workflows should not require such intervention.

## Completion gate

This amendment is complete only when:
- Playwright infrastructure exists in `main`;
- mandatory critical journeys have executable tests;
- tests run in CI against exact head;
- failures produce useful diagnostics;
- capability matrix references Browser E2E evidence;
- final capability audit has 0 P0/P1;
- final deterministic suite and Browser E2E are both green.

# Bruno Electric — Function Capability Stage 3 Independent Audit

AUDIT_SHA: `05186e7286bc088e4e10d0365f3d0ea47b1a4d61`
AUDIT_BRANCH: `audit/function-capability-stage3-05186e7`
STAGE: `STAGE_3_EXECUTABLE_CORE_WORKFLOWS_PLAYWRIGHT_FOUNDATION`
VERDICT: `A_REJECT_CORRECTIVE_REQUIRED`
P0_OPEN: 0
P1_OPEN: 1

## Exact-head execution evidence

Electrical Calculator Tests run #569 / id `35219014909` completed `success` for exact tested head `05186e7286bc088e4e10d0365f3d0ea47b1a4d61`.

Verified CI evidence:
- checkout provenance: `TESTED_HEAD_SHA == EXPECTED_HEAD_SHA == 05186e7286bc088e4e10d0365f3d0ea47b1a4d61`;
- deterministic suite: `771/771 passed`;
- Playwright command: Chromium desktop + phone + tablet projects;
- Playwright result: `25 passed`, `38 skipped`, no failed/flaky tests;
- configured viewports: desktop `1440x1000`, phone `390x844`, tablet `820x1180`;
- deterministic local static server: `tests/e2e/static-server.js` on `127.0.0.1:4173`;
- failure diagnostics configured: retained trace, screenshot, video, HTML report; CI failure artifact upload;
- mandatory journeys E2E-01 through E2E-12 are executable across `tests/e2e/function-capability.spec.js` and `tests/e2e/function-capability-contract.spec.js`;
- E2E-11 executes in all three viewport projects; core desktop journeys are intentionally skipped in duplicate phone/tablet executions where E2E-11 owns responsive reachability.

## Functional journey review

The mandatory Stage 3 browser journeys are materially represented:
- E2E-01: shell navigation, deep-link, back/forward and Electrical Tools reachability;
- E2E-02: Job A/B replacement isolation plus A -> B -> A restoration closure;
- E2E-03: standard/custom material, blank-vs-zero Your Cost, quantity edit and reload persistence;
- E2E-04: Residential calculate/save/reload/load/apply/history;
- E2E-05: Feeder calculate/save/reload/apply/edit/changed-since-apply/update/history;
- E2E-06: Branch, EVSE, HVAC, Motor, Transformer Feed, Generator/Feeder and Generic Long Run route to intended advanced runtime;
- E2E-07: Solver extracts explicit facts, leaves unresolved facts unresolved, does not auto-save/apply and reaches explicit calculation;
- E2E-08: representative live Job content, Approved Quote immutability after Job mutation, fixed-price invoice basis and distinct T&M surface;
- E2E-09: real Export Job bytes are imported after controlled active-state replacement and unrelated state is not inherited;
- E2E-10: user entry reload persistence and stale identifier resilience;
- E2E-11: critical action reachability, long task form/results, bottom-nav non-obstruction and horizontal-overflow checks across configured viewport projects;
- E2E-12: service-worker readiness, owned-cache upgrade cleanup, preservation of unrelated cache and offline core-shell navigation.

The Stage 3 implementation also corrected a browser-discovered production defect before this audit: an Approved Quote snapshot could be removed by a subsequent stale in-memory Job save. Exact-head browser evidence now proves the snapshot remains stable after a live Job material mutation.

## Finding FCA-S3-P1-001 — Mandatory browser error policy is not applied to every critical journey

Severity: `P1`
Status: `OPEN`

Binding browser policy requires critical journeys to fail on unexpected `pageerror`, uncaught/fatal browser errors, fatal console errors, failed required script loads and failed required service-worker/core-shell loads unless an exception is explicitly allowlisted with a documented reason.

At the audited SHA, `tests/e2e/function-capability-contract.spec.js` implements the stronger policy: it records `pageerror`, unexpected `console.error`, failed/HTTP-error script and service-worker requests, and has one exact documented Chromium meta-CSP diagnostic allowlist.

However, `tests/e2e/function-capability.spec.js` uses a separate weaker `criticalErrors()` collector that only records:
- `pageerror`;
- script responses with HTTP status >= 400.

It does **not** record unexpected `console.error`, `requestfailed` for required scripts, or service-worker failures. Mandatory E2E-04 Residential and E2E-05 Electrical Tasks Feeder are only executed in this base suite, so those critical journeys can remain green while violating the binding runtime-error policy.

### Required corrective

Unify or mirror the strict error collector for the base mandatory journey suite so every critical browser journey fails on:
- `pageerror`;
- unexpected `console.error` except the exact documented meta-CSP diagnostic;
- failed required script/service-worker requests;
- required script/service-worker HTTP errors.

Do not broaden the allowlist and do not downgrade real request failures to warnings.

After correction:
1. run deterministic + Playwright CI on the same exact corrective SHA;
2. require zero failed/flaky mandatory browser tests;
3. create a new exact-SHA re-audit branch;
4. verify `FCA-S3-P1-001 -> VERIFIED_CLOSED` before Stage 3 acceptance.

## Non-blocking observations

- The exact meta-CSP Chromium diagnostic allowlist is narrowly documented and does not conceal other console errors.
- Quote approval currently synchronizes the workspace by a controlled reload after persisting the immutable snapshot. This is user-visible but preserves the current replacement/import boundary and is not a Stage 3 correctness blocker.
- Capability registry entries outside the mandatory Stage 3 core journeys remain `UNTESTED`; Stage 3 acceptance must not be interpreted as final PASS certification for every registered capability.

## Gate

Stage 3: **A_REJECT_CORRECTIVE_REQUIRED**.

P0=0, P1=1 (`FCA-S3-P1-001`).

Do not unlock Stage 4 until the corrective exact-SHA CI is green and an independent Stage 3 re-audit verifies the finding closed.

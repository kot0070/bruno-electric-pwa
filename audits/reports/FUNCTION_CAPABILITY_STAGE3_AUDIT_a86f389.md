# Bruno Electric — Function / Capability Stage 3 Audit

AUDIT_ROLE: INDEPENDENT
AUDITED_PRODUCTION_SHA: `a86f38937d82399b1d37cfe9ca49405b0633d1be`
AUDIT_BRANCH: `audit/function-capability-stage3-a86f389`
STAGE: `STAGE_3_EXECUTABLE_CORE_WORKFLOWS_PLAYWRIGHT_FOUNDATION`
VERDICT: `A_REJECT_CORRECTIVE_REQUIRED`
P0_OPEN: 0
P1_OPEN: 1

## Scope
Independent exact-SHA review of the Stage 3 Playwright foundation, mandatory browser journeys, deterministic/browser same-SHA CI provenance, viewport coverage, fatal browser error handling, persistence/integration assertions, PWA/offline assertions, and current authoritative audit state.

## Exact-SHA CI evidence
- Production SHA: `a86f38937d82399b1d37cfe9ca49405b0633d1be`.
- Electrical Calculator Tests run #585 / id `35225679044`: `SUCCESS`.
- Workflow provenance printed and verified `TESTED_HEAD_SHA=a86f38937d82399b1d37cfe9ca49405b0633d1be` and identical expected SHA.
- Deterministic suite: `787/787 passed`.
- Playwright: 66 scheduled project/test entries; `28 passed`, `38 skipped`, `0 failed`. Skips are explicit viewport ownership skips; required cross-viewport journeys are exercised separately.
- `E2E-EVSE-01` executes successfully in Chromium desktop (1440px), phone (390px), and tablet (820px).

## Browser foundation review
PASS:
- Playwright configured at repository root.
- Deterministic local static server configured through `webServer`.
- Chromium desktop/phone/tablet projects configured at 1440/390/820 px.
- CI checks exact checkout provenance before tests.
- Deterministic Node suite and Playwright execute in the same job and same exact checkout.
- `pageerror`, unexpected `console.error`, required script/service-worker HTTP failures and request failures are fatal in the core suites, with one documented Chromium CSP diagnostic allowlisted.
- traces/screenshots/video are retained on failure; CI uploads Playwright failure evidence.
- browser storage is isolated by Playwright contexts; persistence/reload tests explicitly retain state inside their own test context.
- browser tests drive rendered UI controls rather than substituting direct module-only proof for user actions.

## Mandatory journey representation
PASS for Stage 3 representation:
- E2E-01 shell/navigation/deep-link/back-forward.
- E2E-02 Job A/B replacement/isolation/restore contract.
- E2E-03 Catalog standard/custom materials, blank vs zero Your Cost, quantity/reload persistence.
- E2E-04 Residential calculate/save/reload/load/apply/history.
- E2E-05 Electrical Tasks Feeder save/apply/edit/changed-since-apply/update/history.
- E2E-06 Branch, EVSE, HVAC, Motor, Transformer Feed, Generator/Feeder and Generic Long Run advanced templates.
- E2E-07 Professional Task Solver explicit extraction/no guessing/no automatic save/apply.
- E2E-08 Quote approval immutability, fixed-price invoice basis and T&M separation.
- E2E-09 representative Job export/import round-trip.
- E2E-10 reload/stale identifier resilience.
- E2E-11 responsive critical-action reachability on desktop, phone and tablet.
- E2E-12 service-worker cache ownership, offline shell and upgrade behavior.
- Additional E2E-EVSE-01: professional Tesla/EVSE sizing/formulas/charge-time/BOM path on all three viewport projects.

## Finding FCA-S3-P1-001 — Authoritative audit state still claims browser infrastructure is not implemented
Severity: `P1`
Status: `OPEN`

### Evidence
`dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json` is declared authoritative together with the master, but at audited SHA it still records:

`browser_e2e.current_infrastructure_status = "TO_BE_IMPLEMENTED_STAGE_3"`

This conflicts with the exact-SHA runtime/audit evidence: Playwright is installed/configured, the mandatory CI gate is active, all mandatory journey IDs are represented, and run #585 is green on the audited SHA.

### Contract impact
Stage 3 cannot be accepted while its authoritative state describes the required infrastructure as absent/to-be-implemented. This is evidence/state drift of the same class that previously blocked Stage 2. It can mislead handoffs and subsequent stage gating.

### Required corrective action
Update the authoritative state to describe the implemented Stage 3 browser foundation and exact-SHA evidence without prematurely marking Stage 3 accepted before re-audit. Preserve the distinction between infrastructure/gate evidence and per-capability final PASS certification.

## Non-blocking carried observations
The Stage 2 P2 carry remains in force unless separately resolved. No new Stage 3 P2 is required for acceptance by this audit.

## Gate decision
`A_REJECT_CORRECTIVE_REQUIRED`.

Stage 3 must remain ACTIVE. Correct `FCA-S3-P1-001` on `main`, run deterministic + Playwright exact-head CI on the corrective SHA, then perform an independent exact-SHA re-audit. Do not unlock Stage 4 until that re-audit returns zero P0/P1.

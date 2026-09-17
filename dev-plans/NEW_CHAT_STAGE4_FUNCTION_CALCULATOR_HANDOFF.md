# Bruno Electric — New Chat Handoff · Stage 4 Function / Calculator Audit

## Purpose
This file is the authoritative handoff for the next ChatGPT session. Continue the existing Function / Capability Audit without restarting, re-planning, or asking the user to repeat context.

Repository: `kot0070/bruno-electric-pwa`
Implementation branch: `main`
Authoritative audit control files:
- `dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md`
- `dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json`
- `audits/function-capability/FUNCTION_COVERAGE_MAP.md`

## Mandatory operating rules
- GitHub `main` is authoritative. Re-fetch `main` HEAD before every corrective write.
- Strict sequential audit loop remains binding: discover -> define expected contract -> add executable evidence -> exact-head deterministic CI -> Playwright -> independent exact-SHA audit -> correct every P0/P1 -> re-audit -> accept.
- Do not weaken a test to match runtime.
- `BLANK != ZERO`; `UNKNOWN != ZERO`; `Your Cost != Customer Price`; `Save != Apply`; `Live calculation != Approved Quote`; Job A must not contaminate Job B.
- No P0/P1 may be deferred.
- Stage 5+ remain locked until Stage 4 receives independent `A_ACCEPT`.
- Do not mark a capability PASS from unit/static evidence alone when the surface is user-facing/high-risk.

## Accepted audit state
Stages 0-3 are `DONE_ACCEPTED`.
Stage 4 is `ACTIVE`: Function-level deterministic audit.
Stage 5 onward remains locked.

Stage 3 accepted Playwright foundation includes mandatory E2E-01..E2E-12, exact-SHA CI, desktop/phone/tablet viewports, strict runtime-error gating, and EVSE professional browser coverage.

## Latest previously green baseline before current Stage 4 corrective work
SHA: `d3ab36e2597ab45826d616235e78ee83463a3390`
CI: run #590 / id `35231443826`
Result: SUCCESS
Deterministic: `795/795`
Playwright: `28 passed / 38 expected viewport skips / 0 failed`

This is only a historical green baseline. Newer production/test commits invalidate it for current acceptance.

## Stage 4 work completed before current corrective sequence
1. Added targeted BOM deterministic contracts.
2. Added direct test coverage for `BrunoAppBackupDispatch.install()`.
3. Created `audits/function-capability/FUNCTION_COVERAGE_MAP.md`.
4. Added professional EVSE/Tesla workflow earlier in Stage 3/4 work, including Tesla output/breaker presets, conductor sizing, voltage-drop sizing, charge-time, vehicle AC limit, BOM, formulas, deterministic tests and browser coverage on desktop/phone/tablet.
5. Added `STAGE4-APP-BACKUP-01` browser round-trip test for full app backup.
6. Full-app backup investigation discovered a real integration issue: isolated helper/unit coverage was not enough to prove the real full-app UI path. Corrective integration work was made in commits around `0332877eb008...` and `9be9558485eb...`; keep the browser whole-flow test as regression evidence.

## Current calculator/functionality test sequence
User explicitly requested calculator + functionality testing before continuing the audit.

### Control run #596
Test SHA: `c6e8e174366cf7cd78fc8f5e235944af65b9e2ce`
Workflow run: #596 / id `35236567002`
Deterministic result: `795/795 passed`
Playwright result: `29 passed / 44 skipped / 2 failed`

The two failures were:

### A. Real calculator UI-boundary defect
Test: `STAGE4-CALC-02 blank required inputs remain blank and fail closed`
Executable evidence from run #596:
- User cleared `#a-load` (`Load amps`).
- UI converted `''` through `Number('')` to `0`.
- Core calculator therefore received explicit 0 A.
- Browser rendered `PASS` with `Required ampacity 0 A` instead of `Input error` / `load amps is required`.

This is a real violation of `BLANK != ZERO` at the UI -> engine boundary even though the core engine itself correctly rejects `''`.

`STAGE4-CALC-01` passed and proved the normal rendered math for all four core calculators:
- Ampacity: expected 65 A allowable / 50 A required.
- Voltage Drop: expected 3.93 V / 1.64%.
- Conduit Fill: expected 0.0399 in² and 40% rule.
- Box Fill: expected 15.75 in³ required / 20.3 in³ available.

### B. Backup browser harness/UI reachability failure
`STAGE4-APP-BACKUP-01` failed because `#btn-export-app` existed but was hidden inside a closed UI section/details. This was not yet evidence that production backup logic was wrong; the test needed to open the control through the real user UI rather than force-click it.

## Corrective commits already made after run #596
Current pre-handoff production/test lineage:

1. `a98cf4d89cd8036962d3172384472bb733c19591`
   - Corrected `electrical-tools-ui.js` UI numeric conversion.
   - `num(id)` now preserves explicit blank `''` instead of `Number('') -> 0`.
   - Conduit Fill passes raw conductor quantity to core instead of coercing blank to zero.
   - Formulas/calculation engine values were not changed.

2. `f0fb50a5fe699915c61ffa15f74e9bf20b0b74da`
   - Corrected the full-app backup E2E user flow to open the actual UI container/details before using export/import controls.
   - Do not replace this with `force:true`; real reachability is required.

3. `f5cf7f0edd62bda58c6a541c24db051182a84638`
   - Corrected Project Calculator blank input semantics.
   - Blank square footage / room quantities no longer silently become numeric zero before validation.
   - Project Calculator validation can now distinguish missing/blank from explicit `0` where appropriate.

At the moment this handoff was written, `f5cf7f0e...` was the latest production corrective SHA before this documentation handoff commit. Re-fetch `main` because the handoff file commit itself advances HEAD.

## Pending immediate work — continue here
Do NOT restart Stage 4. Continue in this order:

### 1. Finish the same blank/zero defect class in Box Fill
Current core in `electric-calculators.js` uses patterns such as:
- `integer(input.insulatedCount || 0, ...)`
- `integer(input.groundCount || 0, ...)`
- `integer(input.yokeCount || 0, ...)`

This means explicit `''` can still collapse to zero. Preserve backward compatibility for a truly omitted API property if intended, but explicit blank from UI must not silently become zero. Preferred semantic form is equivalent to `input.field == null ? 0 : input.field`, so omitted/null legacy defaults can remain while explicit `''` reaches the core validator and fails.

Check whether any other calculator/UI fields still use `Number(blank)`, `|| 0`, or equivalent coercion where explicit blank is semantically different from zero.

### 2. Expand `tests/e2e/calculator-functionality-stage4.spec.js`
Keep existing `STAGE4-CALC-01` and `STAGE4-CALC-02`.
Add direct browser coverage for:
- Conduit Fill: blank conductor quantity fails closed, explicit valid quantity still passes.
- Box Fill: blank count/volume behavior follows the expected contract; explicit zero remains distinct and valid only where zero is allowed.
- Project Calculator Residential path: enter project type, sqft and room counts -> Calculate -> verify values hand off to live residential inputs / workflow.
- Project Calculator Commercial path: mode persists and residential-only tools are unavailable/blocked while generic electrical tools remain reachable.

Use real UI interactions and strict runtime-error gate.

### 3. Run exact-head CI after the corrective/test commits
Required same SHA:
- deterministic suite
- Playwright Chromium matrix

Do not treat old run #590 or #596 as current evidence after new commits.

If CI is red, inspect exact browser/deterministic failure and distinguish production defect from harness defect. Do not weaken expected behavior.

### 4. Re-run full-app backup whole-flow regression
`STAGE4-APP-BACKUP-01` must prove:
- actual full app JSON export through user-accessible control;
- envelope/type;
- Job;
- Companies/profiles;
- UI prefs;
- Catalog open state;
- current Dispatch Journal data and Dispatch settings;
- deliberate replacement with foreign state;
- import of the exact downloaded backup;
- complete restoration and absence of foreign state.

### 5. Update Stage 4 evidence only after green exact-head CI
`FUNCTION_CAPABILITY_AUDIT_STATE.json` is currently stale relative to the newest calculator/backup work. Do not update it optimistically. After green exact-head CI, record the new SHA, run IDs/counts, targeted test areas and findings/closures.
Update `FUNCTION_COVERAGE_MAP.md` where direct/integration classifications changed.

### 6. Independent Stage 4 audit
Create a separate branch from the exact green SHA, e.g. `audit/function-capability-stage4-<shortsha>`.
Independent audit must look for P0/P1 in:
- math/input boundaries;
- blank vs zero;
- state mutation/rollback;
- stale IDs;
- unsupported/fail-closed behavior;
- full backup/restore;
- BOM source isolation;
- Project Calculator residential/commercial routing;
- other high-risk public/state-mutating APIs not represented in the coverage map.

If P0/P1 found: fix on `main`, exact-head CI, then re-audit. Only `A_ACCEPT` unlocks Stage 5.

## Important known evidence/findings
- Core math normal-path browser test passed before current corrections.
- Real blank->zero UI defect was confirmed by browser evidence, not inferred only from source.
- Deterministic suite at control SHA remained fully green, proving why browser/UI boundary tests are necessary.
- Full-app backup test is intentionally a whole user-flow integration test because isolated backup helper unit tests previously gave insufficient confidence.

## Files to read first in the new chat
1. `dev-plans/NEW_CHAT_STAGE4_FUNCTION_CALCULATOR_HANDOFF.md` (this file)
2. `dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md`
3. `dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json`
4. `audits/function-capability/FUNCTION_COVERAGE_MAP.md`
5. `tests/e2e/calculator-functionality-stage4.spec.js`
6. `tests/e2e/app-backup-stage4.spec.js`
7. `electrical-tools-ui.js`
8. `electrical-project-calculator-ui.js`
9. `electric-calculators.js`
10. `electric-app-backup-dispatch.js`

## User interaction rule
The user does not want repeated questions. Continue autonomously from GitHub. Ask only for a genuine external blocker/credential that cannot be resolved in-repo.

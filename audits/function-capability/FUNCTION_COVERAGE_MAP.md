# Bruno Electric — Stage 4 Function Coverage Map

STATUS: PRE_AUDIT_READY
STAGE: 4 — Function-Level Deterministic Audit
INVENTORY_SOURCE_SHA: `efb02bf1f867787e5bf7251d9045be2931eeb6d3`
EXACT_HEAD_CI: Electrical Calculator Tests #606 / run id `35243084444` / SUCCESS
DETERMINISTIC: `800/800 passed`
BROWSER_REGRESSION_GATE: `87 scheduled / 35 passed / 52 explicit viewport-contract skips / 0 failed`

## Purpose and boundary

This map classifies exported/public and high-value runtime functions by executable evidence. It is not line coverage, and it does not grant user-facing capability PASS by itself. Browser-required capabilities still require the accepted Stage 3 real-UI evidence plus all other applicable contract/integration layers.

Required Stage 4 classifications:
- `DIRECTLY_TESTED` — the public/high-value function is invoked by deterministic tests with result/state assertions.
- `INTEGRATION_TESTED` — behavior is exercised through a higher-level deterministic or browser workflow, but the function is not the direct unit under assertion.
- `TRIVIAL_PLUMBING` — small read/delegation/DOM adapter over directly tested domain behavior; correctness of the underlying domain function is tested elsewhere.
- `DEAD_UNREACHABLE` — current runtime function proven dead/unreachable.
- `UNTESTED_HIGH_RISK` — high-risk business/state function lacking adequate deterministic executable evidence.

Stage 4 policy: coverage metrics may locate gaps but do not prove correctness. `DIRECTLY_TESTED` means executable evidence exists for relevant contracts; it does not mean every possible branch is proven.

## High-value function inventory

| Runtime / public API | High-value functions | Classification | Deterministic evidence / notes |
|---|---|---|---|
| `BrunoElectricalCalc` (`electric-calculators.js`) | `ampacity`, `voltageDrop`, `conduitFill`, `boxFill`, `transformerCurrent` | DIRECTLY_TESTED | `tests/electrical-calculators.test.js`, `tests/math-corrective-boundaries.test.js`, `tests/stage4-calculator-boundary.test.js`: table/boundary, blank/zero, invalid phase/PF/counts, unsupported range, continuous-load and fail/review thresholds. Stage 4 browser tests additionally drive Ampacity, Voltage Drop, Conduit Fill and Box Fill through rendered UI, including explicit blank-vs-zero contracts. |
| `BrunoElectricalCatalogV1` | `mergeMissing` | DIRECTLY_TESTED | `tests/data-integrity.test.js`: preserve user values/metadata, explicit zero, normalized-name collision, ID collision, idempotency. |
| `BrunoElectricBOM` | `prepareReplacement`, `replaceGenerated` | DIRECTLY_TESTED | Existing `tests/data-integrity.test.js` plus Stage 4 `tests/electric-bom.test.js`: same-source replacement across resolved/unresolved stores, preservation of manual/other sources, blank vs zero, invalid/missing cost, normalized matching, persisted rerun. |
| `BrunoElectricBOM` | `readJob`, `_match`, `_knownCost` | TRIVIAL_PLUMBING | Read/helper behavior is exercised by BOM direct tests; no separate high-risk mutation boundary. |
| `BrunoPhase3` | `evse`, `hvac`, `motor`, `egc`, `groundingElectrode`, `feeder`, `bom` | DIRECTLY_TESTED | `tests/phase3-equipment.test.js`: standard OCPD boundaries, fuse-only path, EGC lookups, EVSE/HVAC/Motor/GEC/Feeder invalid/unsupported cases, topology review paths and BOM output/fail-closed module rejection. |
| `BrunoElectricalTasks` | task CRUD / active-task persistence | DIRECTLY_TESTED | `tests/electrical-tasks.test.js`, provenance/data-integrity suites exercise Job-scoped create/save/get/list/active/duplicate/remove semantics and stale/current task behavior. |
| `BrunoElectricalTaskEngine` | feeder calculation/candidate selection | DIRECTLY_TESTED | `tests/electrical-task-engine.test.js`, corrective/data-integrity suites: deterministic sizing, unsupported/fail-closed, voltage-drop/candidate semantics. |
| `BrunoElectricalRacewayEngine` | raceway calculation | DIRECTLY_TESTED | `tests/electrical-raceway-engine.test.js`: supported composition, fill/raceway constraints, fail-closed unsupported configurations. |
| `BrunoGroundingEngine` | grounding/neutral/EGC workflow | DIRECTLY_TESTED | `tests/electrical-grounding-engine.test.js`: neutral modes, EGC integration, unresolved/fail-closed conditions. |
| `BrunoElectricalTaskAdvanced` | advanced template adapters/calculation | DIRECTLY_TESTED | `tests/electrical-task-advanced.test.js` plus E2E-06 browser regression; Branch/EVSE/HVAC/Motor/Transformer/Generator/Long Run adapter contracts are exercised. |
| `BrunoElectricalTaskSolver` | `extract`, `why`, `assumptions` | DIRECTLY_TESTED | `tests/electrical-task-solver.test.js`: explicit extraction, unresolved facts, no guessing; E2E-07 proves rendered workflow. |
| `BrunoElectricalTaskSolver` | `fieldMap`, `requiredFields` | TRIVIAL_PLUMBING | Static field/config mapping consumed by tested solver/UI workflow. |
| `BrunoElectricalTaskMaterialTakeoff` | `build`, `apply` | DIRECTLY_TESTED | `tests/electrical-task-material-takeoff.test.js`: allowance boundary/invalid, Stage-4 review block, unsaved/stale revision, input mismatch, blank/zero cost, provenance, field-verify exclusion, idempotent reapply, changed allowances, cross-Job block. |
| `BrunoElectricalTaskMaterialTakeoff` | `readJob` and `_test` helpers | TRIVIAL_PLUMBING | Support helpers are exercised through direct `build/apply` contracts. |
| `BrunoElectricalTaskArchive` | `status`, `load`, `rename`, `recalculate`, `update` | DIRECTLY_TESTED | `tests/electrical-task-archive.test.js`: Saved/Applied/Changed states, active-Job load, revision advance, recalculation, update/history, failed-update rollback. |
| `BrunoElectricalTaskArchive` | `duplicate`, `remove`, `apply` | TRIVIAL_PLUMBING | Thin delegation to directly tested Tasks CRUD / Takeoff apply domain APIs. |
| Residential engines (`BrunoResidential*`) | estimator/pricing/takeoff/live/levels/history core functions | DIRECTLY_TESTED | Dedicated `residential-*.test.js` suites cover calculation, pricing, takeoff, levels, archive/job scope, history, wire takeoff, save/archive semantics. |
| `BrunoResidentialApplyJob` | `applyActive`, `isActiveApplied` | DIRECTLY_TESTED | `tests/residential-apply-job.test.js`: Save vs Apply, provenance, preserve unrelated rows, blank/zero, reapply replacement, legacy migration, no silent mutation, BOM quantity authority. |
| `BrunoResidentialApplyJob` | `applied`, `savedActive`, `rowsFromSnapshot` | INTEGRATION_TESTED | Used/asserted through direct Apply workflow; low-risk read/translation helpers. |
| `BrunoQuoteLifecycle` | `candidate`, `approve`, `approved`, `history`, `invoiceBasis` | DIRECTLY_TESTED | `tests/quote-lifecycle.test.js`: blank/manual/zero override, approval persistence, immutable snapshot, reapproval history, approved-only invoice basis. |
| `BrunoQuoteLifecycle` | `materialDisclosure`, `normalizeOverride`, `syncWorkspaceState` | INTEGRATION_TESTED | Explicitly exercised as parts of candidate/approval flow; reload synchronization assertion included. |
| `BrunoFixedPriceInvoice` | `buildInvoiceModel`, `invoiceHtml` | DIRECTLY_TESTED | `tests/fixed-price-invoice.test.js`: immutable approved snapshot source, amount/provenance, fail before approval. |
| `BrunoFixedPriceInvoice` | `printFixed`, `relabelTM` | INTEGRATION_TESTED | Document/source and Stage 3 browser workflow prove fixed-vs-T&M separation; print/DOM wiring is intentionally a later Stage 6/8 UI/PWA concern. |
| `BrunoAppBackupDispatch` | `augmentPayload`, `restorePayload`, `install`, full-app build/restore bridge | DIRECTLY_TESTED / INTEGRATION_TESTED | `tests/app-backup-dispatch.test.js` covers Dispatch payload inclusion/restore, legacy preservation, install idempotency, app-only wrapping, return preservation and event emission. `STAGE4-APP-BACKUP-01` drives the real compact-header `More -> Export app`, replaces all supported local state with foreign values, imports the downloaded app backup, follows the production reload lifecycle and proves Job/company prefs/catalog/Dispatch restoration. |
| Dispatch Journal runtime | journal state/settings operations | DIRECTLY_TESTED | `tests/dispatch-journal-v2.test.js`; standalone backup compatibility separately covered above. Dual legacy/current persistence remains carried P2 architecture classification, not a Stage 4 P0/P1. |
| `BrunoElectricAppNavigation` | `workspaceHref`, `parseWorkspaceHash` | DIRECTLY_TESTED | `tests/navigation-deeplink.test.js`: defaults, exact tabs, invalid tabs/groups; E2E-01 adds browser navigation/back-forward evidence. |
| `BrunoElectricAppNavigation` | `group`, `groupForTab`, static `groups` | TRIVIAL_PLUMBING | Canonical IA lookup consumed by deterministic shell tests and E2E-01. |
| `BrunoEvseProfessional` | professional EVSE calculation/BOM workflow | DIRECTLY_TESTED | `tests/evse-professional.test.js` plus E2E-EVSE-01 on desktop/phone/tablet. |
| Custom materials runtime | create/edit/add-to-Job cost/state functions | DIRECTLY_TESTED | `tests/custom-materials.test.js`, catalog/cost semantics suites, E2E-03. |
| Pricing domain guard / margins / Job summary | validation and derived pricing semantics | DIRECTLY_TESTED | `pricing-domain-guard.test.js`, `pricing-margins-semantics.test.js`, `job-summary-semantics.test.js`, Quote tests. |
| Project Calculator | mode/result calculation and residential/commercial routing | DIRECTLY_TESTED / INTEGRATION_TESTED | `tests/project-calculator.test.js` plus Stage 4 browser journeys. Blank required project values fail validation; residential values hand off to Live Residential; commercial mode persists, suppresses residential-only tools, keeps generic calculators reachable and leaves unsupported commercial estimation fail-closed. |
| Service worker/PWA core | install/cache/update/offline helpers | INTEGRATION_TESTED | `tests/service-worker.test.js`, deterministic source contracts, E2E-12 offline/cache browser assertions. Detailed responsive/PWA audit remains Stage 8. |
| Bootstrap/UI loaders and control handlers | script ordering, DOM mounting, event delegation | INTEGRATION_TESTED / TRIVIAL_PLUMBING | Deterministic shell/static integration tests plus Stage 3/4 E2E. Full action-by-action UI wiring is deliberately Stage 6, not falsely promoted to direct function coverage here. |

## Targeted Stage 4 additions

### BOM branch strengthening
Prior to Stage 4, `tests/data-integrity.test.js` already directly covered substantial `replaceGenerated()` behavior. Stage 4 did **not** treat BOM as previously untested. It added `tests/electric-bom.test.js` to close branch-level evidence around `prepareReplacement()` and persisted source replacement:
- missing source tag / missing Job fail closed;
- same-source replacement removes old resolved and unresolved rows while preserving manual/other-source rows;
- blank Your Cost != explicit zero;
- invalid Your Cost and unmatched catalog rows remain first-class unresolved data;
- normalized catalog matching;
- repeated persisted replacement does not duplicate the source.

Evidence commits: `50cdf090468f0772dc078ccb936a27473dfc9141`, suite integration `7cea5eda0425798a06bb2adb62025c7d683c1ecc`.

### App backup wrapper and real-browser closure
Stage 4 first added direct deterministic evidence for the exported `BrunoAppBackupDispatch.install()` wrapper:
- install is idempotent;
- only `type='app'` export receives current Dispatch Journal payload;
- non-app export remains untouched;
- restore wrapper preserves the original `applyAppPayload()` return;
- current standalone Dispatch keys are restored;
- one `bruno:dispatch-changed` event is emitted after successful restore.

The later Stage 4 browser regression closes the actual user-facing full-app path instead of relying on wrapper-only proof:
- opens the real compact-header `More` menu to reach `Export app`;
- verifies the downloaded envelope contains Job, Company profiles, UI preferences, catalog-open state, Dispatch Journal data and Dispatch settings;
- deliberately replaces those local stores with foreign values;
- imports through the real file input and confirmation path;
- follows the production reload lifecycle;
- verifies the original state is restored and foreign Dispatch state is removed.

### Calculator blank/zero and rendered-result closure
Stage 4 corrective work closed the discovered `blank -> 0` defect class without changing calculation formulas:
- `electrical-tools-ui.js` preserves explicit blank required numeric values instead of coercing them with `Number('')`;
- Conduit Fill passes the raw quantity value into the domain validator;
- `electric-calculators.js` Box Fill distinguishes explicit blank from explicit zero while retaining the documented legacy omitted-field zero default;
- `tests/stage4-calculator-boundary.test.js` directly proves blank insulated/ground/yoke counts fail, omitted legacy counts remain zero-compatible, and explicit zero remains valid;
- rendered browser journeys prove Ampacity blank load, Voltage Drop blank current/distance, Conduit Fill blank quantity, Box Fill blank count/volume and explicit-zero behavior through the real UI;
- valid reference results are asserted through rendered output, not only module calls.

### Project Calculator routing closure
Stage 4 browser evidence now proves both supported routing modes:
- residential square footage and room counts transfer into the Live Residential workspace and persist residential project mode;
- commercial mode persists, hides/disables residential-only tools and retains access to generic calculators;
- unsupported commercial estimation remains explicitly fail-closed rather than silently using residential logic.

### Exact-head evidence
Final implementation/test evidence before documentation refresh:
- production/test SHA: `efb02bf1f867787e5bf7251d9045be2931eeb6d3`;
- Electrical Calculator Tests #606 / run id `35243084444`: `SUCCESS`;
- provenance: `TESTED_HEAD_SHA == EXPECTED_HEAD_SHA == efb02bf1f867787e5bf7251d9045be2931eeb6d3`;
- deterministic: `800/800 passed`;
- Playwright: `87 scheduled / 35 passed / 52 explicit viewport-contract skips / 0 failed`.

## Targeted-risk category coverage

| Required category | Representative executable evidence |
|---|---|
| BOUNDARY | ampacity/CCC/temp boundaries; OCPD/fuse-only; feeder/EVSE/HVAC/Motor; allowance 0–20%; box/conduit counts; Project Calculator required-value boundaries. |
| INVALID | blank/missing/non-numeric/unsupported phase, voltage, material, device, cost, task revision/configuration; rendered calculator blank-input failure paths. |
| ROLLBACK | Electrical Task `update()` failed-apply rollback preserves active materials/history. |
| STALE_ID | missing/stale task revisions, active-Job task load, stale identifier browser journey E2E-10. |
| BLANK_ZERO | core calculator required fields including Box Fill/Conduit browser paths, Catalog/BOM Your Cost, task takeoff, Residential Apply, Quote manual adjustment. |
| UNSUPPORTED | Phase 3 module/config rejection, commercial Project Calculator fail-closed boundary, task/raceway fail-closed paths, unsupported electrical configurations. |

## Current Stage 4 pre-audit conclusion

- No new `DEAD_UNREACHABLE` high-value registered runtime was identified in this pass; Stage 1/2 already accepted the runtime reachability inventory.
- After the BOM, backup, calculator and Project Calculator additions, no **known** `UNTESTED_HIGH_RISK` exported business/state API remains in this map.
- The implementation/test SHA `efb02bf1f867787e5bf7251d9045be2931eeb6d3` has matching deterministic and Chromium evidence. This documentation refresh itself still requires exact-head CI before it becomes the production SHA handed to the independent audit.
- This is a **pre-audit classification**, not Stage 4 acceptance. The independent exact-SHA Stage 4 audit must verify completeness and may still raise P0/P1 findings.
- Stage 5 remains locked until the Stage 4 independent audit/corrective/re-audit loop returns `A_ACCEPT` with P0=0/P1=0.

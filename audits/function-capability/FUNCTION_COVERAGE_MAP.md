# Bruno Electric — Stage 4 Function Coverage Map

STATUS: PRE_AUDIT_COMPLETE
STAGE: 4 — Function-Level Deterministic Audit
INVENTORY_SOURCE_SHA: `d3ab36e2597ab45826d616235e78ee83463a3390`
EXACT_HEAD_CI: Electrical Calculator Tests #590 / run id `35231443826` / SUCCESS
DETERMINISTIC: `795/795 passed`
BROWSER_REGRESSION_GATE: `66 scheduled / 28 passed / 38 viewport-contract skips / 0 failed`

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
| `BrunoElectricalCalc` (`electric-calculators.js`) | `ampacity`, `voltageDrop`, `conduitFill`, `boxFill`, `transformerCurrent` | DIRECTLY_TESTED | `tests/electrical-calculators.test.js`, `tests/math-corrective-boundaries.test.js`: table/boundary, blank/zero, invalid phase/PF/counts, unsupported range, continuous-load and fail/review thresholds. |
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
| `BrunoAppBackupDispatch` | `augmentPayload`, `restorePayload`, `install` | DIRECTLY_TESTED | `tests/app-backup-dispatch.test.js`: full-app inclusion, restore, legacy non-destructive behavior; Stage 4 adds install idempotency, app-only export wrapping, return preservation and change-event emission. |
| Dispatch Journal runtime | journal state/settings operations | DIRECTLY_TESTED | `tests/dispatch-journal-v2.test.js`; standalone backup compatibility separately covered above. Dual legacy/current persistence remains carried P2 architecture classification, not a Stage 4 P0/P1. |
| `BrunoElectricAppNavigation` | `workspaceHref`, `parseWorkspaceHash` | DIRECTLY_TESTED | `tests/navigation-deeplink.test.js`: defaults, exact tabs, invalid tabs/groups; E2E-01 adds browser navigation/back-forward evidence. |
| `BrunoElectricAppNavigation` | `group`, `groupForTab`, static `groups` | TRIVIAL_PLUMBING | Canonical IA lookup consumed by deterministic shell tests and E2E-01. |
| `BrunoEvseProfessional` | professional EVSE calculation/BOM workflow | DIRECTLY_TESTED | `tests/evse-professional.test.js` plus E2E-EVSE-01 on desktop/phone/tablet. |
| Custom materials runtime | create/edit/add-to-Job cost/state functions | DIRECTLY_TESTED | `tests/custom-materials.test.js`, catalog/cost semantics suites, E2E-03. |
| Pricing domain guard / margins / Job summary | validation and derived pricing semantics | DIRECTLY_TESTED | `pricing-domain-guard.test.js`, `pricing-margins-semantics.test.js`, `job-summary-semantics.test.js`, Quote tests. |
| Project Calculator | mode/result calculation | DIRECTLY_TESTED | `tests/project-calculator.test.js`; commercial unsupported boundary is fail-closed. |
| Service worker/PWA core | install/cache/update/offline helpers | INTEGRATION_TESTED | `tests/service-worker.test.js`, deterministic source contracts, E2E-12 offline/cache browser assertions. Detailed responsive/PWA audit remains Stage 8. |
| Bootstrap/UI loaders and control handlers | script ordering, DOM mounting, event delegation | INTEGRATION_TESTED / TRIVIAL_PLUMBING | Deterministic shell/static integration tests plus Stage 3 E2E. Full action-by-action UI wiring is deliberately Stage 6, not falsely promoted to direct function coverage here. |

## Targeted Stage 4 additions

### BOM branch strengthening
Prior to Stage 4, `tests/data-integrity.test.js` already directly covered substantial `replaceGenerated()` behavior. Stage 4 did **not** treat BOM as previously untested. It added `tests/electric-bom.test.js` to close branch-level evidence around `prepareReplacement()` and persisted source replacement:
- missing source tag / missing Job fail closed;
- same-source replacement removes old resolved and unresolved rows while preserving manual/other-source rows;
- blank Your Cost != explicit zero;
- invalid Your Cost and unmatched catalog rows remain first-class unresolved data;
- normalized catalog matching;
- repeated persisted replacement does not duplicate the source.

Evidence commits: `50cdf090468f0772dc078ccb936a27473dfc9141`, suite integration `7cea5eda0425798a06bb2adb62025c7d683c1ecc`; exact-head CI #589 SUCCESS with `793/793` deterministic and browser regression green.

### App backup wrapper closure
Stage 4 added direct deterministic evidence for the exported `BrunoAppBackupDispatch.install()` wrapper, which is the runtime bridge around actual full-app export/import:
- install is idempotent;
- only `type='app'` export receives current Dispatch Journal payload;
- non-app export remains untouched;
- restore wrapper preserves the original `applyAppPayload()` return;
- current standalone Dispatch keys are restored;
- one `bruno:dispatch-changed` event is emitted after successful restore.

Evidence SHA: `d3ab36e2597ab45826d616235e78ee83463a3390`; exact-head CI #590 SUCCESS, `795/795` deterministic, Playwright `28 passed / 38 expected viewport skips / 0 failed`.

## Targeted-risk category coverage

| Required category | Representative executable evidence |
|---|---|
| BOUNDARY | ampacity/CCC/temp boundaries; OCPD/fuse-only; feeder/EVSE/HVAC/Motor; allowance 0–20%; box/conduit counts. |
| INVALID | blank/missing/non-numeric/unsupported phase, voltage, material, device, cost, task revision/configuration. |
| ROLLBACK | Electrical Task `update()` failed-apply rollback preserves active materials/history. |
| STALE_ID | missing/stale task revisions, active-Job task load, stale identifier browser journey E2E-10. |
| BLANK_ZERO | core calculator required fields, Catalog/BOM Your Cost, task takeoff, Residential Apply, Quote manual adjustment. |
| UNSUPPORTED | Phase 3 module/config rejection, commercial Project Calculator boundary, task/raceway fail-closed paths, unsupported electrical configurations. |

## Current Stage 4 pre-audit conclusion

- No new `DEAD_UNREACHABLE` high-value registered runtime was identified in this pass; Stage 1/2 already accepted the runtime reachability inventory.
- After the targeted BOM and backup-wrapper additions, no **known** `UNTESTED_HIGH_RISK` exported business/state API remains in this map.
- This is a **pre-audit classification**, not Stage 4 acceptance. The independent exact-SHA Stage 4 audit must verify completeness and may still raise P0/P1 findings.
- Stage 5 remains locked until the Stage 4 independent audit/corrective/re-audit loop returns `A_ACCEPT` with P0=0/P1=0.

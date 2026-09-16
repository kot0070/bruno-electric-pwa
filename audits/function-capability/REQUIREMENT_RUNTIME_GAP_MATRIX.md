# Bruno Electric — Stage 2 Requirement-to-Runtime Gap Matrix

AUDIT_SHA: `b246300e215dc1241434aef9c341e7a12397c29e`
AUDIT_BRANCH_BASE: `audit/function-capability-stage2-matrix-b246300`
STAGE: `STAGE_2_REQUIREMENT_TO_RUNTIME_GAP_AUDIT`
CI: Electrical Calculator Tests run #549 / id `35163662864` — SUCCESS

This matrix compares every registered capability against `PLAN/SPEC -> UI -> RUNTIME -> TEST -> STORAGE/SIDE EFFECT -> RESULT`. Stage 2 classification is **not** a capability PASS. High-risk user-facing PASS still requires the later deterministic/integration/browser gates defined by the Function Capability Audit Master.

Classification vocabulary: `EXACT`, `DIFFERENT_VALID`, `PARTIAL`, `MISSING`, `UNREACHABLE`, `UNDOCUMENTED`, `OBSOLETE`.

## Findings carried / created

- `FCA-S2-P1-001` — stale Stage 1 capability evidence after accepted backup corrective. **VERIFIED_CLOSED** by exact-SHA corrective re-audit `FUNCTION_CAPABILITY_STAGE2_CORRECTIVE_REAUDIT_b246300.md`.
- `FCA-S2-P2-001` — current visible Dispatch Journal v3 uses standalone device/local keys while legacy Job-scoped `state.dispatch` still exists. Product-level persistence/isolation/migration contract is not explicit. **OPEN / CARRY**.
- `FCA-S2-P2-002` — `CAP-ET-016` is incorrectly tagged `RUNTIME_DISCOVERED_CURRENT`; the current accepted Electrical Tasks master Stage 6 explicitly requires Duplicate/Rename/Delete/Load lifecycle. Runtime matches the plan, but registry requirement traceability is under-classified. **OPEN / CARRY**.
- `FCA-S2-P2-003` — several reachable product surfaces are not independently specified by a current product plan: Change Orders, Labor & Equipment, Profit & Loss, Workers, Company profile vault, Company/Workers backup helpers, theme/zoom preferences, and some legacy electrical helper surfaces. Runtime exists, but PLAN/SPEC granularity is absent. **OPEN / CARRY**.
- `FCA-S2-P2-004` — the completed Electrical Tasks master records its Stage 11 final PWA cache as `bruno-electric-v67`; current Function Capability runtime is intentionally `v68` after the later Dispatch-backup corrective. The old v67 statement is historical accepted-stage evidence, not the current PWA contract. Current Function Capability master/runtime control. **DOCUMENTED DIFFERENT_VALID / CARRY AS HISTORY**.

No new P0/P1 is identified by the full matrix at this exact SHA.

## Matrix

| Capability | Plan/spec | UI/runtime | Deterministic evidence at audit SHA | Persistence / result alignment | Stage 2 classification | Finding / note |
|---|---|---|---|---|---|---|
| CAP-NAV-001 | Function Master: App navigation, E2E-01 | canonical desktop/tablet/phone navigation -> Job/Electrical Tools workspaces | `navigation-shell.test.js`, responsive shell tests | navigation only, no business-state mutation | EXACT | Browser proof deferred to Stage 3+ |
| CAP-NAV-002 | Function Master: deep-link/back-forward | `#be=...&tab=...` parse/restore via navigation modules | `navigation-deeplink.test.js` | URL hash only | EXACT | Browser history behavior still needs E2E-01 |
| CAP-JOB-001 | Function Master: Job lifecycle/isolation | New blank / import establishes current active Job | `data-integrity.test.js`, workflow integration | `bruno-electric-v1`; device-global vaults separate | DIFFERENT_VALID | Current product is single-active-Job/import-export, not a multi-job chooser |
| CAP-JOB-002 | Function Master: Job A/B must not contaminate | Job-scoped state plus explicit global vault boundaries | data-integrity and Electrical Tasks/Residential job-scope tests | Job-scoped archives/materials preserved | EXACT | Browser A/B journey still required |
| CAP-JRN-001 | Function Master: Dispatch/Journal | visible Journal v3 reachable and deterministic; legacy Dispatch state remains dormant | `dispatch-journal-v2.test.js`, `app-backup-dispatch.test.js` | current standalone Journal keys; app backup includes them; legacy `state.dispatch` can diverge | PARTIAL | FCA-S2-P2-001 |
| CAP-CAT-001 | Function Master: Catalog; E2E-03 | standard Catalog Add -> active Job | catalog semantics/integration tests | Job catalog/material rows | EXACT | Browser reachability later |
| CAP-CAT-002 | Function Master: custom/special-order | custom material save/add/edit/delete runtime | `custom-materials.test.js` | active Job catalog/materials; historical rows not silently rewritten | EXACT | — |
| CAP-CAT-003 | no granular current spec; broad Catalog domain only | seed missing electrical starter rows via `mergeMissing()` | catalog bridge/data tests provide indirect evidence | preserves existing Catalog rows | DIFFERENT_VALID | implementation detail under broad Catalog requirement |
| CAP-COST-001 | Function Master: BLANK != ZERO; Your Cost != Customer Price | strict cost semantic modules | `catalog-cost-semantics.test.js`, `catalog-job-ux-semantics.test.js`, custom/pricing tests | blank cost remains unresolved | EXACT | — |
| CAP-COST-002 | Function Master: UNKNOWN != ZERO | strict cost semantic modules | same cost/pricing test family | explicit numeric zero remains zero | EXACT | — |
| CAP-RES-001 | Function Master + accepted Electrical Tasks Stage 0: Residential | Project Calculator / Residential Live calculation runtime | residential estimator/live/project tests | project/live state only until explicit save/apply | EXACT | — |
| CAP-RES-002 | Function Master: save/archive/reload/load | Save Calculation + history archive/load/duplicate/delete | residential history/save/archive/job-scope tests | Job-scoped history | EXACT | — |
| CAP-RES-003 | Function Master: Apply + historical snapshot | explicit Apply/Update Job runtime | `residential-apply-job.test.js`, workflow integration | only residential-generated rows replaced; provenance snapshot retained | EXACT | — |
| CAP-ELC-001 | Function Master: electrical calculators | Calculator workspace exposes current core tools | electrical calculator + shell tests | display-only unless explicit source-tagged BOM action | EXACT | umbrella capability |
| CAP-ELC-002 | broad electrical-calculators requirement | Conductor/Ampacity action | `electrical-calculators.test.js` | display-only | DIFFERENT_VALID | granular action not separately planned |
| CAP-ELC-003 | broad electrical-calculators requirement | Voltage Drop action | calculator/math corrective tests | display-only | DIFFERENT_VALID | granular action not separately planned |
| CAP-ELC-004 | broad electrical-calculators requirement | Conduit Fill action | calculator/raceway tests | display-only | DIFFERENT_VALID | granular action not separately planned |
| CAP-ELC-005 | broad electrical-calculators requirement | Box Fill action | `electrical-calculators.test.js` | display-only | DIFFERENT_VALID | granular action not separately planned |
| CAP-ELC-006 | no independent current Project Calculator product spec | Residential/Commercial project mode; Commercial fails closed to generic tools | `project-calculator.test.js` | dedicated project/mode keys; no false residential commercial calculation | UNDOCUMENTED | FCA-S2-P2-003 family |
| CAP-ELC-007 | no independent current Phase-3 EVSE helper spec; EVSE is separately planned under Electrical Tasks | legacy/current EVSE helper + explicit BOM replacement | `phase3-equipment.test.js` | source-tagged Job BOM mutation only on explicit action | UNDOCUMENTED | runtime valid but separate from planned ET EVSE |
| CAP-ELC-008 | no independent current Phase-3 HVAC helper spec; HVAC separately planned under ET | HVAC MCA/MOCP helper + BOM | `phase3-equipment.test.js` | explicit source-tagged BOM mutation | UNDOCUMENTED | FCA-S2-P2-003 family |
| CAP-ELC-009 | no independent current Phase-3 Motor helper spec; Motor separately planned under ET | Motor helper + BOM | `phase3-equipment.test.js` | explicit source-tagged BOM mutation | UNDOCUMENTED | FCA-S2-P2-003 family |
| CAP-ELC-010 | broad grounding domain plus ET grounding plan, but legacy helper not separately specified | Grounding/Bonding helper | phase3 + grounding-engine tests | explicit supported GEC/BOM mutation | DIFFERENT_VALID | granular legacy helper subsumed by broad domain |
| CAP-ELC-011 | broad feeder/electrical-calculator domain; ET Feeder separately specified | Feeder helper | phase3 tests | explicit source-tagged Job BOM mutation | DIFFERENT_VALID | granular helper subsumed by broad domain |
| CAP-ET-001 | Electrical Tasks Master Stage 1 | first-class Electrical Tasks workspace/template selector | `electrical-tasks.test.js`, `electrical-tasks-ui.test.js` | Job-scoped tasks | EXACT | — |
| CAP-ET-002 | Electrical Tasks Master Stage 2 | Feeder deterministic calculation | task-engine/UI tests | result only until Save | EXACT | — |
| CAP-ET-003 | Electrical Tasks Master Stage 7A | Branch Circuit template | advanced task tests | no silent Job mutation | EXACT | — |
| CAP-ET-004 | Electrical Tasks Master Stage 7B | EVSE template | advanced task tests | no silent Job mutation | EXACT | — |
| CAP-ET-005 | Electrical Tasks Master Stage 7C | HVAC template | advanced task tests | no silent Job mutation | EXACT | — |
| CAP-ET-006 | Electrical Tasks Master Stage 7D | Motor template | advanced task tests | no silent Job mutation | EXACT | — |
| CAP-ET-007 | Electrical Tasks Master Stage 7E | Transformer Feed template | advanced task tests | no silent Job mutation | EXACT | — |
| CAP-ET-008 | Electrical Tasks Master Stage 7F | Generator / Feeder template | advanced task tests | no silent Job mutation | EXACT | — |
| CAP-ET-009 | Electrical Tasks Master Stage 7G | Generic Long Run | advanced/task-engine tests | no silent Job mutation | EXACT | — |
| CAP-ET-010 | Electrical Tasks Master Stage 3 | raceway sizing/fill | `electrical-raceway-engine.test.js` | deterministic result, unsupported fails closed | EXACT | — |
| CAP-ET-011 | Electrical Tasks Master Stage 4 | EGC/neutral/grounding model | `electrical-grounding-engine.test.js` | semantic separation retained | EXACT | — |
| CAP-ET-012 | Electrical Tasks Master Stage 5 | Build Material Takeoff | material takeoff tests | plan only; no Job mutation | EXACT | — |
| CAP-ET-013 | Electrical Tasks Master Stage 6 | Save/load/recalculate | task/archive/data-integrity tests | Job-scoped task revisions | EXACT | — |
| CAP-ET-014 | Electrical Tasks Master Stage 6 Save != Apply | explicit Apply to Job | material/archive/workflow tests | exact saved revision/provenance guard | EXACT | — |
| CAP-ET-015 | Electrical Tasks Master Stage 6 | changed-since-apply + explicit Update Job | archive/material tests | prior task-origin material snapshot archived before explicit replacement | EXACT | — |
| CAP-ET-016 | Electrical Tasks Master Stage 6 explicitly requires Duplicate/Rename/Delete/Load | reachable lifecycle actions | Tasks/archive tests | active Job task collection only | EXACT | FCA-S2-P2-002 registry metadata under-classified |
| CAP-SOL-001 | Electrical Tasks Master Stage 8 | Professional Task Solver explicit extraction | `electrical-task-solver.test.js` + Stage8 UI tests | no auto-calculate/save/apply | EXACT | — |
| CAP-QTE-001 | Function Master: Quote / E2E-08 | live quote built from current Job/pricing guards | quote/workflow/job-summary tests | current Job state | EXACT | — |
| CAP-QTE-002 | Function Master: approved snapshot immutable | explicit approval lifecycle | `quote-lifecycle.test.js` | immutable approved/history snapshots | EXACT | — |
| CAP-INV-001 | Function Master: Invoice from approved quote | fixed-price invoice runtime reads approved basis only | `fixed-price-invoice.test.js` | print/read approved snapshot; no live-price substitution | EXACT | — |
| CAP-TM-001 | Function Master: T&M separate | separate T&M invoice path | workflow/pricing-domain tests | separate Job T&M state | EXACT | — |
| CAP-CO-001 | no current independent spec | Change Orders UI/runtime exists | workflow tests provide only indirect coverage | Job-scoped CO state | UNDOCUMENTED | FCA-S2-P2-003 |
| CAP-LAB-001 | no current independent spec | Labor & Equipment runtime exists | no dedicated contract test identified | Job-scoped estimating state | UNDOCUMENTED | FCA-S2-P2-003 |
| CAP-PNL-001 | no current independent spec | Profit & Loss runtime exists | no dedicated contract test identified | reads/derives Job financial state | UNDOCUMENTED | FCA-S2-P2-003 |
| CAP-WRK-001 | no current independent spec | Workers roster/burden/pay runtime exists | data/workflow coverage indirect | current Job/personnel model | UNDOCUMENTED | FCA-S2-P2-003 |
| CAP-CMP-001 | no current independent spec | Company/letterhead profile vault | data/workflow coverage indirect | `bruno-electric-profiles-v1` device/local vault | UNDOCUMENTED | FCA-S2-P2-003 |
| CAP-PRC-001 | Function Master: pricing/margin; cost != customer price | strict pricing-domain runtime | pricing-domain/margins tests | Job pricing fields with domain guards | EXACT | — |
| CAP-IO-001 | Function Master: import/export / E2E-09 | Job export/import envelope | data-integrity/workflow tests | replaces supported current Job payload | EXACT | browser representative import/export still required later |
| CAP-BKP-001 | broad current import/export domain; reachable full-app product action | base app backup + Dispatch bridge | `app-backup-dispatch.test.js` + data/workflow tests | base app members + Journal v3 data/settings; legacy backup non-destructive | DIFFERENT_VALID | app-level superset of explicit Job import/export requirement |
| CAP-BKP-002 | no independent current Company-backup spec | Company profiles export/import | indirect workflow/data coverage | profiles vault only | UNDOCUMENTED | FCA-S2-P2-003 |
| CAP-BKP-003 | no independent current Workers-backup spec | Workers export/import | indirect workflow/data coverage | worker/personnel payload | UNDOCUMENTED | FCA-S2-P2-003 |
| CAP-BKP-004 | no independent current Help-shortcut spec | Help shortcuts call authoritative backup handlers | static/runtime mapping evidence | download/import side effects delegated | UNDOCUMENTED | FCA-S2-P2-003 |
| CAP-UI-001 | no current product requirement for theme/zoom | theme/zoom preferences reachable | responsive/static checks indirect | `bruno-electric-ui-prefs-v1` | UNDOCUMENTED | FCA-S2-P2-003 |
| CAP-REF-001 | Function Master provenance domain + Electrical Tasks Stage 9 broad source/reference contract | Reference surfaces expose current rules/source metadata | provenance/reference/calculator tests | read-only | DIFFERENT_VALID | UI surface is broader than specific provenance requirement |
| CAP-DAT-001 | Function Master: malformed/legacy data; E2E-10 | normalization/import/module parsers | `data-integrity.test.js`, ET data-integrity master tests | fail-safe supported local state | EXACT | browser stale-state journey later |
| CAP-PWA-001 | Function Master current PWA/offline/upgrade; older ET Stage11 historical v67 | current service worker v68 after accepted Dispatch backup correction | `service-worker.test.js`, responsive-PWA master test | Cache Storage only; local user data unchanged | DIFFERENT_VALID | FCA-S2-P2-004 historical cache evolution |
| CAP-RSP-001 | Function Master: phone/tablet/desktop action reachability; ET Stage11 responsive contracts | current responsive shell/CSS | responsive-PWA/static shell tests | presentation only | EXACT | real browser viewports mandatory later |
| CAP-SRC-001 | Electrical Tasks Master Stage 9 provenance | current source/reference metadata and task provenance | `electrical-tasks-provenance.test.js` + reference/calculator evidence | historical task/Job provenance retained | EXACT | local AHJ remains project-specific verification scope |

## Path-level classifications not represented as separate capability IDs

- Legacy inline Dispatch UI/state path (`state.dispatch`): **OBSOLETE AS AUTHORITATIVE VISIBLE UI / retained dormant compatibility state**. It is not deleted in Stage 2; its coexistence is tracked by `FCA-S2-P2-001`.
- Base Electrical Tasks non-feeder “planned” selector behavior: **OBSOLETE/OVERRIDDEN** by accepted Stage 7 handler/runtime after loader completion.
- Older PWA cache identifiers through v67: **OBSOLETE runtime cache names / historical accepted evidence**. Current cache is v68.

## Stage 2 aggregate

- Registered capabilities classified: **all registry entries represented above**.
- New P0: **0**.
- New P1 after corrective re-audit: **0**.
- Open P2: `FCA-S2-P2-001`, `FCA-S2-P2-002`, `FCA-S2-P2-003`; `FCA-S2-P2-004` is documented historical divergence.
- MISSING current registered capabilities: **0 identified**.
- UNREACHABLE current registered capabilities: **0 identified** by Stage 1/runtime mapping; true browser reachability is intentionally not certified until Playwright stages.
- Capability PASS certifications: **0 granted by this matrix**.

Stage 2 can be accepted with these explicitly carried P2 items because no P0/P1 remains. Stage 3 must implement the mandatory Playwright foundation and executable core journeys; later stages remain responsible for function-level deterministic gaps, negative/fault injection, UI action wiring, cross-module regressions and responsive/PWA browser proof.

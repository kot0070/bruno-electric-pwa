# Bruno Electric — Stage 6 UI Action Wiring Matrix

STATUS: IMPLEMENTATION_READY_FOR_EXACT_HEAD
STAGE: 6 — UI Action Wiring Audit
ENTRY_ACCEPTED_STAGE5_SHA: `2f0e7083353008a6bee4d0e294b404f71106331a`
ENTRY_STAGE5_AUDIT: `audits/reports/FUNCTION_CAPABILITY_STAGE5_AUDIT_2f0e708.md` · `A_ACCEPT` · P0=0/P1=0

## Purpose
Stage 6 proves that actionable UI controls are not merely present: they are reachable through the current shell, wired to the intended domain action, honor disabled/hidden state, provide truthful feedback, and remain usable through the supported responsive navigation model. High-risk actions retain real-browser evidence; deterministic wiring inventory rejects duplicate/orphan base action IDs and requires browser evidence references for critical destructive/output actions.

## Deterministic inventory harness
`tests/ui-action-wiring.test.js` adds four Stage 6 gates:
1. base actionable IDs declared in `index.html` / `electrical-tools.html` must be unique;
2. every base actionable ID must have a runtime reference beyond its declaration;
3. critical destructive/output actions must be referenced by real Playwright evidence;
4. current navigation/action-shell bridge modules must remain present and wired.

This is a gap detector, not a substitute for behavioral E2E. Correct domain behavior is established by the browser journeys listed below and existing deterministic domain suites.

## Action group matrix

| UI action group | Representative controls / entry | Intended action | Reachability / state contract | Executable evidence | Stage 6 classification |
|---|---|---|---|---|---|
| Canonical app navigation | desktop side nav, tablet rail, phone bottom nav, `.be-nav-btn`, `#be=GROUP&tab=...` | open correct current panel/deep link | visible at supported shell; exact tab restored; no duplicate IA | `E2E-01`, navigation deterministic suites | VERIFIED |
| Calculator navigation | `#tool-nav [data-tool]`, `#be-tool-select` | open selected electrical workspace | desktop buttons / compact picker route to same workspace | `HUMAN-CALC-01`, `E2E-11` | VERIFIED |
| Header overflow / current shell | `#btn-compact-more` | expose current header actions | legacy wide actions not visibly flash; overflow actions reachable | `E2E-11`, `UI-STABILITY-01` | VERIFIED |
| New Job | `#btn-blank` | explicit current Job reset | current Job only; device vaults remain separate | deterministic Job/state tests; critical ID inventory | WIRED / DOMAIN_TESTED |
| Job export | `#btn-export` | download current Job JSON | no mutation | `E2E-09`, deterministic import/export tests | VERIFIED |
| Job import | `#btn-import` | validate and replace active Job | reject malformed/wrong payload; preserve on failure | `E2E-02`, `E2E-09`, `STAGE5-FAULT-06` | VERIFIED |
| Full-app export | `#btn-export-app` | download supported app backup including current Journal vault | no mutation | `STAGE4-APP-BACKUP-01`, app-backup deterministic suite | VERIFIED |
| Full-app import | `#btn-import-app` | validated transactional restore | confirmation, fail-closed validation, rollback on write fault | `STAGE4-APP-BACKUP-01`, `STAGE5-FAULT-01..05` | VERIFIED |
| Catalog search/add | Catalog controls, `.cat-add` | add selected standard material to active Job | respects active Job and strict cost semantics | `E2E-03`, Catalog deterministic suites | VERIFIED |
| Custom material save/add | custom-material controls | save Catalog definition and/or add explicit quantity | blank Your Cost remains unresolved; zero remains known zero | `E2E-03`, custom-material deterministic suite | VERIFIED |
| Pricing/margins | Pricing & Margins controls | edit customer price / Your Cost semantics | fields remain semantically distinct | pricing-domain / pricing-margins deterministic suites; `E2E-03` | VERIFIED |
| Residential live design calculate | live form controls | recalculate current residential design | form edits do not mutate Job materials | `E2E-04`, `HUMAN-CALC-10` | VERIFIED |
| Residential Save | `#rl-save-ux-btn` | persist calculation/archive snapshot | Save != Apply | `E2E-04`, `HUMAN-CALC-04` | VERIFIED |
| Residential archive load/duplicate/delete | saved-calculation archive controls | lifecycle current calculation history | correct snapshot/action feedback | `E2E-04`, Residential deterministic suites | VERIFIED |
| Residential Apply | `#rl-apply-job-btn` | explicitly replace residential-generated Job materials | manual/other-source rows preserved | `E2E-04`, `HUMAN-CALC-04` | VERIFIED |
| Core electrical Calculate actions | `#run-amp`, `#run-vd`, `#run-cf`, `#run-bf` | calculate current visible inputs | invalid/blank fail closed; corrected input recalculates | `HUMAN-CALC-02`, `HUMAN-CALC-07`, `STAGE4-CALC-01..04` | VERIFIED |
| Equipment/distribution calculations | EVSE/HVAC/Motor/Grounding/Feeder UI actions | execute correct domain engine | unsupported/review states truthful | `HUMAN-CALC-05`, `E2E-EVSE-01` | VERIFIED |
| Equipment BOM replace | EVSE/HVAC/Motor/GEC/Feeder BOM actions | replace only source-tagged generated rows | idempotent source isolation | equipment/BOM deterministic suites | WIRED / DOMAIN_TESTED |
| Electrical Task type/template selection | `#et-type`, task nav | select supported task runtime | disabled/unsupported types fail closed | `E2E-06`, `HUMAN-CALC-01` | VERIFIED |
| Electrical Task Calculate | `#et-calculate` | calculate current draft | no save/apply side effect | `E2E-05`, `E2E-06`, `HUMAN-CALC-04` | VERIFIED |
| Electrical Task Save | `#et-save` | save task revision | Save != Apply | `E2E-05`, `HUMAN-CALC-04` | VERIFIED |
| Build Material Takeoff | `#et-build-takeoff` | build plan from exact calculated/saved state | does not mutate Job | `E2E-05`, task material deterministic suite | VERIFIED |
| Apply Calculated Materials | `#et-apply-materials` | apply eligible exact saved revision | disabled until eligible; provenance written | `E2E-05`, `HUMAN-CALC-04` | VERIFIED |
| Task rename / duplicate / delete | Stage 6 task lifecycle buttons | mutate saved task lifecycle only | active Job scope; truthful selected state | task archive deterministic suite; `HUMAN-CALC-03` reachability | WIRED / DOMAIN_TESTED |
| Task recalc / refresh / update Job | `#et-stage6-recalc`, `#et-stage6-refresh`, `#et-stage6-update` | recalc/status/explicit revision update | changed-since-apply feedback; Update explicit and rollback-safe | `E2E-05`, `HUMAN-CALC-04`, task archive tests | VERIFIED |
| Task Solver extract | `#et-solver-extract` | extract explicit known facts only | unresolved remains explicit | `E2E-07`, `HUMAN-CALC-03` | VERIFIED |
| Task Solver use facts | `#et-solver-use` | copy supported facts into form | no calculate/save/apply side effect | `E2E-07`, `HUMAN-CALC-03` | VERIFIED |
| Calculation document | `#be-download-calc` | open current calculation preview | no download until preview action | `HUMAN-CALC-04`, `HUMAN-CALC-09`, `HUMAN-CALC-11` | VERIFIED |
| Calculation preview Download | `#be-preview-download` | create/download PDF from preview model | same visible calculation model | `HUMAN-CALC-04`, `HUMAN-CALC-09` | VERIFIED |
| Quote approve | `#qa-approve` | create immutable approved quote snapshot | positive amount required; history retained | `E2E-08`, quote lifecycle tests | VERIFIED |
| Use approved invoice basis | `#qa-use-approved` | select approved snapshot basis | live Job mutation cannot rewrite approved amount | `E2E-08` + contract closure | VERIFIED |
| Fixed invoice Preview/Print | `#qa-print-fixed`, `#be-preview-print-fixed` | preview first, print only on explicit preview action | approved snapshot source only | `E2E-08`, fixed-price invoice tests | VERIFIED |
| T&M print | `#btn-print-tm`, `#btn-print-tm-2` | T&M output path | remains explicit/distinct from fixed approved invoice | `E2E-08` | VERIFIED |
| Journal add/edit/delete call | Call Journal rendered actions | mutate current standalone Journal entry | editor state/persistence truthful | `JOURNAL-HUMAN-01`, Journal deterministic suite | VERIFIED |
| Journal pricing mode | hourly/fixed controls | set call price method | visible economics consistent with persisted mode | `JOURNAL-PRICING-HUMAN-01` | VERIFIED |
| Journal materials quick/itemized | material mode/rows | record included reference materials | materials do not inflate customer total | `JOURNAL-MATERIALS-01..03` | VERIFIED |
| Journal tax | taxable/tax controls | apply explicit configured commercial sales tax | residential default no tax; commercial explicit/editable | `JOURNAL-TAX-01` | VERIFIED |
| Journal Preview invoice | `Preview invoice` action | render current customer invoice | source values/current company identity visible | `JOURNAL-HUMAN-01`, `JOURNAL-PREVIEW-01` | VERIFIED |
| Journal PDF/Print preview actions | preview Download PDF / Print | output current preview model | blocked when required company identity missing | `JOURNAL-PREVIEW-01`, `JOURNAL-HUMAN-01` | VERIFIED |
| Company / letterhead controls | More → Company, letterhead selector | edit/select profile used by documents | dark/readable; document identity re-read before output | `UI-STABILITY-02`, customer-doc deterministic suite | WIRED / DOMAIN_TESTED |
| Workers / labor | More → Workers and labor actions | update roster/pay/burden/current Job labor | current Job/personnel scope | runtime map + deterministic labor/summary semantics | WIRED / DOMAIN_TESTED |
| Change Orders | Change Order controls | add/edit current Job COs | current Job scope; quote approval snapshots retain approved CO amount | runtime map + quote/workflow deterministic suites | WIRED / DOMAIN_TESTED |
| Profit & Loss | P&L panel controls | render current Job economics | display-only/current Job semantics | runtime map + summary/pricing deterministic suites | WIRED / DOMAIN_TESTED |
| Theme / zoom preferences | Help/preferences controls | persist UI preference | device preference only, no Job business mutation | runtime map/navigation deterministic suites | WIRED / DOMAIN_TESTED |
| Service worker/offline shell | app install/cache lifecycle (not ordinary button) | retain current cached shell/offline navigation | owned cache only; incomplete core install rejected | `E2E-12`, service-worker deterministic suite | VERIFIED_INFRASTRUCTURE |

## Disabled / hidden / truthful-feedback review
- Electrical Task Apply/Update pathways use eligibility/revision state and visible status rather than silently mutating Job materials.
- Professional Task Solver explicitly states no automatic calculation/save/apply and browser tests verify no side effect.
- Customer document output is preview-first; missing company identity blocks final Journal PDF with an explanatory preview state.
- Current compact shell hides superseded header layout before it can visibly flash; hidden legacy controls are not treated as current user actions.
- Phone/tablet Calculator routing uses the compact picker while desktop uses tool navigation; both target the same tool sections.
- `UI-STABILITY-02` rejects light/white visible disabled/readonly controls in the dark current UI.

## Stage 6 acceptance gate
Before independent audit:
- deterministic suite must include `tests/ui-action-wiring.test.js` and pass completely;
- full Chromium matrix must remain green on exact implementation SHA;
- no base actionable ID may be duplicate/orphan according to deterministic inventory;
- critical destructive/output actions must retain real browser evidence;
- no open P0/P1 wiring finding may remain.

Final exact-head SHA/CI counts are intentionally not filled until the last Stage 6 implementation/document commit is green.

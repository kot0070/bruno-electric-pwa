# Bruno Electric — Stage 1 Runtime Capability Map

STATUS: STAGE_1_DONE_ACCEPTED
RUNTIME_BASE_SHA: `c04a1c6807ab40e142eea25d8fe40405ff139b86`
STAGE_1_ACCEPTANCE_SHA: `16f725d56f034d55a6ae2e5e46acf67a08f95d05`
SCOPE: current reachable runtime, loaders, UI actions, handlers, persistence, services and conflicting/dormant paths

`c04a1c6` is the exact Stage 1 independent re-audit runtime SHA. The delta from `c04a1c6` to Stage 1 acceptance SHA `16f725d` changed only Function Capability Audit governance files, not production/runtime files. This map is runtime evidence only. It does **not** promote user-facing capabilities to PASS; real-browser proof remains mandatory under the Function Capability Audit Master.

## 1. Runtime topology

### Main Job workspace (`index.html`)
- `index.html` is the legacy single-page Job workspace. It owns the base Job state, core tabs, fixed-price/T&M UI, materials, catalog, workers, Company profiles, change orders, P&L, import/export and print actions.
- Primary Job persistence key: `bruno-electric-v1`.
- Additional device/local vaults include Company profiles, UI preferences, Catalog accordion state and the current Dispatch Journal v3 standalone keys.
- `sw-register.js` is not only service-worker registration; it is the runtime enhancement loader for current semantic/capability modules.
- Current navigation is injected by `electric-app-navigation.js` + `electric-workspace.js`; deep-link restoration is `electric-navigation-bridge.js`.
- `electric-app-navigation.js` loads `electric-app-backup-dispatch.js` on the Job workspace so full-app backup/restore includes the current Journal v3 vaults.

### Electrical Tools (`electrical-tools.html`)
- Loads the base electrical calculation/reference/catalog/BOM/Residential/Phase-3 stack directly.
- `electrical-project-calculator-ui.js` adds the project-mode front door and stores project calculator/mode in dedicated localStorage keys.
- `electrical-tools-shell.js` replaces presentation/navigation across phone/tablet/desktop while preserving the underlying tool buttons.
- `sw-register.js` then dynamically loads the Electrical Tasks dependency chain and UI adapters.

### Loader / override policy
`sw-register.js` loads modern runtime overlays after DOM readiness. Important override patterns:
- strict pricing/cost semantics replace or intercept legacy behavior;
- custom materials capture legacy Catalog Add events for custom IDs in capture phase;
- Residential save/archive overlay proxies legacy save and adds explicit Apply;
- Electrical Tasks Stage 2–8 adapters progressively add/override task UI behavior;
- Dispatch Journal v3 re-renders `#panel-dispatch`, superseding the inline legacy Dispatch UI while the legacy state model still exists in `index.html`.

### PWA
- Service worker cache: `bruno-electric-v68`.
- `CORE_SHELL` includes the main Job workspace, Electrical Tools, navigation/workspace overlays, `electric-app-backup-dispatch.js`, current pricing/custom/quote modules, all current Electrical Tasks stages, Residential modules and calculation UIs.
- Install requires all `CORE_SHELL` entries; optional icons may fail without blocking install.
- Fetch strategy is network-refresh with cache fallback; navigation falls back to cached `index.html`.

## 2. Canonical navigation map

| Capability | UI entry | Handler / bridge | Runtime target | Persistence / side effect |
|---|---|---|---|---|
| CAP-NAV-001 | desktop side nav, tablet rail, phone bottom nav | `electric-workspace.js` `openGroup/openTab`; `electrical-tools-shell.js` links/picker | `index.html` panels or `electrical-tools.html` | navigation only |
| CAP-NAV-002 | `#be=GROUP&tab=...` | `electric-app-navigation.js` parse/href + `electric-navigation-bridge.js` click restore | canonical source tab | URL hash / cross-page navigation |
| CAP-JRN-001 | Journal → Call Journal / Dispatch | current overlay `electric-dispatch-journal-v2.js` | call/helper/tax journal runtime | standalone keys `bruno-electric-dispatch-journal-v2`, `bruno-electric-dispatch-settings-v2` |
| CAP-ELC-001 | Calculator → Project Calculator / Electrical Tools | `electrical-tools-shell.js`, `electrical-tools-ui.js` | tool sections and current engine modules | calculations mostly non-persistent; explicit BOM actions mutate active Job |
| CAP-QTE-001 | Job → Customer Price / Quote | inline quote runtime + `electric-quote-lifecycle.js` | live recommendation → approval candidate | Job key `bruno-electric-v1` |
| CAP-TM-001 | Job → Invoice | inline T&M runtime | T&M document path | Job key; remains separate from fixed-price approval |
| CAP-CAT-001/002 | Catalog | inline Catalog + strict overlays + `electric-custom-materials.js` | standard/custom Catalog and Job add | Job-scoped `catalog`, `materialsUsed`, `materialsUnresolved` |
| CAP-PRC-001 | Catalog → Pricing & Margins | strict pricing overlays | contractor cost / customer price semantic guard | Job key |

## 3. Job / shell / backup actions

| Action / capability | Reachable control | Runtime handler | Persistence / side effect | Stage-1 classification |
|---|---|---|---|---|
| New blank Job | header `#btn-blank` | inline `index.html` state reset path | replaces current `bruno-electric-v1`; device vaults intentionally preserved | CURRENT |
| Export current Job | header `#btn-export`, Help shortcut | inline `doExportJob()` | JSON download of current `state` | CURRENT |
| Import current Job | header `#btn-import` | inline import reader → Job payload validation/apply | replaces current Job state | CURRENT |
| Export app backup | header `#btn-export-app`, Help shortcut | `doExportApp()` + `electric-app-backup-dispatch.js` export wrapper | downloads base app payload plus `dispatchJournalV3.data/settings` | CURRENT; Stage 1 backup blocker corrected |
| Import app backup | header `#btn-import-app` | `applyAppPayload()` + `electric-app-backup-dispatch.js` restore wrapper | restores supported base members and Journal v3 standalone keys when present; legacy backups do not erase existing Journal v3 | CURRENT; Stage 1 backup blocker corrected |
| Company profiles | More → Company | inline profile handlers | `bruno-electric-profiles-v1` | CURRENT |
| Company export/import | Company + Help shortcuts | inline company backup handlers | profiles vault only | CURRENT |
| Workers roster/pay/burden | More → Workers | inline personnel handlers | current Job/personnel model | CURRENT |
| Workers export/import | Workers + Help shortcuts | inline worker backup handlers | worker/personnel payload | CURRENT |
| Theme / zoom | Help/preferences controls | inline UI preference handlers | `bruno-electric-ui-prefs-v1` | CURRENT |
| Catalog accordion state | Catalog | inline state handlers | Catalog open-state key | CURRENT |

## 4. Dispatch / Journal runtime and persistence boundary

### Current reachable runtime
`sw-register.js` loads `electric-dispatch-journal-v2.js` on the Job workspace. The module replaces/re-renders `#panel-dispatch` and stores current journal data in:
- `bruno-electric-dispatch-journal-v2`
- `bruno-electric-dispatch-settings-v2`

It supports:
- day/week/month/quarter period navigation;
- calls: add/edit/delete, date/time/hours/address/description/price/status/tax;
- earned-call accounting;
- helpers with effective-dated pay revisions/work days;
- owner/helper tax settings and calculated business net.

### Dormant/conflicting legacy runtime
`index.html` still normalizes, renders and binds a legacy `state.dispatch` inside `bruno-electric-v1`. After the v3 overlay re-renders the panel, the legacy UI path is no longer the authoritative visible journal, but its state remains in the Job model.

### Stage 1 finding lifecycle
At audit SHA `138b3de84f158d57ec0046d6dbed80049c1ba299`, independent audit finding `FCA-S1-P1-001` proved that full app backup omitted the visible Journal v3 standalone data/settings while Help promised Dispatch inclusion.

The production correction added `electric-app-backup-dispatch.js`, deterministic regression tests and PWA core-shell inclusion. Re-audit at exact SHA `c04a1c6807ab40e142eea25d8fe40405ff139b86` verified:
- app export includes `dispatchJournalV3.data/settings`;
- app import restores both current Journal v3 standalone keys when the block is present;
- legacy app backups without the new block do not destructively erase an existing Journal v3;
- PWA cache includes the bridge.

`FCA-S1-P1-001`: **VERIFIED_CLOSED**.

Remaining architectural observation `FCA-S1-P2-001`: legacy `state.dispatch` and current standalone Journal v3 coexist and can diverge. Stage 2 must classify the intended persistence/isolation/migration contract. This is not a Stage 1 P0/P1 blocker.

## 5. Catalog / materials / cost semantics

### Standard Catalog
- Base Job Catalog remains in `bruno-electric-v1`.
- Electrical Tools `Seed missing items` calls `BrunoElectricalCatalogV1.mergeMissing()` and intentionally preserves existing rows/prices.
- Standard add-to-Job path is guarded by current cost semantics modules loaded from `sw-register.js`.

### Custom / special-order
`electric-custom-materials.js` installs the current project-scoped UI and API:
- Save to Catalog;
- Save + Add to Job;
- Add existing custom item to Job with explicit quantity;
- Edit Catalog definition;
- Delete custom definition.

Runtime semantics:
- Customer Price (`unitCost` on custom Catalog definition) is separate from Your Cost;
- blank Your Cost remains unresolved;
- known Your Cost routes row to `materialsUsed`;
- blank Your Cost routes row to `materialsUnresolved`;
- editing/deleting a Catalog definition does not silently rewrite historical Job Materials rows;
- custom rows remain inside the active Job, not a device-global custom registry.

## 6. Residential runtime

| Capability | UI / action | Handler / runtime | Persistence / side effect |
|---|---|---|---|
| CAP-RES-001 | Electrical Tools → Project Calculator → Residential / Live Design | project calculator populates live Residential form; Residential modules calculate | project calculator keys + live UI state |
| CAP-RES-002 | Save Calculation; Saved Calculations archive; Duplicate/Load/Delete | `electric-residential-save-archive-ux.js` proxies accepted history runtime | active/archive snapshot in Job state |
| CAP-RES-003 | Apply to Job / Update Job from Calculation | `electric-residential-apply-job.js::applyActive()` | transaction replaces only prior residential-generated Job material rows, preserves manual/other generated rows, writes provenance `residentialAppliedCalculation` |

Important current boundary: `Live edits -> Save Calculation -> Apply to Job`.
Save does not mutate Job Materials. Editing after Apply marks the live view dirty and does not mutate the applied Job until a new Save + Apply.

## 7. Electrical core tools

Runtime route: `electrical-tools.html` → direct scripts → `electrical-tools-ui.js` / Phase-3 UI.

| Capability ID | UI | Runtime API | Persistence / side effect |
|---|---|---|---|
| CAP-ELC-002 | Conductor / Ampacity → Calculate | `BrunoElectricalCalc.ampacity()` | display only |
| CAP-ELC-003 | Voltage Drop → Calculate | `BrunoElectricalCalc.voltageDrop()` | display only |
| CAP-ELC-004 | Conduit Fill → conductor rows / Calculate | `BrunoElectricalCalc.conduitFill()` | display only |
| CAP-ELC-005 | Box Fill → Calculate | `BrunoElectricalCalc.boxFill()` | display only |
| CAP-ELC-006 | Project Calculator → Calculate project | `electrical-project-calculator-ui.js` | `bruno-electric-project-calculator-v1`, `bruno-electric-project-mode-v1`; Residential handoff or Commercial fail-closed boundary |
| CAP-ELC-007 | EVSE / Charging | `BrunoPhase3.evse()` | result display; Replace EVSE BOM mutates Job via source-tagged BOM replacement |
| CAP-ELC-008 | HVAC MCA/MOCP | `BrunoPhase3.hvac()` | result display; Replace HVAC BOM |
| CAP-ELC-009 | Motor Circuit | `BrunoPhase3.motor()` | result display; Replace Motor BOM |
| CAP-ELC-010 | Grounding / Bonding | `BrunoPhase3.egc()` / `groundingElectrode()` | result display; GEC BOM replacement where supported |
| CAP-ELC-011 | Feeder Helper | `BrunoPhase3.feeder()` | result display; source-tagged feeder BOM replacement |

Commercial Project Calculator explicitly does not reuse residential dwelling minimums; it persists Commercial mode and leaves generic electrical tools available.

## 8. Electrical Tasks chain

### Loader order
On `electrical-tools.html`, `sw-register.js` loads:
`electric-electrical-tasks.js -> task engine -> raceway -> grounding reference -> grounding engine -> task material takeoff -> advanced templates -> archive -> base Tasks UI -> Stage2 -> Stage3 -> Stage4 -> Stage5 -> Stage6 -> Stage7 -> solver -> Stage8 UI`.

### Persistence
`electric-electrical-tasks.js` stores tasks **inside the active Job** (`bruno-electric-v1`) under:
- `electricalTasks`
- `electricalTaskActiveId`

Supported enabled task types:
- Feeder / Panel Run
- Branch Circuit Run
- Long-Distance Voltage Drop
- Transformer Feed
- Motor Circuit
- EVSE Circuit
- HVAC Circuit
- Generator / Feeder

Disabled types fail closed instead of creating unsupported tasks.

### User-action mapping
| Capability | Action | Runtime path | Side effect |
|---|---|---|---|
| CAP-ET-001 | select Electrical Tasks / template | base Tasks UI + Stage7 override | UI only until Save |
| CAP-ET-002 | Calculate Feeder | Stage2 UI → `BrunoElectricalTaskEngine.calculate()` | display result only |
| CAP-ET-003..009 | Calculate advanced templates | Stage7 capture handler → `BrunoElectricalTaskAdvanced.calculate()` | display result only |
| CAP-ET-010 | raceway sizing | Stage3 adapter / raceway engine | display/result model |
| CAP-ET-011 | OCPD/neutral/EGC semantics | Stage4 adapter / grounding engine | display/result model |
| CAP-ET-012 | Build Material Takeoff | Stage5 → `BrunoElectricalTaskMaterialTakeoff.build()` | no Job mutation |
| CAP-ET-014 | Apply Calculated Materials to Job | Stage5 → `.apply(currentPlan)` | only eligible exact saved revision; source-provenance Job material snapshots |
| CAP-ET-013 | Save/load/recalculate | base Tasks API + Stage6 archive | Job-scoped task revisions |
| CAP-ET-015 | Changed-since-apply / Update Job from Task | Stage6 → archive `.status()` / `.update()` | archives prior task-origin Job materials then installs explicit new revision |
| CAP-ET-016 | Rename / Duplicate / Delete saved task | base UI + Stage6 archive | active Job `electricalTasks` only |
| CAP-SOL-001 | Extract known facts / Use known facts | Stage8 → deterministic solver | copies only explicit extracted facts to form; no calculate/save/apply side effect |

Key boundaries observed in current UI:
- Save Task Draft does not Apply to Job.
- Build Material Takeoff does not Apply to Job.
- Apply is disabled unless plan is PASS/applyAllowed and still matches the exact saved task revision.
- Task Solver explicitly states and implements no automatic calculate/save/apply.

## 9. Quote / Approved Quote / Invoice / T&M

### Fixed-price Quote lifecycle
`electric-quote-lifecycle.js` reads the current live recommended customer price, permits an optional positive manual adjustment, then writes an immutable approval snapshot into the active Job:
- `quoteLifecycle.approved`
- prior approval copied to `quoteLifecycle.history`

Snapshot includes customer amount, price source, recommendation at approval, manual override, approved CO amount, cost completeness warning, quote metadata and applied Residential calculation snapshot.

### Fixed-price Invoice
`electric-fixed-price-invoice.js` can build/print only from `BrunoQuoteLifecycle.invoiceBasis()` whose source must be `APPROVED_QUOTE_SNAPSHOT`. It does not use the current live calculator amount.

### T&M
Legacy T&M print controls are deliberately relabeled as T&M and remain separate from the fixed-price approved snapshot path.

## 10. Runtime-discovered current capabilities added to registry
The initial Stage 0 registry was requirement-led. Stage 1 also represents reachable product actions discovered in runtime:
- CAP-ELC-002..011: individual electrical/project/equipment tools;
- CAP-ET-016: task rename/duplicate/delete lifecycle;
- CAP-CO-001: Change Orders;
- CAP-LAB-001: Labor & Equipment;
- CAP-PNL-001: Profit & Loss;
- CAP-WRK-001: Workers roster/burden/pay calculator;
- CAP-CMP-001: Company/letterhead profiles;
- CAP-BKP-001..004: full-app, Company, Workers and Help backup/restore surfaces;
- CAP-UI-001: theme/zoom preference persistence;
- CAP-REF-001: in-product electrical/reference surfaces.

These remain `UNTESTED`; Stage 1 runtime reachability is not capability PASS evidence.

## 11. Infrastructure-only / dormant / conflicting paths

### Infrastructure-only
- `manifest.webmanifest`, icons;
- service-worker cache/update machinery;
- current shell/navigation adapters where no independent business action exists.

### Dormant/overridden
- legacy inline Dispatch renderer/state remains in `index.html`, but current visible Journal is re-rendered by Dispatch Journal v3;
- base Electrical Tasks non-feeder `onchange` says templates are planned, but Stage7 intentionally replaces that handler after load and enables accepted advanced templates;
- base Residential legacy save controls remain as the implementation target behind the newer explicit Save/Archive UX proxy.

### Findings / conflicts after Stage 1 corrective cycle
1. **`FCA-S1-P1-001` Dispatch full-backup mismatch:** corrected and `VERIFIED_CLOSED`; current full app backup includes Journal v3 data/settings.
2. **`FCA-S1-P2-001` Dual Dispatch state models:** remains an architectural classification item for Stage 2; legacy `state.dispatch` and current standalone Journal can diverge.

No capability is promoted to PASS by this map.

## 12. Stage 1 completion checklist
- [x] current shell/pages identified
- [x] current runtime loader order identified
- [x] UI → handler/runtime mapping completed for primary product domains
- [x] persistence scopes identified
- [x] service-worker loading/cache path identified
- [x] dormant/overridden paths identified
- [x] runtime-discovered product capabilities identified for registry expansion
- [x] conflicting implementation candidate recorded without silently changing requirements
- [x] capability registry expansion committed
- [x] fresh exact-head deterministic CI
- [x] independent exact-SHA Stage 1 audit
- [x] all Stage 1 P0/P1 corrected and re-audited
- [x] Stage 1 ACCEPT

Accepted evidence:
- inventory SHA `138b3de84f158d57ec0046d6dbed80049c1ba299`, CI run #536 / id `35160109516`, SUCCESS;
- initial audit branch `audit/function-capability-stage1-138b3de`, verdict `A_REJECT_CORRECTIVE_REQUIRED`, P0=0/P1=1;
- corrective runtime SHA `7b39a8fb55be5a525cf157124fcb14e42903c758`, CI run #543 / id `35163156620`, SUCCESS, 770/770;
- re-audit runtime/governance SHA `c04a1c6807ab40e142eea25d8fe40405ff139b86`, CI run #545 / id `35163241400`, SUCCESS;
- re-audit branch `audit/function-capability-stage1-reaudit-c04a1c6`, verdict `A_ACCEPT`, P0=0/P1=0;
- authoritative Stage 1 acceptance / Stage 2 entry SHA `16f725d56f034d55a6ae2e5e46acf67a08f95d05`, CI run #547 / id `35163361606`, SUCCESS; delta from re-audit SHA is governance-only.

Stage 2 is the next active gate and must compare each capability `PLAN/SPEC -> UI -> RUNTIME -> TEST -> STORAGE/SIDE EFFECT -> RESULT` without treating this Stage 1 map as PASS proof.

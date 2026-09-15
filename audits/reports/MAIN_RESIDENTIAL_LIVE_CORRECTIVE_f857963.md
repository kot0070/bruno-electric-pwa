# Independent Final Acceptance Audit — Residential Live Code & Takeoff

**Mode:** AUDIT ONLY  
**Verdict:** **C — REJECT / REWORK REQUIRED**  
**Audited production HEAD:** `f85796318596d4ed6b2d373f0de314cb9c6793fe`  
**Target branch:** `main`  
**Audit branch:** `audit/main-residential-live-f857963`  
**Report path:** `audits/reports/MAIN_RESIDENTIAL_LIVE_CORRECTIVE_f857963.md`

## 1. Executive result

The pinned production HEAD was independently re-audited against `audits/PROTOCOL.md` and the complete scope in `audits/TASK_CURRENT.md`. The previously identified corrective areas are materially improved: bathroom/powder semantics no longer claim a universal numeric 210.52(D) minimum, malformed wall geometry fails closed, AUTO/USER provenance is preserved in current snapshots, Confirm & Save uses a rollback-protected paired commit, and L0–L5 vs L6 semantics are explicitly separated.

However, final acceptance is blocked by one **P1 material pricing/state-coherency defect** in the main workspace: the top Residential materials total can remain stale after the user changes Catalog pricing in the same browser tab. The widget only refreshes on initial render, `storage`, or window `focus`. Browser `storage` events do **not** fire in the same window that performed the `localStorage` update, and the main Catalog save path has no direct call/event into `BrunoResidentialLiveWorkspace.render()`. Therefore the user can edit current Catalog customer pricing and continue seeing an obsolete Residential top total until a later focus/reload/other-context event.

Under the protocol, any P1 blocker requires verdict C.

---

## 2. Pinned-head verification

Verified `main` points exactly to:

`f85796318596d4ed6b2d373f0de314cb9c6793fe`

GitHub branch metadata showed the exact SHA and commit message `Align service worker tests with v38 cache line`.

The recursive tree for that SHA was inspected directly. Relevant production modules and tests were read at the pinned SHA, not from summaries or prior reports.

---

## 3. CI evidence

Exact-head GitHub Actions evidence:

- Workflow: **Electrical Calculator Tests**
- Run: `35032548823`
- Head SHA: `f85796318596d4ed6b2d373f0de314cb9c6793fe`
- Job: `calculator-tests`
- Step: `Run deterministic calculator and integrity tests`
- Conclusion: **success**
- Pages build/deployment for the same SHA also completed successfully.

The workflow executes `node tests/run-node.js`, which loads the existing calculator/data-integrity/navigation/residential/pricing/takeoff/live/levels/history/phase-3/service-worker deterministic suites.

Green CI was treated only as supporting evidence. Negative paths and implementation behavior were independently inspected.

---

# 4. Findings

## P1-RL-01 — Workspace Residential materials total is stale after same-tab Catalog repricing

**Severity:** P1  
**Status:** BLOCKER

### Required behavior

The task requires:

- live repricing from the **current Catalog**;
- the workspace top Residential material total to use current Catalog pricing.

A user who changes Catalog customer pricing in the main workspace must not continue seeing a stale Residential material total presented as current/live.

### Evidence

`electric-residential-live-workspace.js` correctly recalculates the active Residential BOM through `BrunoResidentialPricing.priceRows(...)` each time `render()` executes.

But its refresh triggers are only:

1. initial `setTimeout(render,0)`;
2. `window.addEventListener('storage', ...)` for `bruno-electric-v1`;
3. `window.addEventListener('focus', render)`;
4. an explicit `BrunoResidentialLiveWorkspace.render()` call from the Residential Live tools Confirm flow if the module is present.

The main workspace Catalog editor and the Residential top-total widget execute in the **same document/tab**. A same-tab `localStorage.setItem(...)` does not dispatch a `storage` event back to the source window. This is standard Web Storage behavior; MDN documents that the `storage` event is sent to other documents sharing the storage area, not to the window that made the change:

https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event

The main `index.html` does not directly call `BrunoResidentialLiveWorkspace.render()` when Catalog pricing is edited/saved, and no same-document Catalog-change event is wired into the Residential widget.

### Deterministic failure scenario

1. Have a confirmed active Residential estimate with a BOM item matched to Catalog.
2. Open main Job Workspace and observe top `Residential materials · customer` total.
3. In the same page/tab, edit that matched Catalog item's Customer Price (`unitCost`) and save/allow normal persistence.
4. The underlying `bruno-electric-v1` Catalog is current, but the Residential chip is not re-rendered by its own module.
5. `storage` does not fire in the source window; ordinary same-tab editing also does not produce a window `focus` transition.
6. The visible top Residential total remains the prior price until a later focus/reload/other-context refresh.

### Impact

This is a customer/material estimating correctness defect: a user-visible value labeled as Residential materials/customer can disagree with the currently saved Catalog in the same active workspace session. It directly fails the requested live Catalog linkage and workspace-top-total acceptance criterion.

### Required correction

Wire the main Catalog persistence/update path to the Residential Live workspace renderer through an explicit same-document mechanism, for example:

- call `window.BrunoResidentialLiveWorkspace.render()` after successful Catalog persistence; or
- dispatch/listen for a dedicated same-document Catalog-changed event; or
- use another deterministic shared state notification mechanism.

Add a deterministic regression test that simulates a Catalog price mutation in the same document and proves the visible top Residential total changes immediately without relying on reload/focus/cross-tab `storage`.

---

## P2-CI-01 — PR path filters omit several Residential Live state modules

**Severity:** P2  
**Status:** Minor process/test-coverage gap; not the verdict driver

The workflow's `pull_request.paths` includes `electric-residential-live.js` and `electrical-residential-live-ui.js`, but does not list several directly relevant files, including:

- `electric-residential-live-levels.js`
- `electric-residential-live-history.js`
- `electric-residential-live-workspace.js`
- `electrical-residential-live-levels-ui.js`

A PR changing only one of those omitted modules can skip the calculator workflow at PR time. Pushes to `main` still run the workflow unconditionally, which is why the pinned production HEAD has green exact-head CI. This is not a production logic blocker but weakens pre-merge regression protection.

---

# 5. Mandatory previous-blocker recheck

## 5.1 Bathroom / powder code-minimum semantics — PASS

Independent inspection of `electric-residential-live.js` found:

- `codeMinimums.bathroomReceptacles.known` is always false from room count alone;
- its numeric `value` is `null`;
- the basis explicitly states sink/placement geometry is required;
- bathroom/powder entered device quantity is labeled as a **design allowance**, not a universal NEC 210.52(D) numeric minimum;
- no bathroom-receptacle non-compliance violation is generated from room count alone;
- `powderRooms` alone does not create the modeled Bathroom receptacle code circuit;
- only confirmed `bathrooms > 0` creates that code-circuit model.

The deterministic suite also explicitly tests that powder/toilet rooms alone do not force a bathroom code circuit.

**Result:** previous blocker resolved for the audited workflow.

## 5.2 Fail-closed wall geometry parser — PASS

`parseSegments()` / `wallMinimum()` were rechecked independently:

- blank tokens inside a supplied list are invalid;
- nonnumeric values are invalid;
- negative values are invalid;
- non-finite values are invalid;
- any invalid token causes `wallMinimum()` to throw before a code minimum is returned;
- valid numeric segments below 2 ft are retained separately as explicit nonqualifying segments;
- invalid tokens are not silently discarded to produce a partial known/compliant minimum.

Tests cover malformed text, blank token, negative token, and sub-2-ft valid numeric segments.

**Result:** previous blocker resolved for UI/string-input workflow.

## 5.3 AUTO vs USER override provenance after Save / Reload / Duplicate — PASS

The current UI stores explicit per-field provenance in `inputs.overrideProvenance`:

- AUTO field -> override persisted as blank plus provenance `AUTO`;
- USER field -> explicit value plus provenance `USER`.

`applySnapshot()` restores USER fields as fixed user values while restoring AUTO fields as blank/AUTO and then calls live render/seed logic. That means AUTO values are rederived from current upstream L0 facts rather than restored as frozen numeric outputs.

`duplicate()` clones the calculation structure after stripping frozen pricing and preserves `inputs.overrideProvenance`; the UI still reapplies AUTO vs USER semantics when loading the duplicate.

Procedural code-path recheck:

1. Save with AUTO defaults -> snapshot stores blank AUTO override + `AUTO` provenance.
2. Reload/duplicate -> `applySnapshot()` restores AUTO mode, not the old displayed number.
3. Change room facts -> `render(false)` recalculates engine inputs and reseeds AUTO design.
4. USER values continue to be supplied through the override map and remain fixed.
5. L3/L4/L5 are recomputed from the resulting current design.

The history suite also verifies provenance survives save and duplicate.

**Result:** previous blocker resolved.

## 5.4 Atomic Confirm & Save with fault paths — PASS

`confirmAtomic()` was inspected end-to-end:

1. reads current job;
2. calls pure `BrunoElectricBOM.prepareReplacement(...)` to build a cloned next job state without writing;
3. embeds the active Residential snapshot into that same next job object;
4. constructs next archive state;
5. calls `commitPair(nextJob,nextLib)`.

`commitPair()`:

- captures old raw job/archive values;
- writes job first, archive second;
- if a write fails, restores any side that was successfully written;
- verifies raw state against the prior raw values;
- reports explicit rollback/reconciliation failure if restoration is incomplete.

Deterministic tests inject failure at:

- first job write boundary;
- second archive write boundary after job write;

and verify both job and archive remain at prior raw state. Because generated BOM and active snapshot are part of the same serialized job write, there is no separate BOM-write boundary that can leave only BOM or only active snapshot committed.

**Result:** previous blocker resolved.

## 5.5 L0–L5 live cascade / L6 commit boundary — PASS

`electric-residential-live-levels.js` defines L0 through L6 and separates:

- `liveAffectedFrom()` -> up through L5 only;
- `pendingCommitFrom()` -> L6.

The UI text explicitly states ordinary edits recalculate L0–L5 and L6 changes only on Confirm & Save. The level UI marks L6 as affected/pending rather than live-committed.

The actual persistence path matches the claim: ordinary `render()` does not write the active estimate/archive; `saveConfirmed()` invokes `confirmAtomic()`.

**Result:** previous blocker resolved.

---

# 6. Full Residential Live workflow audit

## 6.1 Code minimum vs estimating assumptions — PASS

The current engine distinguishes code-driven results from estimating/design assumptions:

- general wall-space numeric minimum only when a complete validated segment list is supplied;
- bathroom/powder exact device count remains layout required;
- kitchen exact device count remains layout required;
- general receptacle circuit grouping is explicitly labeled a Bruno design assumption;
- cable footage is explicitly labeled a routing estimate, not NEC minimum footage.

No acceptance blocker found here.

## 6.2 Circuits / breakers / conductors / cable / panel spaces — PASS within declared model

Rechecked cascade behavior:

- general design receptacle quantity drives `ceilDiv(receptacles, grouping)` general circuits;
- 20 A general circuits select #12 Cu / 12/2 NM-B;
- 15 A general circuits select #14 Cu / 14/2 NM-B;
- kitchen, confirmed bathroom, laundry and garage branches are modeled as 20 A / #12;
- modeled 20 A and 15 A circuit counts drive corresponding 1-pole breaker BOM quantities;
- `panelSpaces120V` tracks total modeled single-pole branch circuits;
- cable estimate responds to circuits and design quantities;
- ordinary receptacle quantity changes branch takeoff but does not directly inflate dwelling service VA under the floor-area general-load method.

Tests explicitly cover receptacle-driven extra circuits/breakers, cable growth, 15 A vs 20 A conductor/breaker families, and major special-area circuit rows.

No additional P0/P1 found.

## 6.3 BOM generation / same-source replacement — PASS

`BrunoElectricBOM.prepareReplacement()` clones job state, preserves manual/material rows not generated by the same source, removes only prior rows with matching `generatedBy.source`, then appends the newly generated rows.

Residential Confirm uses source tag `residential-live-takeoff`, preventing duplicate accumulation across repeated confirms while preserving unrelated/manual rows.

No blocker found.

## 6.4 Customer Price / Your Cost / unresolved cost / explicit zero / margin — PASS

`BrunoResidentialPricing.priceRows()` was rechecked:

- Customer Price comes from Catalog `unitCost`;
- Your Cost comes from Catalog `yourCost`;
- blank/null/missing Your Cost remains `YOUR_COST_UNRESOLVED`, not coerced to zero;
- explicit `yourCost: 0` is treated as a valid resolved zero cost;
- margin/profit are calculated only from rows with both usable customer price and resolved Your Cost;
- negative cost/price and nonnumeric quantity/price inputs fail closed;
- unmatched rows remain identifiable;
- zero customer price is explicitly treated as `UNPRICED`.

Existing deterministic tests cover these semantics.

No blocker found in the pricing engine itself.

## 6.5 Material Calculation Archive / live Catalog repricing — PASS

The archive stores calculation inputs/design/BOM structure and explicitly strips pricing snapshots before persistence.

`active()` and `list()` hydrate pricing from the current job Catalog each time they are called. The test suite verifies that changing both customer price and Your Cost in Catalog changes later archive totals.

Duplicate also strips pricing and rehydrates from the current Catalog.

No blocker found in archive pricing source-of-truth semantics.

## 6.6 Confirm & Save Active Estimate — PASS

The production UI uses `H.confirmAtomic(...)`, not the non-BOM helper path. Code conflicts in `last.violations` block confirmation. Successful Confirm updates generated Residential BOM + active snapshot + archive as one logical transaction via the paired serialized write.

No blocker beyond P1-RL-01 in surrounding workspace display coherence.

## 6.7 Workspace top Residential material total — FAIL (P1-RL-01)

The module exists, is cached, and is dynamically bootstrapped from `sw-register.js` on the main workspace. Initial rendering and cross-context/focus refresh are correct.

But same-tab Catalog edits do not deterministically trigger a Residential re-render. See P1-RL-01.

## 6.8 History / duplicate / delete / persistence — PASS

Rechecked:

- archive list persisted separately under `bruno-residential-live-library-v1`;
- active estimate persisted in the job;
- duplicate creates a new reusable editable copy and does not overwrite source archive record;
- archive delete removes only the requested archive record;
- clearing active does not destroy archive history;
- current snapshot pricing is not frozen;
- current AUTO/USER provenance persists.

No P0/P1 found.

## 6.9 PWA / offline / cache — PASS

`sw.js` at the pinned SHA uses cache `bruno-electric-v38` and includes all Residential Live production modules in `CORE_SHELL`, including:

- live engine;
- levels;
- history;
- workspace total module;
- pricing;
- BOM;
- all relevant Live UI modules.

Activation deletes only caches matching the owned `bruno-electric-vN` pattern while preserving unrelated caches. The deterministic service-worker suite verifies stale-owned-cache cleanup and required core-shell inclusion.

Navigation requests use network-first with cached/index fallback; shell assets use cached response with network refresh behavior.

No P0/P1 found.

## 6.10 Phone / tablet / desktop — PASS by static responsive-path inspection

The Electrical Tools page provides:

- desktop two-column shell with 220 px navigation;
- <=900 px collapse to one-column content;
- sticky horizontally scrollable tool navigation at smaller widths;
- fields/catalog grids collapse to single column;
- L0–L6 level strip has its own overflow handling.

The main workspace enhancement separately defines phone (<768), tablet (768–1199.98), and desktop (>=1200) navigation modes.

No code-level viewport blocker was found. This audit environment did not provide an interactive browser/device farm, so this item is based on exact-head DOM/CSS/JS path inspection plus existing navigation regression coverage rather than screenshot-based device execution.

## 6.11 Regression — existing calculators / NEC / BOM / pricing / navigation — PASS with CI support

`tests/run-node.js` loads the legacy calculator, data integrity, navigation shell, residential estimator, pricing, takeoff, Residential Live, levels, history, phase-3, and service-worker suites. Exact-head GitHub Actions passed the deterministic suite.

The current 2026 Residential rule data uses the 2026 Article 120 structure and distinguishes the 2 VA/ft² service/feeder dwelling basis from the 3 VA/ft² branch-circuit basis. This is consistent with current 2026 NEC restructuring references reviewed during the audit.

No newly discovered P0/P1 regression in those engines was found.

---

# 7. Acceptance matrix

| Area | Result |
|---|---|
| Exact pinned HEAD | PASS |
| Bathroom/powder numeric-minimum semantics | PASS |
| Wall parser fail-closed | PASS |
| AUTO/USER provenance save/reload/duplicate | PASS |
| Atomic Confirm & Save | PASS |
| L0–L5 live / L6 commit boundary | PASS |
| Circuits/breakers/conductors/cable/panel spaces | PASS |
| BOM replacement | PASS |
| Customer Price / Your Cost / margin semantics | PASS |
| Archive stores BOM/calculation, not frozen prices | PASS |
| Active/archive repricing from current Catalog | PASS |
| Workspace top Residential material total | **FAIL — P1** |
| History / duplicate / delete / persistence | PASS |
| PWA/offline/cache | PASS |
| Phone/tablet/desktop responsive code paths | PASS (static inspection) |
| Existing calculator/NEC/BOM/pricing/navigation regression | PASS |
| Exact-head CI | PASS |

---

# 8. Final verdict

## **C — REJECT / REWORK REQUIRED**

### Blocking issue

1. **P1-RL-01:** Workspace top Residential materials/customer total can remain stale after same-tab Catalog pricing changes because no same-document Catalog-change notification invokes the Residential workspace renderer.

### Non-blocking issue

1. **P2-CI-01:** Pull-request path filters omit several Residential Live state/workspace modules, allowing relevant PR-only changes to skip this workflow before merge.

Acceptance requires fixing P1-RL-01 and adding deterministic regression coverage for same-tab Catalog repricing of the top Residential workspace total. After that correction, rerun the complete exact-head acceptance audit rather than checking only this blocker.

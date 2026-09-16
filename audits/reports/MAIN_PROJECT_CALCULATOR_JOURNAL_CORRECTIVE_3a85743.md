# Independent Audit Report — Project Calculator + Journal Corrective Acceptance

**Mode:** AUDIT ONLY  
**Audited production HEAD:** `3a85743b891b9aa276e6eb6ae0ef55cad970094f`  
**Audit branch:** `audit/main-project-journal-3a85743`  
**Report path:** `audits/reports/MAIN_PROJECT_CALCULATOR_JOURNAL_CORRECTIVE_3a85743.md`  
**Verdict:** **C — REJECT / REWORK REQUIRED**

## Executive result

The pinned production artifact is materially improved and most of the requested Project Calculator, Residential Live, persistence/archive, PWA v40, navigation, calculator regression, and Journal earned-call/history behavior is present at the exact audited SHA. Deterministic GitHub Actions also completed successfully for that exact SHA.

However, independent re-audit found **two P1 acceptance blockers** that are not adequately covered by the current deterministic tests:

1. **P1 — Commercial/Residential isolation is not enforced after removal of `electric-project-mode.js`.** The Project Calculator still writes `bruno-electric-project-mode-v1`, but the current Electrical Tools shell continues to expose Residential Live / Residential / Residential Takeoff regardless of that stored Commercial selection. The Commercial entry screen itself fails closed, but the persisted project type is effectively advisory: a user can immediately select a residential workflow and run dwelling logic against the same workspace. This fails the required Residential / Commercial isolation boundary.
2. **P1 — Historical helper tax economics can still be rewritten by a later global helper-tax setting change.** Helper revisions correctly snapshot `taxPct` and `taxEnabled`, but `helperCostForDate()` additionally gates every historical date through the *current* `settings.helperTaxEnabled`. Turning that global setting off later recalculates prior helper `tax`/`net` as if helper tax had never applied. That violates effective-dated helper tax history and the requirement that later settings changes not rewrite prior-period economics.

Because one or more P1 blockers remain, the required verdict is **C — REJECT / REWORK REQUIRED**.

---

## 1. Exact-head / CI evidence

### Production HEAD

Verified GitHub `main` points to:

`3a85743b891b9aa276e6eb6ae0ef55cad970094f`

Commit message: `Remove obsolete project mode overlay`.

This exactly matches `AUDITED_HEAD_SHA` in `audits/TASK_CURRENT.md`.

### Deterministic CI

Exact-SHA Actions query returned an `Electrical Calculator Tests` run for the same HEAD:

- workflow run: `35041147771`
- head SHA: `3a85743b891b9aa276e6eb6ae0ef55cad970094f`
- status: `completed`
- conclusion: `success`
- job: `calculator-tests`
- deterministic calculator/integrity step: `success`

GitHub Pages build for the exact SHA also completed successfully.

**Important audit qualification:** current Project Calculator and Journal tests contain several source-string assertions. They prove important wiring/markers exist, but they do not replace runtime/state-transition review. Both P1s below survive those green tests.

---

# A. Project Calculator primary UX

## A1. Calculator opens Project Calculator first — PASS

`electrical-project-calculator-ui.js` installs a `data-tool="project"` button and auto-activates it with `clickTool('project')`. `electrical-tools-shell.js` puts the Project group first, with `project` first in that group. Canonical app navigation maps Calculator to the electrical tools workspace and labels the item `Project Calculator`.

No obsolete second project-mode overlay file exists at the audited HEAD; commit `3a85743...` removed `electric-project-mode.js`.

## A2. First screen minimal inputs — PASS

The first Project Calculator screen asks for:

- project type;
- total building area;
- room/space quantities.

It does not expose low-level ampacity/conductor configuration on that entry screen.

## A3. Residential project-fact handoff — PASS

Residential Calculate populates the Residential Live inputs for area and rooms, dispatches the corresponding input events, and then activates `res-live`.

## A4. Commercial initial fail-closed behavior — PASS at entry screen

For Commercial, `commercialResult()` explicitly states that commercial receptacle counts, branch circuits, feeder/service and panel size cannot be safely determined from square footage + room count alone, and does not fabricate a dwelling 210.52 numeric minimum.

## A5. **P1 — Residential / Commercial isolation is not enforced downstream — FAIL**

### Evidence

`electrical-project-calculator-ui.js` writes:

```js
localStorage.setItem('bruno-electric-project-mode-v1', x.projectType)
```

but after `electric-project-mode.js` was removed, the current `electrical-tools-shell.js` still defines the Project picker group as:

```js
{label:'Project',ids:['project','res-live','res','res-takeoff']}
```

and its picker rebuild includes all existing tool buttons without consulting the stored project type.

The current shell has no mode guard around Residential Live / Residential / Residential Takeoff. The Commercial result text claims the project type is saved so downstream screens can keep residential-only takeoff rules disabled, but the audited runtime shell does not enforce that statement.

### Reproduction path

1. Open Calculator / Project Calculator.
2. Select `Commercial`.
3. Enter valid square footage and room quantities.
4. Press `Calculate project`.
5. Commercial result correctly fails closed on code minimums.
6. Open the Electrical workspace picker.
7. `Residential Live Design`, `Residential`, and `Residential Takeoff` remain selectable.
8. Selecting a residential workflow invokes dwelling-specific logic despite the current project having been persisted as Commercial.

### Impact

This is a project-type correctness / code-compliance boundary failure. The entry page is safe, but the persisted mode is not an effective downstream isolation control. A Commercial workspace can be routed into dwelling-specific 210.52 / residential load logic by ordinary navigation.

### Required correction

Provide a single authoritative project-type state consumed by downstream routing/tool availability and/or guard residential engines themselves. Commercial must fail closed when a residential-only workflow is invoked, not merely on the Project Calculator entry result. Do not restore a duplicate/obsolete second selector; use the Project Calculator selection as the authoritative state.

---

# B. Residential live calculation

## B1. Square footage / room count semantics — PASS

The audited live engine does **not** claim an exact general receptacle code minimum from square footage or room count alone.

`wallMinimum()` requires an entered wall-space segment list for a known 210.52(A) count. When absent, the engine retains an estimating/design default and marks the code minimum as unknown / layout required.

Bathroom/powder and kitchen device quantities are explicitly described as layout-driven, with code-minimum value `null` until sufficient geometry/layout exists.

## B2. Malformed wall geometry fails closed — PASS

`parseSegments()` records malformed/negative/blank tokens and `wallMinimum()` throws before producing a code minimum when invalid tokens exist.

Segments below 2 ft are treated as nonqualifying rather than malformed, consistent with the model's stated wall-space boundary treatment.

## B3. NON-COMPLIANT behavior — PASS for known numeric wall minimum

When wall geometry is known and the user design override for general receptacles is below the derived minimum, the engine emits a `NON-COMPLIANT` violation with the associated NEC reference. `Confirm & Save` refuses to commit while violations remain.

No false numeric bathroom/kitchen compliance comparison is emitted when layout is insufficient.

## B4. Live cascading edits — PASS

The live UI recalculates on relevant `input` and `change` events. General receptacle/circuit design changes cascade through:

- circuit count;
- OCPD / conductor selection;
- cable model;
- breaker BOM;
- panel occupied/suggested spaces;
- BOM;
- Catalog pricing.

The circuit grouping and cable footage are clearly labeled as Bruno estimating/design assumptions rather than NEC minimums.

## B5. Panel spaces semantics — PASS

`panelSpaces()` uses a 25% Bruno design reserve and the UI/BOM explicitly labels this as a design allowance, not an NEC minimum.

## B6. Major loads / service candidate — PASS

The service calculation is recomputed from major-load inputs, but UI presentation intentionally suppresses the service candidate until `Major loads are complete enough...` is checked.

Range, dryer, HVAC, water heater, EVSE and other fixed load inputs feed the service calculation and can change total VA / candidate service size.

## B7. 310.12 gating — PASS

`electric-residential.js` only emits a service conductor when `table31012Eligible === true` and a supported candidate/material mapping exists. UI/BOM text explicitly states that Table 310.12 output depends on explicit dwelling eligibility confirmation and remains field-verify.

## B8. BOM generation — PASS

The live engine generates quantity-bearing BOM rows for devices, boxes/plates, cable, breakers and allowances. Service/panel rows are augmented from current service state. Code/design/estimate source notes are retained.

## B9. LIVE Catalog Customer Price / Your Cost / margin — PASS

`electrical-residential-live-ui.js` prices the currently generated BOM with the active job Catalog using `BrunoResidentialPricing.priceRows(...)` and renders:

- LIVE Catalog Customer price;
- LIVE Catalog Your Cost;
- material gross profit and margin.

## B10. Same-session repricing behavior — PASS with navigation/focus refresh boundary

Live design inputs reprice immediately. Returning to Residential Live through the tool navigation triggers `refreshLivePricing()`, and window focus also refreshes. Archive hydration always prices from the current Catalog rather than stored prices.

No frozen price payload is persisted in archive snapshots.

## B11. Confirm & Save atomic boundary — PASS

`electric-residential-live-history.js` uses `confirmAtomic()` plus `commitPair()` to construct the replacement BOM/job state and archive snapshot before writing. If the paired write fails, rollback attempts restore the prior raw job and archive storage values; incomplete rollback escalates an explicit reload-required error.

This is materially stronger than independent non-transactional `localStorage` writes.

## B12. AUTO vs USER provenance — PASS

The live UI captures `overrideProvenance`; snapshot apply restores AUTO/USER semantics. Duplicate preserves the snapshot structure after stripping pricing. Legacy provenance inference exists for older records.

## B13. Archive / duplicate / persistence / live repricing — PASS

Archive snapshots persist project/design/BOM quantities and major-load state. `duplicate()` clones the stored structure with a new id/name, while `hydrate()` / `list()` / `active()` recalculate pricing against the current Catalog.

Thus quantity/project snapshots remain stable while price economics are live by design.

---

# C. Journal corrective acceptance

## C1. Scheduled calls are not earned — PASS

`callTotals()` has an explicit earning boundary:

```js
var earned = c.status === 'completed';
if (!earned) return {gross:0,tax:0,net:0,hours:0};
```

Therefore scheduled/cancelled calls do not contribute Gross, Tax, hours or Business Net.

## C2. Helper cost on zero-call days — PASS

`summary()` iterates every calendar date in the selected period with `eachDate(...)` and evaluates `helperCostForDate()` independently of whether any call exists on that date.

This covers Day / Week / Month / Quarter aggregation and fixes the former call-driven helper-cost omission.

## C3. Effective-dated helper rate/pay/active revisions — PASS

Helpers contain a `revisions` array. `revisionFor()` resolves the revision by date. `putRevision()` closes an existing interval at the day before a new effective date and inserts a new revision.

`disableHelper()` writes a future effective inactive revision rather than deleting the helper, preserving earlier gross helper cost.

## C4. **P1 — global helper-tax enable/disable rewrites historical helper tax/net — FAIL**

### Evidence

Each helper revision stores its own `taxPct` and `taxEnabled`, which is correct. However the actual historical computation is:

```js
var pct = (s.helperTaxEnabled && r.taxEnabled !== false)
  ? Math.max(0, n(r.taxPct, s.helperTaxPct))
  : 0;
```

where `s` is `readSettings()` at render/summary time — the **current global settings**, not a historical setting effective on the audited date.

The Settings screen writes `helperTaxEnabled` globally with no effective date.

### Reproduction path

1. Create a helper revision effective on a historical date, with helper tax enabled and e.g. 7.65%.
2. View that historical day/period: helper net reflects the stored revision tax.
3. On a later date, open Tax & journal settings and uncheck global `apply helper tax estimate`.
4. Return to the same historical day/period.
5. `helperCostForDate()` now forces historical helper tax to zero because current `s.helperTaxEnabled` is false.
6. Historical helper net changes even though the helper revision for that historical date did not change.

The inverse can also occur if the global helper-tax gate is later enabled.

### Impact

Historical helper tax economics are not immutable/effective-dated. This directly violates the mandated corrective acceptance requirement for helper tax history and later-setting stability.

Helper **gross** remains stable, so current Business Net (which subtracts helper gross) is not changed by this specific defect; however the Journal's historical helper tax/net economics are rewritten, which is still an explicit P1 acceptance criterion.

### Required correction

Historical helper computation must depend solely on the effective-dated helper revision (or a separately effective-dated global helper-tax policy). A present-day global toggle must not alter previously effective helper tax/net values. New helper revisions may inherit the current default, but historical revisions must remain authoritative.

## C5. Future helper disable preserves history — PASS for gross schedule

`disableHelper()` creates an inactive revision from the selected effective date. Earlier revision intervals remain intact, so prior scheduled helper gross cost is retained.

## C6. Completed-call tax stability — PASS

`saveCall()` snapshots `taxPctApplied` whenever a call is saved as `completed`. `callTotals()` uses `taxPctApplied` first, so later owner/global tax-setting changes do not silently re-tax already completed calls.

## C7. Day / Week / Month / Quarter and Add/Edit/Delete — PASS

The Journal exposes all four period modes, date navigation, call add/edit/delete, helper edit/version/disable, and calendar selection.

---

# D. Shared product regression

## D1. Canonical navigation — PASS by source architecture / CI

`electric-app-navigation.js` defines the five canonical primary groups:

- Journal
- Calculator
- Job
- Catalog
- More

The electrical shell builds responsive mobile bottom navigation, tablet rail/picker, and desktop side navigation from this same canonical model.

## D2. Quote / Invoice / Summary / Change Orders — PASS reachability

The Job group retains:

- Quote (`quote`)
- Invoice (`tm`)
- Summary (`summary`)
- Change Orders (`cos`)

## D3. Catalog / Job Materials / Pricing & Margins — PASS reachability

The Catalog group retains:

- Materials Catalog
- Job Materials
- Pricing & Margins

## D4. Existing electrical calculators — PASS regression evidence

The Electrical Tools shell still exposes the core calculator group (`amp`, `vd`, `cf`, `bf`) and equipment/distribution tools. The exact-SHA deterministic calculator/integrity workflow is green.

No evidence was found in this audit of regression to the existing ampacity, voltage-drop, conduit-fill, box-fill, residential, phase-3, BOM or pricing modules.

## D5. Compact header / totals — PASS static regression review

`electric-compact-header.js` remains in the exact audited tree and v40 shell. Navigation shell changes retain compact responsive layouts. Exact-SHA regression CI is green.

## D6. Persistence / import / export — PASS with no new corruption found

New Project Calculator state uses a dedicated key (`bruno-electric-project-calculator-v1`); Residential Live history uses its existing dedicated archive key plus the job active snapshot. Atomic save logic avoids partial job/archive commit in the audited flow.

No new obvious namespace collision or destructive import/export mutation was identified in the reviewed path.

## D7. PWA / offline / cache v40 — PASS

`sw.js` declares:

```js
const CACHE = 'bruno-electric-v40';
```

The v40 core shell contains:

- Project Calculator UI;
- Journal v2;
- Residential live engine/UI/history/pricing/workspace dependencies;
- core calculator/reference/BOM modules;
- phase-3 modules;
- navigation shell.

Install uses `cache.addAll(CORE_SHELL)`, making missing core dependencies fail installation rather than silently producing a partial core shell.

The obsolete `electric-project-mode.js` is absent from the v40 shell and `sw-register.js` no longer injects it.

## D8. Phone / tablet / desktop — PASS static responsive architecture; no P1 found

`electrical-tools-shell.js` has explicit breakpoints for:

- phone `< 768px` with bottom navigation + picker;
- tablet `768–1199.98px` with side rail + picker;
- desktop `>= 1200px` with full side navigation.

No source-level P1 responsive regression was identified in this audit. This acceptance result is based on deterministic source/runtime wiring review and CI rather than a physical-device visual session.

---

# E. Code/reference semantics reviewed

The audited Residential Live path correctly distinguishes several important categories:

- 210.52(A) exact general-room receptacle count requires entered wall-space geometry;
- bathroom/powder receptacle device quantity is not fabricated from room count;
- kitchen countertop/work-surface quantity is layout-driven;
- general circuit grouping and cable footage are estimating/design assumptions;
- panel reserve is a design allowance;
- service result is a planning candidate;
- Table 310.12 conductor output requires explicit eligibility confirmation and remains field-verify;
- `NON-COMPLIANT` save blocking occurs only where the engine has a known numeric code minimum to compare.

No additional P0/P1 code-reference defect was identified in the reviewed mandatory Residential Live path beyond the Commercial routing/isolation blocker described above.

---

# F. Test-gap observations (non-separate blockers)

The current tests are useful but do not fully exercise the acceptance boundaries that failed:

1. `tests/project-calculator.test.js` verifies the Commercial warning text and verifies that residential handoff exists, but it does not simulate selecting Commercial and then navigating to a residential tool to prove downstream isolation.
2. `tests/dispatch-journal-v2.test.js` verifies the presence of revisions / `taxPctApplied` and the earned-call gate, but it does not execute a historical helper summary before and after changing the global `helperTaxEnabled` setting.
3. Several tests rely on `source.indexOf(...)` assertions; these can remain green even when runtime state semantics are incorrect.

Recommended corrective tests should execute actual exported pure helpers/state transitions for these two cases.

---

# Blocker summary

| ID | Severity | Area | Blocking finding |
|---|---|---|---|
| PC-COMM-ISO-01 | **P1** | Project Calculator / navigation | Commercial project type is written to storage but not enforced by the current Electrical Tools shell after removal of `electric-project-mode.js`; residential-only workflows remain normally selectable and can run dwelling logic in a Commercial workspace. |
| JRN-HELPER-TAX-HIST-01 | **P1** | Journal | `helperCostForDate()` applies current global `settings.helperTaxEnabled` to historical helper revisions, so a later global toggle retroactively rewrites historical helper tax/net economics. |

No P0 blocker found.

---

# Final verdict

## **C — REJECT / REWORK REQUIRED**

Acceptance is blocked by **2 P1 issues**. The exact audited production HEAD and exact-SHA deterministic CI are valid and green, but the two state-boundary defects above violate mandatory acceptance criteria and require correction plus targeted runtime regression tests before re-audit.

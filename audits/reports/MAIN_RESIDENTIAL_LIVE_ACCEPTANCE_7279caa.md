# Bruno Electric — Residential Live Code & Takeoff Engine Acceptance Audit

## Verdict

**C — REJECT / REWORK REQUIRED**

The pinned production implementation has material correctness/state-integrity defects in the Residential Live workflow. Exact-head CI is green, and many core behaviors are implemented correctly, but four P1 blockers remain. Under `audits/PROTOCOL.md`, any P1 requires verdict C.

## Audit identity

- Repository: `kot0070/bruno-electric-pwa`
- Production branch: `main`
- Audited production HEAD: `7279caaf3001ce252121338b6322e36e4c612c9e`
- Audit branch: `audit/main-residential-live-7279caa`
- Mode: `AUDIT ONLY / FINAL_ACCEPTANCE_AUDIT`
- Production code / main / PR / merge state modified: **No**
- Only audit write: this report

## Exact-head and CI verification

Production `main` was independently verified at exactly:

`7279caaf3001ce252121338b6322e36e4c612c9e`

Commit message: `Align integrity tests with active residential estimate flow`.

Exact-head GitHub Actions evidence was also verified independently:

- Workflow: **Electrical Calculator Tests**
- Run: **#112**
- Run id: `35030736242`
- Head SHA: `7279caaf3001ce252121338b6322e36e4c612c9e`
- Status: completed
- Conclusion: success
- Job: `calculator-tests`
- Deterministic calculator/integrity test step: success

Green CI was treated only as supporting evidence, not acceptance proof.

## External code-basis verification

Texas baseline was checked against current TDLR material. TDLR states that the Texas Commission adopted the **2026 National Electrical Code** as the state electrical code effective **September 1, 2026**, with a limited state exception concerning GFCI requirements for certain outdoor outlets.

Official source:
- TDLR, Commission Adopts Rules, Electricians, 2026-09-01: https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/

For the two Residential Live code-minimum areas material to the findings below, NFPA 2026 NEC development records were independently checked:

- 210.52(A): receptacle spacing is based on qualifying **wall space**, with no point along the floor line more than 6 ft from a receptacle and wall-space qualification beginning at 2 ft. This supports the application's decision not to derive an exact general-room receptacle minimum from square footage/room count alone.
- 210.52(D): bathroom receptacle requirements are tied to **each sink** and sink/location geometry, not simply a count of bathroom-like rooms. This is material to Finding P1-01.

Official NFPA records reviewed:
- 210.52(A), Second Revision No. 7758: https://docinfofiles.nfpa.org/files/AboutTheCodes/70/70_A2025_NEC_P02_SD_PrelimSR.pdf
- 210.52(D), Public Comment No. 476 / 2026 NEC process: https://docinfofiles.nfpa.org/files/AboutTheCodes/70/70_A2025_NEC_P02_SD_MeetingAgenda_1024.pdf

This audit distinguishes incorrect user-facing code claims from estimating assumptions that are explicitly labeled as assumptions.

---

# Blocking findings

## P1-01 — Bathroom / powder receptacle quantity is falsely represented as a known universal code minimum

**Severity: P1 — BLOCKER**

### Evidence

`electric-residential-live.js` does all of the following:

- computes `bathCodeMin = bathrooms + powderRooms`;
- publishes `codeMinimums.bathroomReceptacles.known = true`;
- publishes the numeric room-count result as the 210.52(D) code minimum;
- raises `NON-COMPLIANT` when the design quantity is below that numeric room count.

`electrical-residential-live-ui.js` then renders that value in the customer-facing **Code minimum vs live design** table as a known code minimum.

The UI input itself is labeled **“Powder / toilet rooms”**, so the model can count a room that is not proven to contain the sink/basin facts needed for 210.52(D).

The repository's separate `electric-residential-pricing.js` implementation already handles this more correctly: its bathroom receptacle code-scope row is `Layout Required`, because actual sink/counter geometry is required.

### Why this is materially incorrect

210.52(D) is tied to receptacle placement relative to **each sink**. Room count alone cannot prove the exact required device count or location. A room can have multiple sinks, while a generic “toilet room” input does not prove the existence/geometry of a sink at all.

Therefore the Residential Live engine can:

- understate a required quantity in a multi-sink layout;
- overstate or misclassify a toilet-only room;
- show `COMPLIANT / VERIFY` or a numeric “Code minimum” without the project facts required to establish that result;
- block a user with a false non-compliance result or permit a false code-minimum conclusion.

This directly violates the task requirement that layout-dependent quantities not be represented as universal code minimums.

### Required correction

Either:

1. make bathroom receptacle quantity `LAYOUT REQUIRED` unless sufficient sink/basin/layout facts are supplied; or
2. collect explicit per-bathroom sink/basin facts and enough placement geometry to support the asserted code-minimum calculation.

A room-count estimate may remain as an estimating allowance only if clearly labeled as such and kept separate from the L1 code-minimum result.

---

## P1-02 — Malformed wall-space input is silently discarded and can produce a false partial code minimum that is treated as known/compliant

**Severity: P1 — BLOCKER**

### Evidence

`electric-residential-live.js` parses the free-text wall-segment field using:

- comma split;
- `Number(...)` conversion;
- silent filtering to values that are finite and `>= 2`.

There is no error when an entered token is malformed. If at least one valid token survives, `wall.known` becomes true and the remaining partial segment list is used as the asserted 210.52(A) minimum.

`electrical-residential-live-ui.js` exposes this as a free-text field and does not report discarded tokens.

### Reproducible source-level case

Intended complete input:

`13,15,13`

The implemented model yields:

- `ceil(13/12) + ceil(15/12) + ceil(13/12)`
- `2 + 2 + 2 = 6`

Typo input:

`13,abc,13`

The `abc` token is silently deleted, leaving only `13,13`, and the engine can assert a known minimum of **4**. If the design quantity is 4 or higher, no general-receptacle violation is raised and the run can be confirmed.

Ignoring a wall segment that is genuinely less than 2 ft is appropriate because it is not qualifying wall space. Silently deleting malformed/non-numeric/negative input is not.

### Impact

This is a fail-open code-minimum input path. It can understate L1, then propagate the understated value through L2–L6 and allow `Confirm & Save Active Estimate`.

This is not merely an estimating limitation: it is invalid-input handling that can turn incomplete geometry into an affirmative known code-minimum result.

### Required correction

The wall-segment parser must distinguish:

- valid qualifying segment (`>= 2 ft`);
- valid nonqualifying segment (`< 2 ft`, explicitly ignored for code count);
- invalid token / negative / non-finite entry (**hard validation error or explicit unresolved state**).

A malformed list must not set the code minimum to `known:true` until the input is corrected.

---

## P1-03 — Save/reload and Duplicate/Load destroy auto-vs-user override provenance, causing stale L2 design values after L0 changes

**Severity: P1 — BLOCKER**

### Evidence

The live UI initially has a useful distinction:

- `seedOverrides()` auto-populates design values and marks fields `dataset.auto = '1'`;
- once a user edits an override, `markEdited()` marks it `dataset.userEdited = '1'` and stops automatic reseeding.

However this provenance is not persisted.

`saveConfirmed()` serializes `input()` after the auto-seeded values have been written into the fields. Thus auto-generated values are stored in `inputs.overrides` exactly like explicit user overrides.

On active-estimate reload and on `Duplicate / Load`, `applySnapshot()` calls `setv(..., true)` for **every** override. `setv(..., true)` marks all loaded overrides as `userEdited='1'` / `auto='0'`, regardless of their original source.

No auto/user provenance metadata exists in `electric-residential-live-history.js`.

### Failure mode

A calculation that originally used defaults can be confirmed, reloaded or duplicated, and then reused for a similar house. After reload/duplicate, changing upstream L0 facts no longer reseeds formerly automatic L2 values.

Examples include:

- changing bedroom/living/dining/office counts while the previously auto-generated general receptacle estimate remains frozen;
- changing kitchen count while the previously auto-generated kitchen receptacle allowance remains frozen;
- changing room counts while auto-generated lights/switches remain frozen.

Some of these stale values are estimating allowances and therefore do not necessarily trigger a code violation. The UI can continue to display a valid live result while the intended L0→L2→L3→L4→L5 cascade is no longer semantically live.

### Why this violates the acceptance scope

The task explicitly requires:

- L0–L6 live dependency behavior;
- persistence/stale-state correctness;
- `Duplicate / Load` to restore a usable copy;
- similar-house reuse not to retain stale auto/user-edit markers or stale pricing unexpectedly.

The current implementation fails that requirement after any persisted/duplicated calculation is loaded.

### Required correction

Persist provenance for every design override, for example:

- `AUTO` / derived;
- `USER` / explicit override.

On reload/duplicate:

- restore user-entered overrides as user-entered;
- restore automatically derived values as auto-derived, or omit them from the persisted override object and regenerate from current upstream facts;
- changing upstream facts must rederive only AUTO values while preserving true USER overrides.

Add deterministic tests covering save → reload/duplicate → upstream fact edit → downstream design/circuit/BOM/pricing recomputation.

---

## P1-04 — Confirm & Save is not an atomic state transition; a storage failure can leave job BOM and active/history state partially committed

**Severity: P1 — BLOCKER**

### Evidence

`electrical-residential-live-ui.js::saveConfirmed()` executes the persistence sequence in this order:

1. recalculate current DOM;
2. block known `violations`;
3. call `B.replaceGenerated('residential-live-takeoff', rows)`;
4. call `H.save(snapshot)`.

`B.replaceGenerated()` immediately writes the mutated `bruno-electric-v1` job with the Residential Live generated material rows.

`H.save()` then performs additional writes:

1. writes `residentialLiveActive` into `bruno-electric-v1`;
2. writes/updates `bruno-residential-live-library-v1` history.

These operations are independent `localStorage.setItem()` calls with no rollback/reconciliation path.

### Failure modes

If a quota/storage exception occurs after the BOM replacement but before the active snapshot write:

- generated job materials have changed;
- active estimate has not changed;
- the user receives a failed Confirm alert even though part of the job was mutated.

If the active job write succeeds but the library write fails:

- active estimate has changed;
- history is missing the confirmed snapshot;
- the UI reports failure even though the active job was partially committed.

This is a real negative-path integrity defect in the acceptance-critical `Confirm & Save Active Estimate` operation.

### Required correction

Implement a single commit contract with rollback/reconciliation semantics. At minimum:

- construct the complete next job state and next history state first;
- preserve the previous job/history values;
- perform writes in a controlled commit sequence;
- on any exception, restore the prior values or explicitly detect/reconcile the partial state before returning failure;
- do not report failure after silently mutating only one side of the confirmed-estimate contract.

Add deterministic fault-injection tests where `localStorage.setItem` throws on each write boundary.

---

# Non-blocking finding

## P2-01 — Dependency UI says an edit “recalculates L6” although confirmed L6 is intentionally unchanged until Confirm & Save

**Severity: P2**

`electric-residential-live-levels.js::affectedFrom()` includes `L6` for upstream changes. `electrical-residential-live-levels-ui.js` then sets a tooltip saying:

`Changed <key> → recalculates ... L6`

But ordinary live edits do not rewrite `residentialLiveActive` or history. That is desirable — a confirmed estimate should not mutate until the user confirms — but the UI wording therefore overstates the incremental behavior.

Recommended correction: describe downstream levels as **affected / stale / to be recomputed on confirmation**, or visually distinguish live L0–L5 recalculation from L6 commit.

---

# Areas independently checked with no blocking defect found

## Project facts and basic validation

Confirmed from `electric-residential-live.js`:

- square footage must be finite and > 0;
- integer room counts reject fractions and negatives;
- general circuit rating is restricted to 15A or 20A;
- receptacles-per-general-circuit grouping must be >= 1;
- zero-valued optional project counts are supported.

The malformed wall-segment path is separately reported as P1-02.

## General-room 210.52(A) model

The model correctly refuses to call a room-count/square-footage estimate the general-room code minimum when wall geometry is absent. `codeMinimums.generalReceptacles.known` is false without qualifying segments, and the UI says `LAYOUT REQUIRED`.

For valid complete wall-space segments, the `ceil(segment / 12)` model is consistent with the 6-ft reach requirement when each actual qualifying uninterrupted wall space is supplied independently.

The implementation correctly warns that openings/boundaries must be entered as separate segments.

## Kitchen code minimum handling

Kitchen countertop/work-surface receptacle quantity is not falsely emitted as a universal count. The engine exposes the kitchen receptacle minimum as layout-required and labels its default quantity as a design estimate.

Two 20A small-appliance branch circuits are modeled when kitchen scope exists. Actual kitchen device quantity remains explicitly layout-driven.

## Laundry and garage branch-circuit model

The live engine generates:

- laundry 20A circuit when a laundry area exists;
- garage 20A circuit when garage scope exists;
- #12 / 12/2 branch wiring for these special-area 20A circuits.

The implementation labels the circuit/BOM model with field/AHJ verification warnings rather than claiming a full dwelling electrical design.

## Circuits / breakers / conductors / cable cascade

Source and tests confirm:

- general receptacle count changes can change general circuit count;
- breaker count follows circuit count;
- 20A general circuits use #12 Cu / 12/2 NM-B;
- 15A general circuits use #14 Cu / 14/2 NM-B;
- breaker family switches between 20A and 15A for general circuits;
- cable footage responds to device/circuit changes;
- panel-space count follows modeled branch circuits;
- ordinary receptacle edits do **not** directly increase dwelling service-load VA under the floor-area/general-load method.

Cable footage is explicitly labeled an estimating routing model, not an NEC minimum. This is an acceptable estimating limitation.

## BOM integration

`electric-bom.js::replaceGenerated()` was inspected independently.

Confirmed behavior:

- replacement is source-tag scoped;
- manual material rows are preserved;
- generated rows from other calculators are preserved;
- same-source Residential Live generated rows are replaced rather than appended;
- generated BOM rows retain source/version metadata;
- unresolved contractor cost stays zero/unresolved rather than falling back to customer price.

This prevents double insertion of repeated Residential Live confirmations under normal successful writes.

## Catalog / Customer Price / Your Cost / margin

`electric-residential-pricing.js` and `tests/residential-pricing.test.js` were inspected.

Confirmed:

- matching is exact after case/whitespace normalization only;
- no fuzzy collision such as 12/2 vs 10/2;
- catalog `unitCost` is treated as customer unit price;
- catalog `yourCost` is treated as contractor material cost;
- blank/null Your Cost is `YOUR_COST_UNRESOLVED`;
- missing Your Cost is never silently replaced with customer price;
- zero Your Cost is preserved as a legitimate resolved zero;
- unmatched and zero-customer-price rows remain explicit unresolved/unpriced states;
- customer material total can include known customer prices while profit/margin use only fully resolved cost rows;
- gross profit and margin semantics are disclosed in the pricing disclaimer.

No pricing blocker was found independent of the state/provenance issues above.

## Confirm blocking of known conflicts

`saveConfirmed()` forces a fresh `render(true)` immediately before save and rejects when `last.violations.length > 0`.

Thus known wall-derived and numeric bathroom violations are not saved as confirmed. P1-01/P1-02 describe cases where L1 itself can be wrong/incomplete, so this gate does not cure those blockers.

## Active estimate vs history

`electric-residential-live-history.js` keeps:

- active snapshot in the job object (`residentialLiveActive`);
- reusable history in a separate `bruno-residential-live-library-v1` array.

Confirmed from source/tests:

- saving a new estimate replaces only active while retaining prior history entries;
- deleting history only removes the library entry and does not delete the active snapshot or job materials;
- Duplicate creates a new id and does not overwrite the source history entry;
- clear-active leaves history available.

The auto/user provenance defect on loaded copies is separately P1-03.

## Workspace material totals / no normal double count

Two different totals were traced through the production code:

1. The existing workspace **Material** top chip is computed from `state.materialsUsed` using `qty × unitCost`. Residential Live generated rows store resolved **Your Cost** there, so a successful confirmation flows into the normal job material-cost total once the workspace loads the updated job.
2. `electric-residential-live-workspace.js` adds a separate clearly labeled **Residential materials · customer** chip sourced from the confirmed active snapshot's `pricing.customerMaterialTotal`.

The active snapshot is not also added into `calcMaterial()`, so the customer chip is display-only and does not double-count the job's cost calculation.

Repeated successful confirmation replaces same-source BOM rows instead of appending them.

The partial-commit failure path is separately P1-04.

## Persistence and stale pricing

On a loaded active/duplicated calculation, `render()` prices the current live BOM against the **current job catalog**, so the interactive live result is not blindly stuck to the snapshot's old pricing.

Active/history data survive reload via localStorage under the tested schema.

The remaining stale-state blocker is override provenance (P1-03), not basic localStorage survival.

## PWA / offline / cache

`sw.js`, `sw-register.js`, `tests/service-worker.test.js`, and integrity tests were independently inspected.

Confirmed:

- active cache is `bruno-electric-v37`;
- core shell contains Residential Live engine, levels, history, workspace bridge and UI modules;
- core shell contains existing calculators/BOM/residential/phase3/navigation modules needed by the pages;
- optional icon failures cannot poison core install;
- activation deletes only old caches matching `^bruno-electric-v\d+$`;
- v37 is preserved;
- unrelated/foreign cache names are not deleted;
- same-origin offline navigation has cached/index fallback;
- Electrical Tools script order loads dependencies before their dependent UI/shell modules.

The service-worker tests execute the activation cleanup logic in a VM, not merely string-match it.

No P0/P1 cache-ownership/offline-shell defect was found.

## Phone / tablet / desktop navigation

`electric-workspace.js`, `electrical-tools-shell.js`, canonical navigation data, `electrical-tools.html`, and navigation/integrity assertions were inspected.

Confirmed source behavior:

- phone breakpoint `<768px` uses mobile controls/bottom primary navigation;
- tablet `768–1199.98px` uses the compact rail plus tool selector;
- desktop `>=1200px` uses the full sidebar;
- Electrical Tools uses the same canonical five-section navigation model;
- Residential tool category includes `res`, `res-live`, `res-takeoff`;
- the live tool is injected into the tool navigation and the responsive selector rebuilds via `MutationObserver`;
- Electrical is routed as a first-class page, not an iframe;
- existing workspace remains available through the canonical route.

A real-device browser was not available in this audit execution environment, so responsive verification is source/test based rather than visual-device emulation. No source-level responsive/navigation blocker was found.

## Regression — existing calculators / NEC / BOM / pricing / navigation

Exact-head CI run #112 executed the repository's full deterministic Node suite, including:

- `electrical-calculators.test.js`
- `data-integrity.test.js`
- `navigation-shell.test.js`
- `residential-estimator.test.js`
- `residential-pricing.test.js`
- `residential-takeoff.test.js`
- `residential-live.test.js`
- `residential-live-levels.test.js`
- `residential-live-history.test.js`
- `phase3-equipment.test.js`
- `service-worker.test.js`

Representative regression assertions were independently inspected, including:

- 2026 residential service/load calculation constants and boundary cases;
- existing legacy Residential Full Takeoff assumptions and negative inputs;
- ampacity/voltage-drop/conduit/box-fill calculator validation;
- Phase 3 EVSE/HVAC/motor/grounding/OCPD cases;
- BOM source isolation and Your Cost handling;
- navigation shell breakpoints/routing;
- service-worker cache ownership.

No new blocker was identified in these regression areas from the Residential Live integration.

---

# Test-gap analysis

The green suite does not cover the blockers found in this audit:

1. Wall-space tests explicitly show a `<2 ft` token being ignored, but there is no malformed token case such as `13,abc,13` that must fail closed.
2. Bathroom tests assert the current room-count behavior instead of validating that 210.52(D) is sink/layout-dependent.
3. History tests verify duplicate identity and basic persistence but do not test auto-vs-user provenance after save/reload/duplicate and an upstream L0 edit.
4. Confirm/save tests do not inject storage failures between BOM, active and history writes.
5. Dependency tests validate `affectedFrom()` metadata but not the distinction between live L0–L5 recomputation and committed L6 state.

These gaps explain why exact-head run #112 can be green while acceptance blockers remain.

# Required rework before re-audit

1. Replace the numeric room-count bathroom/powder “known code minimum” with layout/sink-fact-aware logic.
2. Make wall-segment parsing fail closed on malformed tokens; never derive a known minimum from a silently partial list.
3. Persist or regenerate override provenance so AUTO values remain live after reload/duplicate while USER values remain intentional overrides.
4. Make Confirm & Save recoverable/atomic across generated BOM, active snapshot and history persistence, with fault-injection tests.
5. Correct the L6 dependency wording so live edits do not claim to recalculate the confirmed estimate before confirmation.
6. Add deterministic regression tests for all four P1 paths before requesting acceptance re-audit.

# Final blocker list

- **P1-01:** False universal bathroom/powder receptacle code minimum from room count.
- **P1-02:** Malformed wall-segment tokens silently discarded, allowing partial geometry to become a known/compliant code minimum.
- **P1-03:** Auto-vs-user override provenance lost on save/reload/Duplicate, causing stale design values and broken live cascade during reuse.
- **P1-04:** Confirm & Save can partially commit BOM/active/history state if localStorage fails between writes.

## Final verdict

**C — REJECT / REWORK REQUIRED**

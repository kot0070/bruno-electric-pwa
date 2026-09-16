# Bruno Electric — Independent Audit Report

**Mode:** AUDIT ONLY  
**Audited production HEAD:** `311997c12cd82d0b45d82584c75c8c6fbcce90bb`  
**Audit branch:** `audit/p1-project-journal-311997c`  
**Report path:** `audits/reports/P1_PROJECT_JOURNAL_CORRECTIVE_311997c.md`  
**PR under audit:** #13 `dev/p1-project-journal-corrective`  
**Verdict:** **C — REJECT / REWORK REQUIRED**

## Executive result

The corrective patch fixes the two previously reported production-code defects at the audited tree:

1. Commercial / Residential isolation is now consumed by the Electrical Tools shell from the Project Calculator authoritative mode, and residential-only tools are hidden, disabled, removed from the responsive picker, and capture-guarded while Commercial is active.
2. Historical helper tax/net computation now uses the effective-dated helper revision's own `taxEnabled` / `taxPct` values instead of the current global helper-tax toggle/percentage.

Independent review of the rest of the required scope found the Project Calculator / Residential Live / BOM / live Catalog pricing / archive-persistence paths and the Journal period/effective-date paths materially intact.

However, one new **P1 production blocker** remains:

> **P1 — the corrective release changes three cached production JavaScript files but does not rev the service-worker cache namespace or otherwise provide deterministic invalidation. Existing `bruno-electric-v40` PWA clients can execute the old pre-corrective Project Calculator shell and Journal code on the first controlled load after deployment, and the attempted background refresh is not tied to the service-worker event lifetime. Therefore the two corrected P1 behaviors are not reliably delivered to already-installed PWA/offline clients.**

Because one P1 blocker remains, the required verdict is **C — REJECT / REWORK REQUIRED**.

---

# 1. Exact HEAD / change-set / CI evidence

## 1.1 Audited HEAD

Verified commit:

`311997c12cd82d0b45d82584c75c8c6fbcce90bb`

Commit tree:

`e769758f13e4ee14fc103dc5327870bb00daeb2d`

PR #13 is open, unmerged, base `main` at `3a85743b891b9aa276e6eb6ae0ef55cad970094f`, head exactly `311997c12cd82d0b45d82584c75c8c6fbcce90bb`.

The change set from prior audited production `3a85743...` to the pinned head contains only:

- `electric-dispatch-journal-v2.js`
- `electrical-project-calculator-ui.js`
- `electrical-tools-shell.js`
- `tests/dispatch-journal-v2.test.js`
- `tests/project-calculator.test.js`
- `dev-reports/P1_PROJECT_JOURNAL_CORRECTIVE.md`

No service-worker/cache-version file changed.

## 1.2 CI

GitHub Actions run `35042142683` (`Electrical Calculator Tests`) is associated with PR #13 and reports `head_sha=311997c12cd82d0b45d82584c75c8c6fbcce90bb`, status `completed`, conclusion `success`.

The deterministic test job reports:

`Bruno Electric deterministic tests: 468/468 passed`

Important exact-SHA qualification: checkout in the Actions log was the PR synthetic merge commit:

`9c37d3ed26a9ad2fb84d3ae98de03bca0d532c29`

rather than commit `311997c...` itself. The merge commit's tree is also exactly:

`e769758f13e4ee14fc103dc5327870bb00daeb2d`

which is byte-for-byte the same tree as audited HEAD, so the executed test content is tree-equivalent to the audited commit. It is not, however, a literal exact-commit checkout. This is recorded as a CI provenance qualification, not a separate blocker.

The added Project/Journal tests are primarily source-string/integrity assertions; they do not replace the runtime/state-transition audit below.

---

# 2. Project Calculator / Commercial-Residential isolation

## 2.1 Project Calculator remains first workflow — PASS

`electrical-project-calculator-ui.js` still inserts `data-tool="project"` near the front of `#tool-nav` and auto-activates Project Calculator after install.

`electrical-tools-shell.js` keeps the first picker group as:

`['project','res-live','res','res-takeoff']`

No duplicate project-type selector architecture has been restored.

## 2.2 Project Calculator is authoritative — PASS

The Project Calculator owns the persisted mode key:

`bruno-electric-project-mode-v1`

and exposes:

- `currentProjectType()`
- `setProjectType(type)`

`setProjectType()` persists the authoritative state and dispatches `bruno:project-mode-changed`.

The shell first consumes `window.BrunoProjectCalculator.currentProjectType()` and only falls back to the same persisted key. This is one project-type source, not a second selector.

## 2.3 Commercial blocks Residential Live / Residential / Residential Takeoff — PASS in production routing

The shell defines exactly these residential-only tools:

- `res-live`
- `res`
- `res-takeoff`

When authoritative mode is Commercial:

- their navigation buttons are disabled;
- their navigation buttons are hidden;
- they are removed from the responsive select/picker;
- a capture-phase click guard stops disallowed `data-tool` events before the legacy bubble-phase tool router can activate them;
- if a now-disallowed residential tool is active when the mode changes, the shell routes to Project Calculator.

This closes both ordinary button selection and programmatic `.click()` / dispatched-click selection through the supported tool-routing surface.

## 2.4 Commercial generic tools remain available — PASS

The restriction is limited to `res-live`, `res`, and `res-takeoff`.

Core/generic tools remain selectable in Commercial mode, including:

- conductor / ampacity;
- voltage drop;
- conduit fill;
- box fill;
- equipment/distribution tools;
- catalog/reference tools.

The Commercial Project Calculator result also routes its continuation buttons to the generic ampacity path rather than a dwelling workflow.

## 2.5 Commercial → Residential switching — PASS

Recalculating Project Calculator as Residential executes `setProjectType('residential')`, immediately emits `bruno:project-mode-changed`, causing shell availability to rebuild, then hands residential facts into the live engine and clicks `res-live`.

Thus the intended sequence is:

Commercial mode → residential-only tools unavailable → user returns to Project Calculator → selects Residential and Calculate → authoritative mode changes → residential tools become available → Residential Live opens.

## 2.6 Reload persistence — PASS at application state level

Authoritative mode is stored independently in localStorage. On reload, the shell resolves the stored `commercial` / `residential` value and applies availability during shell install.

The Project Calculator's area/room project facts are separately retained in `bruno-electric-project-calculator-v1`.

## 2.7 Residual timing note — non-blocking by itself

The shell installs on `load` with a short delayed setup. Project Calculator auto-activation is earlier. In normal supported UI use this does not create an actionable residential workflow before guard installation because Project Calculator is selected automatically and the shell then applies stored-mode restrictions. No standalone P1 was found from this timing path.

---

# 3. Residential Project Calculator / live calculation / BOM / pricing

## 3.1 Square footage + room handoff — PASS

Residential Project Calculator writes the entered project facts into the live residential inputs for:

- total square feet;
- bedrooms;
- bathrooms;
- powder rooms;
- living rooms;
- dining rooms;
- offices;
- kitchens;
- laundry;
- garage bays.

It dispatches input events and opens Residential Live after authoritative Residential mode is established.

## 3.2 Code minimum vs layout-required semantics — PASS

Residential Live continues to distinguish known code-derived quantities from layout-dependent quantities.

Unknown/layout-insufficient code minimums are rendered as `LAYOUT REQUIRED` rather than fabricated numeric minimums.

General-room receptacle compliance remains geometry-driven when qualifying wall segments are available. Bathroom/kitchen layout-dependent quantities remain nonnumeric until sufficient layout information exists.

## 3.3 NON-COMPLIANT behavior — PASS

Known numeric code minimum violations continue to produce explicit `NON-COMPLIANT` output with the associated reference. The save/confirm boundary remains blocked when violations exist.

No change in PR #13 weakened this behavior.

## 3.4 Live dependency cascade — PASS

The inspected live path still recalculates from edited design inputs through:

circuits → OCPD/breakers → conductor/cable model → occupied/suggested panel spaces → BOM → live Catalog pricing.

The live UI explicitly communicates that dependency chain and uses the regenerated BOM as the pricing input.

## 3.5 Major loads → service candidate — PASS

Major load inputs remain part of the live state, including range, dryer, cooling, heating, water heater, EVSE, other load, HVAC relationship and service material.

The service rating candidate is intentionally suppressed until the user marks major loads sufficiently complete. This remains fail-closed rather than presenting an incomplete service rating as final.

## 3.6 Table 310.12 gating — PASS

Dwelling service/feeder conductor output continues to require explicit `table31012Eligible` confirmation. The live BOM note retains field-verification language and does not silently apply 310.12 without that eligibility state.

## 3.7 BOM generation — PASS

Residential Live still generates quantity-bearing rows for the modeled devices/circuits/material allowances and augments service/panel rows from current service state.

Panel-space reserve remains explicitly a Bruno design allowance rather than an NEC minimum.

## 3.8 LIVE Catalog pricing — PASS

Current live BOM rows are repriced through `BrunoResidentialPricing.priceRows(...)` against the current job Catalog.

Displayed material economics still include:

- Customer Price;
- Your Cost;
- material gross profit;
- margin;
- unresolved/unpriced/unmatched line diagnostics.

The archive contract remains quantity/state persistence with live repricing, not frozen material prices.

---

# 4. Project Calculation persistence / archive / duplicate

## 4.1 Confirm & Save atomic boundary — PASS

`electric-residential-live-history.js` still uses the rollback-protected paired commit across:

- current job state / active residential snapshot; and
- residential calculation library.

On a partial write failure it attempts raw-state restoration and raises an explicit reload-required error if rollback itself cannot fully restore prior state.

## 4.2 Archive persistence — PASS

Saved records retain project/design/BOM state while stripping frozen pricing. Hydration reprices against the current Catalog.

## 4.3 Duplicate — PASS

Duplicate clones the saved project calculation structure with a new id/name, removes frozen pricing and hydrates live pricing against the current Catalog.

## 4.4 AUTO / USER provenance — PASS

Live override provenance remains persisted/restored so automatic values are not incorrectly converted into user overrides across archive load/duplicate paths.

## 4.5 No new namespace collision found — PASS

Project mode, Project Calculator state, current job state and Residential Live library remain on separate storage keys. PR #13 does not introduce a destructive import/export namespace overlap.

---

# 5. Journal accounting / history

## 5.1 Scheduled/cancelled calls are not earned — PASS

`callTotals()` still has the explicit boundary:

`earned = c.status === 'completed'`

Non-completed calls return zero gross, tax, net and earned hours.

## 5.2 Helper cost on zero-call days — PASS

Period summary iterates every calendar date in the selected period and evaluates helper cost independently from call existence.

Therefore a configured helper work day still contributes helper cost even when there are zero calls that day.

## 5.3 Day / Week / Month / Quarter — PASS

Period selection remains available for:

- Day;
- Week;
- Month;
- Quarter.

Week is Monday-through-Sunday. Month and quarter boundaries continue to be calculated from the selected local date.

## 5.4 Effective-dated helper rate/pay/active history — PASS

Helper records retain revision arrays. `revisionFor()` chooses the effective interval for the selected date and `putRevision()` splits an active interval when a later effective revision is saved.

Editing a later helper version does not mutate an earlier revision's rate/pay/tax/active data.

## 5.5 Historical helper tax/net stability after global setting changes — PASS

The prior P1 is corrected in the audited head.

`helperCostForDate()` now derives tax only from the effective helper revision:

- `r.taxEnabled`
- `r.taxPct`

and no longer gates historical dates through current `settings.helperTaxEnabled` or falls back to current `settings.helperTaxPct`.

Changing the current global helper-tax enabled state or default percentage therefore does not rewrite tax/net for an existing effective-dated helper revision.

## 5.6 Global helper tax is only a default for newly created versions — PASS

For a new helper/version where no effective revision exists, the editor uses the current global helper-tax settings as initial defaults.

For an existing effective revision, its own tax enabled/rate values populate the editor and remain authoritative.

The settings UI copy now explicitly states that helper tax values are defaults for new versions and are not retroactive policy.

## 5.7 Future helper revisions — PASS

Creating a later helper revision closes the currently effective interval at the prior day and creates a new effective interval from the selected date. Earlier economics remain intact.

## 5.8 Future disable — PASS

Disable creates an inactive effective-dated revision rather than deleting the helper record. Prior helper history is preserved and dates from the disable point forward become inactive according to the version timeline.

## 5.9 Completed-call tax snapshot stability — PASS for post-snapshot records

Saving a call as `completed` records `taxPctApplied`. Later global owner-tax setting changes do not re-tax that completed call because `callTotals()` prefers the stored applied percentage.

Legacy calls without a stored snapshot still have the preexisting fallback behavior; PR #13 did not introduce a new migration. No new regression was introduced by this corrective patch, and the current completed-call save path is stable.

---

# 6. Shared regression

## 6.1 Canonical navigation — PASS

The canonical electrical navigation remains intact and PR #13 does not modify the app-navigation model.

The shell still provides the phone/tablet/desktop surfaces from the same navigation model.

## 6.2 Phone / tablet / desktop shell — PASS by responsive source review

`electrical-tools-shell.js` continues to contain explicit responsive layouts for:

- phone `<768px` using the bottom primary nav and workspace picker;
- tablet `768–1199.98px` using the side rail + workspace picker;
- desktop `>=1200px` using the full side navigation.

The new project-mode guard is attached to the underlying canonical `#tool-nav`, and picker rebuilding consumes the same `toolAllowed()` check, so the Commercial restriction is not limited to only one viewport class.

## 6.3 Existing electrical calculators — PASS

Core calculators remain loaded and available:

- ampacity;
- voltage drop;
- conduit fill;
- box fill;
- equipment/distribution modules.

The deterministic suite reports 468/468 passing against a tree identical to audited HEAD.

## 6.4 Catalog / BOM integration — PASS except deployment-cache blocker below

Catalog and BOM modules themselves are unchanged by PR #13. Residential Live still reprices current generated BOM rows through the current Catalog and retains unresolved diagnostics.

No calculation-path regression was identified in the source/state trace.

## 6.5 Persistence/import/export boundary — PASS in changed code

The corrective mode key is a dedicated localStorage entry and does not overwrite job/BOM/catalog storage. The Journal change only alters helper tax computation/default initialization; it does not change the persistence key or helper revision schema.

No destructive import/export mutation was added by PR #13.

---

# 7. PWA / offline / cache — P1 FAIL

## P1 — unchanged `bruno-electric-v40` cache can serve the pre-corrective JavaScript

### Evidence

The corrective PR changes production behavior in exactly these cached core JavaScript files:

- `electrical-project-calculator-ui.js`
- `electrical-tools-shell.js`
- `electric-dispatch-journal-v2.js`

`sw.js` is unchanged between prior production `3a85743...` and audited head `311997c...`.

At the audited head it still declares:

`const CACHE = 'bruno-electric-v40';`

and still precaches all three corrective production files in `CORE_SHELL`.

For non-navigation GETs the fetch handler resolves:

`cached || net`

meaning an existing cached JavaScript response is returned immediately. A network fetch is started and may attempt to update the same cache, but that refresh promise is not attached through `event.waitUntil()` and, even when it completes, it does not change the JavaScript already returned/executed for the current page load.

Because the `sw.js` bytes/cache namespace were not revised for PR #13, an already-installed v40 client has no deterministic install/activate event that clears/repopulates the core shell with the corrected files.

### Reproduction/state path

1. User has the prior production PWA with `bruno-electric-v40` populated.
2. Prior cached copies include the old `electrical-tools-shell.js`, old Project Calculator UI and old Journal v2 JavaScript.
3. PR #13 is deployed without changing `sw.js` / cache namespace.
4. User opens the already-controlled app online.
5. Navigation HTML can come network-first, but cached non-navigation JavaScript is returned by `cached || net`.
6. The current load can therefore execute the prior Project shell/Journal implementation.
7. In that load the previously identified P1 behavior can reappear: Commercial residential-only isolation is not enforced and historical helper tax can still depend on current global settings.
8. Offline clients necessarily continue using those prior cached files until a successful online refresh path occurs.

### Impact

This is not cosmetic stale content. The stale files contain both production-correctness fixes under acceptance:

- project-type/code-workflow isolation; and
- historical Journal tax/net stability.

Therefore deployment to an existing installed PWA does not reliably deliver the corrective behavior on the first controlled session and can preserve production-blocking behavior in offline/stale-cache sessions.

### Required correction

Use deterministic release cache invalidation. At minimum:

- bump the owned cache namespace for the corrective release (for example `bruno-electric-v41`) so install precaches the corrected core shell and activation removes v40; or
- implement an equivalently deterministic content/version strategy that guarantees corrected core JavaScript replaces prior cached files before it is served.

If stale-while-revalidate behavior is intentionally retained, tie refresh work to the service-worker event lifetime and do not rely on an unawaited background promise for correctness-critical module replacement.

Add a deterministic regression test asserting that a production change to cached core application JavaScript is accompanied by a cache-version/invalidation change.

**Severity: P1 — production-blocking correctness / PWA deployment regression.**

---

# 8. Final acceptance matrix

| Area | Result |
|---|---|
| Exact audited tree verified | PASS |
| Commercial / Residential authoritative isolation | PASS |
| Residential-only workflows blocked in Commercial | PASS |
| Commercial → Residential restore | PASS |
| Generic Commercial tools remain available | PASS |
| Project Calculator first workflow / no duplicate selector | PASS |
| Residential facts handoff | PASS |
| Code minimum vs layout-required fail-closed | PASS |
| NON-COMPLIANT behavior / references | PASS |
| Live circuits/breakers/conductors/panel/BOM cascade | PASS |
| Major loads → service candidate | PASS |
| 310.12 gating | PASS |
| LIVE Catalog pricing | PASS |
| Save/archive/duplicate/persistence/reprice | PASS |
| Scheduled/cancelled calls not earned | PASS |
| Zero-call helper days | PASS |
| Day/Week/Month/Quarter | PASS |
| Effective-dated helper rate/pay/tax/active | PASS |
| Global helper defaults do not rewrite history | PASS |
| Future revision / disable preserves prior history | PASS |
| Completed-call tax snapshot | PASS |
| Existing calculator/navigation regression | PASS |
| CI deterministic suite | PASS, 468/468 on tree-equivalent PR merge commit |
| PWA/offline/cache delivery of corrective JS | **P1 FAIL** |

---

# 9. Verdict

**C — REJECT / REWORK REQUIRED**

## Blockers

1. **P1 — PWA cache version/invalidation was not advanced for correctness-critical cached JavaScript changes. Existing v40 clients can execute stale pre-corrective Project Calculator/shell/Journal code, so the two accepted code fixes are not reliably delivered to installed/offline users.**

No P0 blocker was found.

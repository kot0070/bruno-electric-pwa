# Independent Audit — Main App Home / Call Journal v2

**Mode:** AUDIT ONLY  
**Repository:** `kot0070/bruno-electric-pwa`  
**Production branch:** `main`  
**Pinned / audited HEAD:** `fedf3145e2ae1d1cad1999e400826449d4b13750`  
**Audit branch:** `audit/main-dispatch-v2-fedf314`  
**Report path:** `audits/reports/MAIN_DISPATCH_JOURNAL_V2_fedf314.md`

## VERDICT

**C — REJECT / REWORK REQUIRED**

The product architecture, responsive navigation, Residential/Commercial mode isolation, Residential Live repricing bridge, distinct Quote/Invoice/Change Order paths, and v39 service-worker ownership are present at the pinned production HEAD. However, the Call Journal financial model contains P1 correctness defects that make archive earnings/business-net figures materially unreliable.

## Production immutability / target verification

- `main` resolves exactly to `fedf3145e2ae1d1cad1999e400826449d4b13750`.
- The pinned commit message is `Run dispatch journal v2 regression tests`.
- No production code, `main`, PR, merge state, comments, or production refs were modified by this audit.
- The only write performed is this report on the declared audit branch/path.
- Exact-head GitHub checks: no workflow runs and no combined status contexts were returned for the pinned SHA. Therefore there is no exact-head green CI signal to use as evidence; acceptance is based on independent source inspection, not on CI.

## BLOCKERS

### P1-1 — `scheduled` calls are counted as earned revenue

**Location:** `electric-dispatch-journal-v2.js` → `callTotals()` / `summary()`.

`callTotals()` zeroes revenue only when `c.status === 'cancelled'`. Every other status, including `scheduled`, is treated as earned:

```js
if(c.status==='cancelled') return {gross:0,tax:0,net:0,...};
var g=Math.max(0,n(c.price));
...
return {gross:g,tax:tx,net:g-tx,...};
```

The editor explicitly offers `completed`, `scheduled`, and `cancelled`, so this is not an unreachable state.

**Reproduction by model:**
1. Add a future call with status `scheduled` and price `$1,000`.
2. Select the day/week/month/quarter containing that call.
3. Journal summary includes `$1,000` in **Gross earned**, applies the owner tax reserve, and includes the amount in business net.

**Impact:** planned/future work is represented as realized revenue and tax reserve. Day, Week, Month, and Quarter earnings can therefore be overstated.

**Required correction:** earned-revenue aggregation must be status-aware. At minimum, only completed/earned calls should contribute to earned gross/tax/net; scheduled calls may remain visible in the timeline but must be excluded from earned financial totals until completed.

---

### P1-2 — Week / Month / Quarter helper cost omits zero-call days

**Location:** `electric-dispatch-journal-v2.js` → `summary()`.

For Day mode, every active helper is charged once regardless of calls, which is correct for the explicit zero-call-day requirement. For Week/Month/Quarter, however, helper cost is multiplied only over dates placed in `days`, and `days` is populated only by non-cancelled calls:

```js
calls.forEach(function(c){
  if(c.status!=='cancelled') days[c.date]=1
});
...
if(mode==='day') {
  // active helpers always charged
} else {
  Object.keys(days).forEach(function(){
    // active helpers charged only on call-bearing dates
  })
}
```

**Reproduction by model:**
- Active fixed/day helper: `$200/day`.
- Monday: no calls.
- Tuesday: one completed call.
- Day view Monday correctly shows `-$200` helper effect.
- Week view counts only Tuesday as a helper-cost day and omits Monday's `$200` cost.

A week consisting entirely of zero-call days produces `$0` helper cost even though each Day view produces a negative helper effect.

**Impact:** archive rollups are internally inconsistent: the sum of daily business results does not equal the Week/Month/Quarter result. Business net is overstated in periods containing helper-paid zero-call days.

**Required correction:** helper schedule/cost must be aggregated from helper work/schedule dates, not inferred from revenue-producing call dates. Period rollups must equal the sum of their constituent daily results.

---

### P1-3 — Helper history is global mutable state, so archived business net is not historically stable

**Location:** `electric-dispatch-journal-v2.js` → `readData()`, `saveHelper()`, `summary()`.

Helpers are stored as one global array with current fields only (`rate`, `hours`, `payMode`, `taxPct`, `taxEnabled`, `active`). There is no effective date, per-day assignment, start/end date, or historical snapshot. `summary()` applies the current helper objects to whichever historical date is selected.

Consequences:
- Editing a helper rate today retroactively changes historical Day/Week/Month/Quarter business-net calculations.
- Setting a helper inactive today removes that helper cost from all historical dates.
- Deleting a helper removes that helper cost from all historical dates.
- Adding a helper can make historical dates before the helper existed show helper cost in Day view.

This conflicts with the product requirement for a persistent archive that remains reviewable weeks/months later and with the semantics of an `active / scheduled` helper.

**Impact:** archived business economics are non-deterministic over time and cannot be relied on as a historical record.

**Required correction:** persist helper scheduling/cost by effective date or journal day (or snapshot helper-cost entries into each day). Editing current helper defaults must not rewrite already-earned historical periods unless the user explicitly edits those historical records.

## Non-blocking findings

### P2-1 — Helper-tax display can be misleading when global helper tax is disabled

`helperCostForDay()` correctly applies zero helper tax when `settings.helperTaxEnabled` is false, but `renderHelpers()` displays `helperTaxPct(h,s)` without considering the global switch. The row can therefore display e.g. `tax 7.65%` while the calculation applies 0%.

**Recommendation:** render `0% / disabled` when the global helper-tax switch is off, or explicitly label the stored helper rate as inactive.

### P2-2 — Journal regression test is primarily presence/string coverage

`tests/dispatch-journal-v2.test.js` verifies presence of labels, storage keys, archive mode option strings, and selected implementation tokens. It does not execute `summary()` scenarios for:
- scheduled vs completed revenue,
- zero-call helper periods,
- multiple helpers,
- helper edits across historical dates,
- per-call tax inheritance/override,
- inclusive boundary dates across month/quarter transitions,
- persistence/reload behavior.

The current P1 defects therefore pass the deterministic regression test by construction.

**Recommendation:** add executable model-level tests around exported `BrunoDispatchJournalV2.summary()` and persistent helper/date scenarios.

## Scope verification

### A. Main IA / navigation

**PASS with no blocker found in inspected code.**

`electric-app-navigation.js` defines one canonical five-primary-destination model:
- Journal → `dispatch` / Call Journal
- Calculator → standalone `electrical-tools.html`
- Job → Customer Price / Quote, Invoice, Summary, Change Orders
- Catalog → Materials Catalog, Job Materials, Pricing & Margins
- More → Labor & Equipment, P&L, Workers, Company, Reference, Help

`index.html` retains source tabs for these workflows, including `dispatch`, and `electric-workspace.js` hides the legacy strip while reusing those source tabs. Phone uses a five-column fixed bottom nav, tablet uses a rail plus section choices, desktop uses sidebar groups/subitems.

Journal activation is supported because the source `data-tab="dispatch"` exists and `electric-dispatch-journal-v2.js` reuses/replaces `#panel-dispatch`.

### B. Calendar/date navigation and archive ranges

**PASS for date-range construction; financial archive fails due P1 helper/revenue semantics.**

`periodRange()` creates inclusive ranges:
- Day: selected day
- Week: Monday through Sunday
- Month: first through last day
- Quarter: first day of quarter through last day of quarter

`inRange()` uses inclusive `>=` / `<=` date comparison. Prev/Next shifts by 1 day, 7 days, 1 month, or 3 months respectively. Calendar buttons select a date and return to Day mode.

### C. Add/Edit/Delete Call / compact timeline

**PASS structurally.**

- Add/Save persists to `bruno-electric-dispatch-journal-v2`.
- Edit replaces the matching call by ID.
- Delete filters by ID and persists.
- Timeline row includes time, date, address, hours, status, gross and net.
- Calls are sorted by `date + time`.
- Empty periods render a specific empty state.

Financial interpretation of scheduled rows is blocked by P1-1.

### D. Earnings / tax / helper economics

**FAIL — blockers P1-1, P1-2, P1-3.**

Positive checks:
- Cancelled calls contribute zero gross/tax/net.
- Day view charges active helpers even with zero calls.
- Multiple helper objects are iterated and accumulated.
- Hourly and fixed/day modes exist.
- Per-helper tax enable/disable and override fields exist.
- Global helper tax enable/disable exists.
- Business net subtracts helper gross wage cost, not helper take-home.
- Journal settings persist separately under `bruno-electric-dispatch-settings-v2`.
- Default jurisdiction is `Dripping Springs, TX`.
- Owner tax reserve is clearly labeled as a planning estimate, editable and disableable.
- Per-call tax override uses blank = current journal settings.

### E. Residential / Commercial Project Calculator mode

**PASS in inspected implementation.**

`electric-project-mode.js` persists `bruno-electric-project-mode-v1` and supports:
- `Residential / dwelling`
- `Commercial`

Commercial mode hides Residential-specific tools `res`, `res-live`, `res-takeoff`. If one of those is active during the switch, it clicks the generic `amp` tool. The UI explicitly warns that Commercial mode does not automatically apply all commercial NEC rules and that occupancy/AHJ decisions remain required.

### F. Residential Live / BOM / Catalog live pricing / same-tab repricing

**PASS in inspected regression path.**

- `electric-residential-live-workspace.js` recalculates Residential material customer total through `BrunoResidentialPricing.priceRows()` from current Catalog data on render.
- Same-tab Catalog edits are handled through capturing `input` / `change` listeners scoped to `#panel-catalog` plus a `bruno:catalog-changed` hook.
- The associated executable test changes Catalog unit price from 10 to 14 and expects the live workspace total to move from `$100` to `$140` in the same document.
- Existing BOM regression tests preserve manual/other-source rows during same-source replacement and use contractor `yourCost`, not customer price, for generated BOM cost.
- Unresolved contractor cost remains zero/reviewable instead of falling back to customer price.

No new blocker was identified in these inspected paths.

### G. Quote / Proposal, Invoice, Change Orders / customer document separation

**PASS structurally in inspected index/navigation paths.**

- Quote is a dedicated `panel-quote` customer proposal path with its own preview and print action.
- Invoice remains a separate `tm` route in the canonical Job group and has a separate top-level print action (`btn-print-tm`).
- Change Orders remain a separate `cos` workflow.
- Active Company/letterhead UI remains independent under Company and is referenced by Quote/Invoice print workflows.

No evidence was found that the Journal/navigation change collapses Quote and Invoice into one document path.

### H. Persistence

**PARTIAL PASS; historical helper persistence semantics fail.**

- Journal calls/helpers and journal settings use dedicated localStorage keys, separate from the main job key.
- Project mode has its own persistent key.
- Existing job/Residential data remains on its established key.
- Journal storage is therefore not directly erased by ordinary unrelated job writes.

However, historical helper economics are not persisted per date/effective period (P1-3).

### I. Responsive phone / tablet / desktop

**PASS by static responsive-path inspection; no rendered-device execution was available in this connector audit.**

- Phone workspace reserves bottom padding for the fixed five-item navigation and safe-area inset.
- Browser mode reserves an additional right gutter for phone overlay safety.
- Journal changes to a one-column main grid below 768px, two-column metrics, one-column forms, and compact call rows.
- Tablet/desktop workspace side rails reserve 92px / 244px body padding respectively.
- No new Journal rule intentionally creates horizontal overflow; core grids use `minmax(0,1fr)`.

### J. PWA / offline / cache v39

**PASS in inspected service-worker implementation.**

`sw.js`:
- owns `bruno-electric-v39`,
- deletes only owned prior `bruno-electric-vN` caches,
- includes `electric-dispatch-journal-v2.js` and `electric-project-mode.js` in `CORE_SHELL`,
- isolates optional icon failures so they cannot poison core installation,
- preserves same-origin network/cache behavior and navigation fallback to cached `index.html`.

`sw-register.js` dynamically loads Journal on the main app and Project Mode only on Electrical Tools, while still registering `sw.js`.

### K. NEC/calculator/navigation/print regression

**No new blocker found in inspected regression surfaces.**

- Existing calculator/NEC modules remain in the v39 core shell.
- Commercial mode does not mutate calculation logic; it gates Residential-only UI tools and explicitly avoids claiming full commercial NEC automation.
- Existing deterministic tests still cover catalog/BOM integrity, calculator modules, equipment, Residential estimator/live/history/levels/workspace, service worker and navigation shell.
- Quote/Invoice remain separate source panels/routes, and print controls remain separate.

This audit does not treat those tests as proof of the new Journal financial model; the Journal-specific test lacks the scenarios that exposed the blockers above.

## Required rework before acceptance

1. Exclude `scheduled` calls from earned gross/tax/net until they become completed/earned.
2. Replace call-derived helper-period counting with date/schedule-derived helper cost so zero-call helper days are included in Week/Month/Quarter.
3. Make helper scheduling/economics historically stable (effective dates, per-day assignments, or snapshots) so current helper edits/disable/delete do not silently rewrite historical archive results.
4. Add executable regression tests for the above scenarios, including multiple helpers and period totals equal to the sum of constituent days.
5. Add tests for per-call tax inheritance/override and month/quarter boundary inclusivity.

## Final audit conclusion

The dispatch-first IA and the broader product regression surfaces are substantially intact at `fedf314`, but Journal v2 cannot be accepted as a reliable business archive while scheduled future work is recorded as earned revenue and helper-period costs are omitted or retroactively rewritten. These are P1 financial correctness defects; under `audits/PROTOCOL.md`, the required verdict is **C — REJECT / REWORK REQUIRED**.

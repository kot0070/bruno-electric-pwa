# CURRENT AUDIT TASK — Main App Home / Call Journal v2

AUDIT ONLY.

## Production target
- Repository: `kot0070/bruno-electric-pwa`
- Branch: `main`
- PINNED_HEAD: `fedf3145e2ae1d1cad1999e400826449d4b13750`
- REPORT_PATH: `audits/reports/MAIN_DISPATCH_JOURNAL_V2_fedf314.md`

Do not modify production code, `main`, PRs, comments, or merge state.

## Scope — audit the whole changed product flow, not only one file

Independently verify:

### A. Main information architecture / navigation
- Journal is the first/default primary workspace.
- Five primary destinations are logically and consistently exposed across phone/tablet/desktop: Journal, Calculator, Job, Catalog, More.
- Journal routes to Dispatch/Call Journal.
- Calculator routes to standalone Electrical Tools / Project Calculator.
- Job includes Customer Price/Quote, Invoice, Summary, Change Orders as separate workflows.
- Catalog includes Materials Catalog, Job Materials, Pricing & Margins.
- More exposes Labor & Equipment, P&L, Workers, Company, Reference, Help.
- No dead routes, hidden inaccessible legacy panels, active-state drift, back-navigation regressions, or mobile bottom-nav regressions.

### B. Call Journal v2 functional behavior
- Journal is actually usable and not just rendered UI.
- Calendar/date navigation works.
- Day / Week / Month / Quarter archive views use correct inclusive ranges and do not lose calls.
- Add Call -> Save produces a compact timeline/list row with time, date, address, hours, status, gross price and calculated net.
- Edit/delete call behaves deterministically.
- Cancelled calls do not count as earned revenue.
- Historical calls remain selectable and reviewable weeks/months later.
- Empty days and periods are handled cleanly.
- Persistence survives reload and is not erased by unrelated job work.

### C. Earnings / tax reserve / helper economics
- Gross earned, tax reserve, helper gross cost, and business net are internally coherent.
- A scheduled active helper creates a negative daily business effect even when there are zero calls.
- Multiple helpers are supported.
- Hourly and fixed-per-day helper pay modes work.
- Helper tax estimate can be enabled/disabled and overridden.
- Business net subtracts helper gross business cost rather than pretending helper take-home is the employer cost.
- One-time tax/journal settings persist.
- Default home base is Dripping Springs, TX.
- Tax settings are clearly planning estimates, editable, and can be disabled; no UI should falsely represent them as authoritative payroll/tax filing calculations.
- Per-call tax override vs inherited journal tax setting behaves correctly.

### D. Project Calculator mode
- Residential / dwelling and Commercial project modes persist.
- Commercial mode prevents accidental use of Residential-specific dwelling calculators while keeping generic/equipment calculators usable.
- Switching mode from an active Residential-specific calculator lands on a safe generic tool.
- UI does not imply that merely selecting Commercial automatically applies every commercial NEC rule.

### E. Existing calculator and estimating regression
Recheck independently:
- Residential Live engine / L0-L6 cascade.
- same-tab Catalog repricing -> Residential material total.
- BOM generation and same-source replacement.
- customer price / Your Cost / margin semantics.
- Quote/Proposal and T&M Invoice remain distinct customer document paths.
- Change Orders.
- print/compliance protections.
- NEC/calculator regression.
- persistence.
- compact top header/totals behavior.

### F. PWA / offline / cache
- v39 cache ownership and stale cache cleanup.
- `electric-dispatch-journal-v2.js` and `electric-project-mode.js` are available offline.
- core install cannot be poisoned by optional icons.
- navigation fallback still works offline.

### G. Responsive UX
Inspect phone, tablet and desktop code paths for:
- usable calendar/timeline/helpers/settings;
- no bottom-nav obstruction;
- no giant summary blocks consuming irrelevant screens;
- no horizontal overflow that makes core controls inaccessible.

## CI
Verify exact-head CI belongs to the exact PINNED_HEAD. Treat green CI as supporting evidence only, not as acceptance proof.

## Report
Write the full audit report to:
`audits/reports/MAIN_DISPATCH_JOURNAL_V2_fedf314.md`

Return in chat ONLY:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

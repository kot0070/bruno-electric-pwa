# Bruno Electric — Workflow Overhaul v51 Corrective Developer Report

## Source audit
- Audit branch: `audit/workflow-overhaul-v50-5852749`
- Audited SHA: `5852749be6cd240b6e52bac15cacf4ffbfa6a288`
- Report: `audits/reports/WORKFLOW_OVERHAUL_V50_5852749.md`
- Verdict: `C — REJECT / REWORK REQUIRED`
- Blocking findings: 2 × P1.

## P1-1 — Residential archive cross-job isolation

### Audit finding
Residential archive used the device-global key `bruno-residential-live-library-v1`. Job A saved calculations could remain visible after importing/replacing the active `bruno-electric-v1` state with Job B, and archive rows could be repriced against Job B Catalog.

### Corrective implementation
Added `electric-residential-history-job-scope.js`.

Authoritative state is now:
`bruno-electric-v1.residentialLiveArchive`

The corrective API owns:
- Save Calculation archive persistence;
- list / duplicate / delete;
- active calculation persistence;
- repricing against the current Job Catalog;
- explicit legacy recovery.

The old `bruno-residential-live-library-v1` key is no longer authoritative. Its raw contents remain preserved for recovery. `legacyList()` can inspect them and `importLegacyToCurrent(ids)` explicitly copies selected/all legacy rows into the current Job with new IDs plus `legacyOriginalId` / `legacyRecoveredAt` provenance.

For compatibility with legacy closures, the corrective runtime virtualizes access to the legacy archive key so any old closure still reading/writing that key operates against `residentialLiveArchive` inside the active Job. The raw legacy recovery source is not overwritten by those virtualized operations.

To avoid relying on that fallback in normal Electrical Tools runtime, `electrical-tools.html` now loads:
1. `electric-residential-live-history.js` compatibility API;
2. `electric-residential-history-job-scope.js` corrective authority;
3. only then `electrical-residential-live-ui.js`.

Thus the Residential Live UI captures the corrected history API.

### Regression coverage
`tests/residential-history-job-scope.test.js` verifies:
- Save writes archive inside current Job;
- Job A -> Job B replacement exposes no Job A archive;
- raw legacy archive is preserved and non-authoritative;
- explicit recovery copies rows into current Job without deleting legacy source;
- preloaded legacy archive writes are virtualized into active Job state;
- current-job export/import naturally carries archive data;
- malformed legacy archive cannot erase current-job archive.

C1 exact-head gate: GitHub Actions #307 SUCCESS on `e8d2eb05cbfba54523cf57dd5ecc407d159efb66`.

## P1-2 — Approved fixed-price Quote not connected to actual Invoice

### Audit finding
`electric-quote-lifecycle.js` produced an immutable `APPROVED_QUOTE_SNAPSHOT`, but the application's real Invoice buttons still invoked the independent T&M path. No fixed-price customer document consumed `BrunoQuoteLifecycle.invoiceBasis()`.

### Corrective implementation
Added `electric-fixed-price-invoice.js`.

`buildInvoiceModel()` accepts only:
`BrunoQuoteLifecycle.invoiceBasis()` with `source = APPROVED_QUOTE_SNAPSHOT`.

The fixed-price invoice model carries:
- approval ID;
- approval revision;
- frozen approved amount;
- approved timestamp;
- frozen quote/customer/job/proposal/date metadata;
- applied Residential calculation provenance;
- approval-time unresolved contractor-cost disclosure;
- price source / recommended-at-approval / manual adjustment context.

The fixed-price invoice document does not read `q-total`, `chip-quote`, current calculator totals, current Catalog prices, or current Job Material totals.

New Quote action:
`Print Fixed-Price Invoice`

Existing invoice actions are relabeled:
- `Print T&M Invoice`
- `Print T&M Invoice (PDF)`

This preserves T&M as a separate mode and removes the prior generic `Print Invoice` ambiguity.

### Regression coverage
`tests/fixed-price-invoice.test.js` verifies:
- fixed Invoice consumes approved snapshot only;
- amount and approval provenance appear in the document;
- pre-approval fixed Invoice fails closed;
- T&M controls are explicitly separated;
- fixed Invoice does not read moving live quote DOM totals.

CI #314 SUCCESS on `bf88df0591a0c619687513edaa627cae56cada54`.

## PWA / integration
- Cache bumped `bruno-electric-v50` -> `bruno-electric-v51`.
- New CORE_SHELL modules:
  - `electric-residential-history-job-scope.js`
  - `electric-fixed-price-invoice.js`
- stale owned caches through v50 are removed;
- unrelated caches remain untouched;
- final integration checks assert static Electrical Tools load order and v51 runtime coverage.
- temporary implementation/debug artifacts were removed before release freeze.

Latest implementation/integration gate before this report:
- SHA `6b32c7100ded4f99a479d7eea829581722316e2e`
- GitHub Actions #319 SUCCESS.

## Preserved contracts
The corrective changes do not intentionally modify:
- blank Your Cost != explicit zero;
- unresolved `unitCost:null` exclusion from numeric contractor-cost math;
- Custom Job Material historical snapshot immutability;
- Save Calculation != Apply to Job;
- Commercial / Residential isolation;
- historical Journal helper-tax snapshot semantics;
- Quote approval immutable revision/history behavior;
- exact PR-head CI provenance workflow.

## Re-audit requirements
The final candidate must independently reproduce and verify:
1. Job A Save Calculation -> replace/import Job B -> Job A archive is not visible.
2. Job export/import round-trip carries the correct Job-owned archive.
3. raw legacy archive does not become authoritative automatically.
4. explicit legacy recovery is non-destructive and current-job scoped.
5. Approve fixed Quote -> fixed Invoice amount equals approved snapshot.
6. mutate live calculator/Catalog/Job after approval -> fixed Invoice amount remains frozen.
7. T&M Invoice remains independent and explicitly labeled T&M.
8. PWA v51/offline shell contains both corrective runtimes.
9. Full shared regression suite and exact-head provenance remain green.

## Merge state
PR #14 must remain OPEN / NOT MERGED until independent re-audit returns no P0/P1 blockers.

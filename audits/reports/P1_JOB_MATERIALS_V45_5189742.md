# Independent Audit Report — Job Materials unresolved contractor cost / PWA v45

## Verdict
**A — ACCEPT**

No P0/P1 blockers found in the audited production candidate.

## Audited production HEAD
`51897424146454d50c2b9ae06e7f94f5c8b3e2c7`

Audit mode was read-only against production code and PR/merge state. The only write performed by the auditor is this designated report on the separate audit branch, per `audits/PROTOCOL.md`.

## Independent scope and method
I independently inspected the production files at the pinned SHA, traced the actual UI/data call chain, reviewed and exercised the deterministic runtime tests represented in the exact candidate, reviewed the GitHub Actions execution associated with the exact head, and re-checked the regressions enumerated in `TASK_CURRENT.md` rather than relying on the developer report.

The primary runtime chain audited was:

`Residential Live UI` → `Confirm & Save Project Calculation` → `BrunoResidentialLiveHistory.confirmAtomic()` → `BrunoElectricBOM.prepareReplacement()` → persisted `bruno-electric-v1` → Job Materials rendering → main project cost/quote consumers.

## Findings

### 1. Residential Live positive Customer Price + blank Your Cost — PASS

The Residential Live renderer prices the generated BOM through `BrunoResidentialPricing.priceRows()`. A matched Catalog row with positive Customer Price and blank/missing `yourCost` is represented as `YOUR_COST_UNRESOLVED`; contractor unit cost, contractor total and material gross profit are null for that line. Customer Price remains customer-side pricing and is not used as a fallback for Your Cost.

`Confirm & Save Project Calculation` rebuilds the current live result before commit, creates the generated BOM rows, and calls:

`BrunoResidentialLiveHistory.confirmAtomic(snapshot, 'residential-live-takeoff', rows)`.

`confirmAtomic()` calls `BrunoElectricBOM.prepareReplacement()` against the currently persisted job before writing either the job state or archive.

For blank/missing/invalid contractor cost, `prepareReplacement()` uses `knownCost()` and produces an unresolved row with:
- `unitCost: null`;
- `costState: 'UNRESOLVED'`;
- `bomStatus: 'Unresolved'`;
- `unresolvedReason: 'YOUR_COST_UNRESOLVED'` or `CATALOG_UNMATCHED`;
- `catalogMatchId` when a deterministic Catalog match exists;
- generated source/version/index metadata.

That row is appended to `materialsUnresolved[]`, not `materialsUsed[]`.

This directly closes the prior P1 failure mode in which unresolved contractor cost was materialized as numeric zero.

### 2. Main project material/quote math exclusion — PASS

The main `calcMaterial()` implementation iterates only `state.materialsUsed`. It does not read `materialsUnresolved`.

Because unresolved generated rows are physically separated from `materialsUsed[]`, they cannot enter the existing resolved material extension, project material total, quote/cost summary, gross-profit or related downstream math through the main calculator path.

This is structural exclusion, not merely display suppression.

### 3. Job Materials unresolved UI — PASS

`electric-job-material-cost-semantics.js` reads `bruno-electric-v1.materialsUnresolved[]` and injects review-only rows into Job Materials.

The UI explicitly renders:
- `UNRESOLVED COST` on the item;
- `Unresolved` in the contractor-cost cell;
- `Excluded` in the numeric extension/result cell;
- a banner explaining that generated materials are blocked from project material-cost totals until Your Cost is entered and Confirm & Save is run again.

The renderer is re-applied after table mutations, Confirm & Save, and relevant storage changes, so reload/re-render does not silently hide the unresolved representation.

### 4. Explicit Your Cost = 0 — PASS

`BrunoElectricBOM.knownCost()` distinguishes blank from numeric zero. `0` is a known valid cost.

A generated row with explicit Your Cost `0` remains in `materialsUsed[]` with:
- numeric `unitCost: 0`;
- `costState: 'RESOLVED'`;
- deterministic Catalog match metadata;
- no entry in `materialsUnresolved[]`.

Residential pricing likewise treats explicit zero as a resolved contractor cost and correctly permits a 100% material margin when Customer Price is positive.

### 5. Positive known Your Cost — PASS

Positive known `yourCost` is persisted as a normal numeric resolved Job Material. No Customer Price substitution is used.

### 6. Unresolved → known promotion and recalculation — PASS

`prepareReplacement()` removes prior generated rows with the same `generatedBy.source` from both `materialsUsed[]` and `materialsUnresolved[]` before generating replacements.

Therefore:
1. blank Your Cost → Confirm & Save stores the row in `materialsUnresolved[]`;
2. entering a valid Your Cost in Catalog/Pricing & Margins updates the Catalog state;
3. Confirm & Save again removes the stale unresolved same-source row and generates a numeric resolved row in `materialsUsed[]`.

The deterministic suite contains and passes this promotion transition.

The same-source replacement boundary also removes stale formerly resolved rows if a later recalculation becomes unresolved.

### 7. Manual and other-source preservation — PASS

Both resolved and unresolved stores are filtered only by matching generated source tag. Manual rows and rows generated by other sources are preserved. The deterministic suite explicitly exercises preservation of manual and other-source `materialsUsed[]` rows.

### 8. Persistence / atomic commit / archive — PASS

`confirmAtomic()` prepares the full replacement state first and then commits:
- `bruno-electric-v1` with the resolved/unresolved Job Materials distinction and active Residential snapshot;
- `bruno-residential-live-library-v1` with the archive snapshot.

The paired write has rollback protection. Deterministic tests cover failure of the first and second writes and verify prior state restoration.

Archive snapshots intentionally strip pricing before persistence. `active()`, `list()`, `duplicate()` and `reprice()` hydrate pricing from the current Catalog using the saved BOM quantities. Thus archive/duplicate/reload paths do not freeze stale Customer Price/Your Cost calculations.

The unresolved-vs-zero distinction is stored in job state and survives reload because unresolved generated rows remain in `materialsUnresolved[]` with `unitCost:null` rather than a falsy numeric surrogate.

### 9. Pricing & Margins strict runtime — PASS

The bootstrap synchronously replaces legacy `#margins-body` with `#margins-body-strict` before the inline app `DOMContentLoaded` initialization. The strict runtime is therefore authoritative and the legacy renderer cannot own the Pricing & Margins tbody.

The strict runtime independently preserves:
- blank/missing Your Cost → unresolved/null;
- explicit zero → known zero;
- positive cost → known numeric;
- unresolved rows excluded from resolved cost, gross difference and margin aggregates;
- customer totals separately visible without treating customer price as contractor cost.

Transitions tested at runtime include:
- known → blank;
- blank → 0;
- 0 → blank;
- blank discount → unresolved;
- explicit discount → deterministic known cost;
- save/reload across blank → zero → blank.

Clearing Your Cost deletes the row from all localStorage keys ending in `-catalog-costs-v1`, preventing stale legacy cost-map values from reconstituting a cleared cost through the current edit path.

### 10. Catalog `.cat-your` — PASS

The Catalog cost guard captures both `input` and `change` in the capture phase for `.cat-your` and `.mrg-your`.

Blank or invalid input is persisted as blank/unresolved and propagation is stopped before the legacy coercive handler can turn it into zero. Explicit zero and positive numeric values are allowed through as known values.

The same guard purges persisted stale cost-map overrides for the cleared Catalog id.

### 11. Residential pricing and Catalog matching — PASS

Core Residential pricing performs normalized exact-name matching only. The compatibility bridge adds a bounded explicit alias table for known Residential Live vocabulary.

The bridge resolves exact match first, then only listed aliases. Unsupported items remain `UNMATCHED`; there is no fuzzy nearest-name pricing.

Tests confirm, among other cases:
- explicit alias resolution;
- exact match wins over alias;
- unsupported panel/service item stays unmatched;
- blank persistent Your Cost stays unresolved;
- explicit persisted zero remains known zero.

Malformed negative/nonnumeric pricing values fail closed rather than being coerced to zero. The generated BOM helper itself classifies an invalid Your Cost as unresolved if such a value reaches replacement preparation.

### 12. PWA v44 → v45 / offline — PASS

`sw.js` declares `bruno-electric-v45`.

Activation removes owned caches matching `^bruno-electric-v\d+$` except v45. The service-worker runtime test explicitly verifies deletion of v38 through v44 while preserving v45 and unrelated caches.

The v45 core shell includes the corrective runtimes, including:
- `electric-job-material-cost-semantics.js`;
- `electric-pricing-margins-semantics.js`;
- `electric-catalog-cost-semantics.js`;
- Residential Live/pricing/history/catalog-bridge modules;
- Journal and navigation modules.

Core assets are installed through `cache.addAll(CORE_SHELL)`, while optional icon failures are isolated. The fetch strategy supports cached shell/offline fallback and updates cached same-origin shell responses after successful network fetches.

### 13. Commercial / Residential isolation and switching — PASS

The Project Calculator keeps Commercial mode from reusing dwelling minimums and explicitly refuses to invent Residential 210.52 minimums for Commercial work.

The authoritative project-mode storage/event path is present, and the tools shell treats Residential Live / Residential / Residential Takeoff as residential-only routes. In Commercial mode these entries are hidden/disabled and click capture prevents stale routing into residential-only workflows. Mode changes refresh routing state.

### 14. Residential engine / Project Calculator regression — PASS

The deterministic suite re-runs the Residential service/load/BOM logic and Project Calculator → Residential Live routing. Residential calculations retain explicit code/design boundaries, reject invalid required values, and preserve service/BOM behavior covered by the suite.

### 15. Journal regression — PASS

The Journal remains the canonical home/default route.

Independent regression checks cover:
- Day / Week / Month / Quarter period views;
- scheduled/cancelled calls not counted as earned;
- helper cost evaluated for every calendar date in the selected period, including zero-call days;
- helper economics versioned by effective date rather than historical deletion;
- historical helper-tax percentage/toggle owned by each revision, not later global settings;
- completed-call owner tax snapshot stability.

### 16. Navigation / viewport implications — PASS

The shared navigation remains a canonical five-section model and is consumed across workspace/tool shells. Regression tests cover phone, tablet and desktop breakpoints and the same primary navigation model across viewports. The Electrical route remains a first-class page rather than an iframe.

No v45 corrective module introduces viewport-specific cost semantics; unresolved Job Materials are injected into the existing materials table and banner container.

## Deterministic suite and exact-head CI provenance

GitHub Actions run **#215** (`Electrical Calculator Tests`) is associated by GitHub with:
- `head_sha = 51897424146454d50c2b9ae06e7f94f5c8b3e2c7`;
- PR #13 head SHA = the same audited SHA;
- workflow conclusion = `success`.

The job log reports:

`Bruno Electric deterministic tests: 495/495 passed`

The PR workflow checked out GitHub's synthetic merge commit `48157f3f75637de29a3cd771ea61aba35d911d99`. I independently compared that merge commit to the audited head: GitHub reports it one commit ahead with **no changed files** relative to `51897424146454d50c2b9ae06e7f94f5c8b3e2c7`. Therefore the tested file tree is identical to the audited production candidate while the workflow metadata is explicitly tied to the audited head SHA.

CI was treated as corroborating evidence only; the verdict is based on the independent production-path/source/runtime-state analysis above plus the deterministic test behavior.

## Blockers

**None.**

No P0 catastrophic failure and no P1 production-blocking correctness, pricing, persistence, primary-workflow, code-compliance, or major UX failure was identified in the audited candidate.

# Bruno Electric — Developer Corrective Report

## Scope
Corrective pass following independent audit of `311997c12cd82d0b45d82584c75c8c6fbcce90bb` plus the reproduced Residential Live Catalog-pricing runtime defect.

## Final implementation HEAD
`1bf5429473cd2e3fb6e08589ebc03aa0f6345a91`

PR: #13 — `dev/p1-project-journal-corrective` → `main`

## Corrected acceptance blockers

### 1. Commercial / Residential isolation
The Project Calculator project type remains the authoritative persisted mode. The Electrical Tools shell consumes that state and removes/guards Residential-only workflows while Commercial is active. A Commercial project cannot ordinarily navigate into Residential Live / Residential / Residential Takeoff. Switching back to Residential is performed through Project Calculator rather than by restoring the removed duplicate mode overlay.

### 2. Historical helper-tax stability
Historical helper tax/net is determined by the effective-dated helper revision (`taxEnabled` + `taxPct`). The current global helper-tax toggle/percentage is only a default for newly-created revisions and no longer rewrites prior-period helper tax/net.

### 3. PWA stale-cache invalidation
The app-shell cache was bumped from `bruno-electric-v40` to `bruno-electric-v41`. Activation deletes owned stale `bruno-electric-v*` caches other than v41, including v40. `skipWaiting()` and `clients.claim()` remain in the install/activate lifecycle. The current core shell includes the corrected Project Calculator, Electrical shell, Journal and the new Residential Catalog bridge.

### 4. Residential Live Catalog pricing bridge
The reported runtime condition `Resolved 0 / unmatched 12 / $0.00` was traced to vocabulary mismatch: Residential Live BOM uses normalized estimating names while the established embedded Catalog contains older item descriptions.

Added `electric-residential-catalog-bridge.js` with deterministic, explicit compatibility aliases. Exact catalog-name matches always win; only explicitly mapped legacy equivalents are used otherwise. There is no generic fuzzy matching.

Current compatibility aliases include:
- `15A duplex receptacle` → `120v 15 amp white receptacle (standard)`
- `20A duplex receptacle` → `120v 20 amp white receptacle`
- `20A GFCI receptacle` → `120v 20 amp GFCI receptacle`
- `20A 1-pole breaker` → `20 amp single pole`
- `12/2 NM-B with ground` → `12/2 Romex with ground`
- `14/2 NM-B with ground` → `14/2 Romex with ground`
- `1-gang device wall plate allowance` → `single gang receptacle cover -white`

The bridge also overlays persisted Catalog customer-price and Your-Cost maps before live pricing/BOM insertion, so edits made in the main Catalog/Margins workflow remain visible to Residential Live.

Unsupported rows remain `UNMATCHED` rather than being guessed. Missing/blank `yourCost` remains unresolved; the generated Job Materials path does not silently substitute Customer Price for contractor cost.

## Regression coverage
Added `tests/residential-catalog-bridge.test.js` covering:
- legacy alias resolves live Customer Price and Your Cost;
- exact match wins over alias;
- unsupported rows remain unmatched;
- persisted Catalog price/cost maps are applied;
- generated Job Materials use alias-resolved Your Cost and catalog metadata.

Updated `tests/service-worker.test.js` for v41 and required v40 invalidation/core-shell coverage.

## Exact-head CI
GitHub Actions `Electrical Calculator Tests`, run `35043772494`, completed successfully on exact HEAD `1bf5429473cd2e3fb6e08589ebc03aa0f6345a91`.

## Deliberately not included in this corrective PR
The requested next feature — manual Custom / Special-order Catalog Materials with description/SKU/unit, quantity, Customer Price, Your Cost, margin/markup and direct Project Calculation/BOM/Job Materials insertion — remains the next work-plan item. It is intentionally not mixed into this production-blocker corrective audit.

## Merge policy
Do not merge PR #13 until an independent audit accepts the exact final implementation HEAD.

# Bruno Electric — P1 Catalog Your Cost Semantics Corrective

## Source audit
Independent audit of production candidate `26d5f7140189606277b0f9c28fe87a2e0328c5a5` returned `C — REJECT / REWORK REQUIRED` with one P1 blocker: blank/missing `Your Cost` could be coerced by active Catalog/Pricing editors to numeric `0`, causing Residential Live pricing to treat an unknown contractor cost as a known zero cost and overstate material gross profit/margin.

## Root cause
The pricing and BOM engines already distinguished blank/missing `yourCost` from explicit numeric zero. The defect occurred earlier in the UI persistence boundary: legacy Catalog/Pricing editor handlers normalized empty numeric input to `0` before saving. Starter electrical-catalog rows also seeded `yourCost:0`, which made unknown cost indistinguishable from an intentional zero-cost material.

## Corrective implementation
1. Added `electric-catalog-cost-semantics.js` as a workspace guard for the two active Your Cost editor surfaces (`.cat-your` and `.mrg-your`).
   - blank/missing input is persisted as `''` (unresolved);
   - explicit `0` remains a valid known zero;
   - blank edits are intercepted in capture phase before the legacy coercive bubble handlers can write zero;
   - the corresponding persisted `*-catalog-costs-v1` override is removed when the user clears Your Cost;
   - unresolved inputs are re-rendered visually blank with an `Unresolved` placeholder.
2. Changed starter `electric-catalog-v1.js` rows from `yourCost:0` to `yourCost:''`.
3. Hardened `electric-residential-catalog-bridge.js` so persistent cost-map overlays preserve blank/missing as unresolved rather than applying `Number(raw)||0`.
4. Added deterministic regression coverage for:
   - blank/missing vs explicit zero parsing;
   - blank save/reload persistence;
   - cost-map override removal when cost is cleared;
   - Catalog and Pricing & Margins editor guard coverage;
   - starter catalog unresolved semantics;
   - Residential Live pricing after blank persisted Your Cost;
   - explicit persisted zero remaining valid;
   - existing alias matching, unsupported fail-closed rows and generated Job Materials behavior.
5. Bumped PWA app-shell cache from `bruno-electric-v41` to `bruno-electric-v42` and cached the new semantics module so existing v41 clients cannot remain on the pre-fix behavior.

## Behavioral contract
- `yourCost == null` or `yourCost === ''` → unresolved; excluded from resolved material gross profit/margin.
- explicit numeric `yourCost === 0` → known zero; valid 100% material margin when Customer Price is positive.
- positive finite Your Cost → known cost.
- invalid/negative input does not become an invented known zero.
- Customer Price is never substituted for unresolved Your Cost in Residential Live/BOM.

## Validation
GitHub Actions `Electrical Calculator Tests` passed on implementation commit `4fdce8926c38199dd5653134ea49604f72643cdb` (run 194). A new exact-head CI run is required after this developer-report commit and before independent audit acceptance.

## Production safety
PR #13 remains open and unmerged. Independent audit must accept the new exact candidate HEAD before merge.

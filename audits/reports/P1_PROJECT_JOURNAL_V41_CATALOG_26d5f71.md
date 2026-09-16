# Independent Audit — P1 Project Journal v41 / Catalog corrective

## Verdict
**C — REJECT / REWORK REQUIRED**

## Audited target
- Repository: `kot0070/bruno-electric-pwa`
- Exact audited production-candidate HEAD: `26d5f7140189606277b0f9c28fe87a2e0328c5a5`
- Base production SHA: `3a85743b891b9aa276e6eb6ae0ef55cad970094f`
- PR under audit: `#13`
- Audit mode: **AUDIT ONLY**

The exact pinned SHA was inspected. No production/development code, PR state, or merge state was modified. Only this report was written on the dedicated audit branch.

## Executive result
The prior Commercial/Residential isolation and historical helper-tax blocker areas are materially corrected, and the v40→v41 service-worker invalidation is implemented with an owned-cache-only deletion policy. The Residential Live Catalog bridge is deterministic and does not introduce fuzzy matching.

However, one production-blocking pricing/data-semantics defect remains: **blank/missing `Your Cost` is converted to numeric zero by the active Catalog/Margins editing paths and therefore becomes a resolved known cost instead of remaining unresolved.** Residential Live then computes gross profit/margin as if contractor cost were genuinely `$0.00`, which violates the mandatory fail-closed requirement and can materially overstate margin.

## P1 blocker

### P1-1 — Blank/missing `Your Cost` is coerced to `$0.00` and treated as resolved

**Required contract:** Missing/blank `Your Cost` must remain unresolved and must not participate in resolved gross-profit/margin calculations.

**Observed production behavior:**
1. `electric-residential-pricing.js` correctly distinguishes `null`/`''` from a known numeric value and emits `YOUR_COST_UNRESOLVED` only when `m.yourCost == null || m.yourCost === ''`.
2. But the active Catalog UI path in `index.html` does not preserve blank state. `applyCatalogYourCost()` parses the input and executes `if (!isFinite(price) || price < 0) price = 0;`, then stores `0` into the Catalog row.
3. The Pricing & Margins editor likewise handles `.mrg-your` with `row.yourCost = Math.max(0, parseFloat(e.target.value) || 0)`, so blank input becomes `0`.
4. `saveCatalogCostMapFromState()` subsequently persists that zero because zero is neither `null` nor `''`.
5. Residential pricing therefore receives `yourCost: 0`, classifies the line as `PRICED`, increments `resolvedLineCount`, includes zero in `yourMaterialCost`, and includes the full Customer Price in gross profit. For a positive Customer Price this can display a 100% material margin even though the contractor cost is actually unknown.
6. `electric-catalog-v1.js` also seeds placeholder rows with `yourCost: 0`; therefore a newly seeded Catalog row can be interpreted as a resolved zero contractor cost unless the user explicitly enters a real cost.

**Why this is P1:** This is a primary pricing/margin correctness and fail-closed defect. It can produce materially false profit/margin on Residential Live and archived/live repricing, exactly where the task requires unknown cost to remain unresolved.

**Required correction:** Preserve an explicit unresolved representation (`null`/`''` or equivalent) when Your Cost is blank or not yet entered. Do not serialize blank as zero. Seed placeholder Catalog rows with unresolved Your Cost rather than a known zero unless zero is intentionally user-entered. Ensure both Catalog and Pricing & Margins editors preserve the distinction. Add tests proving: blank input → unresolved; explicit numeric `0` (if allowed as a deliberate value) → resolved zero; persisted blank remains unresolved after reload; Residential Live resolved counts/margin exclude unresolved-cost rows.

## Mandatory scope findings

### A. Commercial / Residential isolation — PASS for audited corrective boundary
- Project Calculator remains the authoritative project-mode source.
- `electrical-tools-shell.js` defines Residential-only IDs `res-live`, `res`, `res-takeoff`, hides/disables them under Commercial mode, blocks captured tool-nav clicks, and rebuilds picker options on project-mode changes.
- Residential handoff continues through Project Calculator; no duplicate project-mode overlay was reintroduced in the audited change set.
- Exact-head project-calculator regression coverage verifies first-screen project workflow and Commercial guard wiring.

### B. Historical helper-tax stability — PASS for audited corrective boundary
- Helper economics are revision/effective-date driven.
- `helperCostForDate()` uses the effective revision's own `taxEnabled`/`taxPct`; it does not read the current global helper-tax percentage when calculating an established revision.
- Owner completed-call tax remains snapshot-aware through `taxPctApplied` / stored tax percentage paths.
- Day / Week / Month / Quarter summaries iterate effective helper revisions by date; scheduled helpers can count on zero-call days as intended.
- Exact-head CI includes the Journal regression suite and completed successfully.

### C. PWA v40 → v41 cache invalidation / offline update — PASS
- Current service-worker cache is `bruno-electric-v41`.
- Activation deletes stale owned caches matching `^bruno-electric-v\d+$` except v41, including v40.
- Unrelated caches such as other application cache names are not deleted.
- Install uses `skipWaiting()` and activate uses `clients.claim()`.
- Core shell includes the corrected Project Calculator, Journal, Residential Live modules, Catalog bridge, and Electrical shell dependencies.
- Service-worker tests execute activation behavior against a mixed cache-name set rather than only checking an expected version string.

### D. Residential Live Catalog resolution — PARTIAL PASS; blocked by P1-1
- Exact normalized item-name match is attempted before alias mapping.
- Explicit compatibility aliases are deterministic.
- No generic fuzzy/substring matching was added to the bridge.
- Unsupported rows remain unmatched.
- Alias coverage includes the mandatory established categories: 15A/20A receptacles, 20A GFCI, 20A single-pole breaker, 12/2 Romex, plus 14/2 and wall plate.
- Persisted Customer Price / Your Cost maps are overlaid by the bridge where used, and the canonical job Catalog remains the live source for Residential rendering.
- Quantity × Customer Price and quantity × Your Cost arithmetic in `priceRows()` is structurally correct for resolved numeric inputs.
- **FAIL:** blank/missing Your Cost semantics do not survive the actual Catalog/Margins editing/persistence path; see P1-1.

### E. Confirm & Save → BOM → Job Materials — PASS subject to P1-1 input semantics
- The Catalog bridge wraps `BrunoElectricBOM.prepareReplacement()` so exact/alias resolution is applied at the commit boundary as well as live pricing.
- Alias-resolved generated Job Materials preserve Catalog match metadata and use `yourCost` rather than Customer Price.
- Manual and unrelated generated rows are preserved; replacement removes only rows generated by the same source tag.
- Unmatched/no-cost rows remain reviewable with zero inserted unit cost and `Unresolved` status rather than inventing Customer Price as contractor cost.
- History `confirmAtomic()` prepares next job + archive and uses rollback protection around the pair write.
- Repeated same-source commit replaces prior generated rows rather than duplicating them.

### F. Archive / duplicate / persistence / live repricing — PASS subject to P1-1
- Archive snapshots strip pricing and retain project/design/BOM quantities.
- `hydrate()` recomputes pricing from current Catalog, so archived quantities remain stable while prices are live.
- Duplicate removes frozen pricing and rehydrates against current Catalog.
- Active/archive writes are rollback-protected by `commitPair()`.
- P1-1 remains applicable because a coerced zero Your Cost is treated as a known current Catalog value during repricing.

### G. Calculator / navigation / NEC / data-integrity regression — NO NEW P0/P1 FOUND in audited delta
- Project-first Calculator workflow remains present.
- Residential dependency chain remains input → design/circuit schedule → service/panel → BOM → live Catalog pricing.
- NON-COMPLIANT and major-load/service candidate gating remain in the Residential modules inspected.
- Canonical navigation and responsive shell code remain present; Commercial guard logic is applied to picker/tool-nav paths.
- Shared calculator/phase-3/data-integrity suites are part of the exact-head workflow and did not fail.
- No audited delta changed Quote / Invoice / Summary / Change Order production paths.

## Deterministic tests / CI evidence
GitHub Actions run `35043808738` (`Electrical Calculator Tests`) is tied to exact HEAD `26d5f7140189606277b0f9c28fe87a2e0328c5a5`, PR #13, and completed with conclusion `success`.

The added `tests/residential-catalog-bridge.test.js` verifies alias resolution, exact-over-alias precedence, unmatched fail-closed behavior, persistent map overlay, and alias-resolved Job Materials. It **does not** exercise the actual Catalog/Margins blank-input persistence path, which is why P1-1 can remain despite green CI.

The v41 service-worker test executes the activate handler with stale Bruno caches plus unrelated cache names, confirming the intended owned-cache deletion boundary.

## Final blocker count
- **P0: 0**
- **P1: 1**
  - P1-1 — blank/missing `Your Cost` coerced to numeric zero, causing unknown contractor cost to be treated as resolved and potentially overstating Residential Live/archived material margin.

## Final verdict
**C — REJECT / REWORK REQUIRED**

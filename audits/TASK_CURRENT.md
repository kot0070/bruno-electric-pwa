# CURRENT AUDIT TASK — Residential Live Code & Takeoff Corrective Final Acceptance

MODE: FINAL_ACCEPTANCE_AUDIT
TARGET_BRANCH: main
HEAD_SHA: f85796318596d4ed6b2d373f0de314cb9c6793fe
AUDIT_BRANCH: audit/main-residential-live-f857963
REPORT_PATH: audits/reports/MAIN_RESIDENTIAL_LIVE_CORRECTIVE_f857963.md

## Scope
Independently re-audit the complete Residential Live Code & Takeoff workflow at the exact pinned production HEAD. Do not limit review to the previous blockers or latest commits.

## Mandatory previous-blocker recheck
1. Bathroom/powder receptacle minimum
- no numeric universal 210.52(D) minimum may be derived only from room count;
- bathroom/powder device quantity must remain layout/sink dependent;
- ambiguous powder/toilet rooms must not silently create false code-minimum device/circuit claims.

2. Wall-segment parser
- malformed, blank, negative, non-finite wall tokens must fail closed;
- numeric segments under 2 ft may be explicitly treated as nonqualifying;
- partial geometry must never become a known/compliant minimum after bad tokens are silently discarded.

3. AUTO vs USER override provenance
- AUTO values must rederive after save/reload/duplicate when upstream L0 facts change;
- USER overrides must remain fixed across save/reload/duplicate;
- verify no stale L2→L5 cascade after reuse of a similar-house calculation;
- include deterministic/procedural scenario: save AUTO defaults, reload/duplicate, change room facts, verify design/circuit/BOM/pricing recompute.

4. Atomic Confirm & Save
- Confirm must behave as one logical transition across generated BOM, active estimate and archive;
- inject/inspect failures at each localStorage write boundary;
- no failed Confirm may leave only BOM, only active estimate, or only archive mutated;
- rollback/reconciliation failure must be explicit, not silent.

5. L6 semantics
- L0–L5 recalculate live;
- L6 is affected by edits but must update only on Confirm & Save;
- UI must not claim that ordinary edits already committed L6.

## Full workflow coverage
- code minimums vs estimating assumptions;
- L0–L6 dependency architecture;
- circuits / breaker counts / 15A-#14 / 20A-#12 / cable estimates / panel spaces;
- BOM quantities and same-source replacement without duplicate accumulation;
- Customer Price / Your Cost / unresolved cost / explicit zero / margin semantics;
- Material Calculation Archive stores calculation/BOM, not frozen pricing as source of truth;
- change Catalog customer price and Your Cost, then verify active/archive totals and margin reprice from current Catalog;
- Confirm & Save Active Estimate;
- workspace top Residential materials total uses current Catalog pricing;
- archive / Duplicate / Delete / persistence / stale-state behavior;
- PWA/offline/cache;
- phone / tablet / desktop;
- regression existing calculators / NEC / BOM / pricing / navigation.

## CI
Verify exact-head Electrical Calculator Tests for HEAD_SHA. Green CI is supporting evidence only.

## Output
Write the full report only to REPORT_PATH on AUDIT_BRANCH.
Return in chat only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

Production main/code must not be modified.
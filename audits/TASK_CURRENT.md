# TASK_CURRENT — Residential Live Code & Takeoff Engine Acceptance Audit

MODE: FINAL_ACCEPTANCE_AUDIT

REPOSITORY: kot0070/bruno-electric-pwa
PRODUCTION_BRANCH: main
PRODUCTION_HEAD_SHA: 7279caaf3001ce252121338b6322e36e4c612c9e
AUDIT_BRANCH: audit/main-residential-live-7279caa
REPORT_PATH: audits/reports/MAIN_RESIDENTIAL_LIVE_ACCEPTANCE_7279caa.md

## Scope
Independently audit the complete Residential Live Code & Takeoff workflow now present on production `main` at the exact pinned HEAD. Do not limit review to recently added files or previously known issues.

## Required functional audit
1. Initial project facts:
   - square footage;
   - bedrooms, bathrooms, powder rooms, living, dining, office/study, kitchens, laundry, garage, outdoor;
   - behavior when required facts are blank/zero/invalid.
2. Code-minimum logic:
   - wall-space segment handling and NEC references;
   - bathroom/powder, kitchen, laundry, garage requirements;
   - ensure layout-dependent quantities are not falsely represented as universal code minimums;
   - below-minimum overrides must clearly fail/flag with reference.
3. Live dependency behavior:
   - editing receptacles/lights/switches/general circuit rating/grouping;
   - downstream updates to circuit count, breakers, conductor/cable family, cable footage, panel spaces, BOM, pricing;
   - verify 15A/#14 vs 20A/#12 behavior;
   - verify ordinary receptacle edits do not falsely change dwelling service-load VA.
4. Level/cascade model:
   - L0 Project Facts;
   - L1 Code Minimums;
   - L2 Live Design;
   - L3 Circuits & Conductors;
   - L4 BOM;
   - L5 Pricing;
   - L6 Confirmed Estimate;
   - verify UI/state descriptions match actual dependencies and do not imply unsupported incremental computation.
5. Pricing integration:
   - Catalog exact matching;
   - customer price vs Your Cost;
   - unresolved/unpriced/unmatched handling;
   - gross profit/margin semantics;
   - no silent fallback from missing Your Cost to customer price.
6. Confirm/save workflow:
   - cannot confirm with P1-level/non-compliant conflicts;
   - active estimate snapshot is internally consistent with current live calculation;
   - generated BOM replacement preserves manual and other-source rows;
   - confirmed material totals are reflected correctly in the main workspace top totals without double counting.
7. History/templates:
   - saved calculation history persists;
   - active estimate is distinct from history entries;
   - Duplicate/Load restores a usable copy without corrupting active job state;
   - deletion of history does not accidentally delete active estimate or job materials;
   - similar-house reuse does not retain stale auto/user-edit markers or stale pricing unexpectedly.
8. Persistence/stale-state:
   - reload behavior;
   - localStorage schema compatibility;
   - active estimate/history survival across reload;
   - switching calculations does not persist stale derived values.
9. PWA/offline/cache:
   - v37 shell ownership and stale-cache cleanup;
   - all live/history/workspace modules cached and load offline;
   - no foreign-cache deletion;
   - no stale module ordering/load-order failure.
10. Responsive/navigation regression:
   - phone/tablet/desktop Electrical Tools access;
   - Residential Live Takeoff appears in categorized navigation;
   - main workspace remains functional.
11. Regression audit:
   - existing calculators;
   - NEC/load calculator;
   - legacy Residential Full Takeoff;
   - BOM/pricing;
   - materials persistence;
   - workspace navigation;
   - no unrelated document/print assumptions should be treated as accepted by this audit.

## Evidence requirements
- Verify exact production HEAD `7279caaf3001ce252121338b6322e36e4c612c9e`.
- Verify exact-head Electrical Calculator Tests run #112 is success, but do not treat green CI as sufficient evidence.
- Inspect source and relevant tests independently.
- Report any incorrect NEC/code claim separately from estimating-model limitations.

## Deliverable
Write the full audit report only to:
`audits/reports/MAIN_RESIDENTIAL_LIVE_ACCEPTANCE_7279caa.md`

In chat return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK
# CURRENT AUDIT TASK — Residential Live Same-Tab Repricing Corrective Acceptance

MODE: FINAL_ACCEPTANCE_AUDIT
TARGET_BRANCH: main
HEAD_SHA: ff6977ce325bb9ca39c2ab64d11d061bd0b8da1c
AUDIT_BRANCH: audit/main-residential-live-ff6977c
REPORT_PATH: audits/reports/MAIN_RESIDENTIAL_LIVE_REPRICE_ff6977c.md

## Scope
Independently re-audit the complete Residential Live Code & Takeoff workflow at the exact pinned production HEAD. Do not limit review to the previous blocker.

## Mandatory corrective recheck
1. Same-tab Catalog repricing
- confirm a Catalog customer-price or Your-Cost edit in the same document/tab immediately refreshes the top Residential materials total;
- do not rely on cross-tab `storage`, window focus, reload, or navigation;
- verify the refresh uses current persisted Catalog data and `BrunoResidentialPricing.priceRows(...)`;
- exercise both delegated Catalog input/change path and explicit `bruno:catalog-changed` / `notifyCatalogChanged` hook as applicable;
- verify non-Catalog edits do not spuriously force the Catalog-specific refresh path.

2. Live pricing consistency
- active Residential estimate and Material Calculation Archive must continue to reprice from current Catalog rather than frozen snapshot pricing;
- Customer Price, Your Cost, unresolved-cost and margin semantics must remain correct after same-tab price changes.

3. Previous Residential blockers
Reconfirm:
- bathroom/powder code-minimum semantics;
- fail-closed wall geometry parser;
- AUTO vs USER override provenance after Save/Reload/Duplicate;
- atomic Confirm & Save with fault injection;
- L0–L5 live cascade and L6 commit boundary.

## Full regression coverage
Independently inspect/test:
- circuits / breakers / conductors / cable / panel spaces;
- BOM replacement and no duplicate accumulation;
- Confirm & Save Active Estimate;
- Material Calculation Archive / history / duplicate / delete / persistence;
- workspace top totals and compact header/totals visibility interactions;
- PWA/offline/cache;
- phone/tablet/desktop;
- existing calculators / NEC / pricing / navigation regressions.

## CI
Verify exact-head Electrical Calculator Tests for HEAD_SHA. Green CI is supporting evidence only. Confirm the new same-tab repricing regression test is executed.

## Output
Write the full report only to REPORT_PATH on AUDIT_BRANCH.
Return in chat only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

Production main/code must not be modified.
# CURRENT AUDIT TASK — Compact Header + Contextual Totals Acceptance

MODE: FINAL_ACCEPTANCE_AUDIT
TARGET_BRANCH: main
HEAD_SHA: af05c270fb42e665d22680c6035720396cc75088
AUDIT_BRANCH: audit/main-ui-compact-af05c27
REPORT_PATH: audits/reports/MAIN_UI_COMPACT_af05c27.md

## Scope
Independently audit the compact global header and contextual totals behavior at the exact pinned production HEAD. Do not limit review to happy paths or the implementation summary.

## Required checks
- Top header exposes only three primary controls: Print, Reset, More.
- More contains secondary job/app actions (export/import job, export/import app, new blank job) without losing original functionality or file-input accessibility.
- Print routes correctly to Quote printing by default and T&M Invoice printing when the T&M tab is active; existing compliance/print gates must not be bypassed.
- Reset retains the original reset behavior.
- More opens/closes reliably, closes on outside click/Escape, and does not cover critical controls unexpectedly.
- Large live totals block is shown only on financially relevant estimate/billing tabs and hidden on unrelated tabs such as Company, Catalog, Workers, Dispatch, Reference, Help.
- Workspace navigation that activates hidden legacy tabs must still synchronize totals visibility.
- Mobile totals are materially more compact than the previous two-column large-card presentation while remaining legible.
- Phone/tablet/desktop responsive behavior and bottom/side navigation remain usable.
- PWA/offline cache includes the compact-header module and existing cache cleanup behavior still works.
- Regression: quote/invoice print, import/export, reset, blank job, navigation, totals updates, Residential live workspace total, calculators, BOM, pricing, persistence.
- Verify exact-head Electrical Calculator Tests for HEAD_SHA; green CI is supporting evidence only.

## Output
Write the full report only to REPORT_PATH on AUDIT_BRANCH.
Return in chat only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

Production main/code must not be modified.
MODE=AUDIT_ONLY
TASK=PR_09_UNIFIED_MOBILE_APP_SHELL_FINAL_ACCEPTANCE
REPO=kot0070/bruno-electric-pwa
PR=9
BASE_BRANCH=main
BASE_SHA=b3b23d751b84b5faba6eef78fbe6141e5bae5267
HEAD_BRANCH=feature/unified-mobile-app-shell
HEAD_SHA=29657186d3446e0132950804df5f06266aa6ec10
AUDIT_BRANCH=audit/pr9-2965718
REPORT_PATH=audits/reports/PR_09_FINAL_ACCEPTANCE_2965718.md
PROTOCOL=audits/PROTOCOL.md

SCOPE:
- UX/app-shell/navigation only.
- Calculator formulas, NEC rules, BOM quantity math, pricing math and persistence logic must remain unchanged.

VERIFY:
1. SHA_INTEGRITY
   - main exact BASE_SHA
   - PR #9 exact HEAD_SHA
   - PR open/not merged during audit
2. MOBILE_PRIMARY_NAV
   - exactly 5 primary groups: Job / Estimate / Electrical / Billing / More
   - bottom-nav press opens a section, NOT a floating popup/menu sheet
   - no be-mobile-sheet architecture
   - no be-mobile-backdrop architecture
3. IN_PAGE_SECTION_OPTIONS
   - Job exposes Quote / Summary / Change Orders inline in-page
   - Estimate exposes Job Materials / Catalog / Labor & Equipment / Margins inline in-page
   - Billing exposes T&M Invoice / Profit & Loss inline in-page
   - More exposes Dispatch / Workers / Company / Reference / Help inline in-page
   - active item is visibly synchronized
4. ELECTRICAL_UNIFIED_SHELL
   - pressing Electrical does NOT navigate browser to a separate app page
   - no production `location.href='./electrical-tools.html'` path from primary shell
   - Electrical Tools render inside main Bruno Electric shell
   - primary bottom navigation remains available while Electrical is active
   - embedded Electrical page hides duplicate top-level app chrome
   - embedded mode uses same-origin `electrical-tools.html#embedded`
   - categorized picker remains available for electrical calculators
5. RETURN_FLOW
   - from Electrical, Job/Estimate/Billing/More can be selected directly using same bottom nav
   - no requirement to use browser Back to return to main workspace
6. OVERLAY_SAFETY
   - browser-mode right-side gutter remains for external `Aa`/browser floating control
   - standalone/PWA mode does not receive unnecessary browser gutter
7. DESKTOP_REGRESSION
   - existing grouped desktop/tablet sidebar remains functional
   - Electrical opens unified embedded workspace rather than a disconnected shell
8. NO_DOMAIN_REGRESSION
   - no changes to calculator engines, NEC rules, residential takeoff math, BOM/pricing/persistence modules
   - changed files limited to shell/navigation/tests unless independently justified
9. CI
   - GitHub Actions run for exact HEAD_SHA exists and is completed/success
   - deterministic test job is successful

FAIL_IF:
- bottom nav still opens overlay popup cards
- Electrical navigates away and loses app shell
- any primary section cannot return directly from Electrical
- P0/P1 regression in accepted calculation/data-flow behavior
- SHA drift

OUTPUT_VERDICT_VALUES:
A — ACCEPT
B — ACCEPT AFTER MINOR FIXES
C — REJECT / REWORK REQUIRED

MERGE_RECOMMENDATION:
- A => MERGE PR #9 INTO main
- B/C => DO NOT MERGE PR #9

RETENTION:
- Write full report ONLY to REPORT_PATH on AUDIT_BRANCH.
- Do not overwrite prior reports.
- Do not modify production/dev branches, PR metadata/comments, or merge state.

MODE=FINAL_ACCEPTANCE_AUDIT
REPO=kot0070/bruno-electric-pwa
PR=11
BASE_SHA=16795ea1b802f348ed693d7b789489136b4132a0
HEAD_SHA=98be9adda70f33c0f838b2b412c069055c8e8b39
REPORT_PATH=audits/reports/PR_11_UNIVERSAL_RESPONSIVE_SHELL_98be9ad.md

MUST_NOT:
- WRITE_PRODUCTION_CODE
- EDIT_PR
- COMMENT_ON_PR
- MERGE
- CHANGE_TARGET_BRANCH

VERIFY:
- EXACT_BASE_SHA=true
- EXACT_HEAD_SHA=true
- PR_OPEN=true
- CI_EXACT_HEAD_SUCCESS=true
- CANONICAL_NAV_MODEL=single shared source for Job|Estimate|Electrical|Billing|More
- WORKSPACE_CONSUMES_SHARED_NAV=true
- ELECTRICAL_TOOLS_CONSUMES_SHARED_NAV=true
- PHONE_LT_768=bottom 5-item nav + in-page section choices
- TABLET_768_1199=92px compact primary rail + section choices/tool picker
- DESKTOP_GTE_1200=244px expanded primary sidebar + subitems
- ELECTRICAL_FIRST_CLASS_PAGE=true
- ELECTRICAL_IFRAME_PATH=false
- CROSS_PAGE_GROUP_RESTORE=true
- CROSS_PAGE_EXACT_TAB_RESTORE=true
- ELECTRICAL_DESKTOP_SECONDARY_TOOL_NAV=true
- ELECTRICAL_TABLET_COMPACT_TOOL_PICKER=true
- LEGACY_LONG_PRIMARY_NAV_HIDDEN=true
- MOBILE_BROWSER_OVERLAY_GUTTER_PRESERVED=true
- CACHE=bruno-electric-v34
- CACHE_OWNERSHIP_ISOLATION=true
- SHARED_NAV_CACHED=true
- NO_CALCULATOR_MATH_CHANGE=true
- NO_NEC_LOGIC_CHANGE=true
- NO_BOM_PRICING_PERSISTENCE_CHANGE=true

RESPONSIVE_ARCHITECTURE_EXPECTATION:
- Information architecture must not change by device class.
- Only navigation presentation may change by viewport.
- Phone, tablet and desktop must expose the same five primary sections.
- Electrical must feel like the same Bruno Electric product on all viewports.

OUTPUT:
- Full evidence report -> REPORT_PATH on this audit branch only.
- Chat response only: VERDICT, AUDITED HEAD SHA, BLOCKERS, REPORT LINK.

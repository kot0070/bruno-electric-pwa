# TASK_CURRENT — PR #8 FINAL ACCEPTANCE

TASK_ID=BRUNO_ELECTRIC_PR08_MOBILE_OVERLAY_IA_FINAL
MODE=INDEPENDENT_ACCEPTANCE_AUDIT
PROTOCOL=audits/PROTOCOL.md

REPO=kot0070/bruno-electric-pwa
PR=8
TARGET_BASE_BRANCH=main
TARGET_BASE_SHA=83ddc80247e0e5d89ff7e152b541bcb797f03d98
TARGET_HEAD_BRANCH=feature/mobile-overlay-ia-hardening
TARGET_HEAD_SHA=64fecc2d768c725c667c8f8edfc31bbdaa40121e
AUDIT_BRANCH=audit/pr8-64fecc2
TASK_PATH=audits/TASK_CURRENT.md
REPORT_PATH=audits/reports/PR_08_FINAL_ACCEPTANCE_64fecc2.md

WRITE_ALLOWLIST:
- audit/pr8-64fecc2:audits/reports/PR_08_FINAL_ACCEPTANCE_64fecc2.md

WRITE_DENYLIST:
- main
- feature/mobile-overlay-ia-hardening
- production files
- tests
- PR metadata/comments/reviews/labels
- merge
- workflow mutation
- audits/PROTOCOL.md
- audits/TASK_CURRENT.md

TARGET_DRIFT_POLICY=STOP

## OBJECTIVE

Independently determine whether PR #8 is production-ready as a UX / information-architecture hardening change.
No calculator math, NEC rules, BOM quantities, pricing formulas, or persistence semantics are intended to change.

PRIMARY_ARCHITECTURE:
MAIN_WORKSPACE -> 5 PRIMARY GROUPS -> ELECTRICAL -> ELECTRICAL TOOLS -> CATEGORY -> TOOL

EXPECTED_PRIMARY_GROUPS:
- Job
- Estimate
- Electrical
- Billing
- More

EXPECTED_ELECTRICAL_TOOL_CATEGORIES:
- Core Calculators
- Residential
- Equipment & Distribution
- Catalog & Reference

## MUST_VERIFY

### A. SHA / DIFF INTEGRITY
A1 PR=8, open, not merged.
A2 base SHA exact TARGET_BASE_SHA.
A3 head SHA exact TARGET_HEAD_SHA.
A4 compare base->head is ahead-only / no unexpected base drift.
A5 changed-file scope is UX/IA/PWA/tests only.
A6 no calculator engine, NEC rule engine, BOM quantity engine, pricing engine, or persistence engine production changes.

Expected changed files:
- electric-workspace.js
- electrical-tools-shell.js
- electrical-tools.html
- sw.js
- tests/data-integrity.test.js
- tests/service-worker.test.js

### B. MAIN MOBILE NAVIGATION
B1 viewport <768px hides legacy #nav-tabs as primary navigation.
B2 exactly 5 primary mobile destinations: Job / Estimate / Electrical / Billing / More.
B3 Job contents: Quote / Summary / Change Orders.
B4 Estimate contents: Job Materials / Catalog / Labor & Equipment / Margins.
B5 Electrical goes directly to electrical-tools.html.
B6 Billing contents: T&M Invoice / Profit & Loss.
B7 More contents: Dispatch / Workers / Company / Reference / Help.
B8 active state synchronizes with current legacy panel.
B9 navigation is keyboard/button semantic enough for mobile web app use.
B10 bottom bar remains fixed and content padding prevents app content from being obscured.

### C. BROWSER OVERLAY SAFETY
C1 distinguish browser mode from installed standalone PWA mode.
C2 browser mode reserves a right-side interaction gutter for floating browser controls.
C3 More remains reachable/tappable even when a browser floating control occupies the lower-right area similar to supplied Android Aa overlay.
C4 standalone/PWA mode does not retain unnecessary asymmetric browser gutter.
C5 safe-area inset behavior remains correct.
C6 mitigation does not make another primary destination unreachable or materially too narrow.

### D. ELECTRICAL TOOLS INFORMATION ARCHITECTURE
D1 mobile Electrical Tools no longer depends on horizontal scrolling as primary discovery mechanism.
D2 mobile has a compact visible tool picker/control.
D3 categories are exactly or materially equivalent to:
   - Core Calculators
   - Residential
   - Equipment & Distribution
   - Catalog & Reference
D4 Core contains Conductor/Ampacity, Voltage Drop, Conduit Fill, Box Fill.
D5 Residential contains Residential Estimator and Residential Full Takeoff.
D6 Equipment & Distribution contains EVSE, HVAC MCA/MOCP, Motor, Grounding, Feeder.
D7 Catalog & Reference contains Electrical Catalog and Code References.
D8 every existing tool remains reachable.
D9 selecting a tool activates the correct existing tool panel and updates picker state.
D10 current active tool is discoverable without inspecting hidden state.
D11 Job workspace remains one-tap reachable.
D12 desktop/tablet existing sidebar remains intact and mobile picker does not duplicate desktop controls.

### E. ARCHITECTURE CLARITY
E1 user can explain hierarchy as:
   Job/Estimate/Electrical/Billing/More -> Electrical -> category -> calculator.
E2 Residential Full Takeoff is discoverable without horizontal swipe guessing.
E3 no important feature is orphaned or represented in two conflicting primary groups.
E4 labels are short enough for mobile and semantically appropriate for electrician workflow.
E5 Electrical vs Estimate boundary is understandable:
   Estimate = commercial/job costing workspace;
   Electrical = engineering/calculator/code tools.
E6 Reference placement does not create a destructive ambiguity between workspace Reference and Electrical Code References; report if naming should be clarified.

### F. PWA / CACHE
F1 CACHE=bruno-electric-v31.
F2 electrical-tools-shell.js is in CORE_SHELL.
F3 stale owned Bruno Electric caches are deleted.
F4 unrelated caches remain untouched.
F5 service worker update does not break offline shell install.

### G. REGRESSION / CI
G1 exact-head Actions run #61 exists.
G2 run #61 completed success on TARGET_HEAD_SHA / PR merge ref corresponding to exact base+head.
G3 deterministic log reports 408/408 passed if logs available.
G4 accepted PR #7 navigation remains functionally present.
G5 no Full Takeoff math/data-flow changes introduced.
G6 no regression in desktop/tablet navigation.

## REQUIRED ADVERSARIAL CHECKS

R1 Simulate/inspect a ~360-430px mobile viewport: all 5 primary destinations remain practically tappable.
R2 Inspect rightmost More hit-area relative to browser gutter; do not accept merely visual spacing if hit area remains under overlay zone.
R3 Verify overlay gutter is conditional on browser mode and not always applied.
R4 Confirm Electrical Tools picker is populated after all dynamic Phase 2/3/Takeoff nav buttons are added, not only initial Phase 1 tools.
R5 Confirm dynamically added tools remain selectable through picker after initialization timing.
R6 Verify picker does not hide the actual desktop sidebar on >=901px layout.
R7 Verify no duplicate IDs / event-handler conflicts caused by the added shell.

## OUT_OF_SCOPE

Unless changed by PR #8, do NOT reopen:
- NEC technical correctness accepted in earlier phases
- Residential Full Takeoff formulas
- Customer Price / Your Cost math
- persistence fixes accepted in PR #7
- Phase 1/2/3 engine semantics

If PR #8 unexpectedly modifies any of these, scope expands only to the modified area and finding must state why.

## VERDICT

Use exactly one:
A — ACCEPT
B — ACCEPT AFTER MINOR FIXES
C — REJECT / REWORK REQUIRED
TARGET_DRIFT

Acceptance rule:
A requires zero P0 and zero required P1.

## REPORT_SCHEMA

Write full report to exact REPORT_PATH with sections:
- TASK_ID
- AUDITED_BASE_SHA
- AUDITED_HEAD_SHA
- EXECUTIVE_VERDICT
- SHA_DIFF_INTEGRITY
- MAIN_MOBILE_NAV
- BROWSER_OVERLAY_SAFETY
- ELECTRICAL_TOOLS_IA
- ARCHITECTURE_CLARITY
- PWA_CACHE
- CI_REGRESSION
- P0_FINDINGS
- P1_FINDINGS
- P2_INFO
- FINAL_VERDICT
- FINAL_RECOMMENDATION
- REPOSITORY_MUTATION_STATEMENT

FINAL_RECOMMENDATION exactly one:
- MERGE PR #8 INTO main
- MERGE PR #8 AFTER MINOR FIXES
- DO NOT MERGE PR #8
- STOP — TARGET DRIFT

REPOSITORY_MUTATION_STATEMENT expected:
Only REPORT_PATH created on AUDIT_BRANCH; target PR/production refs unchanged.

## CHAT_RETURN

Return ONLY:
VERDICT=<verdict>
AUDITED_HEAD_SHA=<sha>
BLOCKERS=<none | compact blockers>
REPORT=<GitHub link>

END_TASK

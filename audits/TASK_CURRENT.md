# TASK_CURRENT

MODE=FINAL_ACCEPTANCE_AUDIT
REPO=kot0070/bruno-electric-pwa
PR=10
BASE_BRANCH=main
BASE_SHA=b43c6c688c0979470f88ae28b1dc280123a7ace2
HEAD_SHA=8fdbb92a71460d5685ad0618dad72915c80d1a37
AUDIT_BRANCH=audit/pr10-8fdbb92
REPORT_PATH=audits/reports/PR_10_REWORK_FINAL_ACCEPTANCE_8fdbb92.md

CONTEXT:
- Prior head 569b168... was rejected because it relied on `frame-ancestors 'self'` in CSP meta, which is not an enforceable ancestor policy.
- Final rework no longer uses iframe embedding as the accepted user navigation path.
- Electrical Tools is a first-class Bruno Electric section/page with the same primary mobile navigation shell.

MUST_NOT:
- WRITE_PRODUCTION_CODE
- MODIFY_PR
- COMMENT_PR
- MERGE
- CHANGE_TARGET_BRANCH

VERIFY:
1. SHA_INTEGRITY
   - PR base exactly BASE_SHA.
   - PR head exactly HEAD_SHA.

2. MOBILE_WORKBAR
   - `.be-workbar` and its buttons use Bruno dark-theme styling on mobile.
   - browser-default white button appearance is explicitly neutralized.

3. ELECTRICAL_PRIMARY_ROUTE
   - Normal user Electrical interactions from bottom nav, desktop side nav, and workbar route to `./electrical-tools.html` via the navigation bridge.
   - capture/interception prevents the older iframe handler from winning for those user interactions.
   - accepted user path does not depend on loading Electrical Tools in an iframe.

4. ELECTRICAL_APP_SHELL
   - Electrical Tools loads normally as a section page.
   - Mobile page provides exactly the same five primary groups: Job / Estimate / Electrical / Billing / More.
   - Electrical is active/current there.
   - Job / Estimate / Billing / More route back to corresponding `index.html#be=...` section.
   - main workspace restores JOB / ESTIMATE / BILLING / MORE from those hash routes.
   - no popup-sheet primary navigation is reintroduced.

5. CSP_CORRECTION
   - `electrical-tools.html` contains no `frame-ancestors` directive in CSP meta.
   - No source/PR behavior claims foreign-frame blocking through CSP meta.
   - HTTP-level frame-ancestor protection is NOT a requirement of this task because iframe embedding is no longer the accepted navigation architecture.

6. PWA
   - CACHE exactly `bruno-electric-v33`.
   - `electric-navigation-bridge.js` belongs to CORE_SHELL.
   - stale `bruno-electric-vN` caches are deleted, current v33 retained, unrelated caches untouched.

7. TESTS / REGRESSION
   - navigation-shell regression tests are executed by `tests/run-node.js`.
   - tests cover route interception, five-section Electrical shell, return routes, and removal of ineffective frame-ancestors meta claim.
   - no calculator formulas changed.
   - no NEC logic changed.
   - no BOM/pricing/persistence semantics changed.

8. CI
   - workflow `Electrical Calculator Tests` run #70 must belong to exact HEAD_SHA and be completed/success.

REPORT:
- Include exact audited base/head.
- Include PASS/FAIL per VERIFY item.
- Include P0/P1/P2 findings.
- Final recommendation exactly one of:
  - `MERGE PR #10 INTO main`
  - `DO NOT MERGE PR #10`
- Save report ONLY at REPORT_PATH on AUDIT_BRANCH.

# TASK_CURRENT

MODE=FINAL_ACCEPTANCE_AUDIT
REPO=kot0070/bruno-electric-pwa
PR=10
BASE_BRANCH=main
BASE_SHA=b43c6c688c0979470f88ae28b1dc280123a7ace2
HEAD_SHA=221907fb4a26e5b0752ef03c744c00a1a98e45a4
AUDIT_BRANCH=audit/pr10-221907f
REPORT_PATH=audits/reports/PR_10_REWORK_FINAL_ACCEPTANCE_221907f.md

CONTEXT:
- Prior audited head 569b168... was rejected because it claimed `frame-ancestors 'self'` through CSP meta, which browsers do not enforce.
- Rework intentionally abandons iframe-dependent user navigation.
- Electrical Tools is now a first-class Bruno Electric section/page with the same primary mobile navigation shell.
- Do NOT require same-origin frame-ancestor enforcement; the normal user path must not depend on iframe embedding.

MUST_NOT:
- WRITE_PRODUCTION_CODE
- MODIFY_PR
- COMMENT_PR
- MERGE
- CHANGE_TARGET_BRANCH

VERIFY:
1. SHA_INTEGRITY:
   - PR base exactly BASE_SHA.
   - PR head exactly HEAD_SHA.

2. MOBILE_WORKBAR:
   - `.be-workbar` and buttons render with Bruno dark-theme styles on mobile.
   - Browser-default white button styling is explicitly neutralized.

3. ELECTRICAL_PRIMARY_ROUTE:
   - Normal user Electrical navigation from bottom nav, desktop side nav, and workbar is intercepted/routed to `./electrical-tools.html`.
   - This path does NOT depend on loading `electrical-tools.html` inside an iframe.
   - Verify capture/interception ordering is sufficient to prevent the older iframe handler from winning on those user interactions.

4. ELECTRICAL_APP_SHELL:
   - `electrical-tools.html` loads the Electrical tools UI normally.
   - Mobile page exposes the same five primary sections: Job / Estimate / Electrical / Billing / More.
   - Electrical is active/current on that page.
   - Job / Estimate / Billing / More return to the corresponding requested section in `index.html`.
   - Main workspace recognizes the `#be=JOB|ESTIMATE|BILLING|MORE` return routes and opens the requested group.
   - No popup sheet architecture is introduced.

5. CSP_CORRECTION:
   - `electrical-tools.html` does not claim `frame-ancestors` enforcement in CSP meta.
   - Do not require HTTP-level frame-ancestor protection in this task; iframe embedding is not the accepted navigation architecture.
   - Flag any misleading claim that foreign framing is blocked if one remains.

6. PWA:
   - cache is exactly `bruno-electric-v33`.
   - `electric-navigation-bridge.js` is in CORE_SHELL.
   - stale Bruno Electric caches are deleted while unrelated caches remain untouched.

7. REGRESSION:
   - no calculator formula changes.
   - no NEC logic changes.
   - no BOM/pricing/persistence semantic changes.
   - regression tests reflect the standalone Electrical section architecture rather than the rejected iframe/CSP-meta requirement.

8. CI:
   - exact HEAD workflow must complete successfully.

REPORT:
- Include exact audited base/head.
- Include PASS/FAIL per VERIFY item.
- Include P0/P1/P2 findings.
- Final recommendation must be either `MERGE PR #10 INTO main` or `DO NOT MERGE PR #10`.
- Save report ONLY at REPORT_PATH on AUDIT_BRANCH.

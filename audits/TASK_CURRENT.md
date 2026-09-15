MODE=FINAL_ACCEPTANCE_AUDIT
REPO=kot0070/bruno-electric-pwa
PR=10
BASE_SHA=b43c6c688c0979470f88ae28b1dc280123a7ace2
HEAD_SHA=569b168f7473b383ccd9eb6005d454cdb3d4fc3e
AUDIT_BRANCH=audit/pr10-569b168
REPORT_PATH=audits/reports/PR_10_FINAL_ACCEPTANCE_569b168.md

SCOPE:
- Mobile `.be-workbar` must render as Bruno Electric dark UI, not browser-default white controls.
- Electrical workspace must embed successfully inside the same Bruno Electric origin.
- CSP must allow only same-origin ancestors for this embed, not arbitrary foreign embedding.
- PWA cache must advance to v32 and stale Bruno Electric caches must be isolated/deleted safely.
- Calculator formulas, NEC logic, BOM math, pricing, persistence behavior must remain unchanged.

VERIFY:
1. EXACT_BASE_SHA=true
2. EXACT_HEAD_SHA=true
3. PR_OPEN=true
4. MOBILE_WORKBAR_DARK_STYLE=true
5. MOBILE_WORKBAR_BUTTON_TEXT_READABLE=true
6. ELECTRICAL_IFRAME_SRC=./electrical-tools.html#embedded
7. ELECTRICAL_CSP_FRAME_ANCESTORS_SELF=true
8. ELECTRICAL_CSP_FRAME_ANCESTORS_NONE=false
9. FOREIGN_FRAME_ANCESTORS_NOT_ALLOWED=true
10. EMBEDDED_TOOLS_SHELL_STILL_PRESENT=true
11. CACHE=bruno-electric-v32
12. CACHE_CLEANUP_ONLY_OWNED=true
13. REGRESSION_TESTS_COVER_WORKBAR=true
14. REGRESSION_TESTS_COVER_CSP=true
15. CI_EXACT_HEAD_SUCCESS=true
16. NO_CALCULATOR_MATH_CHANGE=true
17. NO_NEC_LOGIC_CHANGE=true
18. NO_BOM_PRICING_PERSISTENCE_CHANGE=true

P0:
- Security regression enabling foreign framing.
- Broken Electrical workspace.
- Production navigation unusable.

P1:
- Mobile workbar still visually unreadable/default-white.
- Same-origin embed still blocked.
- Cache update cannot reliably deliver corrected shell.

OUTPUT:
VERDICT=A|B|C
AUDITED_HEAD_SHA=<sha>
BLOCKERS=<none|compact list>
REPORT_LINK=<github link>

FINAL_RECOMMENDATION:
- MERGE PR #10 INTO main
or
- DO NOT MERGE PR #10

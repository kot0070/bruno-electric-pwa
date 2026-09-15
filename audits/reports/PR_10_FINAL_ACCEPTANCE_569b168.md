# PR #10 — Final Acceptance Audit

- Mode: `FINAL_ACCEPTANCE_AUDIT` / `AUDIT_ONLY`
- Repository: `kot0070/bruno-electric-pwa`
- PR: #10
- Required base SHA: `b43c6c688c0979470f88ae28b1dc280123a7ace2`
- Required head SHA: `569b168f7473b383ccd9eb6005d454cdb3d4fc3e`
- Audited head SHA: `569b168f7473b383ccd9eb6005d454cdb3d4fc3e`
- Verdict: **C — REJECT / REWORK REQUIRED**
- Final recommendation: **DO NOT MERGE PR #10**

## SHA integrity / PR state

| Check | Result | Evidence |
|---|---|---|
| EXACT_BASE_SHA | PASS | PR #10 base SHA is exactly `b43c6c688c0979470f88ae28b1dc280123a7ace2`. |
| EXACT_HEAD_SHA | PASS | PR #10 head SHA is exactly `569b168f7473b383ccd9eb6005d454cdb3d4fc3e`. |
| PR_OPEN | PASS | PR #10 is open, unmerged, non-draft. |

PR: https://github.com/kot0070/bruno-electric-pwa/pull/10

## Scope verification

| Requirement | Result | Audit evidence |
|---|---|---|
| MOBILE_WORKBAR_DARK_STYLE | PASS | `electric-workspace.js` adds mobile `.be-workbar` styling with `background:var(--bg-elev)` and button `background:var(--bg-card); color:var(--text)`. |
| MOBILE_WORKBAR_BUTTON_TEXT_READABLE | PASS | Mobile buttons explicitly use `color:var(--text)` on `var(--bg-card)` and reset native appearance with `appearance:none`. |
| ELECTRICAL_IFRAME_SRC=`./electrical-tools.html#embedded` | PASS | `ensureElectricalPanel()` creates the iframe with exactly that same-origin relative source. |
| ELECTRICAL_CSP_FRAME_ANCESTORS_SELF | **FAIL (semantic enforcement)** | The HTML text contains `frame-ancestors 'self'`, but it is delivered inside `<meta http-equiv="Content-Security-Policy">`. `frame-ancestors` is not supported in the `<meta>` element, so the browser does not enforce this ancestor restriction. |
| ELECTRICAL_CSP_FRAME_ANCESTORS_NONE=false | PASS (textual) | The old `'none'` token is absent from the page CSP string. |
| FOREIGN_FRAME_ANCESTORS_NOT_ALLOWED | **FAIL / BLOCKER** | Because `frame-ancestors` in a CSP meta element is ignored, the current implementation does not enforce same-origin-only framing. `default-src 'none'` does not substitute for `frame-ancestors`. Foreign origins therefore are not blocked by this CSP mechanism. |
| EMBEDDED_TOOLS_SHELL_STILL_PRESENT | PASS | Unified shell still creates `panel-electrical-workspace`, same-origin iframe, embedded hash mode, load handler, sizing, and embedded styling. |
| CACHE=`bruno-electric-v32` | PASS | `sw.js` declares `const CACHE = 'bruno-electric-v32'`. |
| CACHE_CLEANUP_ONLY_OWNED | PASS | Cleanup uses `^bruno-electric-v\d+$` and excludes current cache before deletion; regression test includes foreign/non-owned cache names and expects them retained. |
| REGRESSION_TESTS_COVER_WORKBAR | PASS | `tests/data-integrity.test.js` asserts the mobile workbar reset and dark colors. |
| REGRESSION_TESTS_COVER_CSP | **PARTIAL / INSUFFICIENT** | The added test only searches the HTML string for `frame-ancestors 'self'` and absence of `'none'`. It does not test whether browser CSP delivery/enforcement is valid. This test therefore passes while the required security property fails. |
| CI_EXACT_HEAD_SUCCESS | PASS | GitHub Actions workflow `Electrical Calculator Tests`, run #63, completed successfully for exact head `569b168f7473b383ccd9eb6005d454cdb3d4fc3e`. |
| NO_CALCULATOR_MATH_CHANGE | PASS | PR diff changes only `electric-workspace.js`, `electrical-tools.html`, `sw.js`, and two test files; calculator implementation files are untouched. |
| NO_NEC_LOGIC_CHANGE | PASS | No NEC/rules implementation file is changed by PR #10. |
| NO_BOM_PRICING_PERSISTENCE_CHANGE | PASS | No BOM, pricing, residential calculation, or persistence implementation file is changed by PR #10. |

## Blocking finding

### P0 — Required same-origin framing restriction is not enforced

`electrical-tools.html` currently declares:

```html
<meta http-equiv="Content-Security-Policy" content="...; frame-ancestors 'self'">
```

This does **not** implement the stated security requirement. The `frame-ancestors` directive must be delivered in a `Content-Security-Policy` HTTP response header; it is not supported in a CSP `<meta>` element.

Authoritative reference: MDN, **Content-Security-Policy: frame-ancestors directive** — “This directive is not supported in the `<meta>` element.”

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors

MDN also documents that `frame-ancestors` has no `default-src` fallback. Therefore the existing `default-src 'none'` does not prevent arbitrary ancestors from framing this document.

Impact:
- Same-origin embedding can work, because the ineffective meta directive does not block it.
- The required foreign-origin framing prohibition is not actually enforced.
- The new regression test validates only source text, not browser security behavior, producing a false-positive acceptance signal.

This is a release blocker because the audit scope explicitly requires same-origin-only embedding and `FOREIGN_FRAME_ANCESTORS_NOT_ALLOWED=true`.

## Regression / CI assessment

The deterministic suite is wired through `tests/run-node.js`, including `data-integrity.test.js` and `service-worker.test.js`. GitHub Actions on the exact audited head completed successfully. The suite provides useful regression protection for workbar source styling, cache version/ownership cleanup, and unchanged calculator logic; however, it cannot establish the CSP ancestor-enforcement requirement because the current CSP test is textual rather than browser/header semantic validation.

## Findings summary

- **P0:** Same-origin-only framing security requirement is not enforced because `frame-ancestors 'self'` is supplied via CSP `<meta>`, where browsers do not support that directive.
- **P1:** none beyond the P0 blocker.
- **P2:** CSP regression test should validate effective delivery/enforcement rather than only string presence, so this class of false-positive cannot recur.

## Final verdict

**VERDICT: C — REJECT / REWORK REQUIRED**

All audited mobile workbar, same-origin iframe wiring, cache-v32, owned-cache cleanup, and no-math/no-NEC/no-BOM-pricing-persistence-change checks pass. Exact-head CI also passes. Nevertheless, the mandatory foreign-framing security invariant fails in the actual browser security model.

**FINAL RECOMMENDATION: DO NOT MERGE PR #10** until framing protection is delivered through an enforcement mechanism browsers actually honor and regression coverage verifies that effective behavior.

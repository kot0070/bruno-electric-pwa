# Electrical Tasks Master — Stage 0 Previous Audit / Corrective Closure

STATUS: IMPLEMENTATION_CLOSURE_COMPLETE / AUDIT_PENDING
BASELINE_MERGE: `20b7ba172029a257a3178783fcdd0e97ae7923b6`
MASTER_PLAN_COMMIT: `800e0914e77690fff743f8a429959ffe855ef0e2`
CURRENT_BRANCH: `main`

## Purpose
Verify that the previously accepted workflow, persistence, pricing and electrical-math corrections are actually present on current `main` before Electrical Tasks development begins.

## Closure matrix

| Previous finding / contract | Current runtime evidence | Current regression evidence | Status |
|---|---|---|---|
| Calculator -> Job deep-link restore | `electric-navigation-bridge.js` parses `#be` / `tab` and restores the requested primary/tab target | `tests/navigation-deeplink.test.js`, workflow suite | PASS |
| Residential archive must be Job-owned | `electric-residential-history-job-scope.js` stores authoritative archive in `bruno-electric-v1.residentialLiveArchive`; legacy global library is recovery-only | `tests/residential-history-job-scope.test.js` | PASS |
| Save Calculation != Apply to Job | job-scoped history `confirmAtomic()` verifies Job Materials are unchanged by save; apply path is separate in `electric-residential-apply-job.js` | `tests/residential-apply-job.test.js`, `tests/residential-save-archive-ux.test.js` | PASS |
| Applied calculation provenance | `electric-residential-apply-job.js` persists applied calculation metadata/source identity | `tests/residential-apply-job.test.js` | PASS |
| Approved Quote immutable snapshot | `electric-quote-lifecycle.js` persists `quoteLifecycle.approved` revisions and `invoiceBasis()` reads the approved snapshot | `tests/quote-lifecycle.test.js` | PASS |
| Fixed-price Invoice must not read moving live totals | `electric-fixed-price-invoice.js` consumes `BrunoQuoteLifecycle.invoiceBasis()` / approved snapshot | `tests/fixed-price-invoice.test.js` | PASS |
| Custom / Special-order materials | `electric-custom-materials.js` is present on main and remains project/Job-scoped | `tests/custom-materials.test.js` | PASS |
| Custom Qty persistence / row-specific add semantics | Custom runtime persists Qty and uses row-specific saved/add quantity semantics | `tests/custom-materials.test.js` | PASS |
| Blank / zero / positive Your Cost distinction | Custom and BOM paths keep unresolved blank outside numeric contractor-cost math; explicit zero remains resolved zero | `tests/custom-materials.test.js`, BOM/data-integrity tests | PASS |
| Custom Job isolation | no device-global canonical custom registry is authoritative; runtime is scoped through active Job state | `tests/custom-materials.test.js` | PASS |
| Negative pricing/T&M values must fail closed | `electric-pricing-domain-guard.js` validates material, labor/equipment, T&M and Method A domains; signed Change Orders remain separate | `tests/pricing-domain-guard.test.js` | PASS |
| Quote approval must honor pricing domain guard | Quote lifecycle calls `BrunoPricingDomainGuard.assertValid()` before approval; bootstrap order guard -> quote -> fixed Invoice is enforced | `tests/workflow-final-integration.test.js` | PASS |
| Electrical blank/falsy coercion corrected | `electric-calculators.js` strict required-number helpers reject blank/missing required inputs and validate supported domains | `tests/electrical-calculators.test.js`, `tests/math-corrective-boundaries.test.js` | PASS |
| Voltage-drop physics corrected | resistance-only K-method no longer multiplies I×R by PF; method and PF semantics are disclosed | calculator tests / math corrective suite | PASS |
| Residential 2026 §120.13 branch-circuit floor | `electric-residential-live.js` separately computes 3 VA/ft² branch-circuit floor and takes max(code floor, Bruno grouping) | `tests/residential-live.test.js`, math corrective boundaries | PASS |
| PWA / cache integration | `sw.js` v52 includes corrective runtimes in core shell; bootstrap includes pricing guard and workflow modules | service-worker + final-integration tests | PASS |
| Exact tested-head provenance | GitHub Actions push run #347 checked out and verified SHA `800e0914e77690fff743f8a429959ffe855ef0e2` exactly | provenance step PASS | PASS |
| Accepted baseline deterministic suite | run #347 executed current main after merge + master-plan commit | `622/622 passed` | PASS |

## Stage 0 implementation conclusion
No previously accepted P0/P1 correction is missing from current main runtime/test tree. Stage 0 implementation closure is complete.

## Mandatory next gate
1. Commit this closure report.
2. Run exact-main-head CI on the documentation-inclusive Stage 0 SHA.
3. Create a separate exact-SHA Stage 0 audit branch.
4. Independently verify the closure matrix and previous critical paths.
5. Only an audit verdict with 0 P0/P1 may unlock Stage 1.

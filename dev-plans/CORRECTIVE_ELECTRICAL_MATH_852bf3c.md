# Bruno Electric — Electrical Math Corrective Master

Source audit: `audits/reports/ELECTRICAL_MATH_852bf3c.md`  
Source audited SHA: `852bf3c88a4f0fc75584b24aa8e68f277e16342e`  
Execution: STRICT SEQUENTIAL  
Do not merge PR #14 until a new independent math re-audit accepts the corrected frozen SHA.

## MASTER STATUS
`CURRENT_STAGE = FINAL_REAUDIT_GATE`

Rules:
- DO NOT ADVANCE past a stage until implementation + deterministic regression gate is GREEN.
- After every completed stage, reread this file before starting the next stage.
- Final candidate must include developer report and then pass exact-head CI on that documentation-inclusive SHA.
- After freeze, do not touch dev candidate until math re-audit finishes.

## M1 — Strict required electrical-input semantics — DONE
Fix blank/null/falsy coercion in code-facing calculators. Required numeric inputs must reject blank/missing/malformed. Optional defaults apply only to omitted/null values explicitly designated optional. Reject ambient below supported range.

Evidence: implemented in `electric-calculators.js`; adversarial regressions in `tests/electrical-calculators.test.js`.

## M2 — Voltage-drop physics — DONE
Remove the physically invalid `× powerFactor` term from the resistance-only K-method. Keep K-method explicitly labeled as resistive estimating approximation. PF may be accepted only as informational/backward-compatible input and must not reduce calculated K-only drop.

Evidence: `RESISTANCE_ONLY_K` contract + PF adversarial regression coverage.

## M3 — 2026 NEC dwelling branch-circuit minimum — DONE
Implement §120.13 floor-area branch-circuit minimum using 3 VA/ft². For selected 15A/20A general circuits, modeled general-circuit count must be at least `ceil((sqft × 3 / 120) / circuitAmps)`. Keep receptacle grouping as an additional Bruno design basis and expose both bases.

Evidence: `electric-residential-live.js`, rules provenance, 1000/2000 ft² and grouping/code-floor regression cases.

## M4 — Pricing/T&M domain guard — DONE
Add runtime fail-closed validation for nonnegative estimating quantities/rates/hours/costs and Method A domains (`OH >= 0`, `0 <= profit < 1`). Negative signed Change Orders remain allowed as explicit credits. Invalid persisted/imported state must block quote/invoice/summary trust rather than silently lower totals.

Evidence: `electric-pricing-domain-guard.js`, ordered bootstrap `Guard → Quote → Fixed Invoice`, programmatic Quote assertion, `tests/pricing-domain-guard.test.js`.

## Final implementation gate — GREEN
- deterministic adversarial tests for all four P1 families: DONE;
- PWA cache `v52` and new guard runtime in core shell: DONE;
- expanded boundary coverage restores/increases suite size: DONE;
- implementation-head exact PR-head CI #343: **622/622 PASS** at `80b7a0deddcb7cecc782a42291449cd5e4f71487`;
- developer report: `dev-reports/ELECTRICAL_MATH_V52_CORRECTIVE.md`: DONE.

## Final re-audit gate — IN PROGRESS
1. Freeze the documentation-inclusive SHA.
2. Require exact-head CI GREEN on that exact SHA.
3. Create a new independent audit branch pinned to the frozen SHA.
4. Re-audit all four original P1 families plus shared math/pricing regressions.
5. ACCEPT only with no P0/P1.
6. Do not merge PR #14 as part of this master unless user explicitly commands merge.

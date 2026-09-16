# Bruno Electric — Electrical Math Corrective Master

Source audit: `audits/reports/ELECTRICAL_MATH_852bf3c.md`  
Source audited SHA: `852bf3c88a4f0fc75584b24aa8e68f277e16342e`  
Execution: STRICT SEQUENTIAL  
Do not merge PR #14 until a new independent math re-audit accepts the corrected frozen SHA.

## M1 — Strict required electrical-input semantics
Fix blank/null/falsy coercion in code-facing calculators. Required numeric inputs must reject blank/missing/malformed. Optional defaults apply only to omitted/null values explicitly designated optional. Reject ambient below supported range.

## M2 — Voltage-drop physics
Remove the physically invalid `× powerFactor` term from the resistance-only K-method. Keep K-method explicitly labeled as resistive estimating approximation. PF may be accepted only as informational/backward-compatible input and must not reduce calculated K-only drop.

## M3 — 2026 NEC dwelling branch-circuit minimum
Implement §120.13 floor-area branch-circuit minimum using 3 VA/ft². For selected 15A/20A general circuits, modeled general-circuit count must be at least `ceil((sqft × 3 / 120) / circuitAmps)`. Keep receptacle grouping as an additional Bruno design basis and expose both bases.

## M4 — Pricing/T&M domain guard
Add runtime fail-closed validation for nonnegative estimating quantities/rates/hours/costs and Method A domains (`OH >= 0`, `0 <= profit < 1`). Negative signed Change Orders remain allowed as explicit credits. Invalid persisted/imported state must block quote/invoice/summary trust rather than silently lower totals.

## Final gate
- deterministic adversarial tests for all four P1 families;
- PWA cache bump and new guard runtime in core shell;
- exact PR-head CI GREEN;
- developer corrective report;
- freeze corrected SHA;
- new independent math re-audit on exact frozen SHA.

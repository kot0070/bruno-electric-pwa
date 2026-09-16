# Bruno Electric — Function Capability Stage 0 Independent Audit

AUDIT_ROLE: INDEPENDENT_AUDITOR
AUDITED_PRODUCTION_SHA: `31a303dd28b752f5823be78512ee975902295d44`
AUDIT_BRANCH: `audit/function-capability-stage0-31a303d`
STAGE: `STAGE_0_BASELINE_AND_REQUIREMENTS_INDEX`
VERDICT: `A_REJECT_CORRECTIVE_REQUIRED`
P0: 0
P1: 1
P2: 0
P3: 0

## Scope
Independent gate audit of Stage 0 only. No production behavior was modified by the auditor.

Reviewed authoritative Stage 0 artifacts:
- `dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md`
- `dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json`
- `dev-plans/FUNCTION_CAPABILITY_BROWSER_E2E_AMENDMENT.md`
- `dev-plans/ELECTRICAL_TASKS_AUTONOMOUS_MASTER.md`
- `audits/function-capability/REQUIREMENTS_INDEX.md`
- `audits/function-capability/capabilities.json`
- `.github/workflows/electrical-calculators.yml`
- `tests/run-node.js`

## Exact-head CI evidence
- Production SHA: `31a303dd28b752f5823be78512ee975902295d44`
- Workflow: `Electrical Calculator Tests`
- Run number: `531`
- Run id: `35159463504`
- Event: `push`
- Branch: `main`
- `head_sha`: exact audited production SHA
- Conclusion: `success`
- Check-run `calculator-tests`: `success` on the same exact SHA.

The previous deterministic baseline was 767/767 at `41ba3758fd358ad159645e46b42c472d9fcb4157`. Comparison from that baseline to the audited SHA shows only Function Capability Audit governance/evidence files changed; no production runtime or test files changed. Therefore the deterministic test inventory remains 767 while the fresh exact-head workflow independently proves the unchanged suite is green on the audited SHA.

## Browser E2E baseline
`ABSENT` is correctly recorded for Stage 0. The current master correctly defers Playwright implementation to Stage 3 while making it mandatory for final user-facing capability PASS/certification.

## Findings

### FCA-S0-P1-001 — Initial capability registry does not satisfy per-capability source traceability gate
Severity: **P1**
Status: **OPEN**

Stage 0 requires every initial capability to have a traceable source/classification. `audits/function-capability/capabilities.json` contains stable IDs and `requirement_class`, but individual records do not identify their governing requirement/source file or source section. `REQUIREMENTS_INDEX.md` classifies source families globally, but does not map each Capability ID to an authoritative requirement source.

This prevents deterministic proof that every initial Capability ID is grounded in a repository requirement rather than inferred from chat memory, and therefore blocks Stage 0 ACCEPT.

Required corrective:
1. Add per-capability governing source traceability to `capabilities.json` (for example `governing_requirement` and/or `source_file` / `source_section`).
2. Ensure each initial CURRENT capability maps to a current master/runtime/accepted product-contract source.
3. Do not change capability expectations merely to match current runtime.
4. Run exact-head CI on the corrective main SHA.
5. Re-audit Stage 0 on a new exact-SHA audit branch.

## Gate assessment
- Exact current main pinned: PASS
- Fresh exact-head deterministic CI: PASS
- Deterministic test inventory accounted for: PASS
- Current/legacy governance classification: PASS
- Browser baseline explicitly known: PASS
- Stable initial capability IDs: PASS
- Browser-E2E-required fields present: PASS
- Every initial capability traceable to a repository source/classification: **FAIL (P1)**
- P0/P1=0: FAIL

## Verdict
`A_REJECT_CORRECTIVE_REQUIRED`.

Do not advance to Stage 1 until `FCA-S0-P1-001` is corrected on `main`, fresh exact-head CI is green, and an independent re-audit returns `A_ACCEPT` with P0=0/P1=0.

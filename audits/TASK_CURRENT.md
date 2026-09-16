# Electrical Tasks Master — Stage 0 Independent Closure Audit

ROLE: INDEPENDENT AUDIT ONLY
AUDITED_HEAD_SHA: `1dcedbc9934633a924c807e995ac92e25c0254de`
REPORT_PATH: `audits/reports/ELECTRICAL_TASKS_STAGE0_1dcedbc.md`

## Mission
Independently verify that every previously accepted workflow/math corrective family required by Stage 0 is actually present and active on the audited main SHA. Do not trust the Stage 0 developer closure report as proof.

## Mandatory blocker families to trace
- Calculator -> Job deep-link restoration.
- Residential archive is Job-owned; legacy global archive is recovery-only.
- Save Calculation does not mutate Job Materials; Apply is separate.
- Applied calculation provenance.
- Approved Quote immutable snapshot/revisions.
- Fixed-price Invoice consumes approved snapshot, not live totals.
- Custom / Special-order material runtime remains Job-scoped.
- Custom Qty semantics and blank/zero/positive Your Cost semantics.
- No device-global Custom authority causing Job/import leakage.
- Pricing/T&M invalid negative domains fail closed while signed Change Order credits remain allowed.
- Quote approval is actually gated by current pricing validation.
- Required electrical inputs reject blank/malformed values rather than coercing them to zero/default.
- Voltage-drop resistance-only K-method does not multiply I×R by PF.
- Residential 2026 §120.13 general branch-circuit floor remains separate from service-load 2 VA/ft² logic and cannot be reduced by Bruno grouping.
- PWA/core shell/bootstrap contain required corrective runtimes in correct order.
- Exact tested-head provenance and deterministic suite.

## Required evidence
- inspect runtime source at exact audited SHA;
- inspect relevant deterministic tests;
- verify push CI run #348 is exact SHA `1dcedbc...` and GREEN;
- verify no regression introduced by merge to main or master-plan/report commits.

## Verdict
A ACCEPT only if no P0/P1 remains.

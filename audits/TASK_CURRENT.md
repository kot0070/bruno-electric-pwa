# TASK_CURRENT — Independent Audit: Catalog Your Cost Semantics / PWA v42

## MODE
AUDIT ONLY. Follow `audits/PROTOCOL.md`.

## AUDITED_HEAD_SHA
`496d7f7070d3116e93c209c430f88a3a71d6b7dc`

## SOURCE PR
PR #13 — `dev/p1-project-journal-corrective` → `main`.

## SOURCE AUDIT
Previous candidate `26d5f7140189606277b0f9c28fe87a2e0328c5a5` was rejected because blank/missing Catalog `Your Cost` could be coerced to numeric `$0.00`, causing unknown cost to be treated as resolved and overstating material gross profit/margin.

## PRIMARY AUDIT SCOPE
Independently verify the complete candidate, not just developer claims or tests.

### 1. Catalog Your Cost semantics — P1 corrective
Verify both active editing surfaces:
- Catalog editor (`.cat-your` path);
- Pricing & Margins editor (`.mrg-your` path).

Required behavior:
- blank/missing Your Cost remains unresolved;
- clearing an existing known cost returns it to unresolved;
- explicit user-entered `0` remains a valid known `$0` cost;
- positive finite cost remains known;
- invalid/negative input must not silently become a known zero;
- save → reload preserves blank vs explicit-zero distinction;
- persisted `bruno-electric-v1` Catalog data preserves this distinction;
- persisted `*-catalog-costs-v1` maps cannot resurrect a cleared value or coerce blank to zero.

Trace the real runtime event order. Do not accept static helper tests alone. Confirm that the legacy coercive handlers cannot execute after a blank edit and overwrite the unresolved state.

### 2. Residential Live pricing / margin
Using Catalog rows with positive Customer Price:
- blank/missing Your Cost must report `YOUR_COST_UNRESOLVED` / unresolved count and must not contribute invented gross profit or margin;
- explicit Your Cost `0` may resolve and produce legitimate 100% material margin;
- known positive Your Cost must calculate normal cost/profit/margin;
- Customer Price must never substitute for missing Your Cost;
- exact match and explicit aliases remain deterministic;
- unsupported rows remain fail-closed as unmatched; no fuzzy matching.

### 3. Confirm & Save → BOM → Job Materials
Verify generated Residential Live material lines:
- blank/missing Your Cost remains unresolved;
- explicit zero remains resolved zero;
- known positive cost propagates correctly;
- manual/other-source Job Materials remain preserved;
- catalog match metadata remains traceable.

### 4. Starter Catalog / persistence
Verify new starter electrical Catalog items no longer invent `Your Cost = 0`; unknown contractor cost must initialize unresolved while preserving existing user-edited records and explicit historical zeros.

### 5. PWA update / offline
Verify `bruno-electric-v42`:
- v41 and older Bruno Electric caches are invalidated;
- new `electric-catalog-cost-semantics.js` is in the core shell;
- existing installed clients can move off v41 and receive the corrective behavior;
- offline reload after successful update uses the v42 behavior.

### 6. Regressions — independently repeat
Do not limit the audit to the latest P1. Re-check:
- Commercial / Residential isolation and Commercial inability to enter Residential-only workflows;
- Residential ↔ Commercial switching;
- historical helper-tax stability across Day/Week/Month/Quarter, future revisions and disable;
- completed-call tax stability;
- Residential Live → Catalog pricing bridge;
- Customer Price / Your Cost / material margin;
- archive live repricing and persistence;
- Project Calculator → Residential Live → BOM → Job Materials;
- navigation, phone/tablet/desktop implications;
- PWA/offline/cache behavior;
- deterministic test suite and exact audited SHA CI provenance.

## EVIDENCE REQUIREMENTS
- Audit exact production candidate SHA, not the audit-branch commits.
- Inspect actual production paths and persisted state transitions.
- Exercise blank → known → blank, blank → explicit 0, explicit 0 → blank, reload, archive and generated material paths.
- CI green is evidence only, not proof.
- Fail closed on any pricing/data-integrity ambiguity.

## REPORT_PATH
`audits/reports/P1_CATALOG_YOUR_COST_V42_496d7f7.md`

## CHAT RESPONSE
Return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

Do not modify production code, PR, or merge state.

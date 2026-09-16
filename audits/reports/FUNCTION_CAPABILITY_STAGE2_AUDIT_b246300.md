# Bruno Electric — Function Capability Stage 2 Independent Audit

AUDIT_SHA: `b246300e215dc1241434aef9c341e7a12397c29e`
AUDIT_BRANCH: `audit/function-capability-stage2-matrix-b246300`
STAGE: `STAGE_2_REQUIREMENT_TO_RUNTIME_GAP_AUDIT`
VERDICT: `A_ACCEPT`
P0_OPEN: 0
P1_OPEN: 0
P2_CARRIED: `FCA-S2-P2-001`, `FCA-S2-P2-002`, `FCA-S2-P2-003`, historical divergence `FCA-S2-P2-004`

## Exact-head gate
Electrical Calculator Tests run #549 / id `35163662864` completed `success` for exact head `b246300e215dc1241434aef9c341e7a12397c29e`.

The prior Stage 2 audit entry at `16f725d56f034d55a6ae2e5e46acf67a08f95d05` found `FCA-S2-P1-001`, a stale-evidence audit blocker after the accepted Stage 1 Dispatch-backup corrective. The correction changed only:
- `audits/function-capability/capabilities.json`
- `audits/function-capability/RUNTIME_CAPABILITY_MAP.md`

Independent corrective re-audit at exact SHA `b246300e215dc1241434aef9c341e7a12397c29e` returned `A_ACCEPT_CORRECTIVE` and `FCA-S2-P1-001 -> VERIFIED_CLOSED`.

## Full requirement-to-runtime result
The complete matrix is frozen in:
`audits/function-capability/REQUIREMENT_RUNTIME_GAP_MATRIX.md`

Every registered Capability ID is represented and compared across the applicable chain:
`PLAN/SPEC -> UI -> RUNTIME -> TEST -> STORAGE/SIDE EFFECT -> RESULT`.

Classification results are intentionally contract/runtime classifications, not capability PASS certifications. Current high-risk user-facing capability statuses remain subject to the later deterministic/integration/Playwright gates.

### Accepted alignment groups
- Navigation/deep-link contracts have mapped current runtime and deterministic shell/deep-link evidence.
- Job isolation, Catalog/custom material and blank/zero cost invariants have mapped runtime and current deterministic integrity/semantic evidence.
- Residential calculate/save/archive/apply/provenance paths align with current Function Master requirements and existing accepted deterministic evidence.
- Electrical Tasks Stage 1–9 functional contracts align with the completed Electrical Tasks master and current runtime, including Feeder, raceway, grounding/neutral/EGC, takeoff, Save != Apply, explicit Update Job, advanced templates and Solver no-auto-side-effect behavior.
- Quote -> Approved Quote -> fixed-price Invoice and separate T&M paths align with current invariants and deterministic lifecycle tests.
- Pricing/data integrity/source provenance contracts have current runtime and deterministic evidence.

### Different-valid / additional-runtime groups
Granular core calculator helpers, full-app backup, Reference UI and current PWA v68 are valid current implementations that are broader/newer than their independent governing requirement granularity. They are classified `DIFFERENT_VALID`, not silently rewritten into `EXACT`.

### Undocumented current-runtime groups
Several reachable product surfaces exist without independent current product-level PLAN/SPEC granularity: selected Phase-3 helper surfaces, Change Orders, Labor & Equipment, Profit & Loss, Workers, Company profiles/backups, Help backup shortcuts and theme/zoom preferences. They remain `UNDOCUMENTED` at Stage 2 and are tracked by P2 rather than being treated as missing runtime.

## Carried P2 findings

### FCA-S2-P2-001 — Dual Dispatch persistence contract
Visible Journal v3 uses standalone local keys while legacy Job-scoped `state.dispatch` remains. App backup is now safe, but the intended long-term scope/migration contract (Job-scoped vs device-global vs compatibility-only legacy state) remains undocumented. Carry forward; no Stage 2 P0/P1 because current visible workflow is reachable, deterministically covered and backup-safe.

### FCA-S2-P2-002 — CAP-ET-016 registry requirement under-classification
The registry calls rename/duplicate/delete lifecycle runtime-discovered, but Electrical Tasks Master Stage 6 explicitly specifies Duplicate/Rename/Delete/Load. Runtime aligns with the accepted plan. Registry traceability should be normalized in a later evidence-maintenance corrective; no functional blocker.

### FCA-S2-P2-003 — Current reachable surfaces without current independent product spec
Explicitly carried for later governance/product-contract cleanup. Runtime presence alone does not grant `EXACT` or PASS.

### FCA-S2-P2-004 — Historical PWA v67 vs current v68
Electrical Tasks Stage 11 correctly records its historical accepted v67 head. Function Capability audit controls current runtime after the later Dispatch backup bridge advanced cache to v68. This is documented evolution, not a current conflict.

## Negative result summary
At this Stage 2 scope and exact SHA:
- MISSING registered current capability: none identified.
- UNREACHABLE registered current capability: none established by source/runtime mapping.
- New P0: 0.
- New P1: 0.
- Browser execution is not claimed; Stage 3 must create the mandatory Playwright infrastructure and journeys.

## Gate
Stage 2: **A_ACCEPT**.
P0=0, P1=0.
P2 items are explicit and non-blocking.
Stage 3 may be unlocked on authoritative `main` after governance/state update. Stage 3 must implement Playwright and cannot inherit a capability PASS from Stage 2.
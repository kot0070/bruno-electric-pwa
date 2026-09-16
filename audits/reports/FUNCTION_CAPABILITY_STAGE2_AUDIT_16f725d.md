# Bruno Electric — Function Capability Stage 2 Independent Audit

AUDIT_SHA: `16f725d56f034d55a6ae2e5e46acf67a08f95d05`
AUDIT_BRANCH: `audit/function-capability-stage2-16f725d`
STAGE: `STAGE_2_REQUIREMENT_TO_RUNTIME_GAP_AUDIT`
STATUS: `IN_PROGRESS_FINDINGS_FROZEN`
VERDICT: `A_REJECT_CORRECTIVE_REQUIRED`
P0_OPEN: 0
P1_OPEN: 1

## Stage 1 provenance verification
- Stage 1 independent re-audit SHA: `c04a1c6807ab40e142eea25d8fe40405ff139b86`.
- Re-audit verdict: `A_ACCEPT`, P0=0/P1=0.
- Authoritative Stage 2 entry SHA: `16f725d56f034d55a6ae2e5e46acf67a08f95d05`.
- Exact-head deterministic CI at Stage 2 entry: Electrical Calculator Tests run #547 / id `35163361606`, SUCCESS.
- Compare `c04a1c6..16f725d` contains only:
  - `dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md`
  - `dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json`
  No production/runtime file changed after the accepted Stage 1 re-audit.

## Classification vocabulary
Every capability is classified against `PLAN/SPEC -> UI -> RUNTIME -> TEST -> STORAGE/SIDE EFFECT -> RESULT` as one of:
`EXACT`, `DIFFERENT_VALID`, `PARTIAL`, `MISSING`, `UNREACHABLE`, `UNDOCUMENTED`, `OBSOLETE`.

Capability PASS is **not** granted by this Stage 2 classification. Browser E2E remains mandatory later for high-risk user-facing capabilities.

## FCA-S2-P1-001 — Stage 1 capability evidence is stale after the accepted corrective change
Severity: **P1 audit-gate blocker**
Status: **OPEN**
Affected evidence/capabilities: `RUNTIME_CAPABILITY_MAP.md`, `capabilities.json`, `CAP-BKP-001`, `CAP-PWA-001`, `CAP-JRN-001`

### Evidence
The accepted production correction added `electric-app-backup-dispatch.js`, included it in the PWA core shell, advanced the service-worker cache to `bruno-electric-v68`, and closed `FCA-S1-P1-001`.

However the authoritative Stage 1 evidence still contains pre-correction facts:
1. `capabilities.json::CAP-BKP-001` says full-app persistence is `job + companies + uiPrefs + catalogOpen; current Dispatch v3 keys omitted` and still carries the old Stage 1 backup finding reference as though the omission remains current.
2. `capabilities.json::CAP-PWA-001` says `sw.js cache bruno-electric-v67`, while exact audited runtime is v68.
3. `RUNTIME_CAPABILITY_MAP.md` still describes service-worker cache v67, still labels app backup/import as a Dispatch v3 gap candidate, still says the standalone v3 keys are absent from full app backup, and leaves Stage 1 completion/acceptance boxes unchecked.

### Why P1
Stage 2 is explicitly a requirement-to-current-runtime audit. If the authoritative capability evidence itself describes superseded runtime, downstream classifications can be wrong even with green runtime tests. This is an audit integrity blocker, not a new end-user data-loss defect.

### Required correction on `main`
- Update `RUNTIME_CAPABILITY_MAP.md` to the accepted Stage 1/current runtime facts, while retaining historical finding provenance rather than erasing it.
- Update `CAP-BKP-001` to current app-backup behavior including Dispatch Journal v3 data/settings.
- Update `CAP-PWA-001` to current `bruno-electric-v68` and the backup bridge core-shell entry.
- Normalize Stage 1 finding IDs to the frozen ledger IDs (`FCA-S1-P1-001`, `FCA-S1-P2-001`) instead of obsolete candidate aliases where applicable.
- Preserve capability status `UNTESTED`; do not promote to PASS.
- Run exact-head CI and independently re-audit this finding before continuing Stage 2 classification.

## FCA-S2-P2-001 — Dual Dispatch persistence contract is undocumented/ambiguous
Severity: **P2**
Status: **OPEN**
Carried from: `FCA-S1-P2-001`
Affected capability: `CAP-JRN-001`
Classification: **PARTIAL / UNDOCUMENTED_ARCHITECTURE**

Current visible Journal v3 owns standalone data/settings vaults while legacy `state.dispatch` remains in the Job state model. The current master requires a Dispatch/Journal capability but does not define whether Journal is intentionally device-global, Job-scoped, migratory, or mirrored. The visible runtime is reachable and now backup-safe, but the long-term authoritative persistence/isolation contract is not explicit.

Required Stage 2 resolution: document the intended persistence/isolation contract and classify the legacy state path as retained migration compatibility or obsolete runtime. Do not silently merge the two models without a migration contract.

## Runtime-discovered capabilities — documentation classification batch
The following currently reachable capabilities have runtime-backed registry entries but their `governing_requirement` is effectively “current reachable action” rather than an independent product PLAN/SPEC. At Stage 2 entry they are classified **UNDOCUMENTED** at the granular capability level, not MISSING runtime:

- `CAP-CAT-003`
- `CAP-ELC-002` through `CAP-ELC-011`
- `CAP-ET-016`
- `CAP-CO-001`
- `CAP-LAB-001`
- `CAP-PNL-001`
- `CAP-WRK-001`
- `CAP-CMP-001`
- `CAP-BKP-001` through `CAP-BKP-004`
- `CAP-UI-001`
- `CAP-REF-001`

This does not automatically make them P1. Several sit under broader current domains already required by the master (for example electrical calculators), so later Stage 2 rows may resolve to `DIFFERENT_VALID` once their accepted domain contract is traced. The classification may not be upgraded to `EXACT` merely because runtime exists.

## Current requirement-backed capability batch
The following groups have a current governing source and a Stage 1 mapped runtime path, so they proceed to detailed Stage 2 row-by-row comparison rather than being marked MISSING merely for lacking Browser E2E at this stage:
- App navigation/deep-link: `CAP-NAV-001..002`
- Job lifecycle/isolation: `CAP-JOB-001..002`
- Catalog/custom/cost semantics: `CAP-CAT-001..002`, `CAP-COST-001..002`
- Residential: `CAP-RES-001..003`
- Electrical Tasks accepted master capabilities: `CAP-ET-001..015`, `CAP-SOL-001`, `CAP-SRC-001`
- Quote/Approved Quote/Invoice/T&M: `CAP-QTE-001..002`, `CAP-INV-001`, `CAP-TM-001`
- Pricing/import/data/PWA/responsive: `CAP-PRC-001`, `CAP-IO-001`, `CAP-DAT-001`, `CAP-PWA-001`, `CAP-RSP-001`

## Gate
Stage 2 is **not accepted**.
First corrective cycle: close `FCA-S2-P1-001` on `main`, exact-head CI, independent re-audit, then resume the complete per-capability matrix on the new authoritative SHA.

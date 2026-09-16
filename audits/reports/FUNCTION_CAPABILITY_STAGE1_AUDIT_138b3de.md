# Bruno Electric — Function Capability Stage 1 Independent Audit

AUDIT_SHA: `138b3de84f158d57ec0046d6dbed80049c1ba299`
AUDIT_BRANCH: `audit/function-capability-stage1-138b3de`
STAGE: `STAGE_1_RUNTIME_CAPABILITY_INVENTORY`
VERDICT: `A_REJECT_CORRECTIVE_REQUIRED`
P0_OPEN: 0
P1_OPEN: 1

## Scope
Independent exact-SHA review of the Stage 1 runtime map and capability registry, with targeted source verification of reachable UI, runtime ownership and persistence boundaries. This audit does not grant capability PASS; Browser E2E remains mandatory at later gates.

## Exact-head CI evidence
Electrical Calculator Tests run #536 / run id `35160109516` completed `success` for exact head `138b3de84f158d57ec0046d6dbed80049c1ba299`.

## Finding FCA-S1-P1-001 — Full app backup omits the current visible Dispatch Journal v3 data
Severity: **P1**
Status: **OPEN**
Affected capabilities: `CAP-JRN-001`, `CAP-BKP-002`

### Evidence
1. The current visible Dispatch/Call Journal runtime is `electric-dispatch-journal-v2.js` (runtime header identifies v3 behavior) and persists to standalone keys:
   - `bruno-electric-dispatch-journal-v2`
   - `bruno-electric-dispatch-settings-v2`
2. `index.html::doExportApp()` exports only `job`, `companies`, `uiPrefs`, and `catalogOpen`.
3. `index.html::applyAppPayload()` restores the same supported payload members and does not restore the standalone Dispatch Journal keys.
4. Help text promises: `Export app backup includes dispatch in the job JSON.`
5. The legacy `state.dispatch` remains inside the Job state, but it is not the authoritative visible Journal after the v3 overlay re-renders `#panel-dispatch`. Therefore exporting legacy Job dispatch does not preserve the current user-visible journal.

### User impact
A user can create current Call Journal entries/settings, export a nominal full app backup, restore it on another/reset environment, and lose the current visible Journal v3 data/settings. This violates the backup contract and can cause silent data loss.

### Required corrective behavior
- Full app export must include current Dispatch Journal v3 data and settings.
- Full app import must restore those keys when present.
- Legacy app backups without the new fields must remain importable and must not destructively erase current standalone Journal data unless an explicit migration policy says otherwise.
- Add deterministic regression evidence for export payload augmentation and restore semantics.
- Ensure the correction is included in the PWA shell/cache path.
- Re-run exact-head deterministic CI and independent re-audit on the corrected SHA.

## Additional architecture observation FCA-S1-P2-001 — Dual Dispatch persistence models
Severity: **P2**
Status: **OPEN_OBSERVATION**

Legacy `state.dispatch` / `state.taxSettings` remain in the Job model while the reachable v3 Journal owns separate standalone keys. This is an architectural divergence and migration risk. It is not independently promoted to P1 in Stage 1 because the concrete user-impacting backup defect is already captured by FCA-S1-P1-001. Stage 2 must classify the intended long-term contract and obsolete/migration path.

## Gate
Stage 1 is **not accepted**. Correct `FCA-S1-P1-001`, obtain exact-head CI success, then independently re-audit the corrected SHA before Stage 2 unlock.
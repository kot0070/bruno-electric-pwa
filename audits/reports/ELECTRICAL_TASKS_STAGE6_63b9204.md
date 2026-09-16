# Electrical Tasks Stage 6 — Independent Audit

AUDITED PRODUCTION HEAD: `63b9204dff7344eafc44a5b7087d75f0893eb295`

VERDICT: **A — ACCEPT**

P0: 0  
P1: 0  
P2: 0  
P3: 1

## Exact-head evidence
- Electrical Calculator Tests run `435` / run id `35135254278`
- Exact SHA provenance matched `63b9204dff7344eafc44a5b7087d75f0893eb295`
- Deterministic suite: **707/707 passed**
- PWA cache: `bruno-electric-v58`

## Audit scope and conclusions

### Saved task lifecycle — PASS
Stage 6 provides explicit load, rename, duplicate, delete, recalculate, Apply and Update-from-Task semantics over the existing Job-scoped `electricalTasks` model. Rename/recalculate are explicit saves and therefore create a new task revision rather than silently changing an applied revision.

### Save != Apply — PASS
Task saves remain isolated from Job Materials. Apply continues through the Stage 5 takeoff gate. Stage 6 does not introduce any automatic material mutation on save/recalculate/rename.

### Status model — PASS
`SAVED`, `APPLIED_TO_JOB`, and `CHANGED_SINCE_APPLY` are derived from the current Job's application ledger and saved task revision. No device-global task/application registry was added.

### Update Job from Task — PASS
The explicit update workflow archives prior task-origin material snapshots into Job-owned `electricalTaskMaterialHistory`, removes only active material rows carrying the same Electrical Task provenance, and then applies the new final saved revision through the hardened Stage 5 boundary. If the apply fails, the original Job payload is restored synchronously. Historical Catalog cost snapshots are retained.

### Job A/B isolation — PASS
Archive/status/update all read the active Job payload. Stage 5 sourceJobId/task revision/input matching remains the final apply gate, preventing a Job A plan from being applied to Job B.

### Provenance/history — PASS
Active snapshots retain task id/revision, Job id, applied time/application ledger, engine version, code/jurisdiction metadata, catalog match and calculation basis. Replaced snapshots are copied into Job-owned history before an explicit update.

### Import/export / schema compatibility — PASS
Stage 6 adds fields to the existing Job object without a migration or replacement schema and does not modify global import/export code. Existing unknown-field-preserving Job serialization remains untouched; no old storage key is renamed or deleted.

### Protected Work/Workspace matrix — PASS
No protected workspace, navigation, Quote/Invoice, Residential, global pricing or global import/export runtime was modified. Exact-head regression suite remains 707/707 green. PWA v58 adds only the Stage 6 runtime/UI to the owned Bruno Electric cache and preserves unrelated caches.

## P3
`electrical-tasks-stage6-ui.js` refreshes the status display with a low-frequency interval while the page is open. This is non-blocking and does not mutate state; a future UI cleanup may replace it with event-driven refresh.

**ACCEPT STAGE 6.**

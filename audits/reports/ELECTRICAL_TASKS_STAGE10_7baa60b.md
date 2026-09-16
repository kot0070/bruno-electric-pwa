# Electrical Tasks Stage 10 — Data Integrity / Persistence Master Audit

Audited production head: `7baa60b75f0fb7e67983749db167c49d97777904`

## Verdict
A — ACCEPT

P0: 0
P1: 0

## CI evidence
- Workflow: Electrical Calculator Tests
- Run: 511
- Run ID: 35145792218
- Exact tested SHA: `7baa60b75f0fb7e67983749db167c49d97777904`
- Deterministic suite: 759/759 passed

## Stage 10 additions
Added a dedicated malformed-data / persistence master test layer covering:
- invalid Job JSON fails closed and is not silently rewritten;
- malformed legacy `electricalTasks` shape is treated as empty until an explicit user save, while unrelated fields survive;
- stale active task IDs do not fabricate tasks or mutate Job state;
- task Save preserves Quote, Invoice, Catalog, manual Job Materials and unknown/future schema fields;
- task delete mutates only the selected task plus active pointer;
- Job A / Job B state remains isolated even when the same runtime instance observes complete storage swaps;
- malformed application ledgers are tolerated without destructive migration;
- unsupported partial legacy tasks fail closed during recalculation and leave the Job byte-identical.

## Existing regression coverage reviewed
The full deterministic suite also retains coverage for:
- Save != Apply and explicit Update Job from Task;
- update rollback on failed apply;
- applied-material provenance/history;
- blank vs explicit zero contractor cost semantics;
- Catalog/custom-material preservation;
- Approved Quote / fixed-price invoice semantics;
- Residential archive/history/job-scoping;
- navigation/deep-link isolation;
- service-worker cache ownership and offline shell integrity.

## Findings
No cross-job contamination, silent destructive migration, unrelated-field erasure, or malformed-record auto-repair was found in the audited paths.

## Accepted limitations / P2
1. Unknown future schema fields are preserved opportunistically by Job-level object mutation; there is no formal schema-version migration framework yet.
2. A malformed top-level Job JSON record is intentionally fail-closed rather than auto-recovered. Recovery/export tooling is outside this master.
3. Import/export behavior is protected by existing whole-Job persistence semantics, but no new generalized schema migrator was introduced in Stage 10.

## Gate result
Stage 10 satisfies IMPLEMENT → deterministic tests → exact-head CI → independent audit → ACCEPT. Stage 11 Responsive / PWA / Field UX may begin.

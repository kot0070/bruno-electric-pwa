# MASTER 03 — Bruno Electric Data Integrity / Persistence Audit

ROLE: `INDEPENDENT AUDIT ONLY`

TARGET_SHA = `TO_BE_PINNED`
REPORT_PATH = `TO_BE_SET_ON_AUDIT_BRANCH`

## Mission
Independently audit persisted state, migrations, job isolation, import/export, archives, historical snapshots and schema evolution. The goal is to prove that data cannot silently leak, disappear, cross-contaminate another Job, or be reinterpreted by current mutable settings.

## Required state inventory
Map every localStorage key and other persisted source used by the app. At minimum classify:
- current Job state (`bruno-electric-v1`);
- Residential calculation archive/library;
- Company/letterhead profiles;
- Workers/personnel;
- UI preferences;
- any legacy/deprecated keys;
- PWA/cache state that can expose stale runtime/data assumptions.

For each key record owner/domain, schema fields, import/export behavior, blank-job behavior, historical semantics and migration policy.

## Required scenarios
1. Create Job A with Custom definitions, resolved/unresolved Job Materials, Residential saved/applied state, Quote approval/history, Company/Workers references.
2. Export Job A, then create/replace with Job B. Prove no Job A project-scoped state leaks into B.
3. Import Job A again and verify intended state restores exactly.
4. Corrupt/malformed JSON for each independently parsed key and verify fail-safe behavior does not erase unrelated valid state.
5. Missing optional fields from an older schema must not be reinterpreted as explicit zero/false when unknown semantics matter.
6. Unknown future fields should be preserved where round-trip compatibility requires it.
7. Catalog edit/delete after Job snapshot creation must not rewrite historical Job rows.
8. Current helper/tax/pricing/Catalog settings must not rewrite historical journal/approval/archive snapshots.
9. New blank Job must reset only Job-scoped data and retain explicitly global Company/Workers/preferences as designed.
10. Full-app export/import must not merge project-scoped arrays incorrectly or duplicate identities.
11. Job-only export/import must not accidentally overwrite global Company/Worker stores.
12. Repeated save/import/export cycles must remain idempotent where identities are intended stable.

## Schema invariants
- Stable IDs remain stable on edit.
- Historical `createdAt`, approval IDs/revisions, calculation IDs and provenance remain immutable unless a documented new-version action occurs.
- `null`/blank unresolved cost must not become numeric 0 through serialization, normalization or import.
- Explicit 0 remains explicit 0.
- Arrays representing different domains must not be merged by index accidentally.
- Source/provenance fields survive round trip.
- Archived data that intentionally live-reprices must clearly separate immutable structure from current pricing.

## Import security / robustness
Audit:
- unexpected object/array shapes;
- prototype-sensitive keys where relevant;
- oversized/duplicate records;
- duplicate IDs;
- invalid numeric strings;
- missing versions;
- partial imports;
- rollback behavior after failed writes.

## Deliverable
Include storage/schema map, transition diagrams, round-trip scenarios, corruption cases, P0/P1/P2 findings and verdict.

No production edits.

## Next action
- P0/P1 => Corrective Master.
- clean => advance to Master 04.

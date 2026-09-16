# Bruno Electric — Independent Audit Protocol

AUDIT_MODE: AUDIT ONLY
PRODUCTION_CHANGES: PROHIBITED
MERGE: PROHIBITED

## Verdicts
- A ACCEPT — no P0/P1.
- B ACCEPT AFTER MINOR FIXES — no P0/P1; only non-blocking P2/P3.
- C REJECT / REWORK REQUIRED — one or more P0/P1.

## Severity
- P0: dangerous/catastrophic correctness, destructive data behavior, critical cross-job contamination, or unsafe compliance output.
- P1: material functional/correctness/data-integrity defect that blocks acceptance.
- P2: non-blocking defect or incomplete edge/UX/provenance concern.
- P3: polish/documentation/low-risk improvement.

## Required method
1. Audit the exact pinned production SHA only. Audit-branch metadata commits are not production candidate changes.
2. Independently inspect implementation, tests, runtime loading, PWA cache, persistence boundaries, and relevant regressions.
3. Do not trust developer evidence without reproducing/validating the claims.
4. Verify exact-head CI provenance: checked-out SHA must equal the pinned audited SHA and deterministic suite must be green.
5. For electrical/math/material claims, manually validate representative scenarios and fail-closed boundaries.
6. Treat BLANK != ZERO, UNKNOWN != ZERO, Your Cost != Customer Price, Save != Apply, and historical snapshot immutability as invariants.
7. Any compliance-critical unresolved input must fail closed; no fabricated quantity/cost/code answer.
8. No production code edits, PR edits, merge, or branch rewrites from the auditor.

## Auditor deliverable
Commit the full report under `audits/reports/` on this audit branch.

Return to chat only:
VERDICT
AUDITED HEAD SHA
BLOCKERS
REPORT LINK

# Bruno Electric — Custom / Special-order Materials v48 Corrective

## Audited predecessor
Independent audit of `e18e4cbd6778363e8cd5d3737bfad738d2c92f25` returned C with two P1 blockers:
1. Custom Save/Edit/Delete could be overwritten by the legacy closed-over state writing stale `bruno-electric-v1`.
2. CI #227 tested the PR merge commit rather than the exact audited head.

## Persistence coherence correction
`electric-custom-materials.js` now owns a canonical custom-material registry at `bruno-electric-custom-materials-v1` and installs a scoped guard around `bruno-electric-v1` writes.

Before any legacy write to the main job key is committed, `CUSTOM_SPECIAL_ORDER` rows are reconciled from that canonical registry. This prevents stale legacy state from erasing a new custom row, reverting an edit, or resurrecting a deleted row.

Save/Edit/Delete update the canonical registry and persisted job synchronously, then request an immediate page reload for UI / closed-over-state rehydration. Add-to-Job preserves the same registry and strict cost semantics.

Integration regressions now reproduce the exact stale-write sequence for create, edit and delete, plus blank / explicit-zero / positive Your Cost rows.

## Exact-head CI correction
The GitHub Actions workflow now explicitly checks out `github.event.pull_request.head.sha` for PR runs and verifies `git rev-parse HEAD` against that expected SHA before tests execute.

The production/test corrective implementation passed as exact HEAD before this documentation-only commit:
- implementation SHA: `b78b1ea261f3246ab178ab06a8ba5967a1282ef5`
- run #232: SUCCESS
- `TESTED_HEAD_SHA=b78b1ea261f3246ab178ab06a8ba5967a1282ef5`
- `EXPECTED_HEAD_SHA=b78b1ea261f3246ab178ab06a8ba5967a1282ef5`
- deterministic suite: 511/511 passed.

This report commit itself is documentation-only; the next audit candidate must be pinned only after exact-head CI has run on the final branch HEAD.

## Preserved feature scope
- persisted Qty;
- saved-Qty Add-existing default;
- row-specific quantity override;
- full edit workflow;
- stable ID / createdAt;
- immutable existing Job Material snapshots across Catalog edits/deletes;
- blank / zero / positive Your Cost semantics;
- traceability snapshots;
- responsive UI;
- PWA v48.

## Release policy
PR #14 remains unmerged until independent audit acceptance of the next pinned exact HEAD.

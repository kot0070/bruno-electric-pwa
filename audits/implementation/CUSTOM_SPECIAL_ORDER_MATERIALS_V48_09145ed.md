# Implementation Evidence — Custom / Special-order Materials v48

Pinned production candidate: `09145eda17cfe4d161fcc3ab32d6cadacb755b1c`
Source PR: #14.

## Corrective changes
- Added canonical `bruno-electric-custom-materials-v1` registry for `CUSTOM_SPECIAL_ORDER` Catalog rows.
- Added scoped reconciliation guard on writes to `bruno-electric-v1` so stale legacy job-state saves cannot erase a new custom row, revert an edit, or resurrect a deletion.
- Save/Edit/Delete synchronize registry + persisted job synchronously and request immediate page reload for UI/closed-over-state rehydration.
- Add-to-Job preserves canonical registry and existing strict cost-state routing.
- Added stale-write integration regressions for Save/Edit/Delete and blank/zero/positive Your Cost states.
- Retained persisted Qty, row-specific Add Qty override, edit workflow, history snapshots, responsive UI, and traceability.
- Advanced PWA shell to `bruno-electric-v48`.

## Exact-head CI gate
Workflow now explicitly checks out `github.event.pull_request.head.sha` and verifies `git rev-parse HEAD` before tests.

Run #236 evidence for the pinned candidate:
- checkout ref: `09145eda17cfe4d161fcc3ab32d6cadacb755b1c`
- checked-out HEAD: `09145eda17cfe4d161fcc3ab32d6cadacb755b1c`
- `TESTED_HEAD_SHA=09145eda17cfe4d161fcc3ab32d6cadacb755b1c`
- `EXPECTED_HEAD_SHA=09145eda17cfe4d161fcc3ab32d6cadacb755b1c`
- provenance comparison passed;
- deterministic suite: 511/511 passed;
- workflow conclusion: SUCCESS.

## Release rule
Do not merge PR #14 before independent audit acceptance of the pinned candidate.

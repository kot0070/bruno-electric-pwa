# TEMPLATE — Bruno Electric Independent Re-Audit Master

ROLE: `INDEPENDENT AUDIT ONLY`

PRIOR_AUDIT_REPORT = `TO_BE_PINNED`
PRIOR_AUDITED_SHA = `TO_BE_PINNED`
CORRECTIVE_REPORT = `TO_BE_PINNED`
AUDITED_HEAD_SHA = `TO_BE_PINNED`
REPORT_PATH = `TO_BE_SET_ON_SEPARATE_AUDIT_BRANCH`

## Mission
Independently verify that every prior P0/P1 blocker is actually corrected at the new exact SHA and that the correction did not introduce regressions elsewhere. Do not treat the corrective report or green CI as proof.

## Required method
1. Read the prior independent audit first and enumerate every blocker exactly.
2. Inspect the old audited runtime path sufficiently to understand the original failure.
3. Inspect the new exact SHA and reproduce the old failure case against the correction.
4. Verify the new behavior through runtime/data state, not only source strings/tests.
5. Inspect the corrective tests and identify whether they meaningfully reproduce the old defect.
6. Re-run the complete affected regression domain, not only the blocker-specific path.
7. Verify exact-head CI provenance belongs to `AUDITED_HEAD_SHA`.
8. Verify PWA/cache/versioning if runtime client files changed.
9. Verify persistence/history/import if stored state changed.
10. Verify phone/tablet/desktop if primary UI changed.

## Required blocker table
For every prior P0/P1:
- finding ID/title;
- old failure reproduction;
- corrective runtime path;
- observed new result;
- regression evidence;
- status: `CLOSED` / `STILL OPEN` / `NEW REGRESSION`.

## Regression floor
Regardless of original blocker domain, retain these high-risk checks when relevant:
- blank Your Cost != explicit 0;
- unresolved contractor cost excluded from numeric math;
- Job Material historical snapshot immutability;
- Save Calculation != Apply to Job;
- approved Quote snapshot immutability;
- project/job isolation;
- Residential/Commercial isolation;
- Journal historical helper-tax behavior;
- exact-head CI;
- PWA coherent runtime.

## Verdict
- `A — ACCEPT`: no P0/P1 remains and no new P0/P1.
- `B — ACCEPT AFTER MINOR FIXES`: no P0/P1; only bounded P2.
- `C — REJECT / REWORK REQUIRED`: prior blocker remains or any new P0/P1 exists.

## Prohibited
No production edits. No PR edits/comments. No merge. Report only on re-audit branch.

## Chat output
Only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

## Next action
- A => return control to release/merge decision and then next queued domain master.
- B => release coordinator decides bounded minor-fix cycle; do not silently merge if report calls for a required fix.
- C => instantiate Corrective Master again with the new report.

# TEMPLATE — Bruno Electric Corrective Master

ROLE: `DEVELOPER / CORRECTIVE IMPLEMENTATION`

SOURCE_AUDIT_REPORT = `TO_BE_PINNED`
AUDITED_SHA = `TO_BE_PINNED`
WORK_BRANCH = `TO_BE_CREATED_FROM_AUDITED_SHA_OR_ACCEPTED_BASE`

## Mission
Consume one independent audit report and correct every P0/P1 blocker without broad unrelated refactors. Treat the audit finding as evidence to reproduce, not as a patch recipe.

## Mandatory start
1. Read the complete audit report.
2. Reproduce each P0/P1 against the exact audited SHA.
3. Trace root cause through runtime/data path.
4. Record whether the finding is confirmed, partially confirmed, or disproven with concrete evidence. Do not dismiss an audit finding based only on existing tests.

## Implementation rules
- Fix root cause, not only UI symptom.
- Preserve all previously accepted invariants outside the finding.
- Do not silently weaken fail-closed behavior.
- Avoid unrelated architecture rewrites.
- If runtime files change, update PWA core shell/cache version when required by deployment semantics.
- If persisted schema changes, add migration/backward-compatibility tests.
- Every P0/P1 must receive at least one regression test that would fail on the audited SHA and pass on the corrective candidate.

## Required regression baseline
Always re-run:
- full deterministic suite;
- exact-head provenance gate;
- unresolved blank vs explicit zero semantics;
- historical snapshot immutability;
- Commercial/Residential isolation;
- historical helper-tax regression;
- import/export/job isolation if persistence touched;
- PWA/offline if client runtime touched;
- responsive primary action checks if UI touched.

## Corrective developer report
Create a report containing for each finding:
- audit severity/ID;
- reproduction;
- root cause;
- files changed;
- semantic fix;
- regression tests added;
- residual risk;
- exact candidate SHA;
- exact-head CI run.

## Completion gate
Do not call corrective work complete until:
1. all P0/P1 confirmed findings are fixed;
2. full suite is green;
3. exact-head CI is SUCCESS;
4. candidate SHA is frozen;
5. new separate re-audit branch is created from that exact SHA;
6. new `TASK_CURRENT.md` pins that SHA and explicitly requires verification of all prior blockers plus full affected regressions.

## Merge policy
Never merge from corrective chat. Merge remains gated by independent re-audit acceptance.

## Next action
Instantiate `RE_AUDIT_MASTER_TEMPLATE.md` against the frozen corrective SHA.

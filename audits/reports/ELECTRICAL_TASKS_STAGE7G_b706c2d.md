# Electrical Tasks Stage 7G — Generic Long Run Audit

Audited production head: `b706c2d6216030998f29093b72048ba7ace00489`
Audit branch: `audit/electrical-tasks-stage7g-b706c2d`
CI: Electrical Calculator Tests run `495` / run id `35142555941`
Deterministic suite: `734/734 PASS`

## Scope reviewed
- Long-Distance Voltage Drop / Generic Long Run task enablement and active-Job persistence
- advanced adapter reuse of shared ampacity, resistance-only K voltage-drop, raceway and EGC engines
- fail-closed missing inputs and explicit load-basis handling
- PWA v65 upgrade and optional-cache isolation
- protected regression suite at exact SHA

## Corrective history
Initial Stage 7G CI exposed two test/packaging defects, not accepted production behavior:
1. the long-run test expected only PASS/NO SUPPORTED CONFIGURATION even though the audited grounding engine can correctly return `REVIEW REQUIRED` for long-run EGC review;
2. the v65 service-worker rewrite changed the static optional-asset failure-isolation signature expected by regression tests.
Both were corrected before acceptance. `REVIEW REQUIRED` remains non-final and does not become an Apply-safe numeric recommendation; optional assets again cannot poison core PWA installation.

## Findings after corrective
### P0
None.

### P1
None.

### P2
1. Generic Long Run uses the existing resistance-only K voltage-drop model. Power factor/reactance and pulling feasibility remain outside supported scope and are explicitly disclosed.

## Invariant review
- Long distance never bypasses ampacity.
- Missing current, distance or load basis fails closed.
- `REVIEW REQUIRED` remains distinct from PASS.
- Shared math is reused; no duplicate voltage-drop implementation was introduced.
- Save != Apply and active-Job isolation remain unchanged.
- Protected Work/Workspace/navigation/Quote/Invoice/Residential/shared-pricing code was not modified.
- PWA v65 deletes only owned stale Bruno Electric caches; unrelated caches are untouched; optional icon failures do not break core install.

## Re-audit
Corrective head `b706c2d6216030998f29093b72048ba7ace00489` was re-tested by exact-head CI. Provenance: `TESTED_HEAD_SHA=b706c2d6216030998f29093b72048ba7ace00489`; `734/734 PASS`.

## Verdict
`A_ACCEPT`

P0: 0  
P1: 0  
Stage 7 is complete and may advance to Stage 8 Professional Task Solver UX.

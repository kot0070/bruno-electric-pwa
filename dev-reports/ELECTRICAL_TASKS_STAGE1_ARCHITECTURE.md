# Electrical Tasks Master — Stage 1 Architecture / UX Shell

STATUS: IMPLEMENTATION_COMPLETE / AUDIT_PENDING

## Scope delivered
- First-class `Electrical Tasks` tool entry in Electrical Tools.
- Dedicated responsive Field Calculator workspace.
- Feeder / Panel Run enabled as Stage 1 draft template.
- Complete future task-template inventory is visible but locked until its master stage.
- Job-scoped task persistence under `bruno-electric-v1.electricalTasks` with `electricalTaskActiveId`.
- Raw-string electrical inputs preserve BLANK != ZERO (`''` versus `'0'`).
- Save / load / edit revision / duplicate / delete / active selection.
- Job A / Job B isolation by construction: no global Electrical Tasks registry.
- Save Task Draft does not read/write Job Materials.
- sourceEdition / jurisdiction / engineVersion provenance fields captured on saved task objects.
- Stage 1 intentionally produces no conductor/compliance/raceway result; computation remains locked for Stage 2.
- PWA cache bumped to v53 and task core/UI cached offline.
- Bootstrap loads task core before UI and only on Electrical Tools page.

## Main files
- `electric-electrical-tasks.js`
- `electrical-tasks-ui.js`
- `sw-register.js`
- `sw.js`

## Deterministic evidence
- `tests/electrical-tasks.test.js`
- `tests/electrical-tasks-ui.test.js`
- updated `tests/service-worker.test.js`
- test runner includes task runtime before task tests.

## Required Stage 1 independent audit
Audit exact final Stage 1 SHA for:
1. task persistence and Job isolation;
2. blank vs explicit zero round-trip;
3. no Job Materials mutation on Save;
4. stable ID/createdAt + revision increment on edit;
5. duplicate/delete/active semantics;
6. later template lockout;
7. direct discoverability in phone/tablet/desktop Electrical Tools UI;
8. bootstrap dependency order;
9. PWA v53 offline core shell;
10. regression against existing Project / Residential / generic calculator tool navigation.

Stage 2 remains forbidden until Stage 1 independent verdict contains 0 P0/P1.

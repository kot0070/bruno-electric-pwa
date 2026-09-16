# MASTER 04 — Bruno Electric Responsive / PWA / Primary UX Audit

ROLE: `INDEPENDENT AUDIT ONLY`

TARGET_SHA = `TO_BE_PINNED`
REPORT_PATH = `TO_BE_SET_ON_AUDIT_BRANCH`

## Mission
Audit whether the professional estimating workflow remains discoverable, operable and internally consistent on phone, tablet and desktop, including offline/PWA transitions. This is not a cosmetic review; hidden/overlapped primary actions, stale offline runtime or state-confusing UI are production defects.

## Viewport matrix
At minimum inspect representative widths/orientations for:
- phone portrait <768px;
- phone landscape / short-height;
- tablet 768–1199px;
- desktop >=1200px.

## Primary workflows to execute
1. Navigate to exact deep-linked calculator/tab.
2. Run Residential calculation and wire takeoff.
3. Save Calculation; open archive; duplicate/load/delete.
4. Apply saved calculation to Job.
5. Inspect Job totals and unresolved warning.
6. Create/edit/delete Custom Catalog material and row-specific Add Qty.
7. Move Catalog → Job Materials and identify source/used-state badges.
8. Review Summary.
9. Apply optional manual Quote adjustment and approve Quote.
10. Inspect approved snapshot/Invoice basis.
11. Import/export/New Job actions.
12. Company/Workers global-vs-job controls.

## Required UX checks
- Primary buttons visible and tappable without horizontal page loss.
- Sticky headers/nav do not cover focused fields or dialogs.
- Bottom navigation/safe-area handling on mobile.
- Tables either adapt or scroll deliberately without hiding critical actions/labels.
- No required meaning is available only in hover/title text on touch devices.
- Dirty/saved/applied/approved/unresolved states are visibly distinguishable.
- “Catalog definition” vs “Job snapshot” semantics are understandable.
- Exact recommended price vs approved quote snapshot cannot be confused.
- Warnings remain visible enough on small screens.
- Keyboard/focus behavior and minimum target sizing are reasonable for field use.
- Long material names, large currency values and multi-line provenance do not break layout.

## PWA/offline checks
- service worker installs v50/current target shell successfully;
- optional icon failure cannot block shell install;
- upgrade from at least one stale owned cache deletes only owned stale caches;
- unrelated app caches are preserved;
- offline reload serves a coherent single runtime version, not mixed old/new modules;
- new runtime modules required by Save/Apply/Quote/Custom workflow are available offline;
- navigation fallback is sane when offline;
- first-load/update behavior does not strand the user in an old semantic contract after the new code is active.

## Accessibility / professional-use checks
Inspect obvious regressions in:
- labels/associated inputs;
- semantic button text;
- focus visibility;
- contrast for state/warning text;
- touch target sizes;
- state not encoded only by color;
- table headings and source badges.

## Severity
P1 if a primary professional workflow is inaccessible/unusable on a common viewport, if offline mode can execute a mixed incompatible runtime, or if UI state can materially cause the wrong Job/Quote action.
P2 for bounded polish/accessibility defects without material workflow risk.

## Deliverable
Viewport/action matrix, offline/cache matrix, screenshots/evidence references where available, findings and verdict. No production edits.

## Next action
- P0/P1 => Corrective Master.
- clean => orchestration may define next product master.

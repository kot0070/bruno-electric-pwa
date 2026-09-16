# CURRENT AUDIT — Project Calculator + Journal Corrective Acceptance

AUDIT_MODE: AUDIT ONLY
AUDITED_HEAD_SHA: `3a85743b891b9aa276e6eb6ae0ef55cad970094f`
AUDIT_BRANCH: `audit/main-project-journal-3a85743`
REPORT_PATH: `audits/reports/MAIN_PROJECT_CALCULATOR_JOURNAL_CORRECTIVE_3a85743.md`

## Objective
Independently acceptance-audit the full current Bruno Electric production workflow at the exact pinned `main` SHA. Do not limit review to previous blockers or implementation summaries.

## Mandatory audit scope

### A. Project Calculator primary UX
- `Calculator` must open the Project Calculator workflow, not Conductor/Ampacity or another low-level tool.
- First project screen should require only project type, total building square footage, and room/space quantities.
- No obsolete second project-mode selector/overlay should remain.
- Residential vs Commercial choice must persist coherently without applying residential/dwelling rules to Commercial.
- Residential Calculate must hand project facts into the live downstream design/calculation workflow.
- Commercial must fail closed where square footage/room count is insufficient for a code minimum and must not fabricate dwelling 210.52 values.

### B. Residential live calculation
Independently test the full chain:
`project facts -> code minimum / layout-required state -> design overrides -> circuits -> breakers/conductors -> panel spaces -> service/load candidate -> BOM -> Catalog pricing -> Save/archive`.

Specifically verify:
- square footage + room count do not falsely claim exact general receptacle minimums where geometry is required;
- malformed wall geometry fails closed;
- bathroom/powder and kitchen semantics remain layout-driven where required;
- below-known-minimum design values become NON-COMPLIANT with reference;
- edits cascade live through circuit count, OCPD/conductor, cable/BOM, panel spaces and pricing;
- panel-space suggestion is clearly a design allowance, not misrepresented as NEC minimum;
- service amp candidate is not finalized until major loads are marked complete;
- major load inputs actually affect service/load output;
- 310.12 conductor output is gated by explicit eligibility confirmation;
- customer material price / Your Cost / margin are LIVE from current Catalog;
- same-tab Catalog repricing updates active/workspace totals;
- Confirm & Save uses an atomic commit boundary and archive/history remains reusable;
- AUTO vs USER provenance survives save/reload/duplicate;
- archived calculation prices remain live while quantities/project snapshot remain stable.

### C. Journal corrective blockers
Reproduce and independently verify all former P1s:
1. `scheduled` calls must NOT count as earned Gross, Tax, hours, or Business Net; `completed` is the earning boundary.
2. Week/Month/Quarter helper cost must include every helper-scheduled date in the selected period, including dates with zero calls.
3. Helper rate/pay-mode/tax/active changes must be effective-dated/versioned so later edits do not rewrite prior period economics.
4. Disabling/removing a helper for future dates must not erase historical helper cost.
5. Completed-call tax economics must not be silently rewritten by later global tax-setting changes.
6. Day/Week/Month/Quarter archive navigation and Add/Edit/Delete call workflow remain usable.

### D. Shared product regression
- canonical mobile/tablet/desktop navigation: Journal / Calculator / Job / Catalog / More;
- Job quote/invoice/summary/change orders paths remain reachable;
- Catalog/Job Materials/Pricing & Margins remain reachable;
- existing ampacity, voltage-drop, conduit-fill, box-fill, residential, phase-3, BOM/pricing calculators are not regressed;
- compact header/totals behavior is not broken;
- persistence/import/export paths are not obviously corrupted by new project state;
- PWA offline shell uses v40 and includes the Project Calculator + Journal + live calculation dependencies;
- no deleted `electric-project-mode.js` dependency remains in runtime/bootstrap/cache.

### E. Exact-head evidence
- Verify production `main` SHA equals `AUDITED_HEAD_SHA` for the audited artifact.
- Verify deterministic CI for exact `3a85743b891b9aa276e6eb6ae0ef55cad970094f` is completed/success; do not use another SHA's green run.

## Audit independence
Previous reports may be read for context but are not authoritative. Search independently for additional P0/P1 issues.

## Retention / output
Write the complete report only to:
`audits/reports/MAIN_PROJECT_CALCULATOR_JOURNAL_CORRECTIVE_3a85743.md`

Do not modify production code, `main`, PRs, comments, or merge state.

Return in chat only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

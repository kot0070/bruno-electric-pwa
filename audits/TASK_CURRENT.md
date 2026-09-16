# TASK_CURRENT — Independent Corrective Audit

## Mode
AUDIT ONLY. Read `audits/PROTOCOL.md` first and follow it strictly.

## Production-candidate target
- PR: `#13`
- Development branch: `dev/p1-project-journal-corrective`
- `AUDITED_HEAD_SHA`: `26d5f7140189606277b0f9c28fe87a2e0328c5a5`
- Base production SHA: `3a85743b891b9aa276e6eb6ae0ef55cad970094f`

Audit the exact pinned SHA above. Do not audit a moving branch head.

## Prior audit context
The prior independent audit of `311997c12cd82d0b45d82584c75c8c6fbcce90bb` returned `C — REJECT / REWORK REQUIRED` because the PWA cache remained `bruno-electric-v40`, allowing existing clients to retain pre-corrective Project Calculator / shell / Journal assets.

A separate user-observed runtime defect also showed Residential Live Catalog pricing at `$0.00` with `Resolved 0` and all generated BOM rows unmatched despite existing Catalog data.

Do not assume either issue is fixed. Reproduce/trace independently.

## Mandatory audit scope

### A. Re-check original P1 boundaries
- Commercial / Residential isolation remains enforced downstream.
- Commercial mode cannot invoke `res-live`, `res`, or `res-takeoff` through picker/nav/direct ordinary tool routing.
- Commercial → Residential switching works only through the authoritative Project Calculator state and does not restore the obsolete duplicate overlay.
- Historical helper tax/net does not change when current global helper-tax settings are changed later.
- Future helper revisions/disable preserve earlier economics.
- zero-call helper days and Day / Week / Month / Quarter calculations remain correct.
- completed-call tax snapshot stability remains intact.

### B. PWA cache / update P1
Independently verify:
- current cache version is newer than v40;
- an existing `bruno-electric-v40` cache is recognized as owned stale cache and deleted during activation;
- unrelated application caches are not deleted;
- install/activate lifecycle makes the corrective worker take control appropriately;
- corrected Project Calculator, Electrical shell, Journal, Residential pricing dependencies and Catalog bridge are all present in the core offline shell;
- offline behavior after successful v41 installation does not fall back to the old corrective code;
- service-worker tests reflect the production cache contract instead of merely changing an expected string.

### C. Residential Live Catalog pricing runtime
Trace real state from `bruno-electric-v1` Catalog through Residential Live BOM and pricing. Verify at minimum:
- exact Catalog item match takes precedence;
- explicitly supported legacy names resolve current Residential BOM names deterministically;
- known established rows such as 15A/20A receptacles, 20A GFCI, 20A single-pole breaker, 12/2 Romex and wall plate can contribute their current Customer Price;
- persisted Catalog Customer Price edits are visible to Residential Live;
- persisted Your Cost edits are visible to Residential Live;
- missing/blank Your Cost remains unresolved and is not silently replaced by Customer Price;
- unsupported/ambiguous BOM rows remain unmatched instead of fuzzy/unsafe guessed matches;
- quantity × price totals, Your Cost, gross profit and margin are arithmetically correct;
- same-session Catalog changes reprice the live calculation on the documented refresh/navigation boundary;
- archived project quantities remain stable while Catalog pricing remains live.

### D. Confirm & Save / BOM / Job Materials
Verify the same Catalog resolution policy is used at the commit boundary:
- alias-resolved items insert the correct catalog metadata/Your Cost into generated Job Materials;
- manual Job Materials and rows from unrelated generated sources remain preserved;
- unresolved items stay reviewable/unresolved at zero cost rather than receiving an invented cost;
- Confirm & Save remains atomic with archive/job rollback behavior intact;
- repeated save does not duplicate prior generated rows.

### E. Full regression
Do not limit audit to the latest two defects. Re-check:
- Project Calculator first-screen workflow;
- Residential Live input → circuit schedule → panel/service → BOM → pricing dependency chain;
- malformed wall geometry fail-closed behavior;
- NON-COMPLIANT blocking;
- major loads / service candidate and 310.12 gating;
- persistence, Reload, Duplicate, archive;
- canonical Journal / Calculator / Job / Catalog / More navigation;
- Quote / Invoice / Summary / Change Orders reachability;
- Catalog / Job Materials / Pricing & Margins reachability;
- core electrical calculators and phase-3 regressions;
- import/export/data integrity;
- phone / tablet / desktop shell behavior;
- PWA install/offline/update.

## Evidence
Review the developer report only as a claim to verify, never as proof:
`dev-reports/P1_PROJECT_JOURNAL_V41_CATALOG_CORRECTIVE.md`

Verify GitHub Actions belongs to the exact audited SHA, not merely an earlier implementation commit.

## Report
`REPORT_PATH`: `audits/reports/P1_PROJECT_JOURNAL_V41_CATALOG_26d5f71.md`

Write the complete independent report there on this audit branch only.

Production code, development branch, PR and merge state must not be modified.

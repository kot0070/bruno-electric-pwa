# TASK_CURRENT — Electrical Tasks Stage 5 / Material Takeoff

AUDIT ONLY. Do not modify production code, PRs, `main`, or merge anything.

## Exact audited production HEAD
`aef98f62ab7c5c6176eebc9f12c4abbca0e36fbf`

Audit branch metadata commits after that SHA are not part of the production candidate.

## Scope
Stage 5 must convert an accepted Feeder / Panel Run result into a traceable material plan and allow explicit application to Job Materials without inventing quantities/costs or mutating history.

### 1. Stage 4 gate and fail-closed behavior
Verify:
- takeoff publishes calculated rows only when Stage 4 status is `PASS`;
- `REVIEW REQUIRED`, `INPUT REQUIRED`, unsupported/no-config conditions cannot become final Job material quantities;
- EGC review candidates are never presented/applied as final installation quantities;
- unsupported Catalog mapping does not silently substitute another material.

Manually validate at least:
- 300 A, 480 V, 3Ø, 50 ft, Cu, EMT, no neutral;
- same with full-size neutral;
- long-run case that produces Stage 4 `REVIEW REQUIRED`.

### 2. Quantity math and classifications
Verify phase, neutral, EGC and raceway footage formulas for single and parallel sets.
Verify classifications remain distinct:
- `CALCULATED`;
- `ALLOWANCE`;
- `FIELD_VERIFY`.

Check:
- conductor/raceway allowance 0–20%;
- negative/>20/malformed handling;
- allowance quantities do not masquerade as code-required calculated quantities;
- fittings, pull points/equipment, labels and termination hardware remain field-verify where route/equipment facts are absent;
- no invented numeric quantity for FIELD_VERIFY rows.

### 3. Saved task / stale plan boundary
Verify Apply requires a real saved Electrical Task at the exact `sourceTaskId` + `sourceTaskRevision` in the active Job.
Check:
- fabricated metadata cannot apply;
- deleted task cannot apply;
- later task revision makes old plan stale;
- unsaved live form edits after Build Takeoff are detected by UI before Apply;
- saved task inputs and live inputs include Stage 4 fields (`ocpdAmps`, `neutralMode`, `egcMaterial`) and `parallelAllowed` semantics;
- Save remains separate from Apply.

### 4. Catalog mapping and strict cost semantics
Verify Catalog mappings for supported conductor/raceway rows are deterministic and project-safe.
For each applied calculated line test:
- blank/missing/invalid/negative Your Cost -> unresolved, no numeric contractor material-cost math;
- explicit zero Your Cost -> resolved numeric zero;
- positive Your Cost -> resolved numeric contractor cost;
- Customer Price is retained only as customer/reference snapshot and NEVER substitutes for Your Cost;
- later Catalog repricing does not rewrite historical Job Materials snapshots.

Check base Catalog definitions remain definitions only, not project requirements.

### 5. Apply / idempotency / provenance
Verify only non-FIELD_VERIFY numeric takeoff rows are eligible for application under the current Stage 5 contract.
Verify same task revision + same takeoff line cannot be duplicated by repeated Apply.
Verify a later saved task revision can create a new historical snapshot without rewriting the old revision.
Verify provenance fields including source task id/revision, takeoff line id, engine version, code edition/jurisdiction where present, classification/kind, catalog match, added timestamp.
Verify application ledger/history is Job-scoped.

### 6. Job isolation / persistence
Test Job A -> Job B replacement/import behavior:
- no Stage 5 plan/application/material snapshots from Job A may contaminate Job B;
- no device-global registry is authoritative;
- malformed/missing arrays fail safely;
- old Job records without Electrical Tasks do not accept forged Stage 5 application.

### 7. Runtime / PWA / UX
Verify:
- Stage 5 engine and UI load in correct dependency order after Stage 4;
- UI is reachable in Electrical Tasks workspace on desktop/tablet/phone;
- Apply is disabled for preview/stale/blocked plans;
- long labels/rows do not hide critical action/status on 360–430 px;
- PWA cache `bruno-electric-v57` contains Stage 5 engine/UI and deletes only owned stale Bruno Electric caches;
- unrelated caches are preserved.

### 8. Regression scope
Run/inspect full deterministic suite and spot-check no regression to:
- Stage 0–4 accepted Electrical Tasks behavior;
- Custom/Special-order strict Your Cost semantics;
- Catalog vs Job Materials definition/snapshot semantics;
- Quote/Invoice unresolved material-cost disclosures;
- Residential/Commercial Job isolation;
- navigation/workspace/deep-link behavior;
- Save vs Apply boundaries.

### 9. Exact-head CI provenance
Validate GitHub Actions run for exact audited SHA `aef98f62ab7c5c6176eebc9f12c4abbca0e36fbf`:
- workflow: `Electrical Calculator Tests`;
- checkout/provenance step checked exact SHA;
- deterministic test step green;
- no synthetic merge commit substituted for audited head.

### 10. Architecture ambiguity / dead path check
Inspect repository for any parallel or obsolete Stage 5 runtime/test files. Confirm only one runtime path is loaded by production bootstrap/PWA and one authoritative Apply semantics is reachable. If duplicate dormant implementations could be accidentally loaded or create maintenance ambiguity, classify appropriately and document exact paths.

## Verdict rule
- A ACCEPT: P0=0, P1=0.
- B ACCEPT AFTER MINOR FIXES: P0=0, P1=0; only P2/P3.
- C REJECT / REWORK REQUIRED: any P0/P1.

Commit full report to:
`audits/reports/ELECTRICAL_TASKS_STAGE5_aef98f6.md`

Chat response only:
VERDICT
AUDITED HEAD SHA
BLOCKERS
REPORT LINK

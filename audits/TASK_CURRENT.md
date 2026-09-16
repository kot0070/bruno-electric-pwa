# TASK_CURRENT — Independent Audit: Job Materials unresolved contractor cost / PWA v45

## MODE
AUDIT ONLY. Follow `audits/PROTOCOL.md`.

## AUDITED_HEAD_SHA
`51897424146454d50c2b9ae06e7f94f5c8b3e2c7`

## SOURCE PR
PR #13 — `dev/p1-project-journal-corrective` → `main`.

## SOURCE AUDIT
Previous candidate `eb7edb7ecbed209ab4291a247c6eeff3cb9f34c7` was rejected because Residential Live unresolved Your Cost was converted to numeric `unitCost:0` after Confirm & Save → BOM → Job Materials, and the main project material calculator then consumed that zero as a normal resolved cost.

## PRIMARY AUDIT SCOPE
Independently verify the complete candidate, not only developer claims or tests.

### 1. Residential Live → Confirm & Save → BOM → Job Materials — P1 corrective
Trace the real production path from a Catalog row with positive Customer Price and blank/missing Your Cost through:
- Residential Live pricing;
- Confirm & Save Project Calculation;
- `BrunoResidentialLiveHistory.confirmAtomic()`;
- `BrunoElectricBOM.prepareReplacement()`;
- persisted `bruno-electric-v1` state;
- Job Materials rendering;
- project material-cost / quote / gross-profit consumers.

Required behavior:
- blank/missing/invalid Your Cost remains first-class unresolved;
- unresolved generated rows must NOT be stored in `materialsUsed[]` as numeric zero or any other numeric cost;
- unresolved generated rows must remain persisted/reviewable in a distinct unresolved representation;
- explicit numeric `0` remains a valid known zero and stays in resolved Job Materials;
- known positive cost remains numeric/resolved;
- unresolved rows must not enter `calcMaterial()` or any resolved project material-cost/gross-profit/margin total;
- UI must visibly identify unresolved generated materials and indicate they are excluded/blocked from resolved cost math;
- reload must preserve the distinction.

### 2. Promotion / recalculation boundary
Verify:
- unresolved generated row + later known Your Cost + Confirm & Save again => row leaves unresolved storage and becomes resolved numeric Job Material;
- explicit zero is never mistaken for unresolved;
- same-source recalculation removes stale prior resolved/unresolved generated rows;
- manual and other-source materials remain preserved.

### 3. Pricing & Margins regression
Repeat the previous strict-runtime audit:
- legacy `#margins-body` / `renderMargins()` inactive;
- `#margins-body-strict` authoritative;
- blank Your Cost remains unresolved;
- explicit zero remains known zero;
- known positive remains known;
- row/aggregate cost, gross difference and margin exclude unresolved rows;
- blank/known/zero transitions survive save/reload;
- stale `*-catalog-costs-v1` values cannot resurrect cleared cost.

### 4. Catalog and Residential Live pricing regression
Verify:
- `.cat-your` blank capture remains fail-closed;
- Residential pricing still returns `YOUR_COST_UNRESOLVED` with null contractor cost/profit/margin for blank cost;
- no Customer Price fallback;
- exact/explicit-alias matching only; no fuzzy pricing;
- unsupported Catalog matches remain fail-closed.

### 5. Persistence / archive
Verify:
- `bruno-electric-v1.materialsUsed[]` contains only resolved generated contractor costs plus legitimate manual/other-source rows;
- unresolved generated rows persist separately with traceable source/catalog metadata;
- archive remains live-priced and does not freeze stale pricing;
- duplicate/reload/reprice flows do not collapse unresolved into zero.

### 6. PWA v45 / offline
Verify:
- cache is `bruno-electric-v45`;
- v44/v43/v42 and older owned Bruno Electric caches are invalidated;
- `electric-job-material-cost-semantics.js`, Pricing & Margins semantics and Catalog-cost semantics are required core-shell assets;
- installed clients can update and offline reload with the corrective behavior.

### 7. Regressions — independently repeat
Do not limit the audit to the latest blocker. Re-check:
- Commercial / Residential isolation;
- Residential ↔ Commercial switching;
- historical helper-tax stability Day/Week/Month/Quarter;
- completed-call tax stability;
- Project Calculator → Residential Live → BOM → Job Materials;
- Catalog Customer Price / Your Cost / margin;
- navigation and phone/tablet/desktop implications;
- persistence and PWA/offline behavior;
- deterministic suite and exact audited SHA CI provenance.

## EVIDENCE REQUIREMENTS
- Audit exact production candidate SHA, not the audit-branch commits.
- Inspect actual runtime/data transitions, not only source literals.
- Exercise blank → save → reload, blank → explicit 0, explicit 0 → blank, known positive → blank, unresolved → known promotion, and manual-row preservation.
- Verify exact-head CI belongs to `51897424146454d50c2b9ae06e7f94f5c8b3e2c7`.
- CI green is evidence only, not proof.
- Fail closed on any pricing/data-integrity ambiguity.

## REPORT_PATH
`audits/reports/P1_JOB_MATERIALS_V45_5189742.md`

## CHAT RESPONSE
Return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

Do not modify production code, PR, or merge state.

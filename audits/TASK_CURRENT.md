# TASK_CURRENT — Independent Audit: Pricing & Margins unresolved Your Cost / PWA v44

## MODE
AUDIT ONLY. Follow `audits/PROTOCOL.md`.

## AUDITED_HEAD_SHA
`eb7edb7ecbed209ab4291a247c6eeff3cb9f34c7`

## SOURCE PR
PR #13 — `dev/p1-project-journal-corrective` → `main`.

## SOURCE AUDIT
Candidate `496d7f7070d3116e93c209c430f88a3a71d6b7dc` was rejected because the active Pricing & Margins renderer substituted Customer Price when `Your Cost` was blank/unresolved, producing resolved-looking numeric contractor cost, gross difference and margin metrics.

## PRIMARY AUDIT SCOPE
Independently verify the complete candidate. Do not treat developer claims or CI as proof.

### 1. Active Pricing & Margins runtime — latest P1 corrective
Trace actual startup/event ordering from `index.html` and `sw-register.js`.

Verify:
- legacy `#margins-body` / legacy `renderMargins()` path is not active after startup;
- strict `#margins-body-strict` runtime owns the visible Pricing & Margins rows;
- positive Customer Price + blank/missing Your Cost displays unresolved, not Customer Price and not `$0.00`;
- derived gross difference and margin are unresolved when Your Cost is unresolved;
- unresolved rows do not enter resolved contractor-cost / gross-profit / margin aggregates;
- aggregate UI clearly discloses unresolved row count and does not present a full resolved-looking total;
- explicit user-entered `0` remains a valid known `$0` cost and may produce legitimate 100% material margin;
- known positive Your Cost calculates normally;
- blank/invalid input cannot silently become known zero or Customer Price.

Do not stop at source inspection. Exercise the live runtime path and event order.

### 2. Required state transitions / persistence
For a Catalog row with positive Customer Price, independently exercise:
- blank → save → reload;
- known positive cost → blank → reload;
- blank → explicit `0` → reload;
- explicit `0` → blank → reload;
- blank discount/% field behavior;
- explicit discount/% creating a deterministic known Your Cost.

Verify both:
- `bruno-electric-v1` Catalog state;
- all persisted `*-catalog-costs-v1` maps.

A cleared cost must not be resurrected by an old map. Blank and explicit zero must remain distinguishable after reload.

### 3. Catalog editor compatibility
Re-check `.cat-your` separately from Pricing & Margins:
- blank remains unresolved;
- explicit zero remains known zero;
- known positive value persists;
- Catalog and Pricing & Margins agree after reload;
- starter Catalog rows do not invent contractor cost.

### 4. Residential Live pricing / margin
With positive Customer Price:
- blank/missing Your Cost must remain `YOUR_COST_UNRESOLVED` / unresolved and must not contribute invented contractor cost, gross profit or margin;
- explicit zero is resolved zero;
- known positive cost resolves normally;
- Customer Price never substitutes for unresolved Your Cost;
- exact and explicit alias matching remain deterministic;
- unsupported rows remain fail-closed as unmatched.

### 5. Confirm & Save → BOM → Job Materials
Verify generated Residential Live material lines:
- unresolved Your Cost remains unresolved;
- explicit zero remains resolved zero;
- known positive cost propagates correctly;
- manual/other-source Job Materials remain preserved;
- catalog match metadata remains traceable.

### 6. PWA update / offline
Verify `bruno-electric-v44`:
- v43/v42/v41 and older Bruno Electric caches are invalidated;
- `electric-pricing-margins-semantics.js` and `electric-catalog-cost-semantics.js` are in the core shell;
- existing installed clients can move off earlier cached Pricing & Margins behavior;
- offline reload after a successful update uses strict-v2 semantics;
- unrelated caches are not deleted.

### 7. Regressions — independently repeat
Do not limit audit to the latest P1. Re-check:
- Commercial / Residential isolation and Residential-only workflow guards;
- Residential ↔ Commercial switching;
- historical helper-tax stability across Day/Week/Month/Quarter, future revisions and disable;
- completed-call tax stability;
- Residential Live ↔ Catalog pricing bridge;
- Customer Price / Your Cost / material margin;
- archive live repricing and persistence;
- Project Calculator → Residential Live → BOM → Job Materials;
- navigation and phone/tablet/desktop implications;
- PWA/offline/cache behavior;
- deterministic suite and exact audited SHA CI provenance.

## REQUIRED EVIDENCE
- Audit exact candidate SHA `eb7edb7ecbed209ab4291a247c6eeff3cb9f34c7`, not audit-branch commits.
- Confirm strict runtime takeover occurs before legacy inline app initialization can bind/use Pricing & Margins.
- Use runtime/state transitions, not static source assertions alone.
- Inspect unresolved row and aggregate presentation with positive Customer Price.
- Exercise blank ↔ explicit zero distinction through reload and persisted maps.
- CI green is evidence only, not proof.
- Fail closed on pricing/data-integrity ambiguity.

## REPORT_PATH
`audits/reports/P1_PRICING_MARGINS_V44_eb7edb7.md`

## CHAT RESPONSE
Return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

Do not modify production code, PR, or merge state.

# Electrical Tasks Stage 5 — Independent Re-audit

AUDITED PRODUCTION HEAD: `c1d43c345f1943f3fe730bfe3b6a22c6b535d4e5`

VERDICT: **A — ACCEPT**

P0: 0  
P1: 0  
P2: 1  
P3: 0

## Independent scope
Re-audit of Stage 5 Material Takeoff From Task after corrective hardening. Review focused on quantity derivation, Stage 4 fail-closed boundary, Catalog/Job cost semantics, saved-task provenance, Job A/B isolation, idempotency, PWA/runtime wiring, and protected Work/Workspace regressions.

## Exact-head CI evidence
- Workflow: `Electrical Calculator Tests`
- Run number: `426`
- Run id: `35134541643`
- Job id: `104923507314`
- Exact tested SHA: `c1d43c345f1943f3fe730bfe3b6a22c6b535d4e5`
- Provenance step emitted matching `TESTED_HEAD_SHA` and `EXPECTED_HEAD_SHA`.
- Deterministic suite: **700/700 passed**.
- Pages deployment for the same head also completed successfully.

## Audit findings

### 1. Stage 4 / review gate — PASS
`electric-electrical-task-material-takeoff.js` derives final takeoff rows only from a Stage 4 `PASS`. `REVIEW REQUIRED` and unsupported/no-config states return no applicable lines and `applyAllowed:false`. Long-run review candidates therefore cannot become Job Materials.

### 2. Quantity math / classification — PASS
Phase, optional full-size neutral, EGC, and raceway footage are explicit products of conductor/raceway count and one-way length. Allowances remain separate rows with `ALLOWANCE` classification and are bounded to 0–20%. Fittings, pull points/equipment, labels, and terminations remain `FIELD_VERIFY` with no invented numeric quantity.

### 3. Saved task / stale plan boundary — PASS after corrective
Corrective v3 binds the plan to:
- exact saved task id + revision;
- saved input snapshot including Stage 4 fields and `parallelAllowed` semantics;
- source Job id.

The engine now fails closed, not only the UI. A forged/missing/stale revision, saved-input mismatch, or Job switch blocks Apply. UI still revalidates live form state immediately before Apply.

### 4. Job A / Job B isolation — PASS after corrective
A plan built in Job A carries `sourceJobId` and cannot be applied into Job B even when task id/revision happen to match. Application snapshots and ledger entries retain source Job provenance. No device-global authoritative calculation registry was introduced.

### 5. Cost semantics — PASS
For applied rows:
- blank/missing Your Cost stays unresolved with `unitCost:null`;
- explicit zero remains a resolved numeric zero;
- positive Your Cost remains numeric contractor cost;
- Customer Price is snapshotted separately and never substituted for contractor cost.

Catalog edits after Apply do not mutate historical material snapshots.

### 6. Apply / idempotency / provenance — PASS after corrective
Repeated Apply of the same task revision and same takeoff options is idempotent by provenance key. The corrective additionally records takeoff allowance options and blocks silently applying a different allowance configuration against the already-applied same task revision. A new revision / later Stage 6 update workflow is required for changed takeoff intent.

Provenance includes Job id, task id/revision, takeoff line id, engine version, code edition/jurisdiction when available, classification/kind, catalog match, calculation basis, timestamp, and allowance options.

### 7. Runtime / PWA — PASS
Production bootstrap `sw-register.js` loads only the authoritative Stage 5 runtime `electric-electrical-task-material-takeoff.js`, then the existing Electrical Tasks UI chain and `electrical-tasks-stage5-ui.js`. PWA v57 caches those authoritative files. The owned-cache deletion rule remains constrained to `bruno-electric-vN`, preserving unrelated caches.

### 8. Protected Work/Workspace regression matrix — PASS
The full exact-head deterministic suite remains green after the Stage 5 corrective. The corrective touched only the Stage 5 takeoff module and its tests; it did not alter `electric-workspace.js`, app navigation, Job/Quote/Invoice runtime, Residential runtime, or shared pricing semantics. Existing regression suites for navigation, quote/invoice, residential, Catalog/Job cost semantics, service worker, and workflow integration remain included in the 700/700 exact-head run.

## Non-blocking finding

### P2 — Dormant parallel Stage 5 prototype modules remain in repository
Paths:
- `electric-electrical-task-takeoff.js`
- `electric-electrical-task-materials.js`

They expose older alternate takeoff/apply semantics but are not loaded by the production bootstrap and are not present in the PWA authoritative Stage 5 runtime chain. Therefore they are not a production blocker at this head. They should be explicitly marked legacy/deprecated or removed in a later maintenance cleanup once repository-history needs are resolved, to reduce maintenance ambiguity. Do not activate them alongside the authoritative v3 path.

## Gate conclusion
Stage 5 has no remaining P0/P1. Exact-head CI is green, corrective issues are covered by deterministic tests, and the protected workspace boundary remains intact.

**ACCEPT STAGE 5.**

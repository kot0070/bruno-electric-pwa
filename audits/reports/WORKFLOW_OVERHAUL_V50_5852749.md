# Bruno Electric — Full Workflow Overhaul v50 Independent Audit

## Verdict
**C — REJECT / REWORK REQUIRED**

## Audited target
- Repository: `kot0070/bruno-electric-pwa`
- PR: #14
- Audited HEAD: `5852749be6cd240b6e52bac15cacf4ffbfa6a288`
- Runtime implementation freeze: `cd474824c1a45bcc1edaf655a30a26880f00bc05`
- CI run #298: SUCCESS
- Exact-head provenance: PASS. Workflow checked out `5852749be6cd240b6e52bac15cacf4ffbfa6a288`; `TESTED_HEAD_SHA` and `EXPECTED_HEAD_SHA` both equal the audited SHA.
- Deterministic suite: `578/578 passed`.

## Audit method
Independent source/runtime-path review at the pinned SHA. Developer report and green CI were treated as claim/evidence maps only, not proof. Primary focus was persistence boundaries, Save/Apply separation, quote/invoice lifecycle, job isolation, archive behavior, Custom material cost semantics, PWA shell and prior regression contracts.

## Blocking findings

### P1-1 — Residential Calculation Archive is device-global, not job-scoped; Job A archive leaks into Job B/imported jobs

**Severity:** P1 — data isolation / persistence / primary workflow.

`electric-residential-live-history.js` stores archive rows in a separate global key:

`bruno-residential-live-library-v1`

`library()` reads that one global array without any job identity or ownership filter. `list()` hydrates every row in that global library against the **current** Job Catalog. `remove()` and `duplicate()` also operate on that global library by calculation ID only.

The active Job itself lives in `bruno-electric-v1`. Replacing/importing the Job therefore does not replace or scope the archive library.

**Reproduction path:**
1. In Job A, Save Calculation. Archive A is written to `bruno-residential-live-library-v1`.
2. Replace/import `bruno-electric-v1` with unrelated Job B.
3. Open Residential archive in Job B.
4. `H.list()` still returns Job A archive rows because the library is global.
5. Pricing is rehydrated against Job B's current Catalog, making Job A's saved quantities appear inside Job B with Job B prices.
6. `Duplicate / Load` can load Job A calculation content into Job B.
7. Export/import of a current Job does not inherently carry this separate archive library, so archive state can also be silently absent or mismatched after migration.

**Impact:** cross-job data leakage, misleading repricing, wrong-project archive visibility, and unsafe reuse of prior Job calculations. This violates the Stage 3/8 archive and import/job isolation contracts.

**Required corrective direction:** Residential saved calculations must have an explicit Job owner identity and/or be embedded in the exported Job state. `list/load/delete/duplicate/save` must operate only on the active Job's archive set. Import/New Job must not expose another Job's archive records. Migration of existing global archive data must be non-destructive and explicit.

---

### P1-2 — Approved fixed-price Quote snapshot is not connected to the application's actual Invoice/Print Invoice path

**Severity:** P1 — pricing / customer-document workflow.

`electric-quote-lifecycle.js` correctly creates an immutable approval snapshot and `invoiceBasis()` returns `source:'APPROVED_QUOTE_SNAPSHOT'` with the approved amount.

However, this invoice basis is only rendered inside the new Quote lifecycle card. The existing application invoice path remains the separate **T&M Invoice** path. `index.html` still exposes:
- header `Print Invoice` -> `runPrint('tm')`;
- `T&M Invoice` panel;
- `Print Invoice (PDF)` -> `runPrint('tm')`;
- the T&M panel explicitly states its total comes from T&M equipment/labor/material/sub detail, not Summary/Quote.

No production path was found that passes `BrunoQuoteLifecycle.invoiceBasis()` into invoice document generation or a fixed-price invoice document. The Stage 6 implementation therefore freezes a value but does not complete the promised `Approved Quote -> Invoice` transaction.

**Reproduction path:**
1. Build a fixed-price Job and Approve Quote Snapshot at amount X.
2. `BrunoQuoteLifecycle.invoiceBasis()` shows X.
3. Click the application's real `Print Invoice` control.
4. The app runs `runPrint('tm')`, generating the T&M invoice path, whose total is based on `state.tm`, not approved snapshot X.
5. There is no fixed-price invoice generation action consuming approval ID/revision/customer amount.

**Impact:** user can approve a fixed quote but the app's invoice button can produce an unrelated T&M document/amount. This is a production-blocking semantic mismatch in the primary Quote -> Invoice workflow.

**Required corrective direction:** create a distinct fixed-price Invoice action/document sourced only from `APPROVED_QUOTE_SNAPSHOT`, clearly separate it from T&M Invoice, carry approval ID/revision/approved amount/approved-at metadata, and ensure post-approval live calculator changes cannot alter that invoice basis. Keep T&M as a separate explicitly labeled invoice mode.

## Non-blocking observations

### P2-1 — Legacy Residential save alert/text remains semantically stale
The underlying `confirmAtomic()` is SAVE ONLY, and the overlay rewrites the alert in normal flow, but `electrical-residential-live-ui.js::saveConfirmed()` still contains legacy wording such as `Confirm & Save` and reports `Job materials updated` from a save-only result. This is currently masked by the Stage 3 overlay but creates maintenance risk if the overlay fails or load order changes.

### P2-2 — Green tests do not cover the two blockers above
Run #298 correctly proves exact-head provenance and 578/578 deterministic tests, but the suite lacks a cross-job Residential archive isolation scenario and lacks an end-to-end assertion that the actual Invoice print/document path consumes `APPROVED_QUOTE_SNAPSHOT`.

## Areas reviewed with no additional P0/P1 found
- Exact-head CI provenance is correct.
- Save vs Apply-to-Job boundary is structurally separated.
- Residential Apply removes/replaces prior Residential-generated rows while preserving manual/other generated rows.
- Custom materials remain scoped to the active Job Catalog; no device-global Custom registry authority is present.
- Blank / explicit zero / positive Your Cost semantics remain distinct in Custom Add routing.
- Quote approval snapshot is immutable by construction after persistence; re-approval creates revision/history.
- PWA v50 includes newly introduced runtime modules and owned-cache cleanup remains namespaced.
- Header/Summary semantic layer does not introduce a second OH/profit calculation engine.

## Math / pricing spot checks
- Quote approval candidate uses displayed Customer Quote Total and positive manual override only; blank uses live recommendation; zero/negative fail closed.
- Approved snapshot stores approved amount separately from current live state.
- Residential Apply feeds archived BOM rows through `BrunoElectricBOM.prepareReplacement()` rather than directly coercing blank cost to zero.
- No evidence found in the audited modules that unresolved Custom/Residential rows are deliberately inserted into numeric `materialsUsed[]`.

## Final verdict
**C — REJECT / REWORK REQUIRED**

### Blockers
1. **P1-1:** Residential archive is device-global and leaks across Job/import boundaries.
2. **P1-2:** Fixed-price approved Quote snapshot is not wired to the actual Invoice/Print Invoice workflow; the real Invoice path remains T&M.

PR #14 must not merge until both P1 findings are corrected and independently re-audited at a new frozen exact HEAD.

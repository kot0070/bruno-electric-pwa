# PR #12 — Texas Customer Document Compliance Final Acceptance Audit

**Mode:** AUDIT ONLY / FINAL_ACCEPTANCE_AUDIT  
**Audit date:** 2026-09-15  
**Repository:** `kot0070/bruno-electric-pwa`  
**Required base:** `bc69c7f81c7535fdb627a9bff471e06a4c4fc454`  
**Required production HEAD:** `8bfa3b61a2bd9ff18bd33f063e02562d881fc3cb`  
**Audited production HEAD:** `8bfa3b61a2bd9ff18bd33f063e02562d881fc3cb`  
**Verdict:** **C — REJECT / REWORK REQUIRED**

## Executive finding

The two previously reported production-integration defects are materially improved: the compliance module now reads the production Company form representation, and `sw-register.js` installs a capture-phase fail-closed gate before starting the asynchronous navigation chain. Exact-head CI is green and the PWA shell includes the compliance module.

However, independent re-discovery of print paths found a remaining **P1 acceptance blocker**: the app intentionally supports a browser-native fallback print path (`Ctrl+P` / browser Print) which bypasses the click gate entirely. The CSS explicitly prints the active panel when neither `body.print-quote` nor `body.print-tm` is present and explicitly hides `#print-root`. `document-compliance.js`'s `beforeprint` listener only appends the notice into `#print-quote` and `#print-tm`; it does not validate active Company identity, block the print, or convert fallback printing into the guarded dedicated document. Therefore a user can open Quote or T&M Invoice and invoke browser Print to produce customer-facing output without the compliance gate and without the fixed §73.51(f) notice in the actually printed subtree.

Under `audits/PROTOCOL.md`, any P1 acceptance blocker requires rejection/rework, so the result is **Verdict C**.

---

## 1. SHA / PR / CI verification

- PR #12 is **open**, **not merged**, and not draft.
- Base branch: `main`.
- PR base SHA exactly matches required base: `bc69c7f81c7535fdb627a9bff471e06a4c4fc454`.
- PR HEAD exactly matches required production HEAD: `8bfa3b61a2bd9ff18bd33f063e02562d881fc3cb`.
- Base→HEAD comparison is `ahead`, 18 commits, 0 behind; merge base equals the required base SHA.
- Exact-head GitHub Actions check `calculator-tests` completed successfully against `8bfa3b61a2bd9ff18bd33f063e02562d881fc3cb`.

No SHA/base drift blocker.

## 2. Current Texas TDLR requirements — independent verification

Official/current TDLR sources independently reviewed:

- TDLR Electricians Laws and Rules: https://www.tdlr.texas.gov/electricians/laws-rules.htm
- TDLR Electrical Contractors Compliance Guide: https://www.tdlr.texas.gov/electricians/compliance-guide.htm
- TDLR Electrical Safety Penalties and Sanctions: https://www.tdlr.texas.gov/enforcement/elecsanctions.htm
- TDLR 2026 rulemaking — July 2, 2026: https://www.tdlr.texas.gov/news/rulemaking/2026/07/02/commission-adopts-rules-4/
- TDLR 2026 rulemaking — September 1, 2026: https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/

Current 16 TAC §73.51(f) requires the electrical contractor's **name, address, phone number, and license number** on **all proposals, invoices, and written contracts**, plus this fixed Department information on all three document types:

> Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov

TDLR enforcement guidance independently corroborates both violation categories: failure to include contractor identity and failure to include Department information on proposals, invoices, and written contracts.

The current TDLR Compliance Guide contains a conflicting/older presentation: it ends the notice with `/complaints` and its prose says “all invoices and written contracts” for the Department notice. The current rule text and TDLR enforcement guidance are controlling/stronger and apply Department information to proposals as well. PR #12 correctly uses the current §73.51(f) wording ending in `www.tdlr.texas.gov`.

The reviewed 2026 Electricians rulemaking did not amend §73.51(f): July changes concern JEEP/licensure rules; September changes concern §73.100 / adoption of the 2026 NEC and the Texas 210.8(F) modification.

No additional TDLR electrical-contractor requirement was identified in these sources requiring a separate LLC/SOS entity number or EIN on these customer documents.

## 3. Re-discovered customer-facing document / form / print surfaces

Independent repository inspection identified:

- Quote / Proposal panel with `#btn-print-quote` and `#btn-print-quote-2`.
- T&M Invoice panel with `#btn-print-tm` and `#btn-print-tm-2`.
- Dedicated hidden print documents `#print-quote` and `#print-tm`.
- `runPrint(mode)` production path, which builds the print documents, sets `body.print-quote` / `body.print-tm`, invokes `window.print()`, then cleans up after `afterprint`.
- Browser-native fallback print path: print CSS explicitly handles `body:not(.print-quote):not(.print-tm)` and prints the currently active panel while hiding `#print-root`.
- Company/letterhead fields, active letterhead selector/state, editable invoice/quote footer.
- Change Orders panel: approved COs are incorporated into the printed Quote/Proposal; no separate standalone CO print generator was found.
- Job JSON export/import plus company/app backup surfaces. These are data-transfer surfaces, not themselves customer proposal/invoice/contract document renderers.

### P1 BLOCKER — browser-native fallback print bypasses compliance

Evidence chain:

1. The app's print CSS intentionally defines a **fallback Ctrl+P** path when no dedicated print class is set.
2. In that fallback state it hides `#print-root`, which contains the only `#print-quote` / `#print-tm` nodes targeted by `preparePrintDocs()`.
3. `sw-register.js` and `document-compliance.js` block only click events whose targets match the four normal print buttons.
4. Browser-native Print / `Ctrl+P` does not click any of those controls, so neither click gate runs.
5. The `beforeprint` handler calls only `preparePrintDocs()`. It does **not** call `complianceStatus()`, does not cancel/block printing, and does not set a dedicated `body.print-*` class.
6. Because fallback CSS hides `#print-root`, the regulatory notice appended by `preparePrintDocs()` is not in the subtree being printed.
7. Therefore, with Quote or T&M Invoice active, a user can invoke browser Print and produce a customer-facing print/PDF without contractor-identity validation and without the fixed §73.51(f) notice.

**Severity:** P1 acceptance blocker.  
**Acceptance criterion violated:** a normal customer-document print path can bypass compliance; required notice can be absent from printed proposal/invoice output.

This path is also not exercised by `tests/document-compliance.test.js`; the tests assert presence of a `beforeprint` hook and button-click fail-closed behavior, but do not simulate browser-native print with fallback CSS / hidden `#print-root`.

## 4. Active Company / letterhead integration

The previously reported closure-local-state blocker is materially addressed.

`document-compliance.js` no longer assumes global access to closure-local `state` / `getActiveProfile()`. Its production fallback reads these Company form fields:

- `co-legal`
- `co-addr1`
- `co-city`
- `co-state`
- `co-zip`
- `co-phone`
- `co-license`

Those fields are the production Company/letterhead editing representation and are populated from the active letterhead by the existing app. The compliance status also re-renders on relevant Company `input` and `change` events.

The validation model is fail-closed for the required identity components:

- complete identity: pass;
- missing legal name: fail;
- missing street: fail;
- missing city: fail;
- missing state: fail;
- missing ZIP: fail;
- missing phone: fail;
- missing contractor license / TECL: fail.

No remaining P1 was found in the active-Company integration itself.

## 5. Dedicated Quote/Invoice button path

For the four normal app print controls, the implementation is substantially correct:

- `sw-register.js` installs a capture-phase bootstrap blocker before the async navigation enhancement chain.
- `document-compliance.js` is requested independently and immediately.
- Compliance-script load failure leaves the bootstrap blocker active; it does not fail open.
- Bootstrap yields only when `window.BrunoDocumentCompliance.complianceStatus` exists.
- The compliance module then performs active-Company validation in capture phase.
- `preparePrintDocs()` removes any prior `.be-tdlr-notice` and appends exactly one fixed notice to each dedicated print document.
- Editable Company footer content is separate from the fixed notice node and cannot replace it through the normal dedicated print flow.

The dedicated button flow itself therefore clears the two prior blockers. The remaining P1 is the separate fallback/browser print path described above.

## 6. Quote / Proposal, Invoice, Change Orders

### Quote / Proposal

Dedicated Quote print is guarded and receives the fixed §73.51(f) notice. The Quote surface describes itself as a customer proposal. Approved Change Orders are included in Quote Total / printed Quote.

### T&M Invoice

Dedicated Invoice print is guarded and receives the fixed §73.51(f) notice. It uses the same active Company letterhead and editable footer, with the regulatory notice added separately.

### Change Orders

No standalone customer-facing Change Order PDF/written-contract generator was identified. Approved Change Orders are represented in the printed Quote/Proposal and therefore inherit the Quote document's contractor identity + Department notice on the dedicated print path.

If a standalone written Change Order surface is later added, it must independently satisfy §73.51(f).

## 7. PWA / offline / cache

Verified at audited HEAD:

- cache version is `bruno-electric-v36`;
- `./document-compliance.js` is in `CORE_SHELL`;
- service-worker install treats `CORE_SHELL` as mandatory;
- stale cache cleanup is ownership-isolated by `^bruno-electric-v\d+$` and preserves unrelated origin caches;
- compliance loading is independent of navigation enhancement loading.

No P1 PWA/offline/cache blocker found.

## 8. Regression review — calculator / NEC / BOM / pricing / persistence / navigation

Base→HEAD changed only these seven files:

- `docs/TEXAS_CUSTOMER_DOCUMENT_COMPLIANCE_AUDIT.md`
- `document-compliance.js`
- `sw-register.js`
- `sw.js`
- `tests/document-compliance.test.js`
- `tests/run-node.js`
- `tests/service-worker.test.js`

No calculator core, NEC/rules modules, BOM modules, catalog/pricing modules, or main persistence implementation were changed by this PR. The only production navigation-related edit is loader sequencing/error handling in `sw-register.js`; it preserves navigation fallback behavior while moving compliance loading ahead of the async enhancement chain. Exact-head `calculator-tests` CI passed.

No material P0/P1 regression was identified in calculator math, NEC logic, BOM, pricing/catalog, persistence, or universal navigation from this diff.

## 9. Test quality assessment

Green CI is not sufficient proof of acceptance here.

The deterministic compliance tests correctly cover:

- exact notice string;
- required identity fields;
- supplied-company and Company-form validation;
- notice de-duplication;
- pre-ready bootstrap blocking;
- compliance script load failure;
- bootstrap handoff after API readiness;
- cache assertions.

But the tests model print only through the four guarded button clicks and inspect `preparePrintDocs()`. They do **not** execute the production browser-native `beforeprint`/fallback CSS path. The test named `TDLR notice is applied to quote proposal and invoice print documents` only string-checks that a `beforeprint` hook exists; it does not prove that the notice is inside the visible printed tree during fallback printing or that incomplete Company data blocks browser-native print.

This is precisely the path producing the P1 finding.

## 10. Blockers

### P1 — Browser-native / Ctrl+P fallback can print Quote or Invoice outside the compliance gate

**Impact:** incomplete contractor identity can be printed, and required §73.51(f) Department notice is absent from the actually printed fallback document because `#print-root` is hidden.  
**Status:** OPEN at audited HEAD `8bfa3b61a2bd9ff18bd33f063e02562d881fc3cb`.  
**Required for acceptance:** make browser-native/fallback printing fail closed for customer Quote/Invoice surfaces, or route it through the same validated dedicated print document; add deterministic production-integration coverage proving incomplete identity cannot print and the fixed notice is visible in the printed subtree for that path.

No P0 blockers identified.

---

## Final verdict

**VERDICT C — REJECT / REWORK REQUIRED**

The prior active-Company and asynchronous-bootstrap defects are fixed for the dedicated print buttons, but the independently discovered browser-native fallback print path remains a P1 compliance bypass. PR #12 is therefore not safe to merge under the stated acceptance protocol at audited production HEAD `8bfa3b61a2bd9ff18bd33f063e02562d881fc3cb`.

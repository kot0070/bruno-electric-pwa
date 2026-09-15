# PR #12 — Texas Document Compliance Corrective Final Acceptance Audit

**Audit mode:** AUDIT ONLY / FINAL_ACCEPTANCE_AUDIT  
**Audit date:** 2026-09-15  
**Required base:** `bc69c7f81c7535fdb627a9bff471e06a4c4fc454`  
**Audited production HEAD:** `ded3e7bddbcd47b44b760f77d8a24e389fab0d0d`  
**Audit branch:** `audit/pr12-ded3e7b`  
**Verdict:** **C — REJECT / REWORK REQUIRED**

## Executive result

The regulatory text, customer-document scope, PWA cache inclusion, changed-file scope, and exact-head CI are substantially correct. However, the production compliance gate is not integrated with the application's actual active Company/profile state. `document-compliance.js` attempts to read `window.getActiveProfile` or `window.state`, while the production application defines `getActiveProfile()` and `state` inside its main closure and does not export either to `window`. Consequently, the compliance module's normal `activeCompany()` path resolves to `{}` and treats every required field as missing. A fully compliant active Company therefore cannot pass the customer print action after the compliance module has loaded.

There is also a separate fail-closed bootstrap defect: the application binds its existing Quote/Invoice `runPrint()` handlers before the compliance module is dynamically installed through a multi-script asynchronous loader chain, and a compliance-script load error is explicitly swallowed. During that pre-guard interval—or permanently if the compliance script fails to load—the normal app Print Quote / Print Invoice buttons can execute without the compliance gate. That violates the acceptance requirement that an incomplete active Company must fail closed and that no normal app print path may bypass compliance.

Both defects are acceptance blockers.

## 1. Required SHA / PR verification

PASS.

- `TASK_CURRENT.md` requires PR #12 base `bc69c7f81c7535fdb627a9bff471e06a4c4fc454` and production HEAD `ded3e7bddbcd47b44b760f77d8a24e389fab0d0d`.
- PR #12 currently reports base branch `main`, base SHA `bc69c7f81c7535fdb627a9bff471e06a4c4fc454`, and head SHA `ded3e7bddbcd47b44b760f77d8a24e389fab0d0d`.
- Current `main` remains exactly `bc69c7f81c7535fdb627a9bff471e06a4c4fc454`; there is no target-branch drift against the required base.
- PR #12 remains open and unmerged.

No production branch, PR metadata/comment, target branch, or merge state was modified by this audit.

## 2. Independent current Texas TDLR verification

### 2.1 Source hierarchy

The controlling source for the electrical-contractor customer-document requirement is current **16 TAC §73.51(f)**, linked by TDLR from its Electricians Laws and Rules page as part of Texas Administrative Code Chapter 73. TDLR's Compliance Guide is secondary guidance; TDLR's Electrical Safety Penalties and Sanctions page corroborates enforcement scope.

Official/current sources independently checked:

1. TDLR Electricians Laws and Rules:  
   https://www.tdlr.texas.gov/electricians/laws-rules.htm
2. TDLR Electrical Contractors Compliance Guide:  
   https://www.tdlr.texas.gov/electricians/compliance-guide.htm
3. TDLR Electrical Safety Penalties and Sanctions:  
   https://www.tdlr.texas.gov/enforcement/elecsanctions.htm
4. Current Chapter 73 / §73.51 path linked from the TDLR Laws and Rules page; because the SOS TAC endpoint is not consistently retrievable by the audit client, current §73.51 text was cross-checked against the current rule mirror used by the implementation documentation:  
   https://txrules.elaws.us/rule/title16_chapter73_sec.73.51
5. TDLR 2026 Electricians rulemaking/adoptions:  
   https://www.tdlr.texas.gov/news/rulemaking/2026/07/02/commission-adopts-rules-4/  
   https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/
6. Texas Register adopted-rule notices:  
   https://www.sos.state.tx.us/texreg/archive/June262026/Adopted%20Rules/16.ECONOMIC%20REGULATION.html  
   https://www.sos.state.tx.us/texreg/archive/August282026/Adopted%20Rules/16.ECONOMIC%20REGULATION.html

### 2.2 Current §73.51(f) requirement

Current §73.51(f) requires the electrical contractor's **name, address, phone number, and license number** on **all proposals, invoices, and written contracts**. It also requires the following Department information on all three document types:

> Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov

TDLR's current Electrical Safety Penalties and Sanctions page independently corroborates both violations under §73.51(f): failure to include contractor name/address/phone/license on all proposals, invoices, and written contracts, and failure to include Department information on all proposals, invoices, and written contracts.

### 2.3 Compliance Guide discrepancy reconciled

The current TDLR Compliance Guide states the contractor identity requirement for proposals, invoices, and written contracts, but its quoted Department notice is described for invoices and written contracts and ends with `www.tdlr.texas.gov/complaints` (and has a minor punctuation variant in the postal address).

That secondary guidance conflicts with the current controlling §73.51(f) text and with TDLR's current enforcement page on both scope and notice URL. The production implementation correctly selects the controlling §73.51(f) wording ending in `www.tdlr.texas.gov` and applies it to both Proposal/Quote and Invoice output.

PASS on source reconciliation and chosen regulatory notice.

### 2.4 2026 rulemaking check

The July 2026 Electricians adoption amended §§73.10, 73.21, 73.26, 73.80, 73.110, 73.111 and added §73.112. The September 1, 2026 adoption amended §73.100 to adopt the 2026 NEC with a Texas modification. Neither 2026 adoption amended §73.51.

PASS: no 2026 rulemaking found that supersedes the §73.51(f) customer-document text used here.

### 2.5 LLC / SOS entity number / EIN

No separate Texas LLC file number, Secretary of State entity number, or EIN display requirement was found in the current §73.51(f) customer-document rule, the TDLR Compliance Guide's contractor-invoice section, or the Electrical Safety Penalties and Sanctions customer-document requirements. Those identifiers may exist in business/licensing/tax records, but they are not an additional display element identified by the reviewed TDLR electrical-contractor proposal/invoice/written-contract requirement.

PASS within the requested TDLR customer-document scope. The repository documentation states this conclusion with the proper limitation rather than inferring a display duty from application/licensing requirements.

## 3. Independent repository surface discovery

### Quote / Proposal UI and print/PDF

Found two normal Quote print controls:
- header `#btn-print-quote`;
- Quote panel `#btn-print-quote-2`.

Both invoke the application's `runPrint('quote')`. The printed customer document is `#print-quote`, populated by `buildPrintDocs()`. It renders the active letterhead identity, customer/job information, proposal information, sales buckets, base quote, approved Change Orders, quote total, signature/validity block, custom footer, and informational jurisdiction/NEC footer.

### T&M Invoice UI and print/PDF

Found two normal Invoice print controls:
- header `#btn-print-tm`;
- T&M panel `#btn-print-tm-2`.

Both invoke `runPrint('tm')`. The printed customer document is `#print-tm`, populated by `buildPrintDocs()`, with active letterhead identity, invoice/customer information, equipment/labor/material/subcontractor totals, custom footer, and informational footer.

### Change Orders

The Change Orders UI has no standalone customer print/contract button or separate print document. Approved Change Orders are rendered as an `Approved change orders` table inside the Quote/Proposal output; non-approved statuses are excluded. Therefore current Change Orders inherit the Quote/Proposal's document compliance requirements. No separate standalone Change Order customer contract surface was found.

### Company / letterhead / footer

The Company profile provides:
- Legal name;
- DBA;
- Address line 1 / line 2;
- City;
- State;
- ZIP;
- Phone;
- Email;
- License (TECL);
- Website;
- editable invoice/quote footer note.

The fixed TDLR notice is not sourced from the editable footer. It is hard-coded in `document-compliance.js` and appended as a separate `.be-tdlr-notice` node after document preparation.

### Alternate print/export paths

Repository inspection found the dedicated Quote and T&M print buttons and `runPrint()` flow described above. JSON export/backup paths are data exports, not customer proposal/invoice PDF surfaces. No additional standalone document/PDF generator was found.

A direct browser print without `body.print-quote` / `body.print-tm` does not activate the dedicated customer print-root CSS path; the customer-document flow is the normal app `runPrint()` path.

## 4. Production implementation assessment

### 4.1 Fixed regulatory notice

PASS in isolation.

`document-compliance.js` fixes the notice to the current §73.51(f) wording. `preparePrintDocs()` targets both `#print-quote` and `#print-tm`, removes the existing `.be-tdlr-notice` if present, and appends one fixed notice. Repeated preparation therefore leaves one notice under the normal one-notice state. The user-editable Company footer is built separately by `buildPrintDocs()` and cannot replace the fixed notice text.

### 4.2 Complete-address rule

PASS in the module's isolated validation API.

The required-field set explicitly includes:
- contractor name;
- street address;
- city;
- state;
- ZIP code;
- phone number;
- contractor license number.

A street line alone therefore does not satisfy the module's isolated compliance check.

### 4.3 BLOCKER P1 — compliance gate cannot read the production active Company

**Severity: P1 / acceptance blocker.**

`document-compliance.js` resolves the active company as follows:

```js
function activeCompany(){
  try{if(typeof window.getActiveProfile==='function'){
    var p=window.getActiveProfile();if(p)return p
  }}catch(e){}
  try{if(window.state&&window.state.company)return window.state.company}catch(e){}
  return {};
}
```

The production application, however, defines `getActiveProfile()` inside its main application closure and does not export it as `window.getActiveProfile`. The application `state` is likewise closure-scoped and is not exported as `window.state`. Repository search found no `window.getActiveProfile` or `window.state` bridge.

Thus, in the actual application integration, `activeCompany()` falls through to `{}`. `complianceStatus()` consequently reports every required identity field missing even when the active Company profile is complete. The capture-phase `blockNoncompliantPrint()` then prevents the normal Quote/Invoice print buttons from reaching their existing `runPrint()` handlers.

**Acceptance impact:**
- fails C: `compliant complete profile allows normal print flow`;
- prevents usable Quote/Proposal and Invoice customer-document printing after the compliance module loads;
- is a P1 customer workflow regression and therefore prevents verdict A/B under the protocol.

**Why CI did not catch it:** `tests/document-compliance.test.js` passes an artificial `base` company object directly into `complianceStatus(base)`. That verifies the field validator but bypasses `activeCompany()` and therefore does not exercise the production integration with the actual active profile vault/state.

### 4.4 BLOCKER P1 — bootstrap/load failure is fail-open, so a normal print path can bypass the gate

**Severity: P1 / acceptance blocker.**

The existing production app binds all four print buttons directly to `runPrint()` inside the main application initialization. `document-compliance.js` is not synchronously loaded before those handlers. Instead, `sw-register.js` starts after DOMContentLoaded and loads a chain:

`electric-app-navigation.js` → `electric-workspace.js` → `electric-navigation-bridge.js` → `document-compliance.js`.

Only after the final dynamic script executes is the capture-phase compliance click handler installed. Therefore there is a real interval after the app's normal `runPrint()` handlers are live but before the compliance guard is installed.

Additionally, the compliance loader explicitly swallows load failure:

```js
c.onerror=function(){};
```

If `document-compliance.js` cannot load, the existing normal Print Quote / Print Invoice buttons remain operational with no fail-closed substitute.

**Acceptance impact:**
- fails A/C fail-closed behavior for incomplete identity during the pre-guard interval;
- violates the explicit blocking condition that an alternate normal app print path must not bypass required compliance;
- creates permanent fail-open behavior on a compliance-module load error.

The module is correctly cached for normal PWA/offline operation, but cache inclusion does not cure this bootstrap ordering/failure-mode defect.

## 5. PWA / offline / service-worker assessment

PASS for cache inclusion and ownership isolation.

- `document-compliance.js` is present in the actual app bootstrap path through `sw-register.js`.
- It is included in `sw.js` `CORE_SHELL`.
- cache version is bumped from v34 to v35.
- cache deletion remains limited to `OWNED_CACHE_RE = /^bruno-electric-v\d+$/`, preserving ownership isolation.
- same-origin GET fetch behavior remains limited to the app shell logic.

The bootstrap ordering/fail-open issue above remains a separate P1 acceptance defect.

## 6. CI / tests

Exact-head CI PASS as a CI status, but test coverage is insufficient to establish acceptance because it misses the production integration blocker.

For exact HEAD `ded3e7bddbcd47b44b760f77d8a24e389fab0d0d`:
- workflow: **Electrical Calculator Tests**;
- run: `35026563384`;
- status: completed;
- conclusion: success;
- job `calculator-tests`: success;
- deterministic test step: success.

`tests/run-node.js` includes `document-compliance.test.js` and `service-worker.test.js` along with calculator/data/navigation/residential/phase tests.

Positive coverage in the new compliance test:
- exact fixed rule notice string;
- city/state/ZIP/street incomplete cases through `complianceStatus(company)`;
- complete supplied identity through `complianceStatus(company)`;
- repeat `preparePrintDocs()` produces one notice on Quote and Invoice mock documents;
- bootstrap source contains the compliance loader;
- documentation contains discrepancy and LLC/SOS/EIN discussion.

Coverage gap directly material to the P1 finding:
- it never executes `complianceStatus()` without an explicitly supplied company against the real application's active profile bridge;
- it does not load the production app plus compliance module together and click a real print button;
- it does not test that the guard exists before `runPrint()` can become callable;
- it does not test compliance-script load failure/fail-closed behavior.

## 7. Regression and changed-file scope

PASS for changed-file scope; no P0/P1 calculator/NEC/BOM/catalog/persistence/navigation code change was introduced by PR #12 itself.

PR #12 changes exactly seven files:
- `docs/TEXAS_CUSTOMER_DOCUMENT_COMPLIANCE_AUDIT.md`;
- `document-compliance.js`;
- `sw-register.js`;
- `sw.js`;
- `tests/document-compliance.test.js`;
- `tests/run-node.js`;
- `tests/service-worker.test.js`.

No estimating/calculator math, NEC rule engine, BOM, catalog/pricing, job persistence, or universal responsive navigation production source was modified by this PR. Exact-head CI also passes the existing deterministic suites. The P1 regression is confined to the new customer-document compliance/print integration itself.

## 8. Documentation assessment

PASS for regulatory/source content.

`docs/TEXAS_CUSTOMER_DOCUMENT_COMPLIANCE_AUDIT.md` accurately documents:
- controlling source hierarchy;
- current §73.51(f) identity and notice requirement;
- the current Compliance Guide `/complaints` discrepancy and why the rule controls;
- proposal/invoice/written-contract scope;
- current Change Order model and absence of a standalone CO document generator;
- no separately identified LLC/SOS/EIN customer-document display requirement, with appropriate scope;
- intended complete-address gate and fixed-notice separation.

Its statement that the implementation has a functioning complete contractor identity gate is not borne out by the production integration because of P1-1 above; that is an implementation defect rather than a regulatory-text defect.

## 9. Acceptance matrix

| Requirement | Result | Notes |
|---|---|---|
| Exact base / exact production HEAD | PASS | Exact SHAs match task and PR; main has not drifted |
| Current §73.51(f) independently verified | PASS | Rule scope and notice reconciled against TDLR guidance/enforcement and 2026 rulemaking |
| Contractor identity fields include complete address | PASS in isolated validator | name/street/city/state/ZIP/phone/license all present |
| Complete active profile allows normal print | **FAIL P1** | module cannot access closure-scoped active profile/state |
| Incomplete active profile fails closed | **FAIL P1** | bootstrap window/load-error path leaves existing `runPrint()` handlers unguarded |
| Fixed notice exact/current | PASS | uses controlling §73.51(f) wording |
| Notice on Quote and Invoice | PASS after module preparation | both print targets handled |
| Notice non-editable / custom footer separate | PASS | fixed module constant vs Company footer |
| No repeated notice duplication | PASS in covered normal behavior | repeated preparation leaves one notice |
| Approved CO customer output | PASS | only approved COs included inside Quote/Proposal |
| Standalone CO surface | N/A | none exists |
| Alternate customer print generator | No additional generator found | normal app print path itself has bootstrap bypass defect |
| PWA module cached/offline | PASS | module in bootstrap and CORE_SHELL |
| Cache ownership isolation | PASS | owned-cache regex preserved |
| Exact-head CI | PASS | completed/success on audited SHA |
| Behavioral tests | PARTIAL | validator/notice behavior covered; real app state bridge and fail-closed bootstrap not covered |
| Changed scope | PASS | only compliance/PWA/tests/docs files |
| Regulatory documentation | PASS | source hierarchy/discrepancy/scope/LLC-SOS-EIN adequately documented |

## 10. Blockers

### P1-1 — Production compliance module has no access to the active Company/profile

`document-compliance.js` reads only `window.getActiveProfile` / `window.state.company`; the application exposes neither. A compliant profile is therefore evaluated as empty and customer printing is blocked.

### P1-2 — Compliance bootstrap is not fail-closed

Normal `runPrint()` button handlers are active before the dynamically chained compliance module is installed, and a compliance-module load failure is silently ignored. An incomplete profile can therefore reach the normal customer print path before guard installation or if the compliance script fails.

## 11. Required rework before re-audit

1. Provide a deliberate, stable integration boundary by which the compliance guard reads the actual active letterhead/profile (or move the gate into the same application closure and call it directly).
2. Ensure the compliance gate is installed synchronously before any customer print handler can execute, or place the validation directly inside `runPrint()` so the print function itself is fail-closed regardless of loader timing.
3. Treat inability to load/initialize compliance logic as a blocked customer print state, not a silent fail-open state.
4. Add an integration-level behavioral test using the real app/profile bridge: a complete active profile must reach print; deleting each required component (including city/state/ZIP) must prevent `window.print()`.
5. Add a bootstrap/load-failure test proving the normal app print path cannot execute before/without compliance initialization.
6. Re-run exact-head CI and submit a new immutable acceptance audit against the corrected production HEAD.

## Final verdict

**VERDICT: C — REJECT / REWORK REQUIRED**  
**AUDITED HEAD SHA: `ded3e7bddbcd47b44b760f77d8a24e389fab0d0d`**  
**P0 blockers: 0**  
**P1 blockers: 2**

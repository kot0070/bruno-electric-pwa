# PR 12 — Texas Customer Document Compliance — Final Acceptance Audit

**Task:** `PR_12_TEXAS_CUSTOMER_DOCUMENT_COMPLIANCE_FINAL_ACCEPTANCE`  
**Mode:** `FINAL_ACCEPTANCE_AUDIT` / `AUDIT_ONLY`  
**Audit date:** 2026-09-15  
**Required base:** `bc69c7f81c7535fdb627a9bff471e06a4c4fc454`  
**Required / audited production HEAD:** `a32f785149f91c77f2064d7ab7da394de074ab1b`  
**PR:** #12  

## VERDICT

**C — REJECT / REWORK REQUIRED**

There are **P1 acceptance blockers** in the customer-document compliance implementation. PR #12 must not be merged in its audited state.

## BLOCKERS

### P1-1 — The print gate does not require a complete contractor address

TDLR requires the contractor's **name, address, phone number, and license number** on all proposals, invoices, and written contracts. The Company model has separate `address1`, `city`, `state`, and `zip` fields, and the print letterhead can therefore render a partial address.

`document-compliance.js` considers the address requirement satisfied when **only** `address1` (or legacy `address`) is non-empty:

```js
if(key==='address')return String(c.address1||c.address||'').trim();
```

The gate does not require `city`, `state`, or `zip`. Therefore a profile containing only a street line can pass `complianceStatus().ok === true` and Print Quote / Print Invoice remains enabled even though the contractor address is incomplete.

This directly conflicts with the acceptance blocker in `TASK_CURRENT.md`: **required contractor identity can be omitted while the app still allows its customer print flow**.

**Required correction:** validate a complete printable contractor address using the actual Company address model, at minimum ensuring the populated address rendered to the customer contains the street/locality/state/ZIP components required to constitute the contractor's address. Add behavioral regression coverage for missing city/state/ZIP, not only source-string assertions.

### P1-2 — Hard-coded TDLR notice does not match the current controlling rule text; official TDLR sources are inconsistent and the implementation audit does not reconcile them

The implementation hard-codes the current TDLR Compliance Guide wording:

> Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas, 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov/complaints

However, the current **16 TAC §73.51(f)** text linked by TDLR's Laws and Rules page states that the following Department information shall be listed on **all proposals, invoices, and written contracts** and uses:

> Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov

The substantive differences are the website (`www.tdlr.texas.gov` vs. `www.tdlr.texas.gov/complaints`) and punctuation around `Texas 78711`.

TDLR's current enforcement page also explicitly treats failure to include Department information on **all proposals, invoices and written contracts** as a violation under §73.51(f). The current Compliance Guide, by contrast, says the identity quartet is required on proposals/invoices/written contracts but its next sentence says the quoted notice is required on invoices and written contracts; this conflicts with both §73.51(f) and TDLR's current enforcement page regarding proposals.

The implementation audit records only the Compliance Guide notice and enforcement page and calls the chosen output the "published TDLR notice" without identifying the conflict with the controlling rule text. Because the acceptance task specifically requires independent verification of current official TDLR requirements and an accurate fixed regulatory notice, this unresolved source conflict is a P1 acceptance issue.

**Required correction:** reconcile the current rule text and TDLR guidance before merge. For a compliance-critical fixed notice, use the text required by current §73.51(f), or obtain/document an authoritative TDLR basis for a different text. The implementation audit must explicitly record the source hierarchy and discrepancy rather than silently selecting the guide variant.

## OFFICIAL TEXAS TDLR REQUIREMENTS — INDEPENDENT CHECK

Checked 2026-09-15 against current sources:

1. TDLR Electricians Laws and Rules:  
   https://www.tdlr.texas.gov/electricians/laws-rules.htm

2. TDLR Electrical Contractors Compliance Guide:  
   https://www.tdlr.texas.gov/electricians/compliance-guide.htm

3. TDLR Electrical Safety Penalties and Sanctions:  
   https://www.tdlr.texas.gov/enforcement/elecsanctions.htm

4. Current Chapter 73 / §73.51 text as linked through TDLR's Laws and Rules page (Texas Administrative Code mirror used to inspect §73.51 text because the SOS endpoint is not reliably fetchable by this audit environment):  
   https://txrules.elaws.us/rule/title16_chapter73_sec.73.51

5. 2026 TDLR rulemaking/adoptions checked to determine whether §73.51 was amended this year. The July 2026 adoption changed §§73.10, 73.21, 73.26, 73.80, 73.110, 73.111 and added §73.112; the September 2026 adoption changed §73.100. Neither changed §73.51:  
   https://www.tdlr.texas.gov/news/rulemaking/2026/07/02/commission-adopts-rules-4/  
   https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/

### Requirements established

- Contractor name: required on all proposals, invoices, and written contracts.
- Contractor address: required on all proposals, invoices, and written contracts.
- Contractor phone number: required on all proposals, invoices, and written contracts.
- Contractor license number: required on all proposals, invoices, and written contracts.
- Department information: current §73.51(f) and TDLR enforcement guidance require it on all proposals, invoices, and written contracts.
- No separate LLC/SOS entity number or EIN requirement was identified for these customer documents under the reviewed §73.51(f) customer-document requirements. TDLR may collect federal/entity information in licensing/application contexts, but that is not the same as a proposal/invoice/written-contract display requirement.

## SCOPE RESULTS

### 1. Exact base/head integrity and PR state — PASS

PR #12 is **open**, not merged. GitHub reports:

- Base ref: `main`
- Base SHA: `bc69c7f81c7535fdb627a9bff471e06a4c4fc454`
- Head ref: `feature/document-compliance-audit`
- Head SHA: `a32f785149f91c77f2064d7ab7da394de074ab1b`
- `merged_at`: null

No SHA drift was found.

### 2. Independent Texas TDLR requirements — FAIL (P1-2)

Identity quartet is correctly identified, but the official source conflict over the Department notice was not reconciled. Current §73.51(f) and enforcement guidance require Department information on proposals as well as invoices/written contracts. The fixed text in production follows the Compliance Guide variant, not the current §73.51(f) text.

### 3. `document-compliance.js` fixed notice / separation from editable footer — PARTIAL / FAIL (P1-2)

PASS:
- Regulatory notice is a constant in `document-compliance.js`.
- It is inserted with `textContent` and a dedicated `.be-tdlr-notice` marker.
- It is not sourced from `invoiceFooter` or another editable Company field.
- Existing custom footer remains separate.

FAIL:
- The hard-coded notice is not the current §73.51(f) wording and the source discrepancy is unresolved.

### 4. Quote/Proposal and T&M Invoice receive notice before print — PASS (implementation mechanics)

`preparePrintDocs()` appends the fixed notice to both `#print-quote` and `#print-tm`.

The capture-phase click gate schedules `preparePrintDocs()` after the existing button handler rebuilds the print DOM. Existing `runPrint()` delays `window.print()` by 60 ms. A `beforeprint` hook also calls `preparePrintDocs()`. This is a reasonable redundant path for normal app print flows.

This mechanical pass does not cure P1-2 concerning the notice text itself.

### 5. Print blocked when required Company identity is missing — FAIL (P1-1)

PASS for missing:
- contractor name;
- phone;
- contractor license number;
- street address line (`address1`).

FAIL for address completeness:
- city, state and ZIP can be omitted and the compliance gate still reports `ok`.

### 6. Company UI compliance status/warning — PASS / PARTIAL

The module injects `#be-document-compliance-status` after `#co-block` and displays either an OK or missing-field warning. Inputs for legal name/address/city/state/ZIP/phone/license trigger status refresh.

The displayed status inherits the incomplete address validation described in P1-1, so it can incorrectly claim that required Texas contractor identity is complete.

### 7. Company/letterhead model and TECL — PASS

The Company/profile model carries `license`, with legacy `tecl` compatibility. The print letterhead already renders the license when present. Seed data still contains:

`TECL 28137`

No regression was found in that model or seed.

### 8. LLC/SOS/EIN — PASS

No unsupported LLC/SOS entity-number or EIN display requirement was introduced into the customer-document compliance gate. The implementation audit correctly distinguishes these from the TDLR customer-document identity quartet, although its regulatory-source discussion needs the P1-2 correction above.

### 9. Change Orders — PASS for current surfaces

The existing Quote build includes approved Change Orders in the printed Quote/Proposal. Because the compliance notice is appended to the entire `#print-quote` document, approved Change Orders incorporated there inherit the same customer-document compliance output.

No separate standalone Change Order print/PDF generator was found in the current application surface, so there is no separate standalone Change Order document to assess in this task.

### 10. Calculator/NEC/BOM/pricing/persistence scope regression — PASS

PR #12 changes only:

- `docs/TEXAS_CUSTOMER_DOCUMENT_COMPLIANCE_AUDIT.md`
- `document-compliance.js`
- `sw-register.js`
- `sw.js`
- `tests/document-compliance.test.js`
- `tests/run-node.js`
- `tests/service-worker.test.js`

No calculator, NEC rule, BOM, pricing, estimator, or persistence implementation file was modified by the PR.

### 11. PWA cache and stale-cache ownership isolation — PASS

- Cache is `bruno-electric-v35`.
- `document-compliance.js` is in `CORE_SHELL`.
- Stale-cache deletion remains restricted by `^bruno-electric-v\d+$` and excludes the active cache.
- Updated service-worker tests explicitly retain unrelated cache names and `bruno-electric-v35` while deleting stale Bruno Electric versions.

### 12. Deterministic tests and exact-head CI — PASS with P2 test-depth observation

GitHub Actions run `35022502631`:

- Workflow: `Electrical Calculator Tests`
- Event: `pull_request`
- Head SHA: `a32f785149f91c77f2064d7ab7da394de074ab1b`
- Status: completed
- Conclusion: success

The new compliance test file is included by `tests/run-node.js`, so exact-head CI includes the new regression checks.

**P2 observation:** `tests/document-compliance.test.js` is primarily static source-string inspection. It confirms constants, selectors and hooks exist, but it does not execute a DOM-level behavioral test proving that missing identity blocks the actual print buttons or that incomplete city/state/ZIP is rejected. This weakness allowed P1-1 to pass CI. Add behavioral coverage during rework.

## ACCEPTANCE-BLOCKER MATRIX

| Acceptance blocker | Result |
|---|---|
| Missing/inaccurate required TDLR notice on Quote/Proposal or Invoice | **BLOCKED — P1-2** |
| Required contractor identity can be omitted while print flow remains allowed | **BLOCKED — P1-1** |
| Regulatory notice user-editable/replaced by custom footer | PASS |
| Compliance module not loaded/cached offline | PASS |
| P0/P1 estimating/calculator/NEC/BOM/pricing/persistence regression | PASS |
| SHA drift | PASS |

## FINAL DECISION

**VERDICT C.**

Rework is required before merge. At minimum:

1. Correct address validation so the customer print gate cannot pass an incomplete contractor address.
2. Reconcile the current §73.51(f) regulatory notice with TDLR's inconsistent Compliance Guide wording, then hard-code the authoritative current notice and update the implementation audit/tests accordingly.
3. Add behavioral deterministic tests for the corrected gate and notice output.

No production code, PR metadata/comments, merge state, target branch, or production branch was modified by this audit. This immutable report is the only audit write requested by `TASK_CURRENT.md`.
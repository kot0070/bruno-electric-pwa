# Bruno Electric — Texas Customer Document Compliance Audit

Audit date: 2026-09-15
Scope: customer-facing Quote/Proposal, T&M Invoice, Company letterhead/profile, Change Orders as represented in printed quote output, all normal app and browser-native print/PDF paths, compliance bootstrap, and PWA/offline delivery.

## Source hierarchy

The controlling source for this customer-document rule is current 16 TAC §73.51(f), reached through the TDLR Electricians Laws and Rules page. TDLR enforcement guidance corroborates the scope. The TDLR Electrical Contractors Compliance Guide is secondary guidance.

Current §73.51(f) requires the electrical contractor's name, address, phone number, and license number on all proposals, invoices, and written contracts. It also requires the Department information on all three document types using this text:

> Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov

Official/current sources reviewed:
- https://www.tdlr.texas.gov/electricians/laws-rules.htm
- https://www.tdlr.texas.gov/electricians/compliance-guide.htm
- https://www.tdlr.texas.gov/enforcement/elecsanctions.htm
- https://txrules.elaws.us/rule/title16_chapter73_sec.73.51
- https://www.tdlr.texas.gov/news/rulemaking/2026/07/02/commission-adopts-rules-4/
- https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/

### Compliance Guide discrepancy

The Compliance Guide publishes a variant ending in `www.tdlr.texas.gov/complaints` and describes the notice more narrowly than the current rule/enforcement scope. Because the current rule is the controlling source and TDLR enforcement guidance also applies Department information to proposals, invoices, and written contracts, production uses the current §73.51(f) wording ending in `www.tdlr.texas.gov` on both Quote/Proposal and T&M Invoice output.

The 2026 TDLR electrician rulemaking reviewed does not amend §73.51.

## Required contractor identity

The customer print gate requires a complete printable active Company identity:
- legal/contractor name;
- street address;
- city;
- state;
- ZIP code;
- phone number;
- contractor license number (TECL).

A street line alone is not treated as a complete address.

## Production state integration

The application keeps its Company/profile vault inside the main application closure. The compliance module therefore does not assume that closure-local objects are global. For normal production operation it reads the Company form fields that the application itself populates from the active letterhead (`co-legal`, `co-addr1`, `co-city`, `co-state`, `co-zip`, `co-phone`, `co-license`). Those fields are the visible/editable representation of the currently active Company profile and are refreshed when the active letterhead changes.

The compliance module also supports a narrow future `BrunoElectricCompanyBridge.getActiveProfile()` accessor if the application later exposes one deliberately. It does not depend on `window.state` or a non-existent global `getActiveProfile()`.

## Fail-closed print architecture

Customer-document compliance is not allowed to fail open.

`sw-register.js`, which is loaded directly by the main page, installs a capture-phase blocker for the four normal customer print controls immediately when it executes. Until `window.BrunoDocumentCompliance` is present and exposes its validation API, Print Quote / Print Invoice clicks are blocked with a user-facing message.

The compliance script is requested immediately and independently of the navigation enhancement chain. If `document-compliance.js` fails to load, the bootstrap blocker remains active and records `data-be-doc-compliance="error"`; customer-document printing stays blocked rather than silently bypassing the gate.

After the compliance API is ready, the bootstrap blocker yields to the module's own capture-phase validator. The validator then blocks incomplete Company identity or allows the existing dedicated print flow to continue.

### Browser-native Print / Ctrl+P

Browser-native printing is a separate path and cannot be cancelled reliably from `beforeprint`. Therefore the application handles customer Quote/Invoice surfaces fail-closed rather than pretending to cancel the system print dialog.

When neither dedicated `body.print-quote` nor `body.print-tm` mode is active, `beforePrintGuard()` checks whether the active panel is Quote/Proposal or T&M Invoice. If so, it applies `body.be-native-print-blocked`. Print-only CSS then hides every application subtree and prints only a blocker message. The message directs a compliant Company to use the matching in-app Print Quote / Print Invoice button; if Company identity is incomplete it also lists the missing required fields. Thus browser menu Print and Ctrl+P cannot emit the Quote/Invoice active panel as a customer document and cannot bypass the fixed §73.51(f) notice path.

`afterprint` removes the temporary blocker class. Browser-native printing of non-customer internal panels is not converted into a customer document by this compliance module.

## Customer-facing surfaces

### Quote / Proposal
The normal Quote print controls build `#print-quote`. The document already renders the active Company letterhead, including TECL when present. The compliance module appends the fixed §73.51(f) notice after document preparation. Approved Change Orders included in the Quote/Proposal inherit the same compliant document.

### T&M Invoice
The normal Invoice print controls build `#print-tm`. The document uses the same active Company letterhead. The fixed §73.51(f) notice is appended independently of the editable invoice/quote footer.

### Change Orders
The current application does not expose a separate standalone Change Order PDF/written-contract generator. Approved Change Orders are included within the printed Quote/Proposal. If a standalone customer Change Order document is added later, it must independently carry the contractor identity and Department information required by §73.51(f).

### Company / letterhead
The Company profile supports legal name, DBA, address lines, city, state, ZIP, phone, email, License (TECL), website, and editable invoice/quote footer. The Bruno seed letterhead contains `TECL 28137`.

The editable footer remains separate from the fixed regulatory notice and cannot replace it.

### Alternate paths
JSON export/import and backup functions are data-transfer surfaces, not customer proposals/invoices/written contracts. No additional standalone customer PDF generator was identified in the reviewed repository. The historical generic browser-print fallback is explicitly prevented from printing active Quote/Invoice panels as customer documents; users must use the validated dedicated controls for those surfaces.

## LLC / SOS / EIN numbers

No separate Texas LLC file number, Secretary of State entity number, or EIN display requirement was identified in the reviewed current §73.51(f), TDLR contractor compliance guidance, or TDLR enforcement customer-document requirements. The application therefore does not require or print those identifiers as part of this customer-document compliance gate.

## Deterministic acceptance coverage

Regression coverage verifies:
- exact current §73.51(f) notice text;
- complete identity succeeds;
- missing street/city/state/ZIP/phone/license/name fails;
- `complianceStatus()` without a test-injected company reads the production active Company form representation;
- fixed notice appears once on Quote/Proposal and Invoice after repeated preparation;
- bootstrap capture gate blocks before the compliance module is ready;
- compliance-script load failure remains fail closed;
- bootstrap yields only after the compliance API is ready;
- browser-native Ctrl+P / menu Print on active Quote fails closed even with complete identity and directs the user to guarded Print Quote;
- browser-native print on active Invoice with incomplete identity fails closed and reports missing fields;
- dedicated compliant Quote print remains allowed and contains the exact fixed TDLR notice;
- temporary native-print blocker state is cleared after printing;
- compliance module remains in the PWA core shell and stale-cache cleanup stays ownership-isolated.

## Scope boundary

This compliance phase does not change calculator math, NEC rule logic, BOM generation, catalog/pricing semantics, estimating persistence, or universal navigation behavior.

This repository audit/checklist documents the application's implementation against the cited current Texas electrical-contractor customer-document requirements; it is not project-specific legal advice.

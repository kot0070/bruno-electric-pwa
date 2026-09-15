# Bruno Electric — Texas Customer Document Compliance Audit

Audit date: 2026-09-15
Scope: customer-facing Quote/Proposal, T&M Invoice, Company letterhead/profile, Change Orders as represented in printed quote output, and print/PDF flow.

## Source hierarchy and current requirement

This compliance-critical implementation uses the current controlling rule text in **16 TAC §73.51(f)** as the source of truth for the fixed Department notice. TDLR's current enforcement page is used as corroborating enforcement guidance. The TDLR Electrical Contractors Compliance Guide is also reviewed, but where its wording conflicts with the current rule, the rule text controls this implementation.

Current §73.51(f) requires the electrical contractor's:
- name;
- address;
- phone number;
- license number;

on all proposals, invoices, and written contracts. The rule also requires Department information on those customer documents.

The current §73.51(f) Department notice text used by Bruno Electric is:

> Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov

### Reconciled official-source discrepancy

TDLR's current Compliance Guide publishes a variant ending in `www.tdlr.texas.gov/complaints` and describes that quoted notice in the sentence for invoices and written contracts. TDLR's current enforcement page, however, identifies failure to include Department information on **all proposals, invoices and written contracts** as a violation under §73.51(f). The current rule text likewise applies the Department information requirement to all three document types and uses `www.tdlr.texas.gov` without the `/complaints` suffix.

Because this is fixed regulatory content, Bruno Electric follows the current §73.51(f) rule text rather than silently selecting the Compliance Guide variant.

Sources reviewed:
- TDLR Electricians Laws and Rules: https://www.tdlr.texas.gov/electricians/laws-rules.htm
- TDLR Electrical Contractors Compliance Guide: https://www.tdlr.texas.gov/electricians/compliance-guide.htm
- TDLR Electrical Safety Penalties and Sanctions: https://www.tdlr.texas.gov/enforcement/elecsanctions.htm
- Current §73.51 text as linked through the TDLR laws/rules path; audit mirror used where the SOS endpoint is not reliably fetchable: https://txrules.elaws.us/rule/title16_chapter73_sec.73.51
- 2026 TDLR electrician rulemaking checked for §73.51 changes: July 2026 adoption and September 2026 §73.100 adoption. Neither amended §73.51.

## Findings before this corrective phase

### Company / letterhead
PASS — The application supports legal name, street address, city, state, ZIP, phone, email, website and `License (TECL)` in the Company profile.

PASS — The Bruno seed profile contains `TECL 28137`.

PASS — Quote/Invoice print letterhead already renders contractor license when present.

### Quote / Proposal print
PARTIAL — Contractor identity and TECL were supported, but there was no fixed rule-based TDLR regulatory notice.

### T&M Invoice print
PARTIAL — Contractor identity and TECL were supported, but there was no fixed rule-based TDLR regulatory notice.

### Change Orders
CURRENT MODEL — Approved change orders are incorporated into the printed Quote/Proposal. They inherit the Quote/Proposal compliance output after this phase.

LIMITATION — The app does not currently expose a separate standalone Change Order contract/PDF generator. If one is added later, it must independently carry the required contractor identity and Department notice.

### LLC / SOS / EIN numbers
No separate Texas LLC file number, Secretary of State entity number, or EIN display requirement was identified in the §73.51(f) customer-document requirements reviewed above. The customer-document compliance gate therefore does not require or print those identifiers.

## Corrective implementation in this phase

- Dedicated `document-compliance.js` module.
- Fixed §73.51(f) Department notice on Quote/Proposal and T&M Invoice print documents.
- Complete contractor identity gate before customer-document print:
  - legal/business name;
  - street address;
  - city;
  - state;
  - ZIP;
  - phone;
  - contractor license number.
- A street line alone is not treated as a complete contractor address.
- Company-screen compliance status identifies the exact missing address/identity components.
- User-editable invoice/quote footer remains separate from the fixed regulatory notice.
- Existing quote, T&M, pricing, NEC, BOM and persistence calculations remain unchanged.
- Compliance module is cached for offline/PWA use.
- Deterministic behavioral tests execute the compliance module and verify incomplete city/state/ZIP fails, a complete identity passes, and the exact rule notice is appended to both print documents.

## Acceptance criteria

1. Quote/Proposal PDF print contains contractor name, complete address, phone, license and the current §73.51(f) Department notice.
2. T&M Invoice PDF print contains contractor name, complete address, phone, license and the current §73.51(f) Department notice.
3. Print is blocked when any required identity component is missing, including city, state, or ZIP.
4. Regulatory notice is fixed application content and is not editable through the user footer field.
5. Custom invoice/quote footer remains supported in addition to the Department notice.
6. No calculator math, NEC logic, BOM, pricing or persistence behavior changes.
7. PWA offline shell includes the compliance module.
8. Tests behaviorally verify the gate and printed notice, not only source-string presence.

This file is an implementation compliance audit/checklist for the application, not a substitute for project-specific legal advice or local contractual requirements.

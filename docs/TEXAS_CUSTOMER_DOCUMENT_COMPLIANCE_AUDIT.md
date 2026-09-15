# Bruno Electric — Texas Customer Document Compliance Audit

Audit date: 2026-09-15
Scope: customer-facing Quote/Proposal, T&M Invoice, Company letterhead/profile, Change Orders as represented in printed quote output, and print/PDF flow.

## Authoritative requirements checked

Official TDLR Electrical Contractors Compliance Guide and current TDLR Electrical Safety Penalties/Sanctions were used as the regulatory source.

For electrical contractors, TDLR identifies the following as required on proposals, invoices, and written contracts:
- contractor name;
- address;
- phone number;
- contractor license number.

TDLR enforcement guidance also identifies omission of Department information from proposals, invoices, and written contracts as a violation. The compliance guide publishes this notice:

> Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas, 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov/complaints

Sources:
- https://www.tdlr.texas.gov/electricians/compliance-guide.htm
- https://www.tdlr.texas.gov/enforcement/elecsanctions.htm

Implementation uses the stricter reading and prints the TDLR notice on both Quote/Proposal and T&M Invoice.

## Findings before this corrective phase

### Company / letterhead
PASS — The application already supports legal name, address, phone, email, website and `License (TECL)` in the Company profile.

PASS — The Bruno seed profile contains `TECL 28137`.

PASS — Quote/Invoice print letterhead already renders contractor license when present.

### Quote / Proposal print
PARTIAL — Contractor identity and TECL were supported, but there was no fixed TDLR regulatory notice.

### T&M Invoice print
PARTIAL — Contractor identity and TECL were supported, but there was no fixed TDLR regulatory notice.

### Change Orders
CURRENT MODEL — Approved change orders are incorporated into the printed Quote/Proposal. They inherit the Quote/Proposal compliance footer after this phase.

LIMITATION — The app does not currently expose a separate standalone Change Order contract/PDF generator. If one is added later, it must independently carry the required contractor identity and TDLR notice.

### LLC / SOS / EIN numbers
No separate Texas LLC file number, Secretary of State entity number, or EIN requirement was identified in the TDLR electrical-contractor proposal/invoice/written-contract requirements reviewed above. The customer-document compliance gate therefore does not require or print those identifiers.

## Corrective implementation in this phase

- Add a dedicated `document-compliance.js` module.
- Add the published TDLR notice to Quote/Proposal and T&M Invoice print documents.
- Require contractor name, address, phone and contractor license number before the app allows customer-document printing.
- Add a Company-screen compliance status message so missing required identity data is visible before printing.
- Preserve all existing quote, T&M, pricing, NEC, BOM and persistence calculations unchanged.
- Cache the compliance module for offline/PWA use and bump the app shell cache.

## Acceptance criteria

1. Quote/Proposal PDF print contains contractor name, address, phone, license and the TDLR notice.
2. T&M Invoice PDF print contains contractor name, address, phone, license and the TDLR notice.
3. Print is blocked if any of the four required contractor identity fields is missing.
4. TDLR notice is fixed regulatory content and is not editable through the user footer field.
5. Custom invoice/quote footer remains supported in addition to the TDLR notice.
6. No calculator math, NEC logic, BOM, pricing or persistence behavior changes.
7. PWA offline shell includes the compliance module.

This file is an implementation compliance audit/checklist for the application, not a substitute for project-specific legal advice or local contractual requirements.

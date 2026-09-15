# TASK_CURRENT

TASK=PR_12_TEXAS_DOCUMENT_COMPLIANCE_CORRECTIVE_FINAL_ACCEPTANCE
MODE=FINAL_ACCEPTANCE_AUDIT
PR=12
BASE_SHA=bc69c7f81c7535fdb627a9bff471e06a4c4fc454
HEAD_SHA=ded3e7bddbcd47b44b760f77d8a24e389fab0d0d
AUDIT_BRANCH=audit/pr12-ded3e7b
REPORT_PATH=audits/reports/PR_12_TEXAS_DOCUMENT_COMPLIANCE_CORRECTIVE_ded3e7b.md

Read and obey `audits/PROTOCOL.md` literally.

## Purpose
Perform a broad, independent final acceptance audit of PR #12 after corrective rework. Do not limit review to the two prior findings. Re-discover all customer-facing document/form/print surfaces from the repository and independently verify current Texas TDLR requirements.

## Required independent verification

1. Verify exact PR base and exact production HEAD SHA.
2. Verify current official Texas requirements applicable to electrical-contractor proposals, invoices and written contracts, prioritizing current 16 TAC §73.51(f) rule text over secondary guidance where wording conflicts.
3. Independently inspect current TDLR:
   - Electricians Laws and Rules;
   - Electrical Contractors Compliance Guide;
   - Electrical Safety Penalties and Sanctions;
   - current §73.51 text as available through official/TAC-linked sources;
   - 2026 rulemaking/adoptions relevant to whether §73.51 changed.
4. Explicitly reconcile any current official-source discrepancy, including the Compliance Guide `/complaints` variant versus the current §73.51(f) notice text.
5. Confirm whether a separate LLC/SOS entity number or EIN display requirement exists for these customer documents; do not infer one from licensing/application requirements.

## Repository audit scope

Independently find and review every current customer-facing document or form surface, including at minimum:
- Quote / Proposal UI and print/PDF output;
- T&M Invoice UI and print/PDF output;
- approved Change Orders as represented in Quote/Proposal output;
- any standalone Change Order print/contract surface if one now exists;
- Company / letterhead/profile fields;
- customer-facing footer/header blocks;
- print buttons and print event flow;
- any alternate print/export path that could bypass compliance checks;
- PWA/offline loading of compliance code.

Do not assume the implementation report or previous audit identified all surfaces.

## Acceptance requirements

### A. Contractor identity
All customer proposals, invoices and written-contract surfaces must carry the contractor identity required by current Texas rules. The print gate must fail closed when the active Company profile lacks any component needed for a complete printable address.

At minimum test missing:
- contractor name;
- street address;
- city;
- state;
- ZIP;
- phone;
- contractor license number.

A street line alone must NOT satisfy the address requirement.

### B. Department notice
The fixed regulatory notice must:
- use the current controlling §73.51(f) wording chosen after source reconciliation;
- be present on Quote/Proposal and T&M Invoice output;
- be present on any other written-contract surface if such a surface exists;
- not be editable or replaceable through the custom invoice/quote footer;
- not duplicate on repeated preparation/beforeprint paths.

### C. Print-flow behavior
Verify behavior, not only source strings:
- compliant complete profile allows normal print flow;
- incomplete identity prevents the customer print action;
- missing city/state/ZIP is rejected;
- notice is appended to both document outputs;
- repeat preparation leaves exactly one regulatory notice per document;
- custom user footer remains separate.

### D. Audit/source documentation
`docs/TEXAS_CUSTOMER_DOCUMENT_COMPLIANCE_AUDIT.md` must accurately document:
- controlling source hierarchy;
- current rule notice text;
- discrepancy with current Compliance Guide if still present;
- scope of proposal/invoice/written-contract requirement;
- LLC/SOS/EIN conclusion with correct limits.

### E. Regression / scope
No P0/P1 regression in:
- estimating/calculator math;
- NEC logic;
- BOM;
- catalog/pricing;
- persistence;
- universal phone/tablet/desktop navigation.

Confirm changed production files are limited to the intended document-compliance/PWA/tests/docs scope.

### F. PWA / CI
- `document-compliance.js` must be loaded in the actual app bootstrap and cached in the service-worker core shell.
- Cache ownership isolation must remain intact.
- Exact-head CI must be completed/success on HEAD_SHA.
- New tests must include behavioral execution sufficient to catch incomplete city/state/ZIP and wrong/duplicated notice output.

## Blocking conditions
Any of the following is P1 or worse and prevents verdict A:
- required identity can be omitted while customer print remains allowed;
- incomplete address passes the gate;
- fixed Department notice differs from current controlling rule without a documented authoritative basis;
- notice missing from a customer proposal/invoice/written-contract surface;
- editable footer can remove/replace the fixed notice;
- alternate normal app print path bypasses required compliance;
- compliance module not actually loaded or available offline;
- exact production HEAD drift;
- exact-head CI failure;
- P0/P1 regression outside document scope.

## Report retention
Write exactly one immutable report to:
`audits/reports/PR_12_TEXAS_DOCUMENT_COMPLIANCE_CORRECTIVE_ded3e7b.md`

Do not modify production code, production PR branch, PR metadata/comments, target branch or merge state.

In chat return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

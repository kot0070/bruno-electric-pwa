TASK=PR_12_TEXAS_CUSTOMER_DOCUMENT_COMPLIANCE_FINAL_ACCEPTANCE
MODE=FINAL_ACCEPTANCE_AUDIT
PR=12
BASE_SHA=bc69c7f81c7535fdb627a9bff471e06a4c4fc454
HEAD_SHA=a32f785149f91c77f2064d7ab7da394de074ab1b
AUDIT_BRANCH=audit/pr12-a32f785
REPORT_PATH=audits/reports/PR_12_TEXAS_DOCUMENT_COMPLIANCE_a32f785.md

Read and follow audits/PROTOCOL.md literally.

Audit scope:
1. Verify exact base/head integrity and PR open/not merged.
2. Independently verify current official TDLR electrical-contractor customer-document requirements using authoritative TDLR sources, especially contractor name/address/phone/license and Department notice requirements for proposals/invoices/written contracts.
3. Verify `document-compliance.js` contains the published TDLR notice accurately and treats it as fixed regulatory content, separate from editable footer text.
4. Verify Quote/Proposal and T&M Invoice print outputs receive the notice reliably before printing.
5. Verify Print Quote / Print Invoice are blocked when active Company letterhead lacks contractor name, address, phone or contractor license number.
6. Verify Company UI exposes a clear compliance status/warning.
7. Verify existing Company/letterhead model still carries and prints contractor license/TECL; seed `TECL 28137` remains intact.
8. Verify no unsupported requirement for LLC/SOS entity number or EIN was introduced; check the implementation audit document against official sources.
9. Verify approved Change Orders incorporated in printed Quote/Proposal inherit the customer-document compliance output; note whether standalone Change Order document generation exists and assess only actual current surfaces.
10. Verify no calculator math, NEC logic, BOM, pricing or persistence implementation regression/change outside scope.
11. Verify PWA cache is `bruno-electric-v35`, `document-compliance.js` is cached, stale-cache ownership isolation remains intact.
12. Verify deterministic tests include document compliance regressions and exact-head CI is completed/successful.

Acceptance blockers:
- Missing/inaccurate required TDLR notice on customer-facing Quote/Proposal or Invoice print output.
- Required contractor identity can be omitted while app still allows its customer print flow.
- Regulatory notice is user-editable/replaced by custom footer.
- Compliance module not loaded in production path or not cached offline.
- Any P0/P1 regression in accepted estimating/calculator/NEC/BOM/pricing/persistence behavior.
- SHA drift.

Report retention:
- Write exactly one immutable report at REPORT_PATH on AUDIT_BRANCH.
- Do not modify production code, production branch, PR, comments or merge state.

Chat output only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

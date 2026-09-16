# Bruno Electric — Corrective Master after v50 Full Audit

**Source audit:** `audits/reports/WORKFLOW_OVERHAUL_V50_5852749.md`
**Source audited SHA:** `5852749be6cd240b6e52bac15cacf4ffbfa6a288`
**Execution:** STRICT SEQUENTIAL
**Current stage:** `C1_JOB_SCOPED_RESIDENTIAL_ARCHIVE`

## Rules
1. Fix exactly one P1 stage at a time.
2. Do not advance until deterministic regressions and exact-head CI for the current stage are GREEN.
3. Re-read this file between stages.
4. Do not merge PR #14.
5. After C2, run final integration CI, freeze new candidate, write corrective evidence, then create one re-audit branch/task.

## C1 — Job-scoped Residential archive
**Blocker:** device-global `bruno-residential-live-library-v1` leaks Job A archives into Job B/imported jobs.

Required:
- authoritative archive belongs to active `bruno-electric-v1` job state;
- current-job export/import carries archive records;
- new/imported unrelated job cannot see prior job archives;
- legacy global archive remains non-destructively preserved but non-authoritative;
- explicit recovery/import API for legacy archive into current job; never automatic ambiguous ownership assignment;
- list/load/delete/duplicate/save operate on current-job archive only;
- active snapshot semantics preserved;
- tests Job A -> Job B, export/import, new blank, legacy malformed/recovery.

## C2 — Fixed-price approved Quote -> real Invoice
**Blocker:** actual Print Invoice path remains T&M and does not consume `APPROVED_QUOTE_SNAPSHOT`.

Required:
- separate Fixed-Price Invoice action/document;
- fixed invoice unavailable without approved quote;
- amount comes only from `BrunoQuoteLifecycle.invoiceBasis()`;
- invoice shows approval ID/revision/approved time and frozen quote metadata;
- later live calculator/Catalog/Job edits cannot alter printed fixed invoice amount;
- T&M invoice remains separate and explicitly labelled T&M everywhere;
- no ambiguous generic Print Invoice action;
- phone/tablet/desktop usable;
- tests actual fixed-print document builder/invoice basis and T&M separation.

## Final gate
- PWA bump and new modules in CORE_SHELL;
- full deterministic suite;
- exact PR-head provenance CI;
- developer corrective report;
- frozen SHA;
- independent re-audit only after all gates green.

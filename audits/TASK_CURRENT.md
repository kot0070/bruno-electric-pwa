# Bruno Electric — v51 Corrective Independent Re-Audit

## Mode
`AUDIT ONLY`

## Target
- Repository: `kot0070/bruno-electric-pwa`
- PR: `#14`
- `AUDITED_HEAD_SHA = 852bf3c88a4f0fc75584b24aa8e68f277e16342e`
- Source rejected audit: `audits/reports/WORKFLOW_OVERHAUL_V50_5852749.md`
- Corrective developer evidence: `dev-reports/WORKFLOW_OVERHAUL_V51_CORRECTIVE.md`
- Expected exact-head CI: run `#322`
- REPORT_PATH: `audits/reports/WORKFLOW_OVERHAUL_V51_852bf3c.md`

## Primary blocker re-tests

### P1-1 — Residential archive Job/import isolation
Independently prove all of the following at the exact audited SHA:
1. Save a Residential calculation in Job A.
2. Confirm archive authority is owned by `bruno-electric-v1.residentialLiveArchive`, not the device-global legacy library.
3. Replace/import active state with unrelated Job B; Job A archive must not appear in Job B.
4. Job B Catalog must not silently reprice/display Job A archive rows.
5. Current Job JSON export/import round-trip must carry only that Job's archive.
6. New/blank Job must not expose old Job archive.
7. list/load/duplicate/delete/save must operate on current Job archive only.
8. Raw legacy `bruno-residential-live-library-v1` must be non-authoritative and preserved.
9. Explicit legacy recovery must copy into current Job with new identity/provenance and must not delete raw legacy source.
10. Malformed legacy data must not erase or replace valid current-job archive.
11. Verify actual script load order: corrected job-scope history authority must be installed before Residential Live UI captures the API.
12. Verify compatibility adapter does not cause recursion/destructive writes.

### P1-2 — Approved fixed-price Quote -> real Invoice
Independently prove:
1. Before approval, fixed-price Invoice action fails closed.
2. Approve a fixed Quote at amount X.
3. Fixed-price Invoice model/document obtains X only from `BrunoQuoteLifecycle.invoiceBasis()` / `APPROVED_QUOTE_SNAPSHOT`.
4. Document includes approval ID, revision, approved timestamp and frozen quote/job metadata.
5. Change live calculator, Catalog pricing and Job values after approval; fixed Invoice remains X.
6. Re-approval produces a new approval revision and fixed Invoice then uses the newly approved snapshot.
7. Fixed Invoice code does not consume moving `q-total`, `chip-quote`, or T&M totals.
8. Existing T&M Invoice remains a separate workflow and controls are explicitly labeled T&M.
9. There is no generic Invoice control whose meaning is ambiguous between fixed-price and T&M.

## Full regression re-audit
Do not limit the audit to the two prior blockers. Re-check:
- Calculator -> Job navigation/deep links.
- Residential wire/cable takeoff; detailed vs quick budget-only model.
- Save Calculation vs Apply to Job separation.
- calculation archive identity/duplicate/delete behavior.
- Apply provenance and same-domain replacement.
- manual/other-source Job Material preservation.
- blank Your Cost vs explicit `0` vs positive cost.
- unresolved rows excluded from numeric contractor-cost/profit math.
- Job header/Summary parity and cost-completeness disclosure.
- Quote live recommended/manual adjustment/approval snapshot semantics.
- Catalog definitions vs Job Material historical snapshots.
- Custom material create/edit/delete/Add, Qty override, import/new-job isolation.
- Residential/Commercial isolation.
- Journal historical helper-tax semantics.
- import/export and reload persistence.
- phone/tablet/desktop control visibility and primary workflow usability.
- PWA v51 CORE_SHELL/offline/cache migration; stale Bruno caches removed, unrelated caches preserved.
- exact-head GitHub Actions provenance.

## CI provenance requirement
For run #322 verify:
- checkout ref = `852bf3c88a4f0fc75584b24aa8e68f277e16342e`;
- `git rev-parse HEAD` = same SHA;
- `TESTED_HEAD_SHA` = same SHA;
- `EXPECTED_HEAD_SHA` = same SHA;
- deterministic suite completes green.

## Verdict rules
- A ACCEPT: no P0/P1.
- B ACCEPT AFTER MINOR FIXES: no P0/P1.
- C REJECT / REWORK REQUIRED: one or more P0/P1.

Production code, PR state and merge state must not be changed by the auditor.

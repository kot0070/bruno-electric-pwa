# Bruno Electric — Independent Audit Task

## Mode
AUDIT ONLY.

## AUDITED_HEAD_SHA
`311997c12cd82d0b45d82584c75c8c6fbcce90bb`

## Audit branch
`audit/p1-project-journal-311997c`

## REPORT_PATH
`audits/reports/P1_PROJECT_JOURNAL_CORRECTIVE_311997c.md`

## Required reading
- `audits/PROTOCOL.md`
- previous audit report: `https://github.com/kot0070/bruno-electric-pwa/blob/audit/main-project-journal-3a85743/audits/reports/MAIN_PROJECT_CALCULATOR_JOURNAL_CORRECTIVE_3a85743.md`

## Objective
Independently audit corrective PR #13 / audited HEAD above. Do not limit review to the two prior blockers; re-check the affected Project Calculator, Residential workflow, Journal history, persistence and shared regressions from the pinned HEAD.

## Mandatory re-check — Project Calculator
Independently verify:
- Project Calculator remains the first Calculator workflow;
- Project type is authoritative from Project Calculator only; no duplicate selector architecture;
- Residential and Commercial state isolation survives calculate, navigation, reload, switching mode, and ordinary/programmatic tool selection paths;
- Commercial cannot enter Residential Live Design, Residential Estimator, or Residential Takeoff while Commercial is authoritative;
- generic tools (ampacity, voltage drop, conduit fill, box fill, equipment) remain usable for Commercial;
- switching back to Residential intentionally restores residential-only workflows;
- square footage + rooms handoff remains correct;
- code minimum vs layout-required semantics remain fail-closed;
- live edits still cascade through circuits / breakers / conductors / cable / panel spaces / BOM / LIVE Catalog pricing;
- major loads → service candidate and 310.12 gating remain correct;
- NON-COMPLIANT behavior and code references remain intact;
- Save Project Calculation, archive, duplicate, persistence and live repricing remain intact.

## Mandatory re-check — Journal
Independently verify:
- scheduled/cancelled calls are not earned;
- helper cost applies on configured zero-call days;
- Day / Week / Month / Quarter aggregation remains correct;
- helper rate/pay/tax/active history is effective-dated;
- current global helper-tax enabled/disabled and percentage settings cannot rewrite historical helper tax/net;
- global helper-tax settings act only as defaults for newly created helper versions where intended;
- editing a later helper revision does not alter earlier economics;
- future disable does not rewrite prior helper history;
- completed-call tax snapshot remains stable after later owner/global tax changes.

## Regression
Re-check:
- canonical navigation and responsive phone/tablet/desktop shell;
- existing electrical calculators;
- BOM / pricing / Catalog integration;
- persistence/import/export boundaries touched by this change;
- PWA/offline/cache implications;
- no regression caused by the new project-mode event/guard.

## Evidence standard
Do not accept the developer report, PR description, source-string tests, or prior audit as proof. Trace runtime/state behavior independently and verify the exact audited SHA. If CI exists, confirm it belongs to this exact SHA; absence of CI must be called out explicitly rather than inferred as success.

## Chat return
Return only:
- VERDICT
- AUDITED HEAD SHA
- BLOCKERS
- REPORT LINK

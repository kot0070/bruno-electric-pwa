# Bruno Electric — Developer Corrective Report

## Scope
Corrective implementation for the two P1 blockers reported against production HEAD `3a85743b891b9aa276e6eb6ae0ef55cad970094f`.

Source audit report: `audits/reports/MAIN_PROJECT_CALCULATOR_JOURNAL_CORRECTIVE_3a85743.md` on audit branch `audit/main-project-journal-3a85743`.

## P1-1 — Commercial / Residential isolation

### Defect
Project Calculator persisted `bruno-electric-project-mode-v1`, but the Electrical Tools shell did not consume it. Residential Live Design / Residential Estimator / Residential Takeoff remained reachable after a Commercial project was calculated.

### Correction
- `electrical-project-calculator-ui.js`
  - defines the project-mode storage key once;
  - exposes `currentProjectType()` / `setProjectType()` through `BrunoProjectCalculator`;
  - emits `bruno:project-mode-changed` whenever Calculate establishes the authoritative project type;
  - Commercial messaging now matches actual downstream isolation behavior.
- `electrical-tools-shell.js`
  - defines residential-only tools as `res-live`, `res`, `res-takeoff`;
  - consumes the Project Calculator authoritative mode;
  - when mode is Commercial, hides + disables residential-only tool buttons;
  - removes residential-only tools from the responsive workspace picker;
  - capture-guards tool routing so an ordinary or programmatic button click cannot enter a residential-only workflow while Commercial is active;
  - if an active residential-only tool becomes invalid, routes back to Project Calculator;
  - refreshes availability immediately on `bruno:project-mode-changed`.

No duplicate project-type selector was restored.

## P1-2 — Historical helper-tax stability

### Defect
`helperCostForDate()` used the current global `settings.helperTaxEnabled` and current fallback `settings.helperTaxPct` in historical calculations. Later settings changes could therefore rewrite prior helper tax/net economics.

### Correction
- `electric-dispatch-journal-v2.js`
  - helper tax computation now uses only the effective-dated helper revision's `taxEnabled` and `taxPct`;
  - current global helper-tax settings no longer gate historical helper calculations;
  - helper editor uses current settings only as defaults when a new helper revision is created;
  - existing effective-dated revision values remain authoritative;
  - settings copy explicitly describes helper-tax settings as defaults for new versions, not retroactive policy.

Helper gross scheduling, future disable behavior, completed-call tax snapshots, Day/Week/Month/Quarter aggregation, and zero-call-day helper costing were intentionally left intact.

## Regression coverage added

### `tests/project-calculator.test.js`
Added checks for:
- authoritative Project Calculator mode state;
- project-mode change event;
- explicit residential-only boundary;
- Commercial guard;
- disabled/hidden residential-only nav;
- capture routing guard;
- live mode refresh.

### `tests/dispatch-journal-v2.test.js`
Added checks that:
- helper tax is revision-owned;
- current global helper-tax toggle does not gate history;
- current global helper-tax percentage is not a historical fallback;
- global helper tax is described/used as a default for new versions only.

## Changed production files
- `electrical-project-calculator-ui.js`
- `electrical-tools-shell.js`
- `electric-dispatch-journal-v2.js`

## Changed tests
- `tests/project-calculator.test.js`
- `tests/dispatch-journal-v2.test.js`

## Review boundary
This is a corrective patch only. No merge should occur before independent audit acceptance. Auditor must independently exercise runtime/state transitions and must not treat this report or source-string tests as proof.

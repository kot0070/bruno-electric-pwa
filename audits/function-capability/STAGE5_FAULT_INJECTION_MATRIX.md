# Bruno Electric — Stage 5 Negative / Fault-Injection Matrix

STATUS: PRE_AUDIT_READY
STAGE: 5 — Negative / Fault Injection
ENTRY_BASELINE_SHA: `eaf0f4d096d0b207cc27f17675e384e6d6a4099b`
ENTRY_ACCEPTANCE_CI: Electrical Calculator Tests #611 / run id `35244328100` / SUCCESS
IMPLEMENTATION_EVIDENCE_SHA: `f1b5ab8b69a3a509037520d077a28e2dee038528`
EXACT_HEAD_CI: Electrical Calculator Tests #703 / run id `35282365016` / SUCCESS
DETERMINISTIC: `818/818 passed`
BROWSER_REGRESSION_GATE: `168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed`

## Purpose
Stage 5 verifies that malformed, partial, stale, unsupported and fault-injected operations fail closed, preserve valid current state, or perform an explicit no-op/recovery. This matrix reuses strong executable negative evidence from accepted earlier stages where the exact failure contract already exists, and adds Stage 5-specific fault injection where prior evidence was insufficient. User-requested calculator and Call Service walkthroughs are retained as real-browser evidence where they exercise failure/recovery, persistence, preview-before-output, locale-sensitive runtime behavior and UI stability. It does not unlock Stage 6 until the final synchronized documentation SHA passes exact-head CI and an independent exact-SHA Stage 5 audit returns P0=0/P1=0.

## Required fault classes

| Fault class | Expected contract | Executable evidence | Stage 5 status |
|---|---|---|---|
| Malformed full-app JSON | Reject before mutation; current Job/app state remains intact | `tests/e2e/fault-injection-stage5.spec.js` · `STAGE5-FAULT-01` | VERIFIED_GREEN |
| Wrong import type | Reject app-vs-job mismatch without mutation | `tests/e2e/fault-injection-stage5.spec.js` · `STAGE5-FAULT-02`; import type guards in `index.html` | VERIFIED_GREEN |
| Incomplete full-app backup | Missing saved Job is invalid; reject and preserve current state | `tests/app-backup-dispatch.test.js`; `STAGE5-FAULT-03` | CORRECTIVE_VERIFIED_GREEN |
| Partial local-storage write failure during app restore | Restore behaves transactionally; rollback prior writes and preserve old state | `tests/app-backup-dispatch.test.js` injected storage failure | CORRECTIVE_VERIFIED_GREEN |
| Invalid app sub-block shape | Reject before any write | `tests/app-backup-dispatch.test.js` invalid `dispatchJournalV3` block | VERIFIED_GREEN |
| User cancels valid app restore | Explicit no-op; no state mutation/reload | `STAGE5-FAULT-04` | VERIFIED_GREEN |
| Oversized app backup | Reject >8 MB before parsing or mutation | `STAGE5-FAULT-05` | VERIFIED_GREEN |
| Malformed single-Job JSON | Reject malformed Job JSON and preserve current Job | `STAGE5-FAULT-06` | VERIFIED_GREEN |
| Repeated valid app restore | Idempotent state; no duplication/drift | `tests/app-backup-dispatch.test.js` repeated restore | VERIFIED_GREEN |
| Failed Electrical Task Update | Roll back active materials/history; no partial mutation | `tests/electrical-task-archive.test.js` · `failed Update Job rolls back active materials/history transaction` | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Stale/missing task ID | Reject invalid active-Job lookup and preserve active Job scope | `tests/electrical-task-archive.test.js`, task CRUD/integrity tests, accepted E2E-10 | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Unsupported/impossible raceway | Return `NO SUPPORTED CONFIGURATION`; never invent a supported result | `tests/electrical-raceway-engine.test.js`: impossible fill, PVC80, XHHW2, OTHER, unsupported shared strategy | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Unsupported calculator/configuration inputs | Input error / unsupported review state rather than successful-looking defaults | calculator/Phase 3/task-engine negative suites; `HUMAN-CALC-07`; Stage 4 rendered blank/unsupported evidence | VERIFIED_GREEN |
| Calculator failure -> correction -> recalculation | A field user can correct invalid/unsafe inputs through visible controls and obtain the new result without stale-success residue | `tests/e2e/calculator-core-human-inputs.spec.js` · `HUMAN-CALC-07` | VERIFIED_GREEN |
| HVAC selected OCPD above MOCP | Fail closed with input/scope error; do not render a normal successful-looking HVAC result | `tests/e2e/calculator-equipment-human.spec.js` · `HUMAN-CALC-05` | VERIFIED_GREEN |
| Grounding electrode-specific cap without required assertion | Remain explicit REVIEW and state that the electrode-specific cap is not asserted until user confirmation | `tests/e2e/calculator-equipment-human.spec.js` · `HUMAN-CALC-05` | VERIFIED_GREEN |
| Calculation document pre-output boundary | Clicking `Calculation PDF` opens a preview and must not download until the explicit preview action is used | `tests/e2e/calculator-pdf-human.spec.js` · `HUMAN-CALC-09`, `HUMAN-CALC-11`; `HUMAN-CALC-04` | CORRECTIVE_VERIFIED_GREEN |
| Fixed-price invoice pre-print boundary | Fixed invoice action opens the rendered invoice preview; print occurs only after explicit preview action | `tests/e2e/function-capability.spec.js` · `E2E-08` | CORRECTIVE_VERIFIED_GREEN |
| Missing customer-document company identity | Preview remains visible and explains missing identity; final customer PDF is blocked | `tests/e2e/call-journal-materials.spec.js` · `JOURNAL-PREVIEW-01` | VERIFIED_GREEN |
| Locale-formatted helper metric amplification | Currency formatting must never be reparsed as authoritative numeric state; `$160,00` must remain 160 across observer cycles/edit/reload | `tests/e2e/call-journal-helper-consistency.spec.js` · `JOURNAL-HELPER-HUMAN-01` with `uk-UA` locale; production corrective `electric-journal-customer-metrics.js` | CORRECTIVE_VERIFIED_GREEN |
| Repeated residential full-takeoff save | Replace only generator-owned rows; preserve manual rows; no duplicate BOM growth | `tests/e2e/calculator-residential-human.spec.js` · `HUMAN-CALC-10` | VERIFIED_GREEN |
| Optional service-worker asset failure | Optional icon/cache failure must not abort core-shell install | `tests/service-worker.test.js` Stage 5 optional asset fault | VERIFIED_GREEN |
| Core service-worker shell failure | Installation must reject; do not activate incomplete new shell | `tests/service-worker.test.js` Stage 5 core-cache failure | VERIFIED_GREEN |
| Stale cache cleanup | Delete only owned stale Bruno Electric caches; preserve current/unrelated caches | `tests/service-worker.test.js` activation cache ownership test; E2E-12 | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Repeated BOM/source replacement | Idempotent source replacement; preserve manual/other-source rows | `tests/electric-bom.test.js` | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Repeated task material apply | Idempotent reapply with revision/provenance guards | `tests/electrical-task-material-takeoff.test.js` | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Cross-Job/stale revision material apply | Reject rather than mutate wrong Job or stale task revision | task material takeoff/data-integrity suites | EXISTING_EXECUTABLE_EVIDENCE_GREEN |
| Legacy-header prepaint regression | Current shell must install without a visible frame containing legacy wide action controls | `tests/e2e/document-preview-ui-stability.spec.js` · `UI-STABILITY-01` desktop/phone/tablet | CORRECTIVE_VERIFIED_GREEN |
| White disabled/readonly native control regression | Visible disabled/readonly controls and letterhead selector remain dark/readable | `tests/e2e/document-preview-ui-stability.spec.js` · `UI-STABILITY-02` desktop/phone/tablet | CORRECTIVE_VERIFIED_GREEN |

## Current Stage 5 correctives
The initial fault-injection review found a real full-app restore integrity gap: a structurally app-typed payload could omit the saved Job, and storage writes were not transactional if local storage failed after one or more keys were written. Stage 5 corrective work requires a valid Job/state object before any restore, validates optional backup blocks before mutation, and performs all local-storage writes through rollback-capable transactional logic. The real browser import path reloads only after successful restore.

Initial restore corrective production commit: `bed87c9134c0341e72f9bbe0c7b5f4c7693ff10f`.

The later live-user walkthrough exposed a second real defect in Call Journal customer metrics under comma-decimal locales. The overlay parsed its own localized DOM currency string; `$160,00` became `16000`, and MutationObserver re-entry repeatedly multiplied the displayed helper total by 100. The corrective now takes helper economics from `BrunoDispatchJournalV2.summary(...).helperGross` as numeric state and never reparses formatted currency from the DOM. A `uk-UA` real-browser regression waits through observer cycles, edits/saves and reloads while proving `$20/hr × 8 h` remains `$160` rather than amplifying.

Locale-metric corrective production commit: `15eea1302984c0b37d93485ced85796bf2bf5593`.

The customer-document workflow was subsequently hardened to preview before output. Calculator report, Call Journal invoice and fixed-price invoice actions now expose the outgoing document before download/print. The real-browser suite proves no calculator download occurs merely from opening the preview, fixed invoice printing is deferred until the explicit preview action, and missing required company identity blocks the Journal customer PDF while keeping the preview explanatory and editable.

The UI-stability follow-up also closed two user-visible regressions: legacy wide header actions are prevented from becoming visible during current-shell bootstrap, and disabled/readonly native controls including the letterhead selector remain dark/readable. `UI-STABILITY-01` and `UI-STABILITY-02` execute at all three configured Chromium viewport profiles.

## Human-like calculator / Call Service browser coverage retained in the Stage 5 gate
The exact-head browser gate does not merely call calculation functions. It drives rendered controls and user-visible side effects. Current human-style journeys cover:

- Project Calculator residential/commercial switching and invalid input recovery;
- Residential Live Design save -> reload -> load -> explicit Apply to Job;
- Residential Estimator and Full Takeoff, including fail-closed input and idempotent BOM replacement;
- Ampacity, Voltage Drop, Conduit Fill and Box Fill fail/review -> correction -> recalculation flows;
- EVSE, HVAC MCA/MOCP, Motor Circuit, Grounding and Feeder Helper;
- Catalog seeding/idempotency and Reference reachability;
- Electrical Tasks solver, calculate/save/reload/takeoff/apply/edit/update revision chain;
- Calculation preview -> explicit PDF download with visible engineering result and Job context;
- fixed approved invoice preview -> explicit print, with T&M kept separate;
- Call Service Journal materials-in-price semantics, commercial tax, fixed/hourly pricing, invoice preview/customer PDF, reload/edit persistence and locale-sensitive helper metrics;
- reload/current-shell stability and dark native-control readability at desktop, phone and tablet.

The detailed human tests intentionally run deep numeric workflows once on desktop where calculation semantics are viewport-independent, while responsive reachability and action-specific tests run on phone/tablet/desktop. Explicit skips are contract-owned viewport skips, not failures hidden from the result.

## Browser harness integrity
Stage 5 import fault tests seed local state once per browser context using a session marker. An unexpected production reload therefore cannot silently reseed the expected state and hide a destructive import defect.

Two intermediate red runs were harness-only and are not accepted evidence:
- #619 serialized an 8+ MB Playwright `Buffer` through `setInputFiles` and timed out before Bruno Electric handled the file;
- #620 moved the file creation into the browser but deadlocked because the synchronous oversized-file `alert()` blocked `page.evaluate()` before the test could accept the dialog.

The expectation was never weakened. The final harness creates the >8 MB `File` browser-side, registers and accepts the dialog before dispatch, and proves the production size guard preserves state.

Later red human-audit runs were treated as evidence to correct expectations or production behavior, never as accepted green evidence. Examples include aligning HVAC to its fail-closed MOCP contract, grounding to explicit REVIEW semantics, migrating customer-document actions to preview-before-output, and eliminating the stale header prepaint path. Governing behavior was not weakened to obtain green runs.

## Exact-head implementation evidence
Electrical Calculator Tests #703 / run id `35282365016` executed exact implementation SHA `f1b5ab8b69a3a509037520d077a28e2dee038528` with matching tested/expected provenance.

- deterministic: `818/818 passed`;
- Playwright: `168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed`;
- all six Stage 5 import fault journeys remain green;
- human calculator/Journal journeys listed above are green in the same exact-SHA run;
- `JOURNAL-HELPER-HUMAN-01` is green on desktop, phone and tablet under comma-decimal locale;
- `HUMAN-CALC-11` proves opening Calculation PDF preview performs no download; `HUMAN-CALC-09`/`HUMAN-CALC-04` prove explicit preview download contains the visible engineering result;
- `E2E-08` proves fixed-price invoice print is preview-first and approved snapshot amount remains immutable;
- `UI-STABILITY-01` and `UI-STABILITY-02` are green on desktop/phone/tablet;
- the existing Stage 3/4 browser regression suite remains green in the same run.

## Remaining gate
- Synchronize authoritative state/master with this evidence.
- Run deterministic + full Chromium Playwright suite on the final synchronized documentation SHA.
- Create a separate exact-SHA Stage 5 independent audit branch only after that documentation SHA is green.
- Correct every P0/P1 and re-audit before Stage 6 unlock.

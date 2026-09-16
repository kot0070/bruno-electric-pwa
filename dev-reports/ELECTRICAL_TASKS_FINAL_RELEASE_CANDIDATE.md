# Bruno Electric — Electrical Tasks Final Release Candidate

Status at this document: **STAGE 12 ACTIVE / release-candidate assembly**

## Architecture
Electrical Tasks is additive to the existing Bruno Electric Job/Workspace runtime. Task persistence remains inside the active `bruno-electric-v1` Job object; there is no separate global task registry. Shared deterministic engines provide conductor/ampacity, voltage-drop candidate evaluation, raceway, grounding/EGC, advanced-template adaptation, material takeoff, archive/apply/update, and deterministic professional solver behavior.

The implementation intentionally keeps:
- Save != Apply;
- live task calculation != approved quote;
- Your Cost != Customer Price;
- blank/unknown cost != zero;
- voltage-drop sizing != ampacity sizing;
- raceway fill != pulling feasibility;
- EGC != neutral != GEC != bonding jumper.

## Capabilities
Accepted scope through Stage 11 includes:
- Feeder / Panel Run;
- Branch Circuit Run;
- EVSE Circuit;
- HVAC Circuit;
- Motor Circuit;
- Transformer Feed;
- Generator / Feeder;
- Long-Distance Voltage Drop;
- deterministic conductor candidate search;
- supported parallel-conductor configurations;
- voltage-drop evaluation;
- EMT / PVC Schedule 40 raceway sizing where authoritative table data exists;
- EGC sizing for the supported Table 250.122 subset;
- explicit neutral semantics;
- calculated material takeoff with calculated / allowance / field-verify separation;
- Job Materials application with provenance and historical replacement snapshots;
- saved-task archive actions: save, load, rename, duplicate, delete, recalculate, apply, update;
- deterministic plain-language-like Professional Task Solver that extracts only explicit supported facts and leaves compliance-critical unknowns unresolved.

## Unsupported / fail-closed scope
The release does not silently infer:
- local AHJ amendments;
- equipment nameplate facts such as MCA/MOCP where not explicitly supplied;
- motor overload / controller / disconnect requirements from incomplete facts;
- transformer primary/secondary protection rules from incomplete facts;
- generator transfer / separately-derived-system decisions from incomplete facts;
- GEC and bonding-jumper final sizing where a dedicated deterministic rule path is not implemented;
- pulling feasibility from raceway fill;
- unsupported raceway dimensions such as PVC Schedule 80 until authoritative adopted-edition data is independently incorporated;
- power factor/reactance effects in the resistance-only K-method voltage-drop engine.

Unsupported combinations return an explicit unresolved / no-supported-configuration state rather than an invented answer.

## Formula / deterministic engine inventory
- Ampacity: adopted table values plus terminal-temperature, ambient and current-carrying-conductor adjustment logic in the existing electrical calculator engine.
- Continuous-load treatment: explicit load-basis input; 125% is not applied universally without supporting facts.
- Voltage drop: corrected resistance-only K-method with one-way distance and effective total circular-mil area for supported parallel sets.
- Raceway fill: conductor occupied area compared with supported Chapter 9 fill limits; fill is not represented as pulling feasibility.
- EGC: supported Table 250.122 subset through 1200 A with explicit review flags for upsizing/parallel-raceway conditions.
- Material footage: deterministic phase/neutral/EGC/raceway quantities plus bounded allowances and field-verification rows.

## Source provenance
Stage 9 independently verified the release jurisdiction metadata against current authoritative sources at execution time. Release metadata records Texas / NEC 2026 / effective 2026-09-01, retains NFPA 70 source provenance, and records Texas-specific 210.8(F) HVAC exception provenance while continuing to require project-specific local-AHJ verification.

Historical saved-task/apply records preserve task revision, engine version, source edition/jurisdiction and material-application provenance rather than being silently rewritten when later code or Catalog values change.

## Data model / persistence
`ElectricalTaskCalculation` records are Job-scoped and preserve task type, timestamps, inputs, assumptions, results, candidates, calculation steps, warnings, unresolved items, edition/jurisdiction and engine version. Stage 10 tested malformed/partial record handling, Job A/B isolation, stale records, deleted rows and non-destructive unknown-field preservation.

No formal destructive auto-migration was introduced. Malformed top-level Job JSON fails closed rather than being silently repaired.

## Job / material integration
Applying a material plan requires a saved task identity/revision and matching source inputs. Cross-Job application is rejected. Re-application is idempotent for the same Job/task/revision/line identity. Unknown Your Cost remains outside numeric Job material math; explicit zero remains a resolved zero. Field-verify lines do not become fabricated numeric Job cost rows.

`Update Job from Task` archives replaced task-origin material snapshots before replacing only rows belonging to the same source task. Failure during replacement restores the original Job state.

## Quote / invoice regression state
Electrical Tasks does not directly mutate Quote or Invoice records. Existing approved-quote immutability, fixed-price invoice snapshot behavior, T&M separation, pricing-domain guards, custom-material behavior and Job isolation remain covered by the shared deterministic regression suite.

## Responsive / PWA status
Stage 11 added/verified:
- phone breakpoint below 768 px;
- tablet 768–1199.98 px;
- desktop >=1200 px;
- safe-area-aware fixed mobile bottom navigation;
- mobile/tablet electrical tool selector;
- shrink/overflow guards for cards, fields and result tables;
- narrow-screen Professional Solver layout;
- offline Electrical Tasks runtime/UI shell;
- service-worker cache `bruno-electric-v67` with owned-cache cleanup only and navigation fallback.

Repository testing is deterministic/source-contract based; there is no automated screenshot-diff or real-device browser farm in this repository, so device-specific visual quirks remain a non-blocking release-observation item.

## Accepted stage evidence before final release audit
- Stage 0: A_ACCEPT, P0=0, P1=0.
- Stage 1: 639 tests, A_ACCEPT.
- Stage 2: 657 tests, A_ACCEPT.
- Stage 3: 668 tests, A_ACCEPT.
- Stage 4: 685 tests, A_ACCEPT.
- Stage 5: 700 tests, A_ACCEPT.
- Stage 6: 707 tests, A_ACCEPT.
- Stage 7: 734 tests, A_ACCEPT.
- Stage 8: 744 tests, A_ACCEPT.
- Stage 9: 751 tests, A_ACCEPT.
- Stage 10: 759 tests, A_ACCEPT.
- Stage 11: exact head `68ff1dc9084ac67e147707d983f0c7316af6499d`, CI run #516 / id `35146058530`, **767/767 PASS**, A_ACCEPT.

## Remaining accepted P2 observations
- Professional Solver intentionally recognizes a narrow explicit phrase set and does not infer equipment-specific compliance facts.
- Local AHJ amendments remain project-specific verification scope.
- No formal schema-version migration framework exists; unknown future fields are preserved opportunistically and malformed top-level Job JSON fails closed.
- No automated screenshot-diff / real-device browser farm or dedicated mobile virtual-keyboard automation is part of this repository.

## Recommended next master after release
A separate post-release master should focus on deeper equipment-specific deterministic code paths (motor, transformer, generator, HVAC/EVSE nameplate workflows), richer authoritative raceway/reference datasets, explicit schema-version migrations, and optional browser/device visual regression automation. It should remain independent from this completed Electrical Tasks master so release correctness is not mixed with new feature expansion.

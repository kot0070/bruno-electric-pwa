# Electrical Tasks Stage 7F — Generator / Feeder Audit

Audited production head: `d896f0ac11963c5046d4063e2d19bcbdf02d5df6`
Audit branch: `audit/electrical-tasks-stage7f-d896f0a`
CI: Electrical Calculator Tests run `486` / run id `35142055861`
Deterministic suite: `731/731 PASS`

## Scope reviewed
- Generator / Feeder task enablement and active-Job persistence
- isolated Stage 7 advanced adapter and UX disclosure
- deterministic fail-closed tests
- Saved Task recalculate dispatch remains generic through `BrunoElectricalTaskAdvanced`
- PWA cache/runtime upgrade
- protected regression suite at exact tested SHA

## Findings
### P0
None.

### P1
None.

### P2
1. Generator-specific source calculations remain intentionally explicit-input driven. This adapter does not derive current from kW/kVA, standby classification, transfer-equipment rules, separately-derived-system grounding/bonding, fault current, nonlinear/continuous source-load factors, or source-specific protection.
2. `NONCONTINUOUS` is the shared-engine transport contract for an already-derived feeder conductor design current so no second generic multiplier is introduced. Dedicated source prompts belong to Stage 8.

## Invariant review
- Missing already-derived design current fails closed.
- Missing explicit OCPD fails closed.
- No generator-specific compliance facts are silently inferred.
- Shared deterministic conductor/VD/raceway/EGC chain is reused; no duplicate math added.
- Save != Apply remains unchanged.
- Tasks remain scoped to the active Job with no new global registry.
- Work/Workspace, app navigation, Quote/Invoice, Residential and shared pricing business logic were not modified.
- PWA cache advanced v63 -> v64 with owned-cache-only cleanup.

## Re-audit
No P0/P1 corrective patch was required. Exact production head remained unchanged. CI verified `TESTED_HEAD_SHA=d896f0ac11963c5046d4063e2d19bcbdf02d5df6` with `731/731 PASS`.

## Verdict
`A_ACCEPT`

P0: 0  
P1: 0  
Stage 7F may advance to Stage 7G Generic Long Run.

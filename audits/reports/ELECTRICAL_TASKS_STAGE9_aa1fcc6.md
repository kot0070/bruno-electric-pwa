# Electrical Tasks Stage 9 — NEC / Documents / Source Provenance Audit

Audited production head: `aa1fcc63300abfca0cc9b41c6147fda0d8780068`

## Verdict
A — ACCEPT

P0: 0
P1: 0

## CI evidence
- Workflow: Electrical Calculator Tests
- Run: 508
- Run ID: 35143444035
- Exact tested SHA: `aa1fcc63300abfca0cc9b41c6147fda0d8780068`
- Deterministic suite: 751/751 passed

## Authoritative current-source verification
Execution-time verification was performed against current authoritative sources, not memory.

1. Texas Department of Licensing and Regulation, Commission Adopts Rules, September 1, 2026: 16 TAC Chapter 73 §73.100 adopts the 2026 NEC as the Texas state electrical code with a limited GFCI exception for certain outdoor outlets.
   Source: https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/

2. Texas Register, August 28, 2026, 51 TexReg 5776: adopted rule confirms the 2026 NEC and the Texas modification extending NEC 210.8(F) Exception No. 2 for listed HVAC equipment without expiration. Effective date September 1, 2026.
   Source: https://www.sos.state.tx.us/texreg/archive/August282026/Adopted%20Rules/16.ECONOMIC%20REGULATION.html

3. NFPA 70 document status identifies the current edition as 2026.
   Source: https://www.nfpa.org/70

## Repository findings
- `electric-reference-data.js` carries edition `2026`, jurisdiction `Texas`, effective date `2026-09-01`, authoritative TDLR/NFPA provenance, AHJ override warning, and code-vs-recommendation classification.
- Texas HVAC GFCI metadata is represented as a state modification rather than a generic NEC rule.
- Voltage-drop percentage remains labeled as a design recommendation/constraint rather than a universal mandatory code limit.
- Grounding references retain separate code-required vs review-required classifications.
- Electrical Tasks Stage 8 solver explicitly separates field/system/compliance facts from design assumptions and does not infer missing compliance-critical facts.
- Historical saved task provenance already carries source edition/jurisdiction/engine metadata and is not silently rewritten by later recalculation/apply workflows.

## Accepted limitations / P2
1. Local AHJ amendments remain outside the deterministic Texas baseline and must be verified per project.
2. Equipment-specific requirements for HVAC, motor, transformer, generator/feeder and EVSE are deliberately not inferred by generic task adapters; they remain explicit-input / review scope.
3. NFPA section/table text is referenced by section identifiers and authoritative source links; the application does not embed copyrighted NEC text.

## Regression assessment
No P0/P1 regression found in Job/Quote/Invoice, Catalog/custom-material, Residential, navigation, Electrical Tasks persistence/apply, pricing semantics, or PWA ownership tests at the audited exact head.

## Gate result
Stage 9 satisfies IMPLEMENT → deterministic tests → exact-head CI → independent provenance audit → ACCEPT. Stage 10 may begin.

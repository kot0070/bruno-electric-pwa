# MASTER 02 — Bruno Electric NEC / Documents / Source Provenance Audit

ROLE: `INDEPENDENT AUDIT ONLY`

TARGET_SHA = `TO_BE_PINNED`
REPORT_PATH = `TO_BE_SET_ON_AUDIT_BRANCH`

## Mission
Audit every user-facing or calculation-driving electrical-code/document claim for provenance, edition/jurisdiction clarity, stale assumptions, unsupported conclusions, and separation between code requirements and estimating/design heuristics.

This master is about evidence and source semantics, not merely whether arithmetic runs.

## Source hierarchy
Prefer and explicitly distinguish:
1. legally/adopted jurisdiction sources and official state/AHJ rules;
2. NFPA/NEC official material or licensed/authorized source metadata available to the project;
3. official manufacturer/product documentation where equipment-specific;
4. authoritative standards/agency manuals;
5. secondary explanatory material only as supporting context, never as the sole source of a compliance-critical claim.

Do not copy copyrighted NEC text at length. Use article/table identifiers, short bounded quotations only when necessary, and precise paraphrase/provenance.

## Required scope
- NEC edition labels and edition-specific data tables.
- Texas / AHJ edition/adoption metadata represented in the app.
- Any Texas-specific amendment/exception represented in product logic or help text.
- Ampacity, conductor, terminal-temperature, derating/correction, raceway fill, service/load, GFCI/AFCI, equipment/distribution and Residential claims touched by the app.
- Quick-estimate/ft²/wire-budget assumptions.
- Reference/help screens and any explanatory warnings.
- Embedded source/version metadata in `electric-reference-data.js` and related modules.
- Code comments or UI strings that imply compliance/certainty.

## Required checks
1. Build a claim inventory: claim → runtime file/path → source class → edition/jurisdiction → confidence/status.
2. Identify claims that are true code rules versus estimator defaults, design heuristics, convenience presets, manufacturer data, or business policy.
3. Verify the UI makes that distinction visible where a reasonable user could otherwise interpret an estimate as a code-compliant determination.
4. Check stale edition drift: a 2020/2023/2026 label must not silently use a table/logic from another edition while presenting it as current.
5. Check jurisdiction drift: changing an AHJ/edition label must not imply the math changed if the engine did not actually change.
6. Check fail-closed behavior where required facts are missing, such as conductor/material/termination/ambient/current-carrying-conductor/equipment/jurisdiction inputs for a compliance conclusion.
7. Check provenance survives import/export/archive where the historical calculation needs edition/source context.
8. Identify unsupported or overly categorical wording.
9. Verify source URLs/identifiers in project documentation are not dead/stale when practical.

## Texas-specific execution rule
Before making current legal/adoption assertions in the audit report, independently verify them from current authoritative web sources at execution time. Record the retrieval date. The planning master itself does not pin a current legal conclusion.

## Required output tables
- Claim/provenance matrix.
- Edition/jurisdiction mismatch matrix.
- Heuristic-vs-code classification matrix.
- Missing-input/fail-closed matrix.
- Stale/unsupported-document finding list.

## Severity
P0: app can present a materially unsafe/legal compliance conclusion based on false/misapplied source logic.
P1: code/document provenance or edition/jurisdiction defect can materially mislead a professional workflow or calculation.
P2: bounded wording/source-quality issue that does not alter a material conclusion.

## Deliverable
Report exact SHA, authoritative sources checked, retrieval dates, concrete runtime paths, findings, and verdict. No production edits.

## Next action
- P0/P1 => instantiate Corrective Master.
- clean => advance to Master 03.

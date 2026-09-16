# MASTER 05 — Bruno Electric NEC / Documents / Source Provenance Autonomous Master v52

ROLE: `AUTONOMOUS AUDIT → CORRECTIVE → RE-AUDIT`

Repository: `kot0070/bruno-electric-pwa`
Planning branch: `planning/post-v50-ai-masters`
Starting production/dev candidate SHA: `7da0d0ef02858bf891e8f327e02312f7a80f6751`
Accepted prerequisite math re-audit: `audit/electrical-math-v52-7da0d0e/audits/reports/ELECTRICAL_MATH_V52_7da0d0e.md`

## MASTER STATE
`CURRENT_STAGE = ND1_CLAIM_INVENTORY`

## HARD EXECUTION RULES
1. STRICT SEQUENTIAL. Do not skip stages.
2. After completing every stage, reread this file before starting the next stage.
3. A stage is DONE only with recorded evidence: exact SHA/ref, files checked, sources checked, findings, tests where applicable.
4. Audit-only stages may write only to a separate audit branch.
5. Production corrections may write only to the designated dev branch after a P0/P1 is documented.
6. No merge to `main` unless the user explicitly commands merge.
7. Do not trust existing labels such as `NEC 2026`, `Code Required`, `Texas`, `AHJ`, `minimum`, `compliant`, or `pass` without tracing the underlying rule/data/source.
8. Distinguish four categories everywhere:
   - CODE / LEGAL REQUIREMENT
   - MANUFACTURER / LISTING REQUIREMENT
   - ENGINEERING / DESIGN RECOMMENDATION
   - BRUNO ESTIMATING ASSUMPTION
9. Missing required facts must fail closed for compliance conclusions.
10. Do not reproduce copyrighted NEC text at length. Use article/table identifiers, concise paraphrases, and authoritative source metadata.

---

# ND1 — CLAIM INVENTORY

Goal: build a complete inventory of user-facing and calculation-driving compliance/source claims.

Required runtime/code scope:
- `electric-reference-data.js`
- `electric-calculators.js`
- `electric-residential-rules.js`
- `electric-residential.js`
- `electric-residential-live.js`
- `electric-phase3-rules.js`
- `electric-phase3.js`
- all corresponding UI modules
- `index.html`
- `electrical-tools.html`
- Texas/AHJ/edition selectors and help text
- service worker/cache only where stale code/document claims can persist offline

Inventory every claim involving:
- NEC article/table number;
- NEC edition/year;
- Texas adoption/amendment;
- AHJ behavior;
- ampacity / conductor / temperature / terminal / derating;
- conduit fill / box fill;
- voltage drop recommendation vs mandate;
- dwelling service/load;
- §120.13 branch-circuit load;
- GFCI/AFCI;
- EVSE/HVAC/motor/service/feeder/EGC/GEC;
- residential receptacle/circuit rules;
- quick wire-footage and takeoff assumptions;
- any `PASS`, `FAIL`, `NON-COMPLIANT`, `CODE MINIMUM`, `Code Required`, `NEC 2026`, `Texas` wording.

Required artifact on audit branch:
`audits/nec/CLAIM_INVENTORY.md`

Each row:
`claim_id | runtime path | UI surface | claim summary | category | cited article/table/source | edition | jurisdiction | required inputs | fail-closed? | status`

GATE ND1:
- no major runtime claim family omitted;
- inventory includes calculation-driving hidden constants and user-visible prose.

DO NOT ADVANCE if inventory is incomplete.

---

# ND2 — AUTHORITATIVE SOURCE VERIFICATION

Goal: independently verify current source provenance.

Required source hierarchy:
1. Texas/state/AHJ official legal/adoption sources for jurisdiction/adoption claims.
2. NFPA/NEC official metadata or legally accessible authoritative references for edition/article/table provenance.
3. Official manufacturer/listing documentation for equipment-specific requirements.
4. Official standards/agency documents.
5. Secondary explanatory sources only as supporting material, never sole support for compliance-critical claims.

Texas-specific rule:
- web verification is mandatory at execution time for current Texas adoption/amendment claims;
- record retrieval date;
- specifically verify any app claim about Texas NEC edition/effective date and represented Texas modifications/exceptions.

For each ND1 claim assign:
- VERIFIED_CURRENT
- VERIFIED_EDITION_SPECIFIC
- ESTIMATING_ASSUMPTION_NOT_CODE
- SOURCE_INSUFFICIENT
- STALE_EDITION
- WRONG_JURISDICTION
- UNSUPPORTED_CATEGORICAL_WORDING

Required artifact:
`audits/nec/SOURCE_VERIFICATION_MATRIX.md`

GATE ND2:
Every compliance-critical claim must have an authoritative source disposition.

---

# ND3 — EDITION / JURISDICTION / RUNTIME TRACE

Goal: prove labels and math cannot drift apart.

Required scenarios:
- edition label changes while engine constants remain unchanged;
- imported historical Job with older edition metadata;
- Texas/Austin-area labels vs generic NEC math;
- offline cached shell after edition/source update;
- archived calculation opened after current code edition changes;
- AHJ selector/label behavior where no AHJ-specific engine exists.

Required checks:
- a 2020/2023/2026 label must never imply calculations changed if they did not;
- historical calculation must retain source/edition context where needed;
- UI must disclose when edition is metadata only;
- jurisdiction labels must not fabricate local amendments;
- stale offline code must not present a newer source/version label over older math.

Required artifact:
`audits/nec/EDITION_JURISDICTION_MATRIX.md`

GATE ND3:
No unclassified edition/jurisdiction drift remains.

---

# ND4 — FAIL-CLOSED COMPLIANCE SEMANTICS

Goal: validate missing-input behavior for every compliance-facing module.

Required adversarial inputs include:
- blank / malformed / zero where zero is invalid;
- conductor material/size absent;
- terminal rating absent/unsupported;
- ambient temperature outside supported table;
- CCC invalid;
- incomplete room/layout geometry;
- missing major loads;
- unknown equipment/listing facts;
- unknown service/feeder eligibility;
- missing jurisdiction/AHJ specificity where required.

For each module determine whether it may return:
- PASS / FAIL / NON-COMPLIANT;
- INFO / REVIEW;
- LAYOUT REQUIRED / FIELD VERIFY;
- BLOCKED / insufficient facts.

P1 if missing facts can produce a materially false compliance conclusion.

Required artifact:
`audits/nec/FAIL_CLOSED_MATRIX.md`

---

# ND5 — HEURISTIC VS CODE UX AUDIT

Goal: prevent estimator assumptions from masquerading as NEC requirements.

Audit specifically:
- wire/cable footage routing model;
- ft² quick budget multiplier;
- receptacles-per-circuit grouping;
- panel-space reserve;
- device-count allowances;
- material/waste percentages;
- voltage-drop design target;
- any default equipment assumptions.

Required UI standard:
A professional user must be able to distinguish an NEC minimum from Bruno estimating/design logic without opening source code.

Required artifact:
`audits/nec/HEURISTIC_CODE_CLASSIFICATION.md`

---

# ND6 — FULL NEC/DOCUMENT AUDIT VERDICT

Create report:
`audits/reports/NEC_DOCUMENTS_SOURCES_V52_<shortsha>.md`

Severity:
- P0: materially unsafe/legal compliance conclusion from false/misapplied rule/source.
- P1: edition/jurisdiction/provenance/fail-closed defect that can materially mislead professional work.
- P2: bounded wording/source-quality issue without material calculation/workflow consequence.

Verdict:
- A ACCEPT: no P0/P1.
- B ACCEPT AFTER MINOR FIXES: no P0/P1, bounded P2 only.
- C REJECT / REWORK REQUIRED: ≥1 P0/P1.

IF A/B CLEAN ENOUGH:
advance directly to ND10 and prepare next domain master.

IF P0/P1:
instantiate ND7 corrective stage from the report. Do not improvise outside documented findings.

---

# ND7 — CORRECTIVE MASTER GENERATION

Only if ND6 has P0/P1.

Create on dev branch:
`dev-plans/CORRECTIVE_NEC_DOCUMENTS_<source-shortsha>.md`

For each blocker define:
- finding ID;
- exact runtime path;
- root cause;
- correction contract;
- test/evidence contract;
- backwards-compatibility/persistence implications;
- PWA/cache implications;
- stage gate.

STRICT RULE:
One blocker family at a time. No unrelated refactor.

---

# ND8 — CORRECTIVE IMPLEMENTATION

For each blocker:
1. implement smallest systemic fix;
2. add deterministic regression coverage where executable;
3. add source/provenance metadata tests where possible;
4. run exact-head CI;
5. record evidence in corrective master;
6. reread corrective master;
7. only then advance.

If correcting current legal/source assertions, independently re-check authoritative sources immediately before commit.

PWA cache bump required if shipped runtime/document/source semantics change.

---

# ND9 — EXACT-SHA RE-AUDIT

After all corrective stages:
- write developer report;
- freeze documentation-inclusive dev SHA;
- require exact-head CI GREEN;
- create new audit branch from exact SHA;
- independently rerun ND1–ND6 focusing on original blockers plus shared regressions;
- only A / clean B closes this master.

No merge automatically.

---

# ND10 — MASTER COMPLETION / HANDOFF

Completion requirements:
- final accepted exact SHA recorded;
- final audit report link recorded;
- P0/P1 = 0;
- dev branch frozen;
- PR state recorded;
- next master selected from queue.

Next intended master after clean NEC/Documents cycle:
`03_DATA_INTEGRITY_PERSISTENCE_AUDIT_MASTER.md`

Create/update `ai-masters/MASTER_QUEUE.md` before stopping so another AI chat can continue without user reconstruction.

## USER REPORT RULE
Do not send stage-by-stage reports to the user. Send one consolidated report only after this entire master reaches ND10 or a true external blocker makes autonomous continuation impossible.

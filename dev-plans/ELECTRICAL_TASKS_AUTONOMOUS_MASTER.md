# Bruno Electric — Electrical Tasks / Field Calculator Autonomous Master

MASTER_STATUS: MASTER_COMPLETE
CURRENT_STAGE: COMPLETE
EXECUTION_MODE: STRICT_SEQUENTIAL
IMPLEMENTATION_BRANCH: main
AUDIT_BRANCH_POLICY: separate exact-SHA audit branches
USER_REPORTING_POLICY: report only after whole master is complete or a true external blocker requires user input

## Mission
Create a first-class Calculator tab named `Electrical Tasks` for practical professional electrical design/estimating tasks such as `300A panel, 1500 ft run — what conductor and raceway are required?` The system decomposes tasks into deterministic, traceable calculations rather than returning opaque answers.

Core output chain:
load/design current -> ampacity -> correction/adjustment -> conductor candidates -> parallel sets -> voltage drop -> neutral/EGC semantics -> raceway fill -> raceway size -> material takeoff -> assumptions -> code/design basis -> unresolved items.

## Non-negotiable gate
DO NOT ENTER STAGE N+1 until STAGE N has all of:
1. implementation/work complete;
2. deterministic tests complete;
3. exact-head CI GREEN;
4. independent audit on exact SHA;
5. every P0/P1 corrected;
6. exact-head CI after corrective work;
7. independent re-audit when corrective work was required;
8. no remaining P0/P1;
9. evidence/report committed;
10. master/state updated with accepted evidence.

P2 may be carried only when explicitly documented as non-blocking. Never silently defer P0/P1.

## Core invariants
- BLANK != ZERO.
- UNKNOWN != ZERO.
- Your Cost != Customer Price.
- Code requirement != estimating/design assumption.
- Voltage-drop sizing != ampacity sizing.
- Raceway fill != pulling feasibility.
- EGC != neutral != GEC != bonding jumper.
- Save != Apply.
- Live calculation != Approved Quote.
- Historical calculations retain engine/source provenance.
- Compliance-critical missing inputs fail closed.
- No global calculation registry may break Job isolation.
- Calculator outputs never silently mutate Job.
- Every recommendation exposes inputs, formulas/tables, assumptions, and selection basis.
- Unsupported configuration returns `NO SUPPORTED CONFIGURATION`, never an invented answer.

## Accepted execution evidence
The detailed authoritative ledger is `dev-plans/ELECTRICAL_TASKS_MASTER_STATE.json`.

| Stage | Status | Accepted exact head | Tests | Audit |
|---|---|---|---:|---|
| 0 | DONE_ACCEPTED | `1dcedbc9934633a924c807e995ac92e25c0254de` | — | A_ACCEPT |
| 1 | DONE_ACCEPTED | `0231119f6ff56922434e8a954cc3f90d906689b2` | 639 | A_ACCEPT |
| 2 | DONE_ACCEPTED | `c452723c28dbec9cf001b40c3dcf2bd391955e32` | 657 | A_ACCEPT |
| 3 | DONE_ACCEPTED | `3ceac78e05f193ecc7f3f39441a7ce658b25d156` | 668 | A_ACCEPT |
| 4 | DONE_ACCEPTED | `c0a3acf6308200447c22d53317d025ebc6439b77` | 685 | A_ACCEPT |
| 5 | DONE_ACCEPTED | `c1d43c345f1943f3fe730bfe3b6a22c6b535d4e5` | 700 | A_ACCEPT |
| 6 | DONE_ACCEPTED | `63b9204dff7344eafc44a5b7087d75f0893eb295` | 707 | A_ACCEPT |
| 7 | DONE_ACCEPTED | `b706c2d6216030998f29093b72048ba7ace00489` | 734 | A_ACCEPT |
| 8 | DONE_ACCEPTED | `fe43954df4c6174ba40d2322eedc5b864179f230` | 744 | A_ACCEPT |
| 9 | DONE_ACCEPTED | `aa1fcc63300abfca0cc9b41c6147fda0d8780068` | 751 | A_ACCEPT |
| 10 | DONE_ACCEPTED | `7baa60b75f0fb7e67983749db167c49d97777904` | 759 | A_ACCEPT |
| 11 | DONE_ACCEPTED | `68ff1dc9084ac67e147707d983f0c7316af6499d` | 767 | A_ACCEPT |
| 12 | DONE_ACCEPTED | `7895688e2b4d67f25634820822582a4c86635bb3` | >=767 | A_ACCEPT after corrective re-audit |

---

# STAGE 0 — Previous Audit / Corrective Closure
STATUS: DONE_ACCEPTED

Verified current `main` contained previously accepted navigation, Residential archive/Job isolation, Save != Apply, applied-calculation provenance, approved-quote immutability, fixed-price invoice snapshot, custom/special-order materials, blank-zero-positive Your Cost semantics, PWA/cache provenance, pricing-domain guard, voltage-drop corrective, Residential §120.13 corrective, negative pricing/T&M protection, and prior P0/P1 closures.

---

# STAGE 1 — Electrical Tasks Architecture + UX Shell
STATUS: DONE_ACCEPTED

Implemented first-class `Electrical Tasks` workspace, Job-scoped `ElectricalTaskCalculation` persistence, task-template shell, create/edit/reload semantics, blank-vs-zero preservation and Job A/B isolation without introducing a global task registry.

---

# STAGE 2 — Feeder / Panel Run Calculation Engine
STATUS: DONE_ACCEPTED

Implemented strict input normalization, design current, ampacity, supported parallel-set evaluation, corrected resistance-only K-method voltage drop, automatic deterministic candidate search, explicit calculation steps, and `NO SUPPORTED CONFIGURATION` fail-closed behavior. 125% treatment is explicit-fact driven rather than universal.

---

# STAGE 3 — Raceway / Conduit Engine
STATUS: DONE_ACCEPTED

Implemented deterministic raceway fill and sizing using only independently supported authoritative table data. EMT and PVC Schedule 40 are enabled where supported. Unsupported raceway data fails closed. Raceway fill is never presented as pulling feasibility.

---

# STAGE 4 — EGC / Grounding / Neutral Model
STATUS: DONE_ACCEPTED

Kept phase, neutral, EGC, GEC and bonding-jumper semantics separate. Implemented supported EGC sizing and explicit review flags for upsizing/parallel-raceway conditions. GEC/bonding remains separate-verification scope where deterministic logic is not complete.

---

# STAGE 5 — Material Takeoff From Task
STATUS: DONE_ACCEPTED

Implemented task-result material plans for phase conductors, neutral, EGC and raceway plus bounded allowances/field-verification rows. Catalog/Job integration preserves Your Cost semantics, unresolved cost state and historical provenance. Customer Price never substitutes for Your Cost.

---

# STAGE 6 — Saved Electrical Tasks / Archive / Apply to Job
STATUS: DONE_ACCEPTED

Implemented Save, Duplicate, Rename, Delete, Load, Recalculate, Apply to Job and explicit Update Job from Task. Save != Apply. Later task edits do not silently alter Job. Material replacement archives prior task-origin snapshots and rolls back on failed update.

---

# STAGE 7 — Advanced Task Templates
STATUS: DONE_ACCEPTED

Accepted sequential mini-cycles for:
- 7A Branch Circuit
- 7B EVSE
- 7C HVAC
- 7D Motor
- 7E Transformer Feed
- 7F Generator / Feeder
- 7G Generic Long Run / long-distance voltage-drop workflow

Common deterministic engines are reused; missing equipment-specific compliance facts remain explicit/unresolved rather than guessed.

---

# STAGE 8 — Professional Task Solver UX
STATUS: DONE_ACCEPTED

Implemented deterministic plain-language-like extraction. The solver extracts only explicit supported facts, asks for unresolved compliance-critical inputs, exposes why inputs are needed, assumptions and code/design basis, and never auto-saves/applies to Job.

---

# STAGE 9 — NEC / Documents / Source Provenance Audit
STATUS: DONE_ACCEPTED

Completed authoritative current-source audit for edition/jurisdiction metadata, Texas adoption/effective date, Texas HVAC exception provenance, NFPA source provenance, code-vs-heuristic separation, warnings/help text and historical provenance. Local AHJ amendments remain project-specific verification scope.

---

# STAGE 10 — Data Integrity / Persistence Master
STATUS: DONE_ACCEPTED

Completed cross-job and malformed-data audit covering Job A/B, saved/applied Electrical Tasks, Quote/Invoice, Catalog/custom materials, Residential archive, task archive, old/partial records, deleted rows and stale localStorage behavior. No cross-job contamination or silent destructive migration was accepted.

---

# STAGE 11 — Responsive / PWA / Field UX Master
STATUS: DONE_ACCEPTED

Validated deterministic responsive contracts for phone (<768px, including 360–430px target range), tablet (768–1199.98px, covering 768–1024px target range), and desktop (>=1200px). Added safe-area-aware mobile navigation, overflow guards, narrow solver layout and offline shell verification. Final accepted Stage 11 cache is `bruno-electric-v67`.

Accepted P2: repository has no automated screenshot-diff / real-device browser farm or dedicated virtual-keyboard automation.

---

# STAGE 12 — Final Release Candidate Master
STATUS: DONE_ACCEPTED

Final developer report: `dev-reports/ELECTRICAL_TASKS_FINAL_RELEASE_CANDIDATE.md`.

Initial Stage 12 audit on `84f8a6cd834e3c49874a9bfcbeab67c6057ff5cc` found one governance P1: stale master execution state. The corrective synchronized this master with the authoritative state ledger. Exact-head CI run #519 on `7895688e2b4d67f25634820822582a4c86635bb3` passed, and the independent re-audit `audits/reports/ELECTRICAL_TASKS_STAGE12_REAUDIT_7895688.md` returned `A_ACCEPT` with P0=0/P1=0.

All stages 0–12 are DONE_ACCEPTED. Final completion metadata may change the repository head without changing product runtime; the accepted release-candidate code/evidence head is `7895688e2b4d67f25634820822582a4c86635bb3`.

MASTER_COMPLETE

# Bruno Electric — Electrical Tasks / Field Calculator Autonomous Master

MASTER_STATUS: IN_PROGRESS
CURRENT_STAGE: STAGE_0_PREVIOUS_AUDIT_CLOSURE
EXECUTION_MODE: STRICT_SEQUENTIAL
IMPLEMENTATION_BRANCH: main
AUDIT_BRANCH_POLICY: separate exact-SHA audit branches
USER_REPORTING_POLICY: report only after whole master is complete or a true external blocker requires user input

## Mission
Create a first-class Calculator tab named `Electrical Tasks` for practical professional electrical design/estimating tasks such as: `300A panel, 1500 ft run — what conductor and raceway are required?` The system must decompose the task into deterministic, traceable calculations rather than returning an opaque answer.

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
7. independent re-audit;
8. no remaining P0/P1;
9. evidence/report committed;
10. this master updated with DONE state and evidence SHA.

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

---

# STAGE 0 — Previous Audit / Corrective Closure
STATUS: ACTIVE

Verify current `main` actually contains all previously accepted runtime fixes. Do not trust chat history alone.

Required closure matrix includes at least:
- Calculator -> Job navigation/deep-link fixes
- Residential archive and Job isolation
- Save Calculation != Apply to Job
- applied-calculation provenance
- Quote lifecycle / immutable Approved Quote
- fixed-price Invoice from approved snapshot
- Custom / Special-order materials
- Custom Qty semantics / blank-zero-positive Your Cost semantics
- Custom Job isolation
- PWA cache/provenance
- exact-head CI provenance
- pricing-domain guard
- voltage-drop corrective
- Residential §120.13 corrective
- negative pricing/T&M protection
- all prior P0/P1 from workflow and electrical-math audits

Deliverable: `dev-reports/ELECTRICAL_TASKS_STAGE0_CLOSURE.md`
Gate: every previous P0/P1 = PASS. Any regression creates STAGE_0_CORRECTIVE and blocks Stage 1.

---

# STAGE 1 — Electrical Tasks Architecture + UX Shell
STATUS: LOCKED

Create first-class `Electrical Tasks` workspace in Calculator. Do not bury under More.

Initial task templates:
- Feeder / Panel Run
- Branch Circuit Run
- Long-Distance Voltage Drop
- Conductor Sizing
- Conduit / Raceway Sizing
- Parallel Conductors
- Service / Feeder
- Transformer Feed
- Motor Circuit
- EVSE Circuit
- HVAC Circuit
- Generator / Feeder
- Generic Custom Electrical Task

Stage 1 implements shell/data model and makes `Feeder / Panel Run` the first functional template entry point.

Data model:
`ElectricalTaskCalculation { id, taskType, createdAt, updatedAt, inputs, assumptions, result, calculationSteps, warnings, unresolved, sourceEdition, jurisdiction, engineVersion }`

Persist inside active Job only.

Tests: navigation, phone/tablet/desktop, create/edit/reload, Job A/B isolation, blank-vs-zero, no current regressions.
Audit scope: architecture + UX + persistence.

---

# STAGE 2 — Feeder / Panel Run Calculation Engine
STATUS: LOCKED

Required chain:
1. strict input normalization;
2. design current;
3. ampacity;
4. parallel conductor sets;
5. voltage drop;
6. automatic candidate search.

Inputs include load/current, voltage, phase, one-way distance, conductor material/type, terminal rating, ambient, CCC, continuous/noncontinuous facts, VD target, raceway strategy.

Do not apply 125% universally without facts supporting it.

Ampacity output must expose base ampacity, insulation column, terminal limit, ambient factor, CCC factor, adjusted ampacity, final allowable ampacity.

Parallel output must expose sets, conductors/set, ampacity/conductor, combined ampacity, and supported-rule assumptions.

Voltage drop uses corrected resistance-only K-method; PF must not reduce I×R drop. Parallel sets use effective total circular-mil area correctly.

Candidate engine returns several supported candidates with explicit criterion labels such as `smallest supported configuration meeting selected constraints` or `fewer parallel sets`; never an unexplained best/winner.

Mandatory scenario matrix includes 100/200/300/400/600A; Cu/Al; 1Ø/3Ø; 208/240/480V; short/long distance; 2/3/5% VD; continuous/noncontinuous; ambient/CCC/terminal boundaries; blank/zero/negative/malformed; extreme-distance/no-supported-config.

Audit: independent electrical-math audit with manual expected calculations.

---

# STAGE 3 — Raceway / Conduit Engine
STATUS: LOCKED

Initial supported raceways: EMT, PVC Schedule 40, PVC Schedule 80 only where authoritative dimensions are present.

Calculate conductor count/areas, total occupied area, fill limit, available area, smallest supported raceway, per-raceway configuration, total approximate raceway footage.

Support separate raceways for parallel sets. Shared-raceway parallel configurations only when explicitly supported.

Show raceway-by-raceway breakdown. Raceway fill must never be presented as pulling feasibility.

Audit: Chapter 9/table data, 1/2/>2 conductor fill boundaries, mixed sizes, parallel sets, impossible fill, unsupported conductor type.

---

# STAGE 4 — EGC / Grounding / Neutral Model
STATUS: LOCKED

Keep phase, neutral, EGC, GEC, bonding-jumper semantics separate.

Initial scope: EGC sizing where inputs are sufficient, parallel-raceway EGC treatment, explicit neutral inclusion/counting rules, voltage-drop upsizing EGC review logic where applicable.

GEC/bonding output remains `Separate verification required` until fully supported by dedicated deterministic logic.

Audit: code-specific grounding/bonding review.

---

# STAGE 5 — Material Takeoff From Task
STATUS: LOCKED

Convert accepted task result to calculated material plan:
- phase conductor footage
- neutral footage
- EGC footage
- raceway count/size/footage
- bounded allowances for fittings/pulling/labels/termination status

Separate CALCULATED vs ALLOWANCE vs FIELD VERIFY.

Integrate Catalog and Job Materials with strict Your Cost semantics. Unknown cost remains unresolved. Customer Price never substitutes for Your Cost. Applying to Job creates historical snapshots that future Catalog repricing does not silently rewrite.

Audit: Catalog/Job/cost integration.

---

# STAGE 6 — Saved Electrical Tasks / Archive / Apply to Job
STATUS: LOCKED

Actions: Save, Duplicate, Rename, Delete, Load, Recalculate, Apply to Job, Update Job from Task.

Save != Apply.

Apply provenance: sourceTaskId, sourceTaskRevision, appliedAt, engineVersion, code edition, source metadata.

Later task edits do not silently alter Job. Show SAVED / APPLIED TO JOB / CHANGED SINCE APPLY.

Audit: persistence/history/import-export/Job A-B isolation.

---

# STAGE 7 — Advanced Task Templates
STATUS: LOCKED

Add sequentially with their own mini-cycle IMPLEMENT -> TEST -> AUDIT -> CORRECT -> RE-AUDIT -> ACCEPT:
7A Branch Circuit
7B EVSE
7C HVAC
7D Motor
7E Transformer Feed
7F Generator / Feeder
7G Generic Long Run

Reuse common deterministic engines; no duplicate math.

---

# STAGE 8 — Professional Task Solver UX
STATUS: LOCKED

Structured natural-language-like workflow, not AI-dependent.

Example: `I need a 300A panel 1500 ft from service.`
System extracts known facts and explicitly asks unresolved compliance-critical fields such as voltage, phase, material, installation, load basis, VD target.

Do not guess missing compliance facts.

Add `Why do you need this input?`, `Show assumptions`, `Show code/design basis`.

Audit: UX + fail-closed professional usability.

---

# STAGE 9 — NEC / Documents / Source Provenance Audit
STATUS: LOCKED

Run full authoritative provenance audit against previous app claims plus new Electrical Tasks claims.

Check edition/jurisdiction, Texas/AHJ metadata, article/table references, code vs heuristic separation, stale sources, warnings/help text, historical provenance.

Current legal/adoption claims must be independently verified from authoritative current web sources at execution time. Do not rely on memory.

Any P0/P1 => corrective stage + re-audit.

---

# STAGE 10 — Data Integrity / Persistence Master
STATUS: LOCKED

Full app cross-job and malformed-data audit: Job A/B, import/export, saved/applied tasks, quote/invoice, Catalog/custom materials, Residential archive, Electrical Tasks archive, old schemas, partial records, deleted rows, stale localStorage, PWA offline restore.

No cross-job contamination or silent destructive migration.

---

# STAGE 11 — Responsive / PWA / Field UX Master
STATUS: LOCKED

Validate phone 360–430px, tablet 768–1024px, desktop >=1200px.

Primary concerns: long forms, candidate/raceway result tables, saved tasks, bottom nav, keyboard behavior, sticky actions, scroll restoration, offline mode, service-worker upgrade. No hidden action behind navigation or critical horizontal overflow.

---

# STAGE 12 — Final Release Candidate Master
STATUS: LOCKED

Completion requires every stage accepted, 0 P0, 0 P1, exact final SHA, deterministic suite count >= prior accepted baseline, exact-head CI GREEN, final PWA cache version, final developer report, full independent release audit, and re-audit if needed.

Final report: architecture, capabilities, unsupported scope, formula inventory, source provenance, data model, persistence, Job/material integration, quote/invoice regression state, PWA/responsive status, test count, final SHA, CI run, audit verdict, remaining P2/P3, recommended next master.

MASTER_COMPLETE only when STAGE 0–12 are DONE + AUDITED + CORRECTED IF REQUIRED + RE-AUDITED + ACCEPTED and final release audit has 0 P0/P1.

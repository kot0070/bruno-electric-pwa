# Bruno Electric — Independent Electrical Math / Formula Audit

**Role:** INDEPENDENT AUDIT ONLY  
**Audited production SHA:** `852bf3c88a4f0fc75584b24aa8e68f277e16342e`  
**Audit branch:** `audit/electrical-math-852bf3c`  
**Task:** `audits/MATH_TASK_CURRENT.md`  
**Verdict:** **C — REJECT / REWORK REQUIRED**  
**P0:** 0  
**P1:** 4  
**P2:** 2

## Executive conclusion
The candidate contains several correct core formula families and a materially improved test suite, but the math layer is not yet safe enough for a professional estimating/code calculator. Four P1 defects can either produce an unsupported PASS/code result or materially understate project/customer cost.

The two most important technical defects are: (1) the K-method voltage-drop engine multiplies resistive voltage drop by power factor even though the input is already current, which can understate drop and flip a 3% design result from REVIEW to PASS; and (2) the Residential Live circuit model does not enforce the new 2026 NEC dwelling branch-circuit unit-load minimum under §120.13, so it can model fewer general branch circuits/panel spaces than the code-derived minimum.

A separate systemic validation defect allows blank/default coercion and negative monetary/hour quantities to enter calculation paths. Method A also fails open when profit reaches/exceeds 100% rather than rejecting an invalid domain.

## Formula inventory independently traced

### Electrical calculator engine
- Table 310.16 ampacity lookup.
- ambient correction factor lookup.
- current-carrying-conductor adjustment factor.
- terminal-temperature ampacity limit.
- continuous-load 125% multiplier.
- one-phase / three-phase K-method voltage drop.
- raceway fill (53% / 31% / 40%).
- box fill same-gauge supported subset.
- transformer full-load current, 1φ and 3φ.

### Residential / dwelling
- 2026 service/feeder floor-area load density.
- lighting/small-appliance/laundry demand tiers.
- fixed-appliance 75% path.
- dryer and cooking demand.
- noncoincident HVAC selection.
- largest-motor 25% adder.
- service current / standard service candidate.
- Residential Live receptacle/circuit grouping.
- panel-space design allowance.
- detailed and quick cable takeoff plus waste.

### Phase 3
- EVSE continuous-load multiplier.
- HVAC MCA/MOCP guard.
- motor conductor, overload and SC/GF percentage paths.
- Table 250.122 EGC lookup.
- Table 250.66 GEC base/cap paths.
- feeder continuous/noncontinuous load combination.

### Estimating / commercial math
- Job Material Qty × unit cost.
- equipment and subcontractor sums.
- small-tools Qty × unit cost.
- labor straight / 1.5× / 2× hours.
- Method A `sales = cost × (1 + OH) / (1 − profit)`.
- break-even / OH / profit amount.
- rounded base quote + approved Change Orders.
- manual quote adjustment and immutable approved snapshot.
- T&M equipment/labor/material/sub totals.

---

# Independent expected-value evidence

| Family | Input | Independent expectation | Candidate behavior | Result |
|---|---|---:|---:|---|
| Ampacity | #6 Cu, 90°C insulation, 75°C terminal, 30°C, 3 CCC, 50 A | base 75 A; adjusted 75 A; terminal cap 65 A; PASS | 65 A PASS | Correct |
| Continuous ampacity | same conductor, 52 A continuous | required = 65 A | 65 A threshold | Correct |
| Conduit fill | 3 × #12 THHN, 3/4 EMT | used .0399 in²; allowed 40% × .533 = .2132 in² | PASS | Correct |
| Box fill | #12: 4 insulated + 2 EGC group + 1 yoke | units = 4 + 1 + 2 = 7; 7 × 2.25 = 15.75 in³ | 15.75 in³ | Correct |
| Transformer 1φ | 25 kVA, 240→120 | 25,000/240=104.17 A; 25,000/120=208.33 A | matches | Correct |
| Transformer 3φ | 75 kVA, 480 V | 75,000/(√3×480)=90.21 A | matches | Correct |
| Method A | cost 1000, OH 20%, profit 20% sales | 1000×1.2/.8 = 1500; break-even 1200; profit 300 | matches in valid domain | Correct |
| Labor | 2 persons × 5 days × 10 h, straight rate $50 | 80 straight h + 20 OT h; 80×50 + 20×75 = $5,500 | matches stated business rule | Correct |
| Residential demand | 2,000 ft² + 2 SA + 1 laundry | 4000 + 3000 + 1500 = 8500 connected; demand 3000 + 5500×.35 = 4925 VA | matches | Correct |
| Voltage drop, PF=1 | 240 V, 1φ, #12 Cu, 20 A, 100 ft | 2×12.9×20×100/6530 = 7.90 V = 3.29% | 7.90 V = 3.29% | Correct |
| Voltage drop, PF=.8 | same current/distance, PF .8 | resistive K-only method remains 7.90 V / 3.29%; full AC method needs R/X, not `R×PF` alone | candidate gives 6.32 V / 2.63% | **P1** |
| Residential Live 120.13 | 1,000 ft² dwelling, 20 A general circuits | 3 VA/ft² → 3000 VA ÷120=25 A → minimum 2 × 20 A circuits | room/receptacle grouping can produce 1 circuit | **P1** |

---

# Findings

## P1-01 — Required electrical inputs fail open through blank/default coercion

**Files:** `electric-calculators.js`, UI callers/tests.

The shared numeric helper performs `Number(v)`. JavaScript converts `''` to `0`. Several calculator paths then explicitly allow zero, which makes a blank required value become a real engineering value instead of an error.

Concrete reproductions:

1. Ampacity with `loadAmps: ''` reaches `positive('', 'load amps', true)` → numeric `0` → required ampacity `0 A` → can return `PASS`.
2. Voltage Drop permits current and distance through the same allow-zero path; a blank current/distance can become `0`, producing `0 V` / `0%` and PASS.
3. Ampacity ratings use `Number(input.insulationRating || 90)` and `Number(input.terminalRating || 75)`. Explicit `0` or another falsy value silently becomes 90°C / 75°C instead of failing validation.
4. Ambient/CCC defaults are appropriate only for omitted/null fields; falsy coercion must not turn an explicitly invalid entered value into a valid default.

**Why P1:** a code-facing calculator can emit a supported-looking PASS from missing/invalid required engineering input.

**Required correction:** strict missing/blank/invalid parsing before defaults; defaults only for truly omitted optional fields. Add adversarial blank/null/0/malformed tests for each required input.

---

## P1-02 — Voltage-drop power-factor term is dimensionally wrong for the implemented K-only/current-input method

**File:** `electric-calculators.js`.

Current implementation:

`drop = multiplier × K × current × oneWayDistance × powerFactor / CM`

For a resistance-only K-method where actual line current is already supplied, the resistive drop is `I × R` and does not become `I × R × PF`. A full AC approximation with power factor needs both resistance and reactance components (`R cosθ + X sinθ`); multiplying the K-only result by PF is not an equivalent formula.

Hand-check case:
- 240 V, single phase
- Cu #12, CM=6530
- K=12.9
- I=20 A
- L=100 ft one-way
- target=3%

Resistance-only K result:
`2×12.9×20×100/6530 = 7.90 V = 3.29%` → REVIEW.

Candidate at PF .8:
`7.90×.8 = 6.32 V = 2.63%` → PASS.

Thus a lower PF can incorrectly make the displayed voltage drop *better*, and can cross the 3% threshold in the unsafe direction.

The deterministic test suite currently encodes this behavior in the 3φ PF=.9 expected value, so green CI does not validate the physics.

**Required correction:** for the current K-only model, remove the PF multiplier and label it as a resistive estimating approximation; or implement an impedance/reactance model with appropriate conductor/raceway data. Add a regression proving PF cannot artificially reduce K-only drop.

---

## P1-03 — Residential Live omits the 2026 NEC dwelling branch-circuit floor-area minimum (§120.13)

**Files:** `electric-residential-live.js`, `electrical-residential-live-ui.js`, related tests.

The 2026 dwelling **service/feeder** floor-area value of 2 VA/ft² is correctly represented in the service-load rules. However, the 2026 NEC separately retains **3 VA/ft² for dwelling branch-circuit calculation** under new §120.13.

The rules data already contains `branchCircuitGeneralVAperFt2: 3`, but Residential Live does not consume it. Instead, `generalCircuits` is derived from receptacle count divided by an editable Bruno grouping assumption (`receptaclesPerGeneralCircuit`, default 5).

Independent example:
- dwelling floor area = 1,000 ft²
- branch-circuit load = 1,000 × 3 = 3,000 VA
- 3,000/120 = 25 A
- with 20 A general circuits, minimum count = ceil(25/20) = **2** circuits.

A room-count-only Residential Live case can estimate 4 general receptacles and default grouping 5, producing **1** modeled 20 A general circuit. The UI then derives panel-space/BOM quantities from this undercounted circuit total.

Independent 2026 reference confirmation: NFPA 2026 development material and current 2026 code education references distinguish the 2 VA/ft² service/feeder value from the 3 VA/ft² §120.13 branch-circuit value.

**Why P1:** this can understate a mandatory dwelling branch-circuit count and downstream breaker/panel-space/takeoff quantities.

**Required correction:** compute the code-derived general branch-circuit minimum from floor area and selected 15/20 A general-circuit rating, then use at least the greater of that minimum and the design/receptacle grouping requirement. Expose the two bases separately in UI/tests.

---

## P1-04 — Pricing/T&M numeric domains are not enforced; invalid negatives and invalid profit can materially reduce totals

**Files:** inline estimating engine/listeners in `index.html` and normalization paths.

Multiple editable monetary/hour/quantity paths use `Number(x)||0`, `parseFloat(x)||0`, or `asNum()` without nonnegative/domain validation. HTML `min` attributes are not calculation-layer validation and do not protect imported/persisted state.

Affected examples include:
- Job Materials `qty` and `unitCost`;
- Equipment cost;
- small-tools quantity/unit cost;
- subcontractor price;
- labor persons/days/hours;
- T&M equipment qty/rate;
- T&M labor hours/rate;
- T&M material/sub amounts;
- Summary OH/profit state.

Concrete material example:
- `qty = -10`, `unitCost = 50` → line extension `-$500`.
- This directly reduces contractor material cost, then Method A recommended sales and Quote Total.

Concrete T&M example:
- equipment qty `-2`, rate `$100` → `-$200` invoice contribution.

Method A valid-domain example is correct:
`cost=1000, OH=.20, profit=.20` → `$1500`.

But when `profit >= 1`, `withOHP()` does not reject; it executes `if (div <= 0) return c`, returning raw cost. For `cost=1000, OH=.20, profit=1.00`, candidate sales becomes `$1000` while break-even is `$1200`, creating a nonsensical negative profit amount instead of blocking the calculation. Negative OH/profit can likewise lower sales.

**Why P1:** malformed/manual/imported state can materially understate estimates, quotes, or invoices with no fail-closed boundary.

**Required correction:** central strict money/count/hour/rate parsers with explicit domain rules; clamp is not sufficient for imported state because silent coercion hides bad data. Reject or mark calculation incomplete. Enforce `OH >= 0` and `0 <= profit < 1` in engine code. If negative Change Orders are intentionally supported as credits, preserve that as an explicitly separate signed-money domain.

---

## P2-01 — Ambient correction accepts temperatures below the declared supported table range

`tempFactor()` rejects ambient values above the final table bound, but a value below the first row (10°C) simply selects the 10°C factor. The source comment states a supported table range beginning at 10°C.

This is conservative in the usual cold-ambient direction, so no under-ampacity case was demonstrated, but it is still an unsupported-input semantic mismatch.

**Correction:** reject `<10°C` unless a deliberate documented clamp policy is adopted.

---

## P2-02 — Rounding policy is technically consistent in most paths but not centrally specified

The candidate mixes:
- 2-decimal display/result rounding for many electrical values;
- whole-dollar base quote rounding;
- raw floating-point accumulation in cost buckets;
- per-scope ceiling in wire takeoff before aggregation.

No material arithmetic error was demonstrated from the current policy, but professional estimating behavior should document which layer owns rounding so future refactors do not introduce penny/foot drift.

---

# Reference-table / boundary review

## Passed representative checks
- Table 310.16 Cu/Al supported rows are internally monotonic and align with the project’s expected test matrix.
- CCC thresholds 1–3, 4–6, 7–9, 10–20, 21–30, 31–40, 41+ are implemented with correct inclusive boundaries.
- Raceway fill uses 53% for one conductor, 31% for two, 40% for more than two.
- 240.6 additional fuse ratings `1, 3, 6, 601` are intentional 2026 values; `601` is not a typo.
- Transformer 3φ uses √3 denominator correctly.
- EVSE 125%, motor conductor/SCGF/overload percentage arithmetic is internally consistent with the supported model.
- 2026 Residential service/feeder floor-area load density of 2 VA/ft² is correct; the defect is the missing separate 3 VA/ft² branch-circuit minimum.

## Boundary gaps requiring new tests
- ampacity blank `loadAmps`;
- ampacity explicit zero/falsy insulation/terminal rating;
- ambient below 10°C;
- voltage-drop blank current/distance;
- PF < 1 threshold regression;
- Residential §120.13 floor-area branch-circuit minimum at exact and just-over circuit boundaries;
- negative Job material/equipment/labor/T&M values;
- OH negative, profit negative, profit=.99, profit=1, profit>1;
- imported malformed numeric strings and Infinity/NaN equivalents where JSON/state manipulation can create them before normalization.

---

# Existing test-suite blind spots

The exact candidate had green CI (593/593), but those tests do not disprove these findings:

1. Electrical calculator tests intentionally expect the existing PF-scaled 3φ voltage-drop value.
2. Ampacity tests exercise invalid material/CCC but not blank required load semantics or falsy rating defaults.
3. Residential Live tests validate receptacle grouping behavior (for example 5 devices→1 circuit, 6→2) but do not assert the independent 2026 §120.13 floor-area branch-circuit minimum.
4. Pricing/workflow tests validate persistence and quote boundaries but do not adversarially inject negative quantities/rates/hours or invalid Summary profit domains into the core arithmetic.

---

# Severity / verdict

- **P0:** none found.
- **P1-01:** required electrical-input coercion can create unsupported PASS.
- **P1-02:** PF multiplier understates K-method voltage drop.
- **P1-03:** missing 2026 NEC §120.13 branch-circuit minimum can undercount dwelling circuits/panel spaces.
- **P1-04:** estimating/T&M/Method-A numeric domains fail open and can understate price/invoice totals.
- **P2-01:** low ambient outside supported table range is silently clamped to 10°C row.
- **P2-02:** rounding ownership needs an explicit contract.

## VERDICT

**C — REJECT / REWORK REQUIRED**

Do not merge the audited production candidate based on this math audit. Create a corrective master on the development branch, fix P1s sequentially with deterministic adversarial regressions, run exact-head CI, then perform a new independent math re-audit on the frozen corrected SHA.

# Bruno Electric — Workflow Overhaul Master Plan

**Branch:** `dev/custom-special-order-materials`  
**Execution mode:** STRICT SEQUENTIAL  
**Audit mode:** ONE INDEPENDENT FULL AUDIT AFTER ALL STAGES  
**Current stage:** `STAGE_1_NAVIGATION`  
**Overall state:** `IN_PROGRESS`

## NON-NEGOTIABLE EXECUTION RULES

1. Work on exactly one `CURRENT_STAGE` at a time.
2. DO NOT start the next stage until every acceptance criterion and required regression for the current stage is GREEN.
3. After finishing each stage, RE-READ THIS FILE from the repository before changing any code for the next stage.
4. Update this file after each completed stage with:
   - status = `DONE`;
   - implementation SHA(s);
   - tests/evidence;
   - discovered follow-up risks;
   - next `Current stage`.
5. If a stage fails CI or an acceptance criterion, remain on that stage until corrected.
6. Do not silently weaken an acceptance criterion to advance.
7. Do not merge PR #14 during this plan.
8. Do not create an independent audit task after intermediate stages. The independent audit is created only after `STAGE_8_FINAL_INTEGRATION_GATE` is GREEN.
9. Preserve existing accepted safety contracts:
   - blank `Your Cost` != explicit `0`;
   - unresolved cost never enters numeric project material-cost math;
   - historical Job Materials are immutable snapshots;
   - Residential/Commercial isolation remains intact;
   - historical helper-tax semantics remain intact;
   - exact-head CI must test the real PR head SHA.
10. Any navigation, storage, import/export, archive, quote, or invoice change must be tested for phone/tablet/desktop and reload persistence where applicable.

---

## STAGE 1 — NAVIGATION / DEEP-LINK CORRECTNESS

**Status:** `IN_PROGRESS`

### Problem
From Electrical Calculator on mobile, tapping `Job` can land on the main workspace/home state first instead of opening the Job/Quote destination directly.

### Required implementation
- Make Calculator → Job a deterministic deep-link to the intended Job subpage (`Customer Price / Quote`).
- Preserve direct navigation for Journal, Catalog and More.
- Main workspace must restore `#be=<GROUP>&tab=<TAB>` before presenting the default group.
- Browser refresh/deep link must restore the same destination.
- Back/forward navigation must not require a second tap.

### Acceptance criteria
- Calculator → Job opens Job / Customer Price / Quote in one user action.
- No intermediate home/default workspace state is visible as the settled result.
- Direct URL refresh restores the requested group/tab.
- Journal/Catalog/More routes continue to work.
- Phone/tablet/desktop canonical navigation still uses the same information architecture.

### Required regressions
- canonical navigation model test;
- deep-link parser/restoration test;
- Calculator → Job route test;
- refresh/deep-link restore test;
- existing responsive navigation regressions.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---

## STAGE 2 — RESIDENTIAL WIRE / CABLE TAKEOFF

**Status:** `PENDING`

### Problem
Residential Live already computes cable footage internally, but the result is not presented as a useful electrician-facing wire takeoff. User cannot easily answer “how much 12/2, 14/2, etc. should I buy?”

### Required implementation
- Add a visible `Wire / Cable Takeoff` block to Residential Live.
- Show per-cable-type footage and total footage.
- Show routing-model basis separately from NEC requirements.
- Add editable waste/allowance percentage (default must be explicit and documented).
- Add `Quick Budget Estimate by ft²` as an OPTIONAL estimating mode only, never labeled NEC/code minimum.
- Quick mode must expose the coefficient and resulting footage, and must not silently overwrite Detailed Live Routing quantities.
- Detailed mode remains based on circuits/devices/lights/switches/special-area routing.
- Saved calculation snapshots must preserve the selected estimating inputs/basis needed to reproduce the displayed quantity model.

### Acceptance criteria
- User can see total cable footage without reading BOM rows.
- User can see cable type split.
- Quick estimate is clearly labeled as estimating/budget only.
- Detailed routing and quick estimate are not conflated.
- No code minimum is fabricated from square footage.

### Required regressions
- detailed routing math;
- waste percentage application;
- quick ft² estimate math;
- mode separation;
- archive snapshot reproduction;
- invalid/negative coefficient/waste fail-closed.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---

## STAGE 3 — SAVE CALCULATION / ARCHIVE UX

**Status:** `PENDING`

### Problem
Archive engine exists, but Save/Archive behavior is not obvious enough and users can reach the bottom of the calculator believing calculations cannot be saved.

### Required implementation
- Make `Save Calculation` a prominent explicit action in Residential Live.
- Distinguish:
  1. live unsaved calculation;
  2. saved calculation/archive record;
  3. calculation applied to Job.
- Archive list must show name, saved timestamp, area, principal takeoff totals and live-pricing status.
- Preserve Load/Duplicate/Delete semantics.
- Add visible saved/unsaved state indicator.
- Save action must be idempotent/intentional: no accidental duplicate archive rows from ordinary input changes.

### Acceptance criteria
- A first-time user can find Save without scrolling through ambiguous output.
- Reload retains archived calculations.
- Editing live inputs does not mutate an archived calculation.
- Duplicate creates a new editable calculation identity.
- Delete affects only intended archive item.

### Required regressions
- save/reload;
- duplicate identity;
- delete isolation;
- archive immutability;
- active calculation restore;
- no autosave duplication.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---

## STAGE 4 — APPLY CALCULATION TO JOB / PROVENANCE

**Status:** `PENDING`

### Problem
Calculator and Job totals are conceptually disconnected. Users cannot clearly tell whether the Job reflects the current Residential calculation.

### Required implementation
- Introduce explicit `Apply to Job` transaction after a calculation is saved/confirmed.
- Job must store provenance for the applied calculation:
  - calculation/archive ID;
  - calculation name;
  - applied timestamp;
  - source type/version.
- Applying must update generated Job Materials using the existing strict BOM/cost semantics.
- Existing manual/other-source Job Materials must remain preserved.
- Re-applying same calculation replaces only rows generated by that source/calculation, not manual history.
- Job UI must display the currently applied calculation.
- Calculator changes after Apply must NOT silently mutate Job; user must explicitly `Update Job from calculation` / Apply again.

### Acceptance criteria
- User can answer which calculation produced the current Job material state.
- Job totals update only on explicit Apply/Update.
- Unresolved Your Cost stays excluded from numeric cost totals.
- Manual/other-source materials survive Apply and re-Apply.
- Historical archived calculation remains immutable.

### Required regressions
- Apply saved calculation;
- same-source re-apply;
- manual/other-source preservation;
- unresolved/zero/positive Your Cost;
- provenance persistence/reload;
- calculator edit after Apply does not auto-mutate Job.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---

## STAGE 5 — JOB TOTALS / QUOTE PRICE CLARITY

**Status:** `PENDING`

### Problem
Top Job metrics (`Material`, `Labor`, `Equip`, `Job Cost`, `Sales (Exact)`, `Quote Total`) are not self-explanatory and can appear to come from the calculator when they may represent other persisted Job state.

### Required implementation
- Clarify metric labels and calculation provenance.
- Separate contractor cost from customer selling price.
- Display whether material totals are complete or contain unresolved-cost exclusions.
- Show applied calculation reference near summary metrics when applicable.
- Remove/rename ambiguous duplicate concepts such as `Sales (Exact)` vs `Quote Total` unless their difference is explicitly defined in UI.
- Ensure top metrics and detailed Summary use the same authoritative calculation path.

### Acceptance criteria
- Every top metric has one unambiguous business meaning.
- User can distinguish cost, recommended/customer price, approved quote and change orders.
- Unresolved material cost prevents a misleading “complete cost” presentation.
- Summary and header cannot disagree for the same state.

### Required regressions
- metric formulas;
- unresolved disclosure;
- approved CO handling;
- Summary/header parity;
- applied-calculation provenance display.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---

## STAGE 6 — QUOTE APPROVAL / MANUAL CUSTOMER-PRICE OVERRIDE / INVOICE BOUNDARY

**Status:** `PENDING`

### Problem
User needs a clear step before Invoice where calculated selling price can be reviewed/overridden intentionally instead of silently editing unrelated totals.

### Required implementation
Create an explicit commercial flow:
`Estimated Job Cost → Recommended Customer Price → Manual Quote Adjustment (optional) → Approved Quote → Invoice`.

- Add manual customer-price override with:
  - explicit enable/action;
  - override amount;
  - reason/note;
  - delta $ and % from recommended price;
  - timestamp.
- Approved Quote must be a persisted boundary.
- Invoice must derive from approved/final quote semantics, not from an unrelated live calculator value.
- Approved Change Orders remain additive according to existing business rules and must not be double-counted.
- Editing calculator after approval must not silently rewrite an approved quote/invoice basis.

### Acceptance criteria
- User can intentionally change customer-facing price before invoice.
- System retains original recommended price and shows difference.
- Approved quote survives reload/export/import.
- Invoice basis is traceable.
- No silent calculator-driven mutation after approval.

### Required regressions
- override/no override;
- delta math;
- approve/reload;
- CO interaction;
- invoice basis;
- calculator changes after approval;
- export/import persistence.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---

## STAGE 7 — CATALOG / JOB MATERIALS UX CLARITY + CUSTOM MATERIAL COMPLETION

**Status:** `PENDING`

### Problem
Catalog status such as `7/79` and green checks is ambiguous. Catalog, Job Materials and Custom/Special-order workflows are not clearly differentiated.

### Required implementation
- Replace ambiguous category badge `used/total` formatting with explicit labels (for example `Used 7 · Catalog 79`).
- Make green state explicitly mean “Used on this Job”, not selection checkbox.
- Clearly separate:
  - Materials Catalog (available definitions/pricing);
  - Job Materials (actual current-job lines);
  - Custom / Special-order material creation/editing.
- Ensure Custom/Special-order creation is discoverable at top of Catalog.
- Complete strict Custom Add semantics from PR #14:
  - ordinary Catalog `+` routes Custom rows through strict custom add path;
  - blank/zero/positive Your Cost preserved;
  - persisted Qty and row override preserved;
  - no cross-job/global registry authority;
  - import/export isolation preserved;
  - historical Job Material snapshots immutable.

### Acceptance criteria
- User can immediately understand badge/check meaning.
- User can find Add Custom Material without documentation.
- Catalog and Job Materials roles are distinct.
- All current PR #14 safety semantics remain intact.

### Required regressions
- category badge counts;
- used-on-job marker;
- custom create/edit/delete/add;
- ordinary Catalog `+` strict routing;
- job/import isolation;
- malformed legacy registry harmlessness;
- blank/zero/positive Your Cost;
- Qty persistence and override.

### Completion evidence
- Implementation SHA: `PENDING`
- CI/test evidence: `PENDING`

---

## STAGE 8 — FINAL INTEGRATION GATE / PWA / EXPORT-IMPORT / EXACT-HEAD CI

**Status:** `PENDING`

### Required implementation and verification
- Full deterministic regression suite.
- Add end-to-end integration tests covering:
  `Residential Calculate → Save → Apply to Job → Catalog/Job Materials → Quote → Approve → Invoice → reload → export/import`.
- Verify job isolation across import/switch/blank/reset flows.
- Verify archive isolation.
- Verify Commercial/Residential isolation.
- Verify helper-tax historical semantics.
- Verify phone/tablet/desktop navigation and key workflow surfaces.
- Bump PWA cache only once final client code settles for this release candidate.
- Verify stale owned caches are removed and unrelated caches preserved.
- Ensure offline core shell contains all new runtime modules.
- Exact-head CI must checkout and assert the exact final PR head SHA.
- Freeze final candidate SHA after green CI; no production/test/docs commit on PR head after the pinned audit candidate.

### Acceptance criteria
- All deterministic tests GREEN.
- End-to-end workflow tests GREEN.
- Exact-head CI provenance GREEN.
- PR open/unmerged.
- Final candidate SHA frozen.
- Developer implementation report complete.
- Only now create independent full-audit branch/TASK_CURRENT/PROTOCOL.

### Completion evidence
- Final candidate SHA: `PENDING`
- CI run: `PENDING`
- Test count: `PENDING`
- Audit task: `PENDING`

---

# FINAL AUDIT SCOPE

The final independent audit MUST re-check the entire integrated workflow, not merely the last stage:

1. Calculator navigation/deep links.
2. Residential wire/cable takeoff and quick estimate labeling/math.
3. Save/archive UX and persistence.
4. Apply-to-Job transaction/provenance.
5. Job top totals and unresolved-cost disclosure.
6. Quote override/approval/invoice boundary.
7. Catalog/Job Materials clarity and Custom materials semantics.
8. Import/export/job isolation.
9. Residential/Commercial isolation.
10. Journal historical helper-tax behavior.
11. Responsive phone/tablet/desktop.
12. PWA/offline/cache migration.
13. Exact-head CI provenance.
14. Shared regressions and data-integrity paths.

**Audit verdict rules:**
- `A ACCEPT` — no P0/P1.
- `B ACCEPT AFTER MINOR FIXES` — no P0/P1.
- `C REJECT / REWORK REQUIRED` — one or more P0/P1.

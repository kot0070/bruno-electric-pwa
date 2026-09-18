# Stage 9 — Field Usability, Estimating Accuracy, Labor Units, and Documents

Status: ACTIVE
Authoritative branch: `main`

## User-reported acceptance targets

1. **Motor Circuit input usability**
   - Keep NEC Article 430 table-FLC workflow authoritative for branch conductor and SC/GF sizing.
   - Add a field helper that accepts **horsepower or watts** and estimates current from entered voltage, phase, power factor, and efficiency.
   - Never silently substitute the estimated current for required Article 430 table FLC. The user can use the estimate/nameplate helper while table FLC remains explicit.

2. **Conduit Fill coverage**
   - UI must expose every raceway type and trade size actually supported by verified reference data.
   - UI conductor-size choices must expose the full verified THHN/THWN-2 area table already in the runtime.
   - Expand beyond EMT/PVC40 only after raceway areas are provenance-verified for the adopted NEC edition. Do not invent values.

3. **Voltage Drop verdict clarity**
   - Result must prominently show `PASS` when calculated drop is at or below the entered design target and `REVIEW` when above target.
   - Show actual drop %, design target %, and voltage at load together. Do not hide the verdict inside the calculation-path table.

4. **Catalog labor units / install cost**
   - Add labor-unit fields to catalog items: source, unit basis, normal/difficult/very-difficult or company-experience unit, selected labor condition, labor hours, labor rate, labor cost.
   - NECA MLU is a licensed/copyrighted estimating reference. Do not bulk-copy the commercial manual into the repository without a user-provided/licensed dataset.
   - Support manual entry/import of user-owned NECA/company labor units, with provenance recorded per item.
   - Labor cost = selected labor hours per unit × quantity × labor rate; material and labor remain separate costs.

5. **Customer PDF / invoice**
   - Browser preview is not the PDF source of truth.
   - Produce a document-oriented PDF path with Letter-page geometry, real text, margins, selectable/searchable content, and stable pagination.
   - Preview may resemble the PDF but should not be implemented as a screenshot-like print of the mobile modal.

6. **Journal helper correctness**
   - Active helper must contribute to the selected Day/Week/Month/Year/Custom period according to its effective revision, workdays, pay mode, rate, and hours.
   - Business Net must subtract helper gross exactly once.
   - Add phone browser regression for create helper → current date → metric → reload → period changes.

7. **Runtime generation / old version elimination**
   - Production must never flash or fall back to retired UI/runtime generations.
   - One visible version source; one bootstrap generation; no legacy executable owner for the same capability.
   - Any old implementation kept for history belongs in Git history or a non-loaded archive, never production root/module lists.
   - Browser test must hold one version through boot, 2-second idle, navigation, reload, calculator open, Journal open, and invoice open.

## Execution order

### Stage 9A — Field calculator UX
Motor HP/W helper, conduit UI coverage from verified runtime data, voltage-drop PASS/REVIEW visibility.

### Stage 9B — Journal/runtime regression
Reproduce helper defect in phone Playwright, fix root cause, verify runtime generation stability and no old-version flash.

### Stage 9C — Labor-unit estimating model
Catalog schema + labor-rate settings + manual/imported labor units + Job/estimate labor rollups. NECA data only from licensed/user-owned source or limited official sample data used for validation.

### Stage 9D — True document PDF
Separate document renderer/data model from mobile preview. Validate Letter margins, text selectability/searchability, one-page simple invoice, multi-page long invoice, and iPad/Android output.

### Stage 9E — Raceway expansion
Add additional metal/nonmetallic raceway tables only after provenance verification, then engine tests and UI exposure.

## Release gates

- Exact-SHA CI provenance.
- Phone Playwright human journey required before declaring a stage fixed.
- No hidden hard-coded 8.25%, old version literals, retired PDF writers, or duplicate runtime owners.
- Every build submitted for user testing increments the visible version.

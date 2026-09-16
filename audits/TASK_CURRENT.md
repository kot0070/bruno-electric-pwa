# Bruno Electric — Electrical Math v52 Re-Audit

AUDIT MODE: AUDIT ONLY
AUDITED_HEAD_SHA: `7da0d0ef02858bf891e8f327e02312f7a80f6751`
SOURCE_AUDIT_SHA: `852bf3c88a4f0fc75584b24aa8e68f277e16342e`
REPORT_PATH: `audits/reports/ELECTRICAL_MATH_V52_7da0d0e.md`

Read `audits/PROTOCOL.md` first.

## Reproduce original P1 families independently

### P1-A — blank/falsy calculator coercion
Verify required electrical inputs reject blank/missing/malformed values and that explicit invalid `0` ratings are not silently replaced by defaults. Check ampacity, voltage drop and supported temperature-correction boundaries.

### P1-B — voltage-drop physics
Verify the resistance-only K-method no longer multiplies by power factor. A lower PF must not reduce the computed K-only voltage drop or turn a REVIEW into PASS. Verify formula/result labeling is explicit.

### P1-C — Residential §120.13 branch-circuit floor
Verify dwelling general branch-circuit count includes the NEC 2026 §120.13 `3 VA/ft²` floor and is not driven only by receptacle grouping. Verify the final modeled count is `max(code floor, design grouping)`. Test threshold examples around 1000 and 2000 ft² for 15 A and 20 A circuits. Verify service/load-calculation floor-area math remains separate.

### P1-D — pricing/T&M invalid numeric domains
Verify negative or malformed persisted/imported values cannot silently lower live Job/Quote/T&M totals. Check materials, equipment, tools, subcontractor, labor, T&M and Method A OH/profit domains. Negative Change Orders remain valid signed credits. Verify live Quote approval and live T&M/Quote outputs are blocked fail-closed. Verify immutable previously approved fixed-price invoice snapshot remains historical/readable and is not recomputed from later malformed live state.

## Shared regression scope
- Table 310.16 and temperature correction boundaries.
- CCC adjustment boundaries.
- conduit fill / box fill / transformer current unaffected.
- Residential BOM, breakers, cable and grouping behavior.
- Quote lifecycle and fixed-price invoice snapshot boundary.
- PWA `v52` core shell and stale cache deletion.
- bootstrap dependency order `Pricing Domain Guard → Quote Lifecycle → Fixed-Price Invoice`.
- exact-head GitHub Actions provenance.

## CI provenance target
Expected exact-head workflow after documentation-inclusive freeze: run #345, exact audited SHA `7da0d0ef02858bf891e8f327e02312f7a80f6751`.

## Acceptance
A ACCEPT only if no P0/P1 remains and exact-head tests are GREEN.

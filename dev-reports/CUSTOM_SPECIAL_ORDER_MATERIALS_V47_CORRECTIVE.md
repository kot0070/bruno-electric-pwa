# Bruno Electric — Custom / Special-order Materials v47 Corrective

## Candidate scope
This corrective expands PR #14 beyond the original Qty blocker so the Custom / Special-order workflow is release-ready as one coherent block.

## Changes
- Persist normalized `qty` on every custom Catalog row.
- `Add to Job` defaults to the selected Catalog row's persisted quantity after reload.
- Add row-specific quantity override for one-time Job insertion without mutating saved Catalog quantity.
- Add full edit workflow for existing custom Catalog rows: Description, SKU/Part, Vendor, Unit, Customer Price, Your Cost, Qty.
- Preserve custom row ID and `createdAt` across edits; update `updatedAt`.
- Existing Job Materials history is not rewritten by later Catalog edits or Catalog deletion.
- Preserve strict cost-state contract:
  - blank Your Cost => unresolved -> `materialsUnresolved[]`, `unitCost:null`;
  - explicit 0 => resolved zero -> `materialsUsed[]`;
  - positive cost => resolved -> `materialsUsed[]`.
- Add traceability snapshots on Job insertion (`catalogMatchId`, `catalogQty`, `customerUnitPrice`, vendor, addedAt).
- Responsive Custom Materials UI: desktop multi-column, tablet two-column, phone single-column; row actions wrap correctly.
- PWA cache advanced to `bruno-electric-v47` with custom module in core shell.
- Expanded deterministic tests for persisted Qty, Save/reload/Add-existing, repeated Add, row-specific override, edit persistence, history preservation, blank/zero/positive semantics, and validation.

## Previous independent audit blocker
Audited HEAD `15dacdde3ddbc7895e78c1b057bcc4149d0863d1` was rejected because Qty was validated but not persisted, and Add-existing used the unrelated top-form Qty/default 1 after reload.

## Release policy
Do not merge PR #14 before independent audit acceptance of the new exact candidate HEAD.

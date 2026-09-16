# Bruno Electric Independent Audit Protocol

Mode: AUDIT ONLY.

Auditor must independently inspect the pinned audited production candidate and may write only the designated audit report on this audit branch.

Prohibited:
- production code changes;
- writes to main or dev branches;
- PR creation/edit/comment/merge;
- changing release state.

Required:
- independently trace real runtime/data paths;
- verify exact audited SHA and exact-head CI provenance;
- verify persistence/import/job isolation;
- verify Custom blank/zero/positive Your Cost semantics and Job Materials routing;
- verify ordinary Catalog Add cannot bypass strict Custom routing;
- verify PWA/offline/cache behavior;
- repeat shared regression checks relevant to Commercial/Residential, Journal, Pricing & Margins, Residential Live, BOM, Job Materials, navigation and persistence.

Verdict policy:
- A — ACCEPT: no P0/P1 blockers.
- B — ACCEPT AFTER MINOR FIXES: no P0/P1 blockers.
- C — REJECT / REWORK REQUIRED: one or more P0/P1 blockers.

Chat return only:
VERDICT
AUDITED HEAD SHA
BLOCKERS
REPORT LINK

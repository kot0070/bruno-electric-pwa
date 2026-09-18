# Stage 8 Runtime Architecture Cleanup

STATUS: IMPLEMENTED_PENDING_EXACT_HEAD_CI_AND_BROWSER_REAUDIT
TARGET_BUILD: v1.15

## Trigger
Repeated real-device reports showed visible build regression (`v1.13` flashing then returning to `v1.11`), intermittent legacy UI, and duplicate invoice behavior. This is an architecture defect, not a user refresh issue.

## Root causes confirmed
1. `index.html` retained multiple hard-coded legacy version strings (`v1.11`) while `sw-register.js` advanced independently.
2. `electric-compact-header.js` dynamically loaded `electric-customer-invoice-patch.js` even though the deterministic bootstrap explicitly declared legacy invoice patch modules retired.
3. `electric-customer-invoice-patch.js` contained a complete second invoice owner, old tax fallbacks, DOM MutationObserver rewrites, and its own PDF generator.
4. `electric-journal-customer-metrics.js` retained a second Journal metrics/settings writer with obsolete reserve semantics.
5. The result was split ownership: current documents/authority runtime could be overwritten after initial render by dynamically resurrected legacy modules.

## Corrective architecture
- `sw-register.js` is the sole runtime bootstrap and build-generation owner.
- `electric-app-version.js` is the sole runtime-visible version authority.
- `electric-customer-documents.js` is the customer document renderer.
- `electric-runtime-authority-v1.js` is the temporary compatibility authority while direct ownership is consolidated.
- `electric-dispatch-journal-v2.js` owns Journal base UI/data.
- obsolete `electric-customer-invoice-patch.js` and `electric-journal-customer-metrics.js` are deleted.
- `electric-compact-header.js` may not dynamically load business-domain patches.

## Stage 8 invariants added
- one deployed build must expose one visible version for the entire session; no version regression after DOM mutations;
- no runtime script outside `sw-register.js` may dynamically resurrect retired business-domain modules;
- customer invoice has one renderer/output path;
- Journal settings/metrics have one active writer chain;
- retired duplicate owners are physically absent, not merely omitted from the primary bootstrap;
- phone/tablet/desktop reload tests must assert the visible version remains stable after at least 1 second and after opening Journal + invoice preview.

## Remaining architectural debt
The monolithic legacy shell/runtime still exists inside `index.html`. Stage 8 must classify and remove unreachable/duplicate business behavior from that monolith incrementally, preserving only the base shell and still-required core functions. This cleanup is now an explicit active Stage 8 task rather than deferred implicit debt.

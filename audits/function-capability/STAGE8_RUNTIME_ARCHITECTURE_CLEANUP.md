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

## Production runtime hygiene policy
`main` is a production tree, not a museum of executable development history.

Binding rules:
- replaced runtime/UI files are deleted from the production root once the replacement is proven;
- obsolete patch modules, alternate renderers, old loaders and one-shot mutation workflows are not retained as executable production files;
- Git history is the primary backup for prior implementations;
- if a human-readable snapshot is ever required, it belongs under a non-runtime archive/documentation location and must never be referenced by HTML, bootstrap, service worker, dynamic loader or production tests as an executable dependency;
- a new implementation may not coexist with an older implementation that owns the same user-facing capability;
- every replacement requires repository search for the retired filename, handler, selector, storage writer and version literal;
- production CI must fail if a retired runtime owner reappears;
- visible app version, bootstrap build version and test expectation must advance together;
- completed one-shot workflows are removed after they have applied their change.

The repository currently uses Git history for the deleted duplicate invoice/Journal modules rather than copying them into another active directory.

## Stage 8 invariants added
- one deployed build must expose one visible version for the entire session; no version regression after DOM mutations;
- no runtime script outside `sw-register.js` may dynamically resurrect retired business-domain modules;
- customer invoice has one renderer/output path;
- Journal settings/metrics have one active writer chain;
- retired duplicate owners are physically absent, not merely omitted from the primary bootstrap;
- phone/tablet/desktop reload tests must assert the visible version remains stable after at least 1 second and after opening Journal + invoice preview;
- `.github/workflows` contains only durable CI/automation, not completed one-shot repair scripts;
- production root must not contain superseded runtime copies for the same capability.

## Cleanup completed in this corrective pass
- deleted `electric-customer-invoice-patch.js`;
- deleted `electric-journal-customer-metrics.js`;
- removed the hidden `loadInvoicePatch()` path from `electric-compact-header.js`;
- established `electric-app-version.js` + `sw-register.js` build `v1.15` as current generation authorities;
- added `tests/e2e/runtime-generation-stability.spec.js`;
- rewrote deterministic customer-document architecture tests to assert retired owners are physically absent;
- removed obsolete one-shot workflows for invoice v1.12, invoice v1.13, sales-tax cleanup, Stage 5 pre-audit sync, v1.14 version repair and the completed Stage 8 cleanup workflow.

## Remaining architectural debt
The monolithic legacy shell/runtime still exists inside `index.html`. Stage 8 must classify and remove unreachable/duplicate business behavior from that monolith incrementally, preserving only the base shell and still-required core functions. This cleanup is now an explicit active Stage 8 task rather than deferred implicit debt.

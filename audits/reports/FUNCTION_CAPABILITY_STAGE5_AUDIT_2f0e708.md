# Bruno Electric — Function Capability Stage 5 Independent Audit

AUDIT_ROLE: INDEPENDENT_AUDITOR
STAGE: 5 — Negative / Fault Injection
AUDITED_PRODUCTION_SHA: `2f0e7083353008a6bee4d0e294b404f71106331a`
AUDIT_BRANCH: `audit/function-capability-stage5-2f0e708`
DATE: 2026-09-17
VERDICT: `A_ACCEPT`
OPEN_P0: `0`
OPEN_P1: `0`

## Independence boundary
This branch was created directly from the exact synchronized production SHA after its exact-head deterministic and Chromium gates completed successfully. The audit report does not modify production behavior, weaken expectations, or alter the tested implementation. Production fixes, if any blocker had been found, would have been required on `main` followed by a new exact-head gate and re-audit.

## Exact-SHA gate verified
Electrical Calculator Tests #709 / run id `35283187090` tested exact SHA `2f0e7083353008a6bee4d0e294b404f71106331a`.

Provenance from the job log:
- `TESTED_HEAD_SHA=2f0e7083353008a6bee4d0e294b404f71106331a`
- `EXPECTED_HEAD_SHA=2f0e7083353008a6bee4d0e294b404f71106331a`

Results:
- deterministic: `818/818 passed`;
- Playwright Chromium matrix: `168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed`;
- desktop / phone / tablet projects all participated according to their declared viewport contracts;
- failure artifact upload was skipped because there were no failures.

## Audit scope
The audit checked the authoritative Stage 5 contract against the synchronized fault matrix, current implementation evidence and executable browser evidence. The required question was not whether source files existed, but whether malformed, stale, partial, unsupported, cancelled or fault-injected operations fail closed or preserve current valid state, and whether recent customer-document/UI hardening retained those invariants.

### Import / restore integrity
Verified executable evidence covers:
- malformed full-app JSON rejection with current state preserved;
- wrong app-vs-Job backup type rejection;
- incomplete full-app backup rejection;
- validation of optional backup sub-blocks before mutation;
- transactional rollback on injected local-storage write failure;
- cancelled valid restore as a no-op;
- oversized backup rejection before mutation;
- malformed single-Job JSON preservation;
- repeated valid restore idempotency.

The original destructive-risk gap discovered during Stage 5 is closed by the transactional restore corrective. No evidence in the exact-head run indicates regression.

### Electrical / calculation fail-closed behavior
Verified retained evidence covers:
- invalid/blank calculator inputs and visible recovery through correction/recalculation;
- impossible or unsupported raceway/configuration states returning explicit unsupported/review behavior rather than invented success;
- HVAC OCPD above MOCP fail-closed behavior;
- grounding assertions remaining REVIEW when required facts are not asserted;
- stale/missing task identifiers;
- failed Electrical Task Update rollback;
- repeated task/BOM application idempotency and source isolation;
- cross-Job/stale-revision rejection.

### Service worker / PWA fault behavior
Verified deterministic/browser evidence covers:
- optional cache asset failure not aborting the core-shell install;
- core-shell cache failure rejecting incomplete installation;
- stale Bruno-owned cache cleanup without deleting unrelated caches;
- offline shell regression journey remaining green.

### Call Service / customer-document regressions
The exact-head gate includes the later human-workflow hardening rather than relying only on the earlier Stage 5 implementation SHA. Verified evidence covers:
- localized comma-decimal helper metrics remain numeric-state driven and do not amplify after observer cycles/edit/reload;
- included materials do not inflate customer Amount Due;
- itemized included materials persist;
- scheduled calls remain non-earned;
- commercial repair tax remains explicit/editable;
- missing required company identity remains visible and blocks final customer PDF;
- full service-call preview -> edit -> reload -> PDF path;
- fixed/hourly pricing switch through rendered UI.

### Preview-before-output and UI stability
Verified browser evidence covers:
- Calculation PDF action opens preview without an immediate download;
- explicit preview download uses the visible calculation result and Job context;
- approved fixed-price invoice exposes preview before print and does not rewrite approved amount;
- reload does not present the legacy wide header/action set as a visible animation frame;
- letterhead and visible disabled/readonly controls remain dark/readable at supported viewport profiles.

## Invariant review
No Stage 5 evidence contradicts the binding master invariants:
- BLANK != ZERO / UNKNOWN != ZERO;
- Your Cost != Customer Price;
- Save != Apply;
- live calculation != Approved Quote;
- Residential != Commercial;
- Job A does not contaminate Job B;
- unsupported configurations fail closed;
- historical/approved snapshots are not silently rewritten.

## Findings
### P0
None.

### P1
None.

### P2 / carried architecture observations
The previously documented non-blocking Stage 2 architectural/documentation carry items remain outside this Stage 5 acceptance boundary. They do not invalidate the tested fault contracts and remain candidates for the later corrective/final-certification stages. This audit does not silently close them.

## Audit conclusion
Stage 5 satisfies its acceptance gate at exact synchronized production SHA `2f0e7083353008a6bee4d0e294b404f71106331a`. Negative/fault-injection behavior, transactional preservation, unsupported fail-closed behavior, PWA fault handling, preview-before-output boundaries and recent UI stability regressions all have current executable evidence in the same exact-SHA gate.

**VERDICT: `A_ACCEPT` — P0=0, P1=0. Stage 6 may be unlocked only by the authoritative `main` state/master transition recording this audit.**

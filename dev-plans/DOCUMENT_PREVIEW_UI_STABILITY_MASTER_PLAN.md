# Bruno Electric — Document Preview & UI Stability Master Plan

STATUS: IMPLEMENTATION_COMPLETE
OWNER: Autonomous implementation on `main`
DATE: 2026-09-17

## Mission
Make every customer-facing document action understandable before it performs a destructive/irreversible action such as print/download, eliminate stale/legacy UI flashes during reload, and remove native white-control regressions from the dark theme. The implementation must be exercised like a real electrician/customer workflow through rendered UI, not accepted from source inspection alone.

## Non-negotiable UX contracts
1. **Preview before output** — customer-facing PDF/print/download actions first show the exact document form/content that will be sent or printed. No opaque `PDF invoice` action with no visual context.
2. **Edit -> preview -> output loop** — the user can see a wrong company/customer/address/description/price, edit the source, reopen preview, and only then download/print.
3. **Truthful source of totals** — service-call materials marked included never get added twice; residential/commercial tax treatment remains explicit; fixed/hourly pricing is shown in the preview exactly as billed.
4. **Company identity visible** — invoice previews show company/letterhead identity, TECL license and contact fields. Missing required company identity blocks final customer PDF and explains what must be completed.
5. **No stale-layout flash** — reload/cold launch must never show the legacy wide header/actions for a visible frame before the compact/current UI replaces it. A neutral dark prepaint state is acceptable; legacy layout flash is not.
6. **No white native controls in dark UI** — select/input/textarea normal, disabled and readonly states must remain dark/readable on Android Chrome, tablet and desktop.
7. **Preview consistency** — preview totals/content and generated PDF/print content are produced from the same model and current persisted state.
8. **Real-browser proof** — desktop 1440, phone 390 and tablet 820 browser journeys are required for materially user-facing preview/style/reload behavior.

## Scope
### A. Call Journal / Service Invoice
- Replace ambiguous `Mini invoice` + direct `PDF invoice` UX with a clear `Preview invoice` entry point.
- Build a customer-facing visual invoice preview modal/sheet that resembles the actual outgoing invoice.
- Preview contains company identity, invoice metadata, customer/service address, work description, pricing method, hours/rate where applicable, included materials reference/itemization, tools/consumables, subtotal, sales tax and Amount Due.
- Preview actions: `Edit call`, `Company / invoice settings`, `Download PDF`, `Print`, `Close`.
- `Download PDF` re-reads the current saved call and current invoice settings before output.
- Missing required company fields are shown in preview and block final PDF rather than allowing a misleading document.

### B. Calculator Report
- Replace direct download ambiguity with `Calculation PDF` -> preview.
- Preview shows company identity, calculator name, current visible inputs, calculation result/path, job/customer, jurisdiction and code edition.
- Actions: `Download PDF`, `Close`; no download until explicit action inside preview.
- Result and PDF payload share the same captured calculation model.

### C. Existing Quote / Fixed Invoice / T&M document actions
- Preserve existing in-page Quote Sheet as the quote preview source.
- Route customer print actions through a clear preview/print affordance where practical.
- Fixed-price invoice must expose its rendered invoice document before `window.print()`.
- T&M action labels must remain explicit and distinct from approved fixed-price invoice.
- Export/import backups are data operations, not customer documents; they require truthful confirmation, not invoice-style preview.

### D. Reload / Prepaint Stability
- Compact-header transformation must occur immediately when its DOM is available, not wait unnecessarily for `DOMContentLoaded`.
- Add a deterministic current-shell ready marker.
- Prevent legacy header/action layout from becoming visible before current shell installation; use a dark neutral prepaint fallback with bounded timeout/fail-safe rather than a permanently hidden page.
- Verify cold reload and repeated reload on phone/tablet/desktop for no large legacy-action flash or layout jump.

### E. Dark Form Controls
- Apply `color-scheme: dark` to app controls.
- Explicitly style letterhead select and disabled/readonly select/input/textarea states using app tokens.
- Ensure readable foreground/background contrast and no white rectangle for disabled company/letterhead selectors.
- Audit visible controls in Job, Quote, Company, Journal editor, invoice preview and Electrical Tools.

## Implementation phases
### Phase 0 — Baseline / Evidence
- Freeze current `main` SHA and latest green CI evidence.
- Retain current Function/Capability Stage 5 state; this master plan does not bypass strict audit stages.

### Phase 1 — Shared document preview layer
- Implement reusable modal/sheet shell with semantic dialog, close/Escape/backdrop handling, sticky action bar and printable customer-paper surface.
- Add shared dark modal styles plus white paper preview inside it.
- Model->preview and model->PDF paths must use the same values.

### Phase 2 — Journal invoice preview
- Rename action to `Preview invoice`.
- Remove separate direct PDF action from call card.
- Preview the official customer form first.
- Add edit/settings/download/print actions.
- Re-open preview after edits without stale data.

### Phase 3 — Calculator document preview
- `Calculation PDF` opens report preview.
- Add explicit `Download PDF` only inside preview.
- Preserve current calculation capture and PDF regression assertions.

### Phase 4 — Quote / fixed-price / T&M output clarity
- Fixed invoice gets preview before print.
- Compact header copy becomes `Preview / Print` where it dispatches a customer document.
- Keep T&M/fixed-price distinction explicit.

### Phase 5 — No-flash boot
- Install compact/current shell at first possible parse point.
- Hide only legacy action area during prepaint if needed; fail-safe reveals app if enhancer cannot initialize.
- Add E2E that samples early reload frames/state and rejects old wide action set becoming visibly rendered.

### Phase 6 — Dark-control regression closure
- Fix letterhead white select.
- Add app-wide native dark control rules for disabled/readonly state.
- Add contrast/background assertions against visible white-control regressions.

### Phase 7 — Browser human walkthroughs
Required journeys:
1. Residential fixed service call -> Preview invoice -> edit customer/company -> reopen preview -> PDF.
2. Hourly call -> preview shows hours x rate -> reload -> preview -> PDF.
3. Commercial taxable call -> preview shows configured tax -> PDF.
4. Itemized included materials remain reference-only and do not inflate Amount Due.
5. Missing company identity blocks final PDF but preview explains missing fields.
6. Calculator -> calculate -> preview -> verify inputs/result -> download PDF.
7. Fixed approved invoice -> preview -> print path.
8. Android-sized Job/Quote/Company controls contain no white disabled/letterhead strip.
9. Repeated reload does not expose legacy wide header/action UI.

### Phase 8 — Deterministic + exact-head CI
- Extend deterministic source/contract tests where appropriate.
- Full Playwright Chromium matrix: desktop + phone + tablet.
- Pageerror, console error, required-script/service-worker failure remain blockers.
- Exact tested SHA must equal expected SHA.

### Phase 9 — Audit synchronization
- Update Stage 5 matrix/state/master only after the final implementation SHA is green.
- Production changes invalidate stale exact-SHA evidence; rerun exact-head gate.
- Independent Stage 5 audit remains required before Stage 6 unlock.

## Acceptance criteria
Master plan implementation is complete only when all are true:
- Call card has one understandable invoice entry point: `Preview invoice`.
- Customer invoice preview visually represents the outgoing document and exposes edit/settings/download/print.
- No direct customer PDF download occurs before preview.
- Calculator customer report has preview-before-download.
- Fixed-price invoice print has preview-before-print.
- Company/letterhead selector is dark/readable, including disabled state.
- No visible old-header/action flash on reload in supported viewports.
- Human flows pass on desktop/phone/tablet where applicable.
- Deterministic suite green.
- Full exact-head Playwright suite green with 0 failures.
- Final implementation evidence is recorded here and then synchronized into Function/Capability audit documents.

## Completion evidence
Implementation was validated on exact production SHA `f1b5ab8b69a3a509037520d077a28e2dee038528` before this documentation-only synchronization commit.
- IMPLEMENTATION_SHA: `f1b5ab8b69a3a509037520d077a28e2dee038528`
- CI_RUN: Electrical Calculator Tests #703 / run id `35282365016` / SUCCESS
- EXACT_SHA_PROVENANCE: `TESTED_HEAD_SHA == EXPECTED_HEAD_SHA == f1b5ab8b69a3a509037520d077a28e2dee038528`
- DETERMINISTIC: `818/818 passed`
- PLAYWRIGHT: `168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed`
- VIEWPORTS: desktop 1440 / phone 390 / tablet 820
- OPEN_P0: `0`
- OPEN_P1: `0`
- PREVIEW_EVIDENCE: `HUMAN-CALC-04`, `HUMAN-CALC-09`, `HUMAN-CALC-11`, `JOURNAL-PREVIEW-01`, `JOURNAL-HUMAN-01`, `E2E-08`
- UI_STABILITY_EVIDENCE: `UI-STABILITY-01`, `UI-STABILITY-02`

The next gate is documentation synchronization plus a new exact-head CI on the resulting documentation SHA. That administrative SHA is not treated as validated merely because the implementation SHA above was green.

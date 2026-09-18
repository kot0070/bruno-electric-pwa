# NEW CHAT HANDOFF — Bruno Electric Call Service / Invoice / Refresh Audit

Use this file as the authoritative continuation prompt for a new ChatGPT chat.

## Repository and authority

Repository: `kot0070/bruno-electric-pwa`

Authoritative branch: `main`

Do **not** restart the project, re-ask resolved questions, or rebuild context from scratch. Read this handoff first, then inspect the current `main` head before making changes.

The user expects autonomous continuation, real product changes, and rigorous browser-level validation. Code-only checks are not sufficient for user-facing behavior.

---

## Global audit rules

Continue the existing Function / Capability Audit discipline:

1. discover current behavior
2. define expected contract
3. deterministic checks
4. exact-head CI
5. real Playwright/Chromium user journeys for user-facing behavior
6. fix all P0/P1 defects
7. exact-head CI again
8. independent audit on exact SHA when the product area is stable

Never weaken an expected contract merely to match broken runtime behavior.

`main` is authoritative.

Stage 6 remains locked until Stage 5 is independently accepted. Recent product work invalidated old Stage 5 exact-SHA acceptance evidence, so Stage 5 needs fresh exact-head evidence after the Call Service/product changes stabilize.

---

## Previously accepted Stage 4

Accepted implementation SHA:
`eaf0f4d096d0b207cc27f17675e384e6d6a4099b`

Independent audit SHA:
`ad468ae53e32cd0d9515c02a3ea1b912ebe65a6f`

Stage 4 was accepted with P0/P1 = 0.

---

## Stage 5 negative/fault baseline before recent product changes

Important prior implementation SHA:
`7c009e6c049b751f9c71bfd356ed3a7984895a8b`

At that point:
- deterministic: 806/806
- Playwright: 41 passed / 64 explicit viewport skips / 0 failed
- full-app restore became transactional/fail-closed with rollback
- SW install/core failure and stale-cache cleanup were covered

Because Call Service/product code changed afterwards, do **not** treat that as current exact-head Stage 5 acceptance.

---

# Current Call Service product contract

The current focus is the **Call Journal / service call workflow / customer invoice**.

## Pricing model

Each call must support flexible per-call pricing:
- `Fixed job price`
- `Hourly / time based`

Default hourly service rate is configurable, currently intended default example: `$175/hr`.

Hourly mode:
- per-call hourly rate is editable
- price is calculated from hours × hourly rate
- calculated price is readonly in hourly mode
- mode and applied hourly rate persist after reload

Fixed mode:
- hourly field is hidden
- job/service price is directly editable
- switching back to fixed persists correctly

Do not reinterpret old calls as hourly. Missing `pricingMode` migrates to fixed.

---

## Materials contract

The service/job price already includes materials.

Materials must **never** be added to the customer total a second time.

Included material information is only a reference/breakdown for the invoice.

Invoice material visibility must be optional:
- field: `invoiceShowMaterials`
- if not enabled, material reference rows/details should not appear on customer invoice
- if enabled, quick total or itemized included materials may be shown

The user specifically asked for invoice customization because some customers only need the final service price.

---

## Tool / consumables contract

`Tool / consumables` is optional.

If it is not enabled or its computed amount is zero, the customer invoice should **not show a zero-value Tool / consumables row**.

If enabled, it is calculated as a percentage of service/labor price and added to subtotal.

---

## Sales-tax contract

Do not make a universal “commercial always 8.25%” rule.

The current product categories are:
- `residential` → customer sales tax 0%
- `commercial_repair` → taxable using editable commercial/job-site rate, default example 8.25%
- `commercial_nontaxable` → 0%, with verification/documentation responsibility

The customer tax is calculated on customer subtotal (service price + optional tool charge; materials are already inside service price).

Invoice behavior:
- if tax rate/amount is zero, omit the zero-value `Sales tax · 0.00%` row
- if taxable, show rate and computed tax
- amount due must include tax

The call editor should visibly show the current customer-tax result/amount so the user can see tax before saving.

The previous bug report from the user was: “далі не рахує налог”. Browser tests must explicitly prove commercial repair tax through the visible UI and persisted call.

---

## Texas contractor notice

The user questioned the bottom text:

`Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas, 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov/complaints`

This notice should remain in the customer invoice because it is the contractor regulatory notice used by the product. Do not remove it merely because the user thought it looked odd.

If making legal/tax claims, verify current authoritative Texas sources first.

---

# Refresh / old-design flash defect

The user has repeatedly reported that on page refresh the **old legacy design/navigation appears first**, then the modern workspace loads afterwards.

Screenshots showed:
- first paint: legacy top navigation / quote tabs and old layout
- shortly after: modern Call Journal / current shell

This is a real UX defect and the user explicitly said it has been requested multiple times.

Root cause identified: modern workspace/nav is dynamically injected after initial HTML paint through `sw-register.js` → `electric-app-navigation.js` → `electric-workspace.js`.

A prepaint guard was added to `index.html` so legacy `#nav-tabs` and panels do not paint before the current workspace is ready. Do not remove this behavior.

Important related files:
- `index.html`
- `sw-register.js`
- `electric-workspace.js`
- `electric-compact-header.js`
- `sw.js`

A Playwright test was added specifically to observe the first frames during controlled refresh, not merely after `load`.

---

# Recent implementation commits and files

The exact current main HEAD must be fetched when the new chat starts, but recent relevant commits include:

- `bc8ac6f34f1420fdf08c204508c26a34b9dcd27a`
  - added `electric-customer-invoice-patch.js`

- `a6fd4cafb11d81da8138488553a649cf49ff26d7`
  - wired customer invoice patch into loader

- `347d55830ac79dbf4d19f563350e664d3b91bf8b`
  - added patch to SW shell

- `c5ff66a190b088a29f14278d54e0804a64a6afd4`
  - added first-paint guard against legacy navigation flash

- `00c0822663bc2119cb2487dc048cd34ad8e49dc5`
  - added Call Service invoice customization/tax browser tests

- `ce43bbd8adc39e8ebed387ef7b4afba4e2aec8ae`
  - updated deterministic customer-document contract tests

- `ade0cf2c3a199b97e8b08d51462f7f0fd8626514`
  - added refresh first-paint Playwright test

Recent main files added/changed:
- `electric-customer-invoice-patch.js`
- `sw-register.js`
- `sw.js`
- `index.html`
- `tests/customer-documents.test.js`
- `tests/e2e/call-journal-invoice-customization.spec.js`
- `tests/e2e/refresh-first-paint.spec.js`

Base invoice implementation remains in:
- `electric-customer-documents.js`

Call Journal base runtime:
- `electric-dispatch-journal-v2.js`

Existing browser workflow coverage:
- `tests/e2e/call-journal-materials.spec.js`
- `tests/e2e/call-journal-pricing-human.spec.js`

---

# Very important implementation nuance

The current invoice customization was implemented as a patch layer (`electric-customer-invoice-patch.js`) over the existing `electric-customer-documents.js`.

Before declaring the area finished, inspect whether this should remain as a patch or be consolidated into the base document module once behavior is proven stable. Do not create a regression while refactoring.

Potential fragility that still deserves review:
- `findEditingCall()` and post-save matching use date/time/address rather than a durable editing ID
- post-save hooks may select the newest `updatedAt` call
- this can be risky with multiple calls having identical date/time/address or rapid edits

Add a multi-call browser or deterministic test if needed to prove edits apply to the intended call.

---

# Current test/CI state at handoff time

The latest exact-head workflow at handoff time is:

Run:
`Electrical Calculator Tests #731`

Run ID:
`35289928477`

Head SHA:
`ade0cf2c3a199b97e8b08d51462f7f0fd8626514`

Observed state at handoff:
- exact SHA checkout/provenance: success
- Chromium install: success
- deterministic calculator/integrity tests: success
- Playwright Function Capability journeys: **still in progress** at handoff time

Do **not** claim this run is green until you re-check it in the new chat.

The immediately previous main workflow before these newest patches had passed fully.

---

# Existing live-user Call Service flow already covered

`JOURNAL-HUMAN-01` in `tests/e2e/call-journal-materials.spec.js` already covers a real visible chain:
- open Journal
- configure invoice company settings
- create hourly call
- customer/address
- 2h × $175 = $350
- included materials reference
- optional 3% tool charge
- residential tax 0
- save completed
- preview invoice
- reload
- edit same call
- convert to commercial repair
- itemize materials
- verify 8.25% tax and amount due
- download PDF
- verify persisted mode/rate/materials/tax

Do not replace this with storage-only validation.

---

# What to do first in the new chat

1. Fetch current `main` HEAD.
2. Re-read this handoff and the latest versions of all relevant files.
3. Re-check workflow run `35289928477` and its final Playwright result/logs.
4. If the run failed, diagnose the actual browser failure and fix production or tests according to the intended product contract. Do not weaken behavior.
5. If green, manually review the current Call Service browser contract and continue the walkthrough until all items below are proven.

---

# Required Call Service walkthrough before calling this area complete

Prove through visible UI + reload/persistence where relevant:

- settings save and reload
- hourly call with custom/default hourly rate
- fixed-price call
- switching hourly ↔ fixed
- residential call: no customer sales tax row on invoice
- commercial repair: editable 8.25% default computes tax and amount due correctly
- commercial non-taxable: tax omitted/0
- materials hidden by default when user does not want them
- materials shown when explicitly enabled
- itemized included materials persist but are not double-added to amount due
- Tool / consumables row hidden when zero/disabled
- Tool / consumables appears and affects subtotal when enabled
- required company info blocks customer PDF when missing
- valid invoice PDF downloads and contains company, TECL 28137, customer/address, pricing, amount due, regulatory notice
- tax collected is not treated as business revenue/net
- scheduled → completed lifecycle and metrics
- reload at meaningful points
- multi-call edit targets correct call
- critical journeys at phone/tablet/desktop where appropriate
- first-paint refresh test proves no legacy old design/nav appears before current shell

Do not move on to the next major product area until the Call Service chain is robust and exact-head CI is green.

---

# User communication style

User language: Ukrainian.

Keep status messages concise and technical.

The user expects action rather than repeated planning.

If CI is still running, state that it is running; do not call it green early.

When something fails, report the concrete failing behavior, fix it, and rerun exact-head validation.

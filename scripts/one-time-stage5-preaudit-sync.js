'use strict';
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const SHA='f1b5ab8b69a3a509037520d077a28e2dee038528';
const RUN=703, RUN_ID=35282365016;
function p(x){return path.join(root,x)}
function read(x){return fs.readFileSync(p(x),'utf8')}
function write(x,s){fs.writeFileSync(p(x),s)}

// Authoritative JSON state.
const statePath='dev-plans/FUNCTION_CAPABILITY_AUDIT_STATE.json';
const state=JSON.parse(read(statePath));
Object.assign(state.stage_5,{
  implementation_evidence_sha:SHA,
  implementation_exact_head_ci_run:RUN,
  implementation_exact_head_ci_run_id:RUN_ID,
  implementation_exact_head_ci_conclusion:'success',
  deterministic_test_count:818,
  playwright_scheduled_entries:168,
  playwright_passed:88,
  playwright_skipped_by_viewport_contract:80,
  playwright_failed:0,
  human_walkthrough_scope:['PROJECT_CALCULATOR','RESIDENTIAL_LIVE_DESIGN','RESIDENTIAL_ESTIMATOR','RESIDENTIAL_FULL_TAKEOFF','AMPACITY','VOLTAGE_DROP','CONDUIT_FILL','BOX_FILL','EVSE','HVAC_MCA_MOCP','MOTOR_CIRCUIT','GROUNDING','FEEDER_HELPER','CATALOG_REFERENCE','ELECTRICAL_TASKS','CALCULATION_PREVIEW_PDF','FIXED_PRICE_INVOICE_PREVIEW','CALL_SERVICE_JOURNAL','UI_PREPAINT_NO_FLASH','DARK_NATIVE_CONTROLS'],
  known_open_p0:[],known_open_p1:[],
  pre_audit_status:'FINAL_IMPLEMENTATION_EXACT_HEAD_GREEN_READY_FOR_INDEPENDENT_AUDIT',
  gate:'INDEPENDENT_EXACT_SHA_STAGE5_AUDIT_REQUIRED'
});
write(statePath,JSON.stringify(state,null,2)+'\n');

// Stage 5 matrix final implementation evidence.
const matrixPath='audits/function-capability/STAGE5_FAULT_INJECTION_MATRIX.md';
let m=read(matrixPath);
m=m.replace(/IMPLEMENTATION_EVIDENCE_SHA: `[^`]+`/,'IMPLEMENTATION_EVIDENCE_SHA: `'+SHA+'`')
 .replace(/EXACT_HEAD_CI: Electrical Calculator Tests #[0-9]+ \/ run id `[^`]+` \/ SUCCESS/,'EXACT_HEAD_CI: Electrical Calculator Tests #'+RUN+' / run id `'+RUN_ID+'` / SUCCESS')
 .replace(/DETERMINISTIC: `[^`]+`/,'DETERMINISTIC: `818/818 passed`')
 .replace(/BROWSER_REGRESSION_GATE: `[^`]+`/,'BROWSER_REGRESSION_GATE: `168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed`');
const oldEvidence=/## Exact-head implementation evidence[\s\S]*?## Remaining gate/;
const newEvidence=`## Exact-head implementation evidence\nElectrical Calculator Tests #${RUN} / run id \`${RUN_ID}\` executed exact implementation SHA \`${SHA}\` with matching tested/expected provenance.\n\n- deterministic: \`818/818 passed\`;\n- Playwright: \`168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed\`;\n- all Stage 5 import fault journeys are green;\n- calculator human journeys cover Project, core calculators, equipment/distribution, Residential, Catalog/Reference, Electrical Tasks, calculation preview/PDF and recovery flows;\n- Journal journeys cover materials-in-price semantics, itemized materials, scheduled non-earned behavior, commercial tax, hourly/fixed pricing, preview/edit/reload/PDF and locale-sensitive helper metrics;\n- \`UI-STABILITY-01\` proves zero visible legacy wide-header frames on desktop, phone and tablet;\n- \`UI-STABILITY-02\` proves letterhead and disabled/readonly native controls remain dark/readable;\n- preview-first contracts are green for Calculation PDF, service invoice PDF and approved fixed-price invoice print;\n- the existing Stage 3/4 browser regression suite remains green in the same run.\n\n## Remaining gate`;
if(!oldEvidence.test(m))throw new Error('Stage5 matrix evidence section not found');
m=m.replace(oldEvidence,newEvidence);
m=m.replace(/- Synchronize the authoritative state\/master with this evidence\.\n- Run deterministic \+ full Chromium Playwright suite on the final synchronized documentation SHA\.\n- Create a separate exact-SHA Stage 5 independent audit branch only after that documentation SHA is green\./,'- Authoritative state/master are synchronized by the pre-audit documentation commit.\n- Run deterministic + full Chromium Playwright suite on that synchronized documentation SHA.\n- Create a separate exact-SHA Stage 5 independent audit branch only after that documentation SHA is green.');
write(matrixPath,m);

// Function master Stage 5 evidence block.
const masterPath='dev-plans/FUNCTION_CAPABILITY_AUDIT_MASTER.md';
let master=read(masterPath);
const gateLine='Gate: synchronize authoritative documentation, run exact-head deterministic + Playwright CI on that documentation SHA, then create a separate exact-SHA Stage 5 independent audit branch. Every P0/P1 must be corrected and independently re-audited before Stage 6 unlock.';
const replacement=`Current final implementation evidence before independent audit:\n- exact implementation SHA: \`${SHA}\`;\n- Electrical Calculator Tests #${RUN} / run id \`${RUN_ID}\`, SUCCESS;\n- provenance: tested SHA equals expected SHA;\n- deterministic: \`818/818 passed\`;\n- Playwright: \`168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed\`;\n- human calculator coverage now includes every enabled workspace traversal plus active core, equipment/distribution, residential, project, catalog/reference, Electrical Tasks, preview/PDF and failure-recovery journeys;\n- preview-first service invoice, calculation report and fixed-price invoice behavior is browser-proven;\n- zero-frame legacy-header flash and dark native-control regressions are browser-proven on desktop/phone/tablet.\n\nGate: run exact-head CI on this synchronized documentation SHA, then create a separate exact-SHA Stage 5 independent audit branch. Every P0/P1 must be corrected and independently re-audited before Stage 6 unlock.`;
if(!master.includes(gateLine))throw new Error('Function master Stage5 gate line not found');
master=master.replace(gateLine,replacement);
write(masterPath,master);

// Master plan stays ACTIVE until independent Stage 5 audit, but records implementation gate.
const planPath='dev-plans/DOCUMENT_PREVIEW_UI_STABILITY_MASTER_PLAN.md';
let plan=read(planPath);
plan=plan.replace(/- FINAL_SHA: PENDING\n- CI_RUN: PENDING\n- DETERMINISTIC: PENDING\n- PLAYWRIGHT: PENDING\n- OPEN_P0: PENDING\n- OPEN_P1: PENDING/,
`- IMPLEMENTATION_SHA: \`${SHA}\`\n- IMPLEMENTATION_CI_RUN: Electrical Calculator Tests #${RUN} / run id \`${RUN_ID}\` / SUCCESS\n- IMPLEMENTATION_DETERMINISTIC: \`818/818 passed\`\n- IMPLEMENTATION_PLAYWRIGHT: \`168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed\`\n- UI_STABILITY: zero legacy-header visible frames + dark native controls green on desktop/phone/tablet\n- FINAL_SHA: PENDING_INDEPENDENT_STAGE5_AUDIT_AND_FINAL_DOCS\n- OPEN_P0: 0 known before independent audit\n- OPEN_P1: 0 known before independent audit`);
write(planPath,plan);

const coverage=`# Bruno Electric — Human Calculator / Document Coverage Matrix\n\nSTATUS: PRE_AUDIT_GREEN\nEVIDENCE_SHA: \`${SHA}\`\nCI: Electrical Calculator Tests #${RUN} / run id \`${RUN_ID}\` / SUCCESS\n\n| Surface / capability | Human browser evidence | What is actively exercised |\n|---|---|---|\n| Every enabled Electrical workspace | HUMAN-CALC-01 | Opens every enabled workspace through rendered navigation and proves reachability |\n| Ampacity / Voltage Drop / Conduit Fill / Box Fill | HUMAN-CALC-02, HUMAN-CALC-07, STAGE4-CALC-01..04 | Calculate, invalid/blank/zero boundaries, correction and recalculation |\n| Project Calculator | HUMAN-CALC-06, STAGE4-PROJECT-01/02 | Residential/commercial switching, validation, routing and persistence |\n| EVSE / HVAC / Motor / Grounding / Feeder Helper | HUMAN-CALC-05, E2E-EVSE-01 | Visible inputs, calculation, fail-closed/review states and recovery |\n| Residential Live / Estimator / Full Takeoff | HUMAN-CALC-04, HUMAN-CALC-10, E2E-04 | Calculate, save, reload, load, apply, history and idempotent material replacement |\n| Catalog / Reference | HUMAN-CALC-08, E2E-03 | Seed/search/add/persist material and reach code references |\n| Electrical Tasks + templates | HUMAN-CALC-03/04, E2E-05/06/07 | Solver, calculate, save, reload, takeoff, apply, changed-since-apply, update revision, advanced templates |\n| Calculation report | HUMAN-CALC-04/09/11 | Preview before output, visible inputs/result parity, explicit PDF download, cancel/no-download |\n| Fixed-price invoice | E2E-08 | Approved snapshot immutability, preview-before-print, explicit Print/Save PDF, T&M separation |\n| Call Journal service invoice | JOURNAL-HUMAN-01, JOURNAL-PRICING-HUMAN-01, JOURNAL-MATERIALS-01..03, JOURNAL-TAX-01, JOURNAL-PREVIEW-01 | Included/itemized materials, fixed/hourly, commercial tax, preview/edit/reload/PDF, missing-company block |\n| Helper economics | JOURNAL-HELPER-HUMAN-01 | Locale-sensitive summary consistency through observer cycles, edit and reload |\n| UI prepaint / dark controls | UI-STABILITY-01/02 | Zero visible legacy-header frames; dark/readable letterhead, disabled and readonly native controls across 3 viewports |\n| Import/export and storage resilience | E2E-02/09/10/12 + STAGE5-FAULT-01..06 | Job isolation, round-trip, stale IDs, offline shell, malformed/wrong/incomplete/cancelled/oversized imports |\n\n## Gate result\nAt the evidence SHA, deterministic tests are \`818/818\` and Playwright is \`168 scheduled / 88 passed / 80 explicit viewport-contract skips / 0 failed\`. Deep numeric workflows are intentionally run once where viewport-independent; responsive reachability and user-facing preview/style contracts run on phone/tablet/desktop where applicable.\n`;
write('audits/function-capability/HUMAN_CALCULATOR_DOCUMENT_COVERAGE.md',coverage);
console.log('Stage 5 pre-audit documentation synchronized.');

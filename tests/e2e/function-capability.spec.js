const { test, expect } = require('@playwright/test');

const JOB_KEY = 'bruno-electric-v1';
const criticalErrorRegistry = new WeakMap();
function baseJob(name='Browser Audit Job') {
  return {
    id:'e2e-'+String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    quote:{customer:name,jobNumber:'E2E-001',proposalNumber:'P-001',date:'2026-09-16'},
    company:{name:'Bruno Electric Services LLC'}, catalog:[], materialsUsed:[], materialsUnresolved:[],
    personnel:{employees:[],burden:[]}, electricalTasks:[], electricalTaskActiveId:null,
    changeOrders:[], summary:{}, residentialHistory:[], necEdition:'2026 NEC', jurisdiction:'Texas'
  };
}
async function seedJob(page, job=baseJob()) {
  await page.addInitScript(([key,value]) => {
    if(sessionStorage.getItem('__bruno_e2e_seeded')==='1')return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem('__bruno_e2e_seeded','1');
  }, [JOB_KEY, job]);
}
function criticalErrors(page) {
  let errors=criticalErrorRegistry.get(page);
  if(errors)return errors;
  errors=[];
  criticalErrorRegistry.set(page,errors);
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('response',r=>{ if(r.request().resourceType()==='script' && r.status()>=400) errors.push(`script ${r.status()}: ${r.url()}`); });
  return errors;
}
test.beforeEach(async ({page})=>{ criticalErrors(page); });
test.afterEach(async ({page})=>{
  const errors=criticalErrors(page);
  expect(errors, errors.join('\n')).toEqual([]);
});
async function openStable(page, path) {
  const errors=criticalErrors(page);
  await page.goto(path, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(450);
  expect(errors, errors.join('\n')).toEqual([]);
}
function desktopOnly(testInfo){ return testInfo.project.name !== 'chromium-desktop'; }
async function openTool(page,id){
  const picker=page.locator('#be-tool-select');
  if(await picker.isVisible()) await picker.selectOption(id);
  else {
    const button=page.locator(`#tool-nav [data-tool="${id}"]`);
    await expect(button).toBeVisible();
    await button.click();
  }
  await expect(page.locator(`#tool-${id}`)).toBeVisible();
}
async function openTaskAdvanced(page){
  const advanced=page.locator('#tool-tasks details.et-advanced');
  await expect(advanced).toBeAttached();
  if((await advanced.getAttribute('open'))===null) await advanced.locator('summary').click();
  await expect(page.locator('#et-ambient')).toBeVisible();
  await expect(page.locator('#et-ocpd')).toBeVisible();
}
async function fillTaskDesign(page, overrides={}){
  const x=Object.assign({
    load:'20',voltage:'240',phase:'1',distance:'50',material:'Cu',install:'EMT',conductor:'THHN_THWN2',
    basis:'NONCONTINUOUS',vd:'3',ambient:'30',ccc:'2',terminal:'75',parallel:'0',maxSize:'',raceway:'SEPARATE_SETS',
    ocpd:'20',neutral:'NONE',egc:'Cu'
  },overrides);
  await page.locator('#et-load').fill(x.load);
  await page.locator('#et-voltage').selectOption(x.voltage);
  await page.locator('#et-phase').selectOption(x.phase);
  await page.locator('#et-distance').fill(x.distance);
  await page.locator('#et-material').selectOption(x.material);
  await page.locator('#et-install').selectOption(x.install);
  await page.locator('#et-conductor').selectOption(x.conductor);
  await page.locator('#et-load-basis').selectOption(x.basis);
  await page.locator('#et-vd').fill(x.vd);
  await openTaskAdvanced(page);
  await page.locator('#et-ambient').fill(x.ambient);
  await page.locator('#et-ccc').fill(x.ccc);
  await page.locator('#et-terminal').selectOption(x.terminal);
  await page.locator('#et-parallel').selectOption(x.parallel);
  await page.locator('#et-max-size').fill(x.maxSize);
  await page.locator('#et-raceway-strategy').selectOption(x.raceway);
  await page.locator('#et-ocpd').fill(x.ocpd);
  await page.locator('#et-neutral-mode').selectOption(x.neutral);
  await page.locator('#et-egc-material').selectOption(x.egc);
}

// E2E-01 — real shell navigation/deep-link/back-forward.
test('E2E-01 app shell navigation, deep-link and back-forward', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Core journey runs once on desktop; E2E-11 owns viewport matrix.');
  await seedJob(page);
  await openStable(page, '/index.html#be=BILLING&tab=quote');
  await expect(page.locator('#panel-quote')).toBeVisible();
  await page.goto('/index.html#be=ESTIMATE&tab=catalog');
  await expect(page.locator('#panel-catalog')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#panel-quote')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#panel-catalog')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#panel-quote')).toBeVisible();
  await page.goto('/electrical-tools.html');
  await expect(page).toHaveTitle(/Electrical Tools/);
  await expect(page.locator('#tool-host')).toBeVisible();
});

// E2E-02 — import two distinct Jobs through the real file input and prove replacement/isolation.
test('E2E-02 Job A/B isolation through user import', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page);
  await openStable(page, '/index.html');
  page.on('dialog', d=>d.accept());
  const input=page.locator('#btn-import');
  const a=baseJob('JOB-A-CUSTOMER'); a.materialsUsed=[{item:'A-only',qty:1,unitCost:10}];
  const b=baseJob('JOB-B-CUSTOMER'); b.materialsUsed=[{item:'B-only',qty:1,unitCost:20}];
  const env=x=>({brunoExportType:'job',brunoExportVersion:1,appVersion:'e2e',exportedAt:new Date().toISOString(),payload:x});
  await input.setInputFiles({name:'job-a.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(env(a)))});
  await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)).quote.customer,JOB_KEY)).toBe('JOB-A-CUSTOMER');
  await input.setInputFiles({name:'job-b.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(env(b)))});
  await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)).quote.customer,JOB_KEY)).toBe('JOB-B-CUSTOMER');
  const rows=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).materialsUsed.map(x=>x.item),JOB_KEY);
  expect(rows).toEqual(['B-only']);
});

// E2E-03 — standard + custom Catalog UI, blank-vs-zero Your Cost, reload persistence.
test('E2E-03 Catalog standard/custom material and blank/zero Your Cost persist correctly', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  const job=baseJob();
  job.catalog=[{id:'ecat-br-1p20',category:'SERVICE / PANELS',item:'20A 1-pole breaker',units:'EA',unitCost:15,yourCost:7.5,vendor:'E2E',part:'BR20',notes:'standard audit fixture',priceStatus:'PRICED'}];
  await seedJob(page,job);
  await openStable(page, '/index.html#be=ESTIMATE&tab=catalog');
  await page.locator('#cat-search').fill('20A 1-pole breaker');
  let standardRow=page.locator('#cat-groups tr').filter({hasText:'20A 1-pole breaker'}).first();
  await expect(standardRow).toBeVisible();
  await standardRow.locator('.cat-add').click();
  await expect.poll(()=>page.evaluate(k=>(JSON.parse(localStorage.getItem(k)).materialsUsed||[]).some(x=>x.item==='20A 1-pole breaker'),JOB_KEY)).toBe(true);

  await expect(page.locator('#custom-materials-card')).toBeVisible();
  await page.locator('#cm-item').fill('E2E unresolved material');
  await page.locator('#cm-customer').fill('125');
  await page.locator('#cm-your').fill('');
  await page.locator('#cm-save-add').click();
  await page.waitForLoadState('domcontentloaded');
  await expect.poll(()=>page.evaluate(k=>(JSON.parse(localStorage.getItem(k)).materialsUnresolved||[]).some(x=>x.item==='E2E unresolved material'),JOB_KEY)).toBe(true);
  await page.goto('/index.html#be=ESTIMATE&tab=catalog'); await page.waitForTimeout(350);
  await page.locator('#cm-item').fill('E2E zero-cost material');
  await page.locator('#cm-customer').fill('20');
  await page.locator('#cm-your').fill('0');
  await page.locator('#cm-save-add').click();
  await page.waitForLoadState('domcontentloaded');
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(300);
  const result=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));const zero=(j.materialsUsed||[]).find(x=>x.item==='E2E zero-cost material');return{standard:(j.materialsUsed||[]).some(x=>x.item==='20A 1-pole breaker'),unresolved:(j.materialsUnresolved||[]).some(x=>x.item==='E2E unresolved material'),zero:zero&&{unitCost:zero.unitCost,costState:zero.costState}};},JOB_KEY);
  expect(result.standard).toBe(true);
  expect(result.unresolved).toBe(true);
  expect(result.zero).toEqual({unitCost:0,costState:'RESOLVED'});
});

// E2E-04 — Residential live calculation -> Save -> reload/load -> Apply -> history.
test('E2E-04 Residential calculate, save, reload, load, apply and history', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page);
  await openStable(page, '/electrical-tools.html');
  await openTool(page,'res-live');
  const facts=page.locator('#tool-res-live details').filter({has:page.locator('#rl-sqft')});
  await facts.locator('summary').click();
  await expect(page.locator('#rl-sqft')).toBeVisible();
  await page.locator('#rl-sqft').fill('1800');
  await page.locator('#rl-bed').fill('3');
  await page.locator('#rl-bath').fill('2');
  await page.locator('#rl-kitchen').fill('1');
  await page.locator('#rl-laundry').fill('1');
  await page.locator('#rl-sqft').dispatchEvent('input');
  await expect(page.locator('#rl-out')).not.toContainText('Live takeoff error');
  page.on('dialog',d=>d.accept());
  const before=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return[(j.materialsUsed||[]).length,(j.materialsUnresolved||[]).length];},JOB_KEY);
  await page.locator('#rl-save-ux-btn').click();
  await expect(page.locator('#rl-save-state')).toContainText('SAVED · NOT APPLIED');
  const afterSave=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return[(j.materialsUsed||[]).length,(j.materialsUnresolved||[]).length];},JOB_KEY);
  expect(afterSave).toEqual(before);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(450);
  await openTool(page,'res-live');
  await page.locator('#rl-save-archive-ux details > summary').click();
  await expect(page.locator('#rl-archive-overview')).toContainText('1800');
  const loadButton=page.locator('#rl-archive-overview [data-ux-load]').first();
  await expect(loadButton).toBeVisible();
  await loadButton.click();
  await expect(page.locator('#rl-sqft')).toHaveValue('1800');
  await page.locator('#rl-save-ux-btn').click();
  await expect(page.locator('#rl-apply-job-btn')).toBeEnabled();
  await page.locator('#rl-apply-job-btn').click();
  await expect(page.locator('#rl-save-state')).toContainText('APPLIED TO JOB');
  const applied=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return(j.materialsUsed||[]).length+(j.materialsUnresolved||[]).length;},JOB_KEY);
  expect(applied).toBeGreaterThan(before[0]+before[1]);
  await expect(page.locator('#rl-archive-overview')).toContainText('APPLIED TO JOB');
});

// E2E-05 — full Feeder save/apply/edit/update/history workflow and Save != Apply boundary.
test('E2E-05 Electrical Tasks Feeder calculate save reload apply edit update history', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  test.setTimeout(60000);
  await seedJob(page);
  await openStable(page, '/electrical-tools.html');
  await openTool(page,'tasks');
  await page.locator('#et-name').fill('E2E Feeder');
  await fillTaskDesign(page);
  await page.locator('#et-calculate').click();
  await expect(page.locator('#et-calc-out')).toContainText('PASS');
  await expect(page.locator('#et-grounding-out')).toContainText('STAGE 4 PASS');
  const before=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return(j.materialsUsed||[]).length+(j.materialsUnresolved||[]).length;},JOB_KEY);
  await page.locator('#et-save').click();
  await expect(page.locator('#et-status')).toContainText('saved');
  await expect(page.locator('#et-stage6-status')).toContainText('SAVED');
  const afterSave=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return(j.materialsUsed||[]).length+(j.materialsUnresolved||[]).length;},JOB_KEY);
  expect(afterSave).toBe(before);

  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(450);
  await openTool(page,'tasks');
  await expect(page.locator('#et-name')).toHaveValue('E2E Feeder');
  await openTaskAdvanced(page);
  await page.locator('#et-calculate').click();
  await expect(page.locator('#et-grounding-out')).toContainText('STAGE 4 PASS');
  await page.locator('#et-build-takeoff').click();
  await expect(page.locator('#et-takeoff-out')).toContainText('PASS');
  await expect(page.locator('#et-apply-materials')).toBeEnabled();
  await page.locator('#et-apply-materials').click();
  await expect(page.locator('#et-takeoff-status')).toContainText('Applied');
  await expect(page.locator('#et-stage6-status')).toContainText('APPLIED TO JOB',{timeout:5000});
  const appliedRevision=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));const a=(j.electricalTaskMaterialApplications||[]).slice(-1)[0];return a&&a.sourceTaskRevision;},JOB_KEY);
  expect(Number(appliedRevision)).toBeGreaterThan(0);

  await page.locator('#et-distance').fill('40');
  await page.locator('#et-save').click();
  await expect(page.locator('#et-status')).toContainText('saved');
  await expect(page.locator('#et-stage6-status')).toContainText('CHANGED SINCE APPLY',{timeout:5000});
  const oldRows=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return(j.materialsUsed||[]).concat(j.materialsUnresolved||[]).filter(x=>x.materialType==='ELECTRICAL_TASK_TAKEOFF').map(x=>x.sourceTaskRevision);},JOB_KEY);
  expect(oldRows.length).toBeGreaterThan(0);
  expect(oldRows.every(x=>Number(x)===Number(appliedRevision))).toBe(true);
  await page.locator('#et-calculate').click();
  await expect(page.locator('#et-grounding-out')).toContainText('STAGE 4 PASS');
  await page.locator('#et-stage6-update').click();
  await expect(page.locator('#et-stage6-message')).toContainText('Job updated from task revision');
  await expect(page.locator('#et-stage6-message')).toContainText('Archived');
  await expect(page.locator('#et-stage6-status')).toContainText('APPLIED TO JOB',{timeout:5000});
  const history=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));const t=(j.electricalTasks||[]).find(x=>x.id===j.electricalTaskActiveId);const rows=(j.materialsUsed||[]).concat(j.materialsUnresolved||[]).filter(x=>x.materialType==='ELECTRICAL_TASK_TAKEOFF');return{history:(j.electricalTaskMaterialHistory||[]).length,revision:t&&t.revision,rowRevisions:rows.map(x=>x.sourceTaskRevision)};},JOB_KEY);
  expect(history.history).toBeGreaterThan(0);
  expect(history.rowRevisions.length).toBeGreaterThan(0);
  expect(history.rowRevisions.every(x=>Number(x)===Number(history.revision))).toBe(true);
});

// E2E-06 — every accepted advanced template performs an actual rendered calculation.
test('E2E-06 advanced Electrical Task templates calculate through rendered UI', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  test.setTimeout(60000);
  await seedJob(page); await openStable(page, '/electrical-tools.html');
  await openTool(page,'tasks');
  const sel=page.locator('#et-type');
  const cases=[
    ['BRANCH_CIRCUIT_RUN',{}],
    ['EVSE_CIRCUIT',{basis:'CONTINUOUS'}],
    ['HVAC_CIRCUIT',{load:'32',ocpd:'40'}],
    ['MOTOR_CIRCUIT',{}],
    ['TRANSFORMER_FEED',{load:'125',voltage:'480',phase:'3',ccc:'3',ocpd:'150'}],
    ['GENERATOR_FEEDER',{load:'100',ocpd:'125'}],
    ['LONG_DISTANCE_VD',{load:'30',distance:'1000',parallel:'1',ocpd:'30'}]
  ];
  for(const [type,values] of cases){
    await sel.selectOption(type);
    expect(await sel.inputValue()).toBe(type);
    await fillTaskDesign(page,values);
    await page.locator('#et-calculate').click();
    await expect(page.locator('#et-status')).toContainText('calculation completed');
    if(type==='LONG_DISTANCE_VD') await expect(page.locator('#et-grounding-out')).toContainText(/STAGE 4 PASS|REVIEW REQUIRED|NO SUPPORTED CONFIGURATION/);
    else await expect(page.locator('#et-grounding-out')).toContainText('STAGE 4 PASS');
  }
});

// E2E-07 — Solver copies explicit facts only and does not save/apply.
test('E2E-07 Professional Task Solver no guessing and no auto side effects', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page); await openStable(page, '/electrical-tools.html');
  await openTool(page,'tasks');
  await page.locator('#et-solver-text').fill('I need a 100A panel 250 ft from service at 240 V.');
  await page.locator('#et-solver-extract').click();
  await expect(page.locator('#et-solver-known')).toContainText(/100|250|240/);
  await expect(page.locator('#et-solver-unresolved')).not.toBeEmpty();
  const countBefore=await page.evaluate(k=>(JSON.parse(localStorage.getItem(k)).electricalTasks||[]).length,JOB_KEY);
  await page.locator('#et-solver-use').click();
  await expect(page.locator('#et-status')).toContainText('Nothing was calculated, saved, or applied');
  const countAfter=await page.evaluate(k=>(JSON.parse(localStorage.getItem(k)).electricalTasks||[]).length,JOB_KEY);
  expect(countAfter).toBe(countBefore);
});

// E2E-08 — approve snapshot through UI, prove fixed invoice uses immutable snapshot; T&M remains separate.
test('E2E-08 Quote approval immutability and fixed-price invoice basis', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page); await openStable(page, '/index.html#be=BILLING&tab=quote');
  await expect(page.locator('#quote-lifecycle-card')).toBeVisible();
  await page.locator('#qa-manual').fill('1234.56');
  await page.locator('#qa-approve').click();
  await expect(page.locator('#qa-status')).toContainText('APPROVED SNAPSHOT');
  const approved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).quoteLifecycle.approved.customerAmount,JOB_KEY);
  expect(approved).toBe(1234.56);
  await page.locator('#qa-manual').fill('2222.22');
  await page.locator('#qa-use-approved').click();
  await expect(page.locator('#qa-invoice-basis')).toContainText('$1,234.56');
  const still=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).quoteLifecycle.approved.customerAmount,JOB_KEY);
  expect(still).toBe(1234.56);
  await page.evaluate(()=>{window.__e2ePrinted=false;window.print=()=>{window.__e2ePrinted=true;};});
  await page.locator('#qa-print-fixed').click();
  await expect.poll(()=>page.evaluate(()=>window.__e2ePrinted)).toBe(true);
  await expect(page.locator('#fixed-price-invoice-print-root')).toContainText('$1,234.56');
  await page.evaluate(()=>document.body.classList.remove('bruno-print-fixed'));
  await page.locator('.be-nav-btn[data-tab="tm"]').click();
  await expect(page.locator('#panel-tm')).toBeVisible();
  await expect(page.locator('#btn-print-tm-2')).toBeVisible();
  await expect(page.locator('#btn-print-tm-2')).toContainText('T&M');
});

// E2E-09 — real export download + import file control through compact header overflow.
test('E2E-09 representative Job export and import', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page, baseJob('Exported Customer')); await openStable(page, '/index.html');
  await page.locator('#btn-compact-more').click();
  await expect(page.locator('#btn-export')).toBeVisible();
  const downloadPromise=page.waitForEvent('download'); await page.locator('#btn-export').click();
  const download=await downloadPromise; expect(download.suggestedFilename()).toMatch(/bruno.*\.json/i);
  page.on('dialog',d=>d.accept());
  const changed=baseJob('Imported Customer');
  const env={brunoExportType:'job',brunoExportVersion:1,appVersion:'e2e',exportedAt:new Date().toISOString(),payload:changed};
  await page.locator('#btn-import').setInputFiles({name:'import.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(env))});
  await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)).quote.customer,JOB_KEY)).toBe('Imported Customer');
});

// E2E-10 — malformed/stale optional fields survive reload without fatal UI failure.
test('E2E-10 reload and stale identifier resilience', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  const j=baseJob('Stale Safe'); j.electricalTaskActiveId='missing-task-id'; j.electricalTasks=[]; j.materialsUnresolved=[{item:'Legacy unresolved',qty:1,yourCost:''}];
  await seedJob(page,j); await openStable(page, '/index.html'); await page.reload();
  await expect(page.locator('body')).toBeVisible();
  await page.goto('/electrical-tools.html'); await page.waitForTimeout(400);
  await openTool(page,'tasks');
  await expect(page.locator('#et-status')).not.toContainText(/TypeError|ReferenceError/);
});

// E2E-11 — actual responsive reachability in all configured Chromium viewport projects.
test('E2E-11 critical actions remain reachable at desktop, phone and tablet', async ({page}, testInfo) => {
  await seedJob(page); await openStable(page, '/index.html');
  await expect(page.locator('#btn-compact-more')).toBeVisible();
  await page.locator('#btn-compact-more').click();
  await expect(page.locator('#btn-export')).toBeVisible();
  await expect(page.locator('#btn-blank')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await page.goto('/electrical-tools.html'); await page.waitForTimeout(450);
  await expect(page.locator('#tool-host')).toBeVisible();
  await openTool(page,'tasks');
  await expect(page.locator('#et-save')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
  expect(['chromium-desktop','chromium-phone','chromium-tablet']).toContain(testInfo.project.name);
});

// E2E-12 — service worker registration/cache shell on localhost and reload under offline context.
test('E2E-12 service-worker install and offline shell reload', async ({page, context}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop service-worker journey.');
  await seedJob(page); await openStable(page, '/index.html');
  await expect.poll(()=>page.evaluate(async()=>!!(navigator.serviceWorker && await navigator.serviceWorker.ready))).toBe(true);
  const cacheNames=await page.evaluate(()=>caches.keys());
  expect(cacheNames).toContain('bruno-electric-v69');
  expect(cacheNames.filter(x=>/^bruno-electric-v\d+$/.test(x))).toEqual(['bruno-electric-v69']);
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('body')).toBeVisible();
  await page.goto('/electrical-tools.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#tool-host')).toBeVisible();
  await context.setOffline(false);
});

const { test, expect } = require('@playwright/test');

const JOB_KEY = 'bruno-electric-v1';
function baseJob(name='Browser Audit Job') {
  return {
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
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('response',r=>{ if(r.request().resourceType()==='script' && r.status()>=400) errors.push(`script ${r.status()}: ${r.url()}`); });
  return errors;
}
async function openStable(page, path) {
  const errors=criticalErrors(page);
  await page.goto(path, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(450);
  expect(errors, errors.join('\n')).toEqual([]);
}
function desktopOnly(testInfo){ return testInfo.project.name !== 'chromium-desktop'; }

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

// E2E-03 — actual custom Catalog UI, blank-vs-zero Your Cost, reload persistence.
test('E2E-03 Catalog custom material blank and zero Your Cost persist correctly', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page);
  await openStable(page, '/index.html#be=ESTIMATE&tab=catalog');
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
  const result=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));const r=(j.materialsUsed||[]).find(x=>x.item==='E2E zero-cost material');return r&&{unitCost:r.unitCost,costState:r.costState};},JOB_KEY);
  expect(result).toEqual({unitCost:0,costState:'RESOLVED'});
});

// E2E-04 — Residential live calculation -> Save -> Apply -> reload/archive state.
test('E2E-04 Residential calculate, save, apply and reload', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page);
  await openStable(page, '/electrical-tools.html');
  const resButton=page.locator('[data-tool="res-live"]');
  await expect(resButton).toBeVisible(); await resButton.click();
  await expect(page.locator('#tool-res-live')).toBeVisible();
  await page.locator('#rl-sqft').fill('1800');
  await page.locator('#rl-bed').fill('3');
  await page.locator('#rl-bath').fill('2');
  await page.locator('#rl-kitchen').fill('1');
  await page.locator('#rl-laundry').fill('1');
  await page.locator('#rl-sqft').dispatchEvent('input');
  await expect(page.locator('#rl-out')).not.toContainText('Live takeoff error');
  page.on('dialog',d=>d.accept());
  await page.locator('#rl-save-ux-btn').click();
  await expect(page.locator('#rl-save-state')).toContainText('SAVED');
  await expect(page.locator('#rl-apply-job-btn')).toBeEnabled();
  await page.locator('#rl-apply-job-btn').click();
  await expect(page.locator('#rl-save-state')).toContainText('APPLIED TO JOB');
  await page.reload(); await page.waitForTimeout(450); await page.locator('[data-tool="res-live"]').click();
  await expect(page.locator('#rl-archive-overview')).toContainText('1800');
});

// E2E-05 — Feeder real form calculate + save; preserve Save != Apply boundary.
test('E2E-05 Electrical Tasks Feeder calculate and save boundary', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page);
  await openStable(page, '/electrical-tools.html');
  await page.locator('[data-tool="tasks"]').click();
  await expect(page.locator('#tool-tasks')).toBeVisible();
  await page.locator('#et-name').fill('E2E Feeder');
  await page.locator('#et-load').fill('100');
  await page.locator('#et-voltage').selectOption('120/240');
  await page.locator('#et-phase').selectOption('1');
  await page.locator('#et-distance').fill('100');
  await page.locator('#et-material').selectOption('Cu');
  await page.locator('#et-install').selectOption('EMT');
  await page.locator('#et-conductor').selectOption('THHN_THWN2');
  await page.locator('#et-load-basis').selectOption('NONCONTINUOUS');
  await page.locator('#et-vd').fill('3');
  await page.locator('#et-calculate').click();
  await expect(page.locator('#et-calc-out')).toContainText(/PASS|NO SUPPORTED CONFIGURATION|BLOCKED/);
  const before=await page.evaluate(k=>(JSON.parse(localStorage.getItem(k)).materialsUsed||[]).length,JOB_KEY);
  await page.locator('#et-save').click();
  await expect(page.locator('#et-status')).toContainText('saved');
  const after=await page.evaluate(k=>(JSON.parse(localStorage.getItem(k)).materialsUsed||[]).length,JOB_KEY);
  expect(after).toBe(before);
});

// E2E-06 — every accepted advanced template is selectable in the rendered UI.
test('E2E-06 advanced Electrical Task templates are reachable', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page); await openStable(page, '/electrical-tools.html');
  await page.locator('[data-tool="tasks"]').click();
  const sel=page.locator('#et-type');
  for(const type of ['BRANCH_CIRCUIT_RUN','EVSE_CIRCUIT','HVAC_CIRCUIT','MOTOR_CIRCUIT','TRANSFORMER_FEED','GENERATOR_FEEDER','LONG_DISTANCE_VD']){
    await sel.selectOption(type); expect(await sel.inputValue()).toBe(type);
    await expect(page.locator('#tool-tasks')).toBeVisible();
  }
});

// E2E-07 — Solver copies explicit facts only and does not save/apply.
test('E2E-07 Professional Task Solver no guessing and no auto side effects', async ({page}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop core journey.');
  await seedJob(page); await openStable(page, '/electrical-tools.html');
  await page.locator('[data-tool="tasks"]').click();
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

// E2E-08 — approve snapshot through UI, mutate live recommendation source, snapshot remains immutable; invoice basis uses approved snapshot.
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
  await page.locator('.be-nav-btn[data-tab="tm"]').click();
  await expect(page.locator('#panel-tm')).toBeVisible();
  await expect(page.locator('#btn-print-tm-2')).toBeVisible();
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
  await page.locator('[data-tool="tasks"]').click();
  await expect(page.locator('#tool-tasks')).toBeVisible();
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
  await page.goto('/electrical-tools.html'); await page.waitForTimeout(350);
  await expect(page.locator('#tool-host')).toBeVisible();
  await expect(page.locator('[data-tool="tasks"]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
  expect(['chromium-desktop','chromium-phone','chromium-tablet']).toContain(testInfo.project.name);
});

// E2E-12 — service worker registration/cache shell on localhost and reload under offline context.
test('E2E-12 service-worker install and offline shell reload', async ({page, context}, testInfo) => {
  test.skip(desktopOnly(testInfo), 'Desktop service-worker journey.');
  await seedJob(page); await openStable(page, '/index.html');
  await expect.poll(()=>page.evaluate(async()=>!!(navigator.serviceWorker && await navigator.serviceWorker.ready))).toBe(true);
  const cacheNames=await page.evaluate(()=>caches.keys());
  expect(cacheNames).toContain('bruno-electric-v68');
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('body')).toBeVisible();
  await context.setOffline(false);
});

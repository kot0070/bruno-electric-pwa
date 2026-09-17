const { test, expect } = require('@playwright/test');

const JOB_KEY='bruno-electric-v1';
const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){
  let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);
  page.on('pageerror',e=>rows.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(t))rows.push('console.error: '+t);}});
  page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});
  page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))rows.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});
  return rows;
}

test.beforeEach(async({page})=>{errorsFor(page);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

test('STAGE7-XMOD-01 PWA cache and service-worker lifecycle preserves stored Job provenance',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','PWA storage lifecycle semantics are viewport-independent; run once on desktop Chromium.');
  const job={
    id:'stage7-pwa-job',
    quote:{customer:'Stage 7 PWA Customer',jobNumber:'S7-PWA-1',proposalNumber:'S7-P1',date:'2026-09-17'},
    company:{name:'Bruno Electric Services LLC'},
    catalog:[],
    materialsUsed:[{item:'Task conductor',qty:100,units:'FT',unitCost:1.25,costState:'RESOLVED',materialType:'ELECTRICAL_TASK_TAKEOFF',sourceTaskId:'task-stage7',sourceTaskRevision:3,generatedBy:{source:'electrical-task-material-takeoff',version:'stage5'}}],
    materialsUnresolved:[],
    personnel:{employees:[],burden:[]},
    electricalTasks:[{id:'task-stage7',name:'Stage 7 feeder',revision:3,type:'FEEDER_PANEL_RUN'}],
    electricalTaskActiveId:'task-stage7',
    electricalTaskMaterialHistory:[{taskId:'task-stage7',sourceTaskRevision:2,archivedAt:'2026-09-17T12:00:00.000Z'}],
    residentialAppliedCalculation:{calculationId:'res-stage7',name:'Stage 7 residence',sourceVersion:'residential-apply-v1'},
    changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'
  };
  await page.addInitScript(([key,value])=>{
    if(sessionStorage.getItem('__stage7_pwa_seeded')==='1')return;
    localStorage.setItem(key,JSON.stringify(value));
    sessionStorage.setItem('__stage7_pwa_seeded','1');
  },[JOB_KEY,job]);

  // Build the approval through the actual Quote UI instead of fabricating a partial
  // lifecycle object. This both keeps the fixture schema-valid and proves that the
  // state crossing the PWA lifecycle is state a real user can create.
  await page.goto('/index.html#be=BILLING&tab=quote',{waitUntil:'load'});
  await expect(page.locator('#q-customer')).toHaveValue('Stage 7 PWA Customer');
  await expect(page.locator('#quote-lifecycle-card')).toBeVisible();
  await page.locator('#qa-manual').fill('2450');
  const approvalReload=page.waitForEvent('load');
  await page.locator('#qa-approve').click();
  await approvalReload;
  await expect(page.locator('#qa-status')).toContainText('APPROVED SNAPSHOT');
  await expect.poll(()=>page.evaluate(async()=>!!(navigator.serviceWorker&&await navigator.serviceWorker.ready))).toBe(true);

  // Capture the fully normalized, live-runtime representation. The lifecycle test
  // below is about cache/SW replacement preserving that exact persisted Job.
  const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),JOB_KEY);
  expect(before.electricalTasks[0].revision).toBe(3);
  expect(before.materialsUsed[0].sourceTaskRevision).toBe(3);
  expect(before.residentialAppliedCalculation.calculationId).toBe('res-stage7');
  expect(before.quoteLifecycle.approved.customerAmount).toBe(2450);

  const lifecycle=await page.evaluate(async()=>{
    const cachesBefore=await caches.keys();
    await Promise.all(cachesBefore.filter(x=>/^bruno-electric-v\d+$/.test(x)).map(x=>caches.delete(x)));
    const regs=await navigator.serviceWorker.getRegistrations();
    const unregistered=[];
    for(const r of regs)unregistered.push(await r.unregister());
    return{cachesBefore,unregistered};
  });
  expect(lifecycle.cachesBefore.some(x=>/^bruno-electric-v\d+$/.test(x))).toBe(true);
  expect(lifecycle.unregistered.every(Boolean)).toBe(true);

  await page.reload({waitUntil:'load'});
  await expect(page.locator('#q-customer')).toHaveValue('Stage 7 PWA Customer');
  await expect.poll(()=>page.evaluate(async()=>!!(navigator.serviceWorker&&await navigator.serviceWorker.ready))).toBe(true);

  const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),JOB_KEY);
  expect(after).toEqual(before);
  expect(after.electricalTaskMaterialHistory[0].sourceTaskRevision).toBe(2);
  expect(after.materialsUsed[0].generatedBy.source).toBe('electrical-task-material-takeoff');
  expect(after.quoteLifecycle.approved.customerAmount).toBe(2450);
  expect(after.residentialAppliedCalculation.sourceVersion).toBe('residential-apply-v1');

  const cachesAfter=await page.evaluate(()=>caches.keys());
  expect(cachesAfter.filter(x=>/^bruno-electric-v\d+$/.test(x)).length).toBe(1);
});

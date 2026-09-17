const { test, expect } = require('@playwright/test');

const JOB_KEY='bruno-electric-v1';
const PROFILES_KEY='bruno-electric-profiles-v1';
const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){
  let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);
  page.on('pageerror',e=>rows.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error'){const text=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(text))rows.push('console.error: '+text);}});
  page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});
  page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))rows.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});
  return rows;
}
function job(customer){return{id:'stage5-import-job',quote:{customer,jobNumber:'S5-1',proposalNumber:'S5-P1',date:'2026-09-17'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function seed(page){
  const currentJob=job('Stage 5 Current State');
  const profiles={version:1,activeId:'stage5-current',profiles:[{id:'stage5-current',name:'Current Company',legalName:'Current Company LLC'}]};
  await page.addInitScript(({jobKey,profilesKey,currentJob,profiles})=>{
    if(sessionStorage.getItem('__stage5_fault_seeded')==='1')return;
    localStorage.setItem(jobKey,JSON.stringify(currentJob));
    localStorage.setItem(profilesKey,JSON.stringify(profiles));
    sessionStorage.setItem('__stage5_fault_seeded','1');
  },{jobKey:JOB_KEY,profilesKey:PROFILES_KEY,currentJob,profiles});
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#q-customer')).toHaveValue('Stage 5 Current State');
  await expect.poll(()=>page.evaluate(()=>window.__brunoAppBackupDispatchUiInstalled===true)).toBe(true);
  return{currentJob,profiles};
}
async function snapshot(page){return page.evaluate(({jobKey,profilesKey})=>({job:localStorage.getItem(jobKey),profiles:localStorage.getItem(profilesKey)}),{jobKey:JOB_KEY,profilesKey:PROFILES_KEY});}

test.beforeEach(async({page})=>{errorsFor(page);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

function desktopOnly(testInfo){test.skip(testInfo.project.name!=='chromium-desktop','Stage 5 import fault contract is viewport-independent; execute once on desktop Chromium.');}

test('STAGE5-FAULT-01 malformed full-app JSON fails closed and preserves current local state',async({page},testInfo)=>{
  desktopOnly(testInfo);await seed(page);const before=await snapshot(page);
  const dialogPromise=page.waitForEvent('dialog');
  await page.locator('#btn-import-app').setInputFiles({name:'malformed.json',mimeType:'application/json',buffer:Buffer.from('{"brunoExportType":"app","payload":')});
  const dialog=await dialogPromise;expect(dialog.type()).toBe('alert');expect(dialog.message()).toContain('Import app failed:');await dialog.accept();
  expect(await snapshot(page)).toEqual(before);
  await expect(page.locator('#q-customer')).toHaveValue('Stage 5 Current State');
});

test('STAGE5-FAULT-02 wrong backup type is rejected without confirmation or mutation',async({page},testInfo)=>{
  desktopOnly(testInfo);await seed(page);const before=await snapshot(page);
  const env={brunoExportType:'job',brunoExportVersion:1,payload:{job:job('Foreign Job')}};
  const dialogPromise=page.waitForEvent('dialog');
  await page.locator('#btn-import-app').setInputFiles({name:'job-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(env))});
  const dialog=await dialogPromise;expect(dialog.type()).toBe('alert');expect(dialog.message()).toContain('Expected an app backup');await dialog.accept();
  expect(await snapshot(page)).toEqual(before);
});

test('STAGE5-FAULT-03 incomplete app payload is rejected after confirmation and preserves all existing state',async({page},testInfo)=>{
  desktopOnly(testInfo);await seed(page);const before=await snapshot(page);
  const env={brunoExportType:'app',brunoExportVersion:1,payload:{companies:{version:1,activeId:'foreign',profiles:[]}}};
  const messages=[];
  page.on('dialog',async d=>{messages.push({type:d.type(),message:d.message()});await d.accept();});
  await page.locator('#btn-import-app').setInputFiles({name:'incomplete-app.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(env))});
  await expect.poll(()=>messages.length).toBe(2);
  expect(messages[0].type).toBe('confirm');
  expect(messages[1].type).toBe('alert');
  expect(messages[1].message).toContain('saved Job is required');
  expect(await snapshot(page)).toEqual(before);
  await expect(page.locator('#q-customer')).toHaveValue('Stage 5 Current State');
});

test('STAGE5-FAULT-04 cancelled valid app restore is a no-op',async({page},testInfo)=>{
  desktopOnly(testInfo);await seed(page);const before=await snapshot(page);
  const env={brunoExportType:'app',brunoExportVersion:1,payload:{job:job('Foreign Valid Backup'),companies:{version:1,activeId:'foreign',profiles:[{id:'foreign',name:'Foreign'}]}}};
  const dialogPromise=page.waitForEvent('dialog');
  await page.locator('#btn-import-app').setInputFiles({name:'valid-app.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(env))});
  const dialog=await dialogPromise;expect(dialog.type()).toBe('confirm');await dialog.dismiss();
  await page.waitForTimeout(100);
  expect(await snapshot(page)).toEqual(before);
  await expect(page.locator('#q-customer')).toHaveValue('Stage 5 Current State');
});

test('STAGE5-FAULT-05 oversized app backup is rejected before file parsing or mutation',async({page},testInfo)=>{
  desktopOnly(testInfo);await seed(page);const before=await snapshot(page);
  let seen=null;
  const dialogHandled=new Promise(resolve=>page.once('dialog',async d=>{seen={type:d.type(),message:d.message()};await d.accept();resolve();}));
  await page.evaluate(()=>{
    const input=document.querySelector('#btn-import-app');
    const transfer=new DataTransfer();
    transfer.items.add(new File([new Uint8Array(8*1024*1024+1)],'oversized-app.json',{type:'application/json'}));
    input.files=transfer.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await dialogHandled;
  expect(seen.type).toBe('alert');expect(seen.message).toContain('too large');
  expect(await snapshot(page)).toEqual(before);
  await expect(page.locator('#q-customer')).toHaveValue('Stage 5 Current State');
});

test('STAGE5-FAULT-06 malformed single-Job JSON is rejected and current Job is preserved',async({page},testInfo)=>{
  desktopOnly(testInfo);await seed(page);const before=await snapshot(page);
  const dialogPromise=page.waitForEvent('dialog');
  await page.locator('#btn-import').setInputFiles({name:'malformed-job.json',mimeType:'application/json',buffer:Buffer.from('{"brunoExportType":"job","payload":')});
  const dialog=await dialogPromise;expect(dialog.type()).toBe('alert');expect(dialog.message()).toContain('Invalid JSON:');await dialog.accept();
  expect(await snapshot(page)).toEqual(before);
  await expect(page.locator('#q-customer')).toHaveValue('Stage 5 Current State');
});

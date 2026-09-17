const { test, expect } = require('@playwright/test');
const fs = require('fs');

const KEYS={
  job:'bruno-electric-v1',
  profiles:'bruno-electric-profiles-v1',
  prefs:'bruno-electric-ui-prefs-v1',
  catalogOpen:'bruno-electric-cat-open-v1',
  dispatch:'bruno-electric-dispatch-journal-v2',
  dispatchSettings:'bruno-electric-dispatch-settings-v2'
};
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
function job(customer){return{id:'stage4-app-backup',quote:{customer,jobNumber:'APP-1',proposalNumber:'APP-P1',date:'2026-09-17'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[{item:'Backup material',qty:2,units:'EA',unitCost:12,costState:'RESOLVED'}],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function revealThroughDetails(locator){
  if(await locator.isVisible())return;
  const details=locator.locator('xpath=ancestor::details[1]');
  if(await details.count()){
    const summary=details.locator('summary').first();
    await expect(summary).toBeVisible();
    await summary.click();
  }
  await expect(locator).toBeVisible();
}

test.beforeEach(async({page})=>{errorsFor(page);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

test('STAGE4-APP-BACKUP-01 full app export/import round-trips all supported local state',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','Composite backup contract is viewport-independent; run once on desktop Chromium.');
  const original={
    job:job('Full Backup Original'),
    profiles:{version:1,activeId:'profile-stage4',profiles:[{id:'profile-stage4',name:'Backup Company',legalName:'Backup Company LLC',address:'1 Backup Way',city:'Austin',state:'TX',zip:'78701',license:'TECL TEST'}]},
    prefs:{theme:'light',zoom:110},
    catalogOpen:{WIRE:true,SERVICE:false},
    dispatch:{calls:[{id:'call-stage4',customer:'Dispatch Backup'}],helpers:[]},
    dispatchSettings:{jurisdiction:'Austin, TX',ownerTaxPct:15}
  };
  await page.addInitScript(({keys,data})=>{
    if(sessionStorage.getItem('__stage4_app_backup_seeded')==='1')return;
    localStorage.setItem(keys.job,JSON.stringify(data.job));
    localStorage.setItem(keys.profiles,JSON.stringify(data.profiles));
    localStorage.setItem(keys.prefs,JSON.stringify(data.prefs));
    localStorage.setItem(keys.catalogOpen,JSON.stringify(data.catalogOpen));
    localStorage.setItem(keys.dispatch,JSON.stringify(data.dispatch));
    localStorage.setItem(keys.dispatchSettings,JSON.stringify(data.dispatchSettings));
    sessionStorage.setItem('__stage4_app_backup_seeded','1');
  },{keys:KEYS,data:original});
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#q-customer')).toHaveValue('Full Backup Original');
  await expect.poll(()=>page.evaluate(()=>window.__brunoAppBackupDispatchUiInstalled===true)).toBe(true);

  const exportButton=page.locator('#btn-export-app');
  await revealThroughDetails(exportButton);
  const downloadPromise=page.waitForEvent('download');
  await exportButton.click();
  const download=await downloadPromise;
  const p=await download.path();expect(p).toBeTruthy();
  const buffer=await fs.promises.readFile(p);
  const env=JSON.parse(buffer.toString('utf8'));
  expect(env.brunoExportType).toBe('app');
  expect(env.payload.job.quote.customer).toBe('Full Backup Original');
  expect(env.payload.companies.activeId).toBe('profile-stage4');
  expect(env.payload.uiPrefs).toEqual(original.prefs);
  expect(env.payload.catalogOpen).toEqual(original.catalogOpen);
  expect(env.payload.dispatchJournalV3.data.calls[0].id).toBe('call-stage4');
  expect(env.payload.dispatchJournalV3.settings.ownerTaxPct).toBe(15);

  const foreign={
    job:job('Foreign Active State'),
    profiles:{version:1,activeId:'foreign-profile',profiles:[{id:'foreign-profile',name:'Foreign Company',legalName:'Foreign Company LLC'}]},
    prefs:{theme:'dark',zoom:80},catalogOpen:{FOREIGN:true},
    dispatch:{calls:[{id:'foreign-call'}]},dispatchSettings:{jurisdiction:'Foreign',ownerTaxPct:1}
  };
  await page.evaluate(({keys,data})=>{
    Object.entries({job:data.job,profiles:data.profiles,prefs:data.prefs,catalogOpen:data.catalogOpen,dispatch:data.dispatch,dispatchSettings:data.dispatchSettings}).forEach(([name,value])=>localStorage.setItem(keys[name],JSON.stringify(value)));
  },{keys:KEYS,data:foreign});
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#q-customer')).toHaveValue('Foreign Active State');

  page.on('dialog',d=>d.accept());
  await page.locator('#btn-import-app').setInputFiles({name:download.suggestedFilename(),mimeType:'application/json',buffer});
  await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)).quote.customer,KEYS.job)).toBe('Full Backup Original');
  const restored=await page.evaluate(keys=>({
    job:JSON.parse(localStorage.getItem(keys.job)),profiles:JSON.parse(localStorage.getItem(keys.profiles)),prefs:JSON.parse(localStorage.getItem(keys.prefs)),catalogOpen:JSON.parse(localStorage.getItem(keys.catalogOpen)),dispatch:JSON.parse(localStorage.getItem(keys.dispatch)),dispatchSettings:JSON.parse(localStorage.getItem(keys.dispatchSettings))
  }),KEYS);
  expect(restored.job.materialsUsed.some(x=>x.item==='Backup material'&&x.qty===2)).toBe(true);
  expect(restored.profiles.activeId).toBe('profile-stage4');
  expect(restored.profiles.profiles[0].legalName).toBe('Backup Company LLC');
  expect(restored.prefs).toEqual(original.prefs);
  expect(restored.catalogOpen).toEqual(original.catalogOpen);
  expect(restored.dispatch.calls[0].id).toBe('call-stage4');
  expect(restored.dispatchSettings.ownerTaxPct).toBe(15);
  expect(restored.dispatch.calls.some(x=>x.id==='foreign-call')).toBe(false);
});
const { test, expect } = require('@playwright/test');
const JOB_KEY='bruno-electric-v1';
const allowed=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
function baseJob(){return{id:'e2e-evse-pro',quote:{customer:'EVSE Browser Audit',jobNumber:'EVSE-001',proposalNumber:'EVSE-P1',date:'2026-09-17'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function seed(page){await page.addInitScript(([k,v])=>{localStorage.setItem(k,JSON.stringify(v));},[JOB_KEY,baseJob()]);}
function errors(page){const e=[];page.on('pageerror',x=>e.push('pageerror: '+x.message));page.on('console',m=>{if(m.type()==='error'&&!allowed.has(m.text()))e.push('console.error: '+m.text());});page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)e.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))e.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});return e;}
async function openTool(page,id){const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);if(compact){const p=page.locator('#be-tool-select');await expect(p).toBeVisible();await p.selectOption(id);}else{const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();}await expect(page.locator(`#tool-${id}`)).toBeVisible();}

test('E2E-EVSE-01 · CAP-ELC-007 professional EVSE Tesla sizing, formulas, charge-time and BOM',async({page},testInfo)=>{
  const runtimeErrors=errors(page);await seed(page);page.on('dialog',d=>d.accept());
  await page.goto('/electrical-tools.html',{waitUntil:'load'});await openTool(page,'ev3');await expect(page.locator('#evp-profile')).toBeVisible();
  await page.locator('#evp-profile').selectOption('TESLA_48_60');await page.locator('#evp-terminal').selectOption('75');await page.locator('#evp-distance').fill('50');await page.locator('#evp-vehicle').selectOption('');await page.locator('#evp-run').click();
  await expect(page.locator('#evp-out')).toContainText('60 A');await expect(page.locator('#evp-out')).toContainText('#6 Cu');await expect(page.locator('#evp-out')).toContainText('11.52 kW');await expect(page.locator('#evp-out')).toContainText('4.34 h');await expect(page.locator('#evp-out')).toContainText('48 A × 125%');
  await page.locator('#evp-terminal').selectOption('60');await page.locator('#evp-run').click();await expect(page.locator('#evp-out')).toContainText('#4 Cu');
  await page.locator('#evp-terminal').selectOption('75');await page.locator('#evp-distance').fill('300');await page.locator('#evp-run').click();await expect(page.locator('#evp-out')).toContainText('#3 Cu');
  await page.locator('#evp-distance').fill('50');await page.locator('#evp-vehicle').selectOption('32');await page.locator('#evp-run').click();await expect(page.locator('#evp-out')).toContainText('7.68 kW');await expect(page.locator('#evp-out')).toContainText('6.51 h');
  await page.locator('#evp-vehicle').selectOption('');await page.locator('#evp-run').click();await page.locator('#evp-bom').click();
  const generated=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return(j.materialsUsed||[]).concat(j.materialsUnresolved||[]).filter(x=>x.generatedBy&&x.generatedBy.source==='phase3-evse').map(x=>x.item);},JOB_KEY);
  expect(generated.length).toBe(3);expect(generated.join('|')).toContain('#6 Cu');expect(generated.join('|')).toContain('60A 2-pole Tesla Wall Connector');expect(generated.join('|')).toContain('#10 Cu equipment grounding conductor');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
  if(runtimeErrors.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(runtimeErrors.join('\n')),contentType:'text/plain'});expect(runtimeErrors,runtimeErrors.join('\n')).toEqual([]);
});

const { test, expect } = require('@playwright/test');
const fs = require('fs');

const JOB_KEY='bruno-electric-v1';
const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);page.on('pageerror',e=>rows.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(t))rows.push('console.error: '+t);}});page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))rows.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});return rows;}
function baseJob(){return{id:'pdf-human-job',quote:{customer:'PDF Customer',jobNumber:'PDF-101'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function openTool(page,id){const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();await expect(page.locator(`#tool-${id}`)).toBeVisible();}
async function downloadText(page){const p=page.waitForEvent('download');await page.locator('#be-download-calc').click();const d=await p;expect(d.suggestedFilename()).toMatch(/^Bruno-Electric-Calculation-\d{4}-\d{2}-\d{2}\.pdf$/);const path=await d.path();expect(path).toBeTruthy();return fs.readFileSync(path,'utf8');}

test.beforeEach(async({page})=>{errorsFor(page);await page.addInitScript(([k,v])=>localStorage.setItem(k,JSON.stringify(v)),[JOB_KEY,baseJob()]);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

test('HUMAN-CALC-09 downloaded calculation PDF contains the visible engineering result and job context',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','PDF payload inspection runs once on desktop.');
  test.setTimeout(60000);
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await expect(page.locator('#be-download-calc')).toBeVisible();

  await openTool(page,'amp');
  await page.locator('#a-size').selectOption('6');
  await page.locator('#a-load').fill('50');
  await page.locator('#run-amp').click();
  await expect(page.locator('#out-amp')).toContainText('PASS');
  const ampPdf=await downloadText(page);
  expect(ampPdf).toContain('ELECTRICAL CALCULATION REPORT');
  expect(ampPdf).toContain('Conductor / Ampacity');
  expect(ampPdf).toContain('PDF Customer PDF-101');
  expect(ampPdf).toContain('Code edition: 2026 NEC');
  expect(ampPdf).toContain('Calculation path / result');
  expect(ampPdf).toContain('PASS');

  await openTool(page,'ev3');
  await expect(page.locator('#evp-profile')).toBeVisible();
  await page.locator('#evp-run').click();
  await expect(page.locator('#evp-out')).toContainText('EVSE result · PASS');
  const evsePdf=await downloadText(page);
  expect(evsePdf).toContain('Professional EVSE / Charging');
  expect(evsePdf).toContain('Required circuit ampacity');
  expect(evsePdf).toContain('Branch breaker');
  expect(evsePdf).toContain('Selected phase conductors');
  expect(evsePdf).toContain('60 A');
});

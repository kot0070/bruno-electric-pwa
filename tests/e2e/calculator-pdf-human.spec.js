const { test, expect } = require('@playwright/test');
const fs = require('fs');

const JOB_KEY='bruno-electric-v1';
const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);page.on('pageerror',e=>rows.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(t))rows.push('console.error: '+t);}});page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))rows.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});return rows;}
function baseJob(){return{id:'pdf-human-job',quote:{customer:'PDF Customer',jobNumber:'PDF-101'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function openTool(page,id){const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);if(compact){await page.locator('#be-tool-select').selectOption(id);}else{const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();}await expect(page.locator(`#tool-${id}`)).toBeVisible();}
async function downloadText(page){
  let confirmMessage='';
  page.once('dialog',async d=>{confirmMessage=d.message();expect(d.type()).toBe('confirm');await d.accept();});
  const p=page.waitForEvent('download');
  await page.locator('#be-download-calc').click();
  const d=await p;
  expect(confirmMessage).toContain('CURRENT calculator inputs and visible result');
  expect(d.suggestedFilename()).toMatch(/^Bruno-Electric-Calculation-\d{4}-\d{2}-\d{2}\.pdf$/);
  const path=await d.path();expect(path).toBeTruthy();return fs.readFileSync(path,'utf8');
}
function contrast(rgbA,rgbB){
  function parse(s){const m=String(s).match(/[\d.]+/g)||[];return m.slice(0,3).map(Number);}
  function lum(rgb){return rgb.map(v=>{v=v/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
  const a=lum(parse(rgbA)),b=lum(parse(rgbB));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}

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

test('HUMAN-CALC-11 Calculation PDF action is readable and requires confirmation before download',async({page})=>{
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await expect(page.locator('#be-tool-select')).toBeAttached();
  await openTool(page,'amp');
  await page.locator('#run-amp').click();
  await expect(page.locator('#out-amp')).toContainText('PASS');

  const button=page.locator('#be-download-calc');
  await expect(button).toBeVisible();
  await expect(button).toHaveText('Calculation PDF');
  const style=await button.evaluate(el=>{const s=getComputedStyle(el);const r=el.getBoundingClientRect();return{bg:s.backgroundColor,fg:s.color,w:r.width,h:r.height};});
  expect(style.w).toBeGreaterThan(80);expect(style.h).toBeGreaterThan(30);
  expect(contrast(style.bg,style.fg)).toBeGreaterThanOrEqual(4.5);

  let dialogText='',downloadSeen=false;
  page.once('download',()=>{downloadSeen=true;});
  page.once('dialog',async d=>{dialogText=d.message();await d.dismiss();});
  await button.click();
  await page.waitForTimeout(250);
  expect(dialogText).toContain('CURRENT calculator inputs and visible result');
  expect(dialogText).toContain('Nothing is saved or downloaded until you confirm');
  expect(downloadSeen).toBe(false);
});

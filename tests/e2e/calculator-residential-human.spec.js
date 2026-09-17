const { test, expect } = require('@playwright/test');

const JOB_KEY='bruno-electric-v1';
const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);page.on('pageerror',e=>rows.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(t))rows.push('console.error: '+t);}});page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))rows.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});return rows;}
function baseJob(){return{id:'res-human-job',quote:{customer:'Residential Human',jobNumber:'RES-101'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[{id:'manual-existing',item:'Manual field material',qty:1,unit:'EA',source:'manual'}],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function openTool(page,id){const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();await expect(page.locator(`#tool-${id}`)).toBeVisible();}
async function materialState(page){return page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k)||'{}');return{used:(j.materialsUsed||[]).length,unresolved:(j.materialsUnresolved||[]).length,manual:(j.materialsUsed||[]).some(x=>x.id==='manual-existing')};},JOB_KEY);}

test.beforeEach(async({page})=>{errorsFor(page);await page.addInitScript(([k,v])=>{localStorage.setItem(k,JSON.stringify(v));localStorage.removeItem('bruno-electric-project-mode-v1');},[JOB_KEY,baseJob()]);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

test('HUMAN-CALC-10 electrician operates residential load estimator and full takeoff through visible UI',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','Detailed residential estimator/takeoff mutation runs once on desktop.');
  test.setTimeout(90000);
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});

  // Residential load estimator: prove blank required input fails closed, then recover with a realistic dwelling and generate BOM.
  await openTool(page,'res');
  await expect(page.locator('#r-calc')).toBeVisible();
  await page.locator('#r-sqft').fill('');
  await page.locator('#r-calc').click();
  await expect(page.locator('#r-out')).toContainText('Input / scope error');
  await page.locator('#r-sqft').fill('2200');
  await page.locator('#r-mat').selectOption('Cu');
  await page.locator('#r-other').fill('1500');
  await page.locator('#r-run').fill('80');
  await page.locator('#r-calc').click();
  await expect(page.locator('#r-out')).toContainText('Residential load summary');
  await expect(page.locator('#r-out')).toContainText('Total calculated');
  await expect(page.locator('#r-out')).toContainText('Service candidate');
  const beforeEstimator=await materialState(page);
  let estimatorDialog='';
  page.once('dialog',async d=>{estimatorDialog=d.message();await d.accept();});
  await page.locator('#r-bom').click();
  await expect.poll(()=>estimatorDialog).toContain('Residential BOM updated');
  const afterEstimator=await materialState(page);
  expect(afterEstimator.manual).toBe(true);
  expect(afterEstimator.used+afterEstimator.unresolved).toBeGreaterThan(beforeEstimator.used+beforeEstimator.unresolved);

  // Full takeoff: enter actual zone counts, calculate the visible schedule/BOM, then replace only this generator's rows.
  await openTool(page,'res-takeoff');
  await expect(page.locator('#rt-calc')).toBeVisible();
  await page.locator('#rt-rooms').fill('6');
  await page.locator('#rt-kitchens').fill('1');
  await page.locator('#rt-baths').fill('2');
  await page.locator('#rt-laundry').fill('1');
  await page.locator('#rt-garage').fill('2');
  await page.locator('#rt-outdoor').fill('2');
  await page.locator('#rt-room-wire').fill('450');
  await page.locator('#rt-k-wire').fill('160');
  await page.locator('#rt-b-wire').fill('100');
  await page.locator('#rt-l-wire').fill('55');
  await page.locator('#rt-g-wire').fill('90');
  await page.locator('#rt-o-wire').fill('60');
  await page.locator('#rt-calc').click();
  await expect(page.locator('#rt-out')).toContainText('General-room receptacles');
  await expect(page.locator('#rt-out')).toContainText('24');
  await expect(page.locator('#rt-out')).toContainText('Circuit schedule + conductor sizing');
  await expect(page.locator('#rt-out')).toContainText('Generated takeoff BOM');
  await expect(page.locator('#rt-out')).toContainText('Catalog pricing');

  let takeoffDialog='';
  page.once('dialog',async d=>{takeoffDialog=d.message();await d.accept();});
  await page.locator('#rt-save').click();
  await expect.poll(()=>takeoffDialog).toContain('Current takeoff recalculated and saved');
  const afterTakeoff=await materialState(page);
  expect(afterTakeoff.manual).toBe(true);
  expect(afterTakeoff.used+afterTakeoff.unresolved).toBeGreaterThan(afterEstimator.used+afterEstimator.unresolved);

  // Repeating the same generated takeoff replaces its own rows rather than duplicating the Job BOM.
  let repeatDialog='';
  page.once('dialog',async d=>{repeatDialog=d.message();await d.accept();});
  await page.locator('#rt-save').click();
  await expect.poll(()=>repeatDialog).toContain('Current takeoff recalculated and saved');
  const afterRepeat=await materialState(page);
  expect(afterRepeat.manual).toBe(true);
  expect(afterRepeat.used+afterRepeat.unresolved).toBe(afterTakeoff.used+afterTakeoff.unresolved);
});

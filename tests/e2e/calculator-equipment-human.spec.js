const { test, expect } = require('@playwright/test');

const JOB_KEY='bruno-electric-v1';
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
function baseJob(){return{id:'equipment-human-job',quote:{customer:'Equipment Walkthrough',jobNumber:'EQ-001'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function openTool(page,id){
  const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);
  if(compact){const picker=page.locator('#be-tool-select');await expect(picker).toBeVisible();await picker.selectOption(id);}
  else{const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();}
  await expect(page.locator(`#tool-${id}`)).toBeVisible();
}

test.beforeEach(async({page})=>{
  errorsFor(page);
  await page.addInitScript(([k,v])=>{localStorage.setItem(k,JSON.stringify(v));localStorage.removeItem('bruno-electric-project-mode-v1');},[JOB_KEY,baseJob()]);
});
test.afterEach(async({page},testInfo)=>{
  const rows=errorsFor(page);
  if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});
  expect(rows,rows.join('\n')).toEqual([]);
});

test('HUMAN-CALC-05 electrician operates every equipment and distribution calculator through visible UI',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','Detailed equipment workflow runs once on desktop; cross-viewport tool reachability is covered by the full responsive suite.');
  test.setTimeout(90000);
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});

  // Professional EVSE: validate the shipped Tesla preset, then switch to Generic so the field tech can enter a custom unit, fail closed on blank current, recover, and replace BOM.
  await openTool(page,'ev3');
  await expect(page.locator('#evp-profile')).toBeVisible();
  await page.locator('#evp-run').click();
  await expect(page.locator('#evp-out')).toContainText('EVSE result · PASS');
  await expect(page.locator('#evp-out')).toContainText('60 A');
  await expect(page.locator('#evp-out')).toContainText('48 A');
  await page.locator('#evp-profile').selectOption('GENERIC');
  await expect(page.locator('#evp-a')).toBeEnabled();
  await page.locator('#evp-a').fill('');
  await page.locator('#evp-run').click();
  await expect(page.locator('#evp-out')).toContainText('Input / scope error');
  await page.locator('#evp-a').fill('32');
  await page.locator('#evp-v').selectOption('240');
  await page.locator('#evp-distance').fill('75');
  await page.locator('#evp-run').click();
  await expect(page.locator('#evp-out')).toContainText('EVSE result · PASS');
  await expect(page.locator('#evp-out')).toContainText('40 A');
  page.once('dialog',d=>d.accept());
  await page.locator('#evp-bom').click();
  await expect.poll(()=>page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k)||'{}');return (j.materialsUsed||[]).length+(j.materialsUnresolved||[]).length;},JOB_KEY)).toBeGreaterThan(0);

  // HVAC: verify pass path, intentionally oversize the selected OCPD, require fail-closed input/scope rejection, then recover.
  await openTool(page,'hv3');
  await page.locator('#hv-run').click();
  await expect(page.locator('#hv-out')).toContainText('HVAC result');
  await expect(page.locator('#hv-out')).toContainText('50 A / 50 A');
  await expect(page.locator('#hv-out')).toContainText('PASS');
  await page.locator('#hv-ocpd').fill('60');
  await page.locator('#hv-run').click();
  await expect(page.locator('#hv-out')).toContainText('Input / scope error');
  await expect(page.locator('#hv-out')).toContainText('Selected OCPD exceeds equipment MOCP');
  await page.locator('#hv-ocpd').fill('50');
  await page.locator('#hv-run').click();
  await expect(page.locator('#hv-out')).toContainText('HVAC result');
  await expect(page.locator('#hv-out')).toContainText('PASS');

  // Motor: exercise device-type and overload-class changes, then confirm result remains coherent.
  await openTool(page,'mo3');
  await page.locator('#mo-run').click();
  await expect(page.locator('#mo-out')).toContainText('Motor result');
  await expect(page.locator('#mo-out')).toContainText('Minimum branch conductor ampacity');
  await page.locator('#mo-dev').selectOption('timeDelayFuse');
  await page.locator('#mo-sf').selectOption('0');
  await page.locator('#mo-run').click();
  await expect(page.locator('#mo-out')).toContainText('timeDelayFuse');
  await expect(page.locator('#mo-out')).toContainText('Overload max');

  // Grounding: run both independent helpers and then the electrode-specific path that requires an explicit checkbox.
  await openTool(page,'gr3');
  await page.locator('#gr-egc').click();
  await expect(page.locator('#gr-out')).toContainText('EGC result');
  await expect(page.locator('#gr-out')).toContainText('60 A OCPD');
  await page.locator('#gr-gec').click();
  await expect(page.locator('#gr-out')).toContainText('GEC result');
  await page.locator('#gr-et').selectOption('rod-pipe-plate');
  await page.locator('#gr-gec').click();
  await expect(page.locator('#gr-out')).toContainText('GEC result · REVIEW');
  await expect(page.locator('#gr-out')).toContainText('Electrode-specific 250.66 cap not asserted');
  await page.locator('#gr-sole').check();
  await page.locator('#gr-gec').click();
  await expect(page.locator('#gr-out')).toContainText('rod-pipe-plate');
  await expect(page.locator('#gr-out')).not.toContainText('Electrode-specific 250.66 cap not asserted');
  await expect(page.locator('#gr-out')).not.toContainText('Input / scope error');

  // Feeder planning helper: verify actual arithmetic, edit both load classes, and recalculate.
  await openTool(page,'fd3');
  await page.locator('#fd-run').click();
  await expect(page.locator('#fd-out')).toContainText('80 A');
  await page.locator('#fd-c').fill('24');
  await page.locator('#fd-n').fill('20');
  await page.locator('#fd-run').click();
  await expect(page.locator('#fd-out')).toContainText('50 A');
  await expect(page.locator('#fd-out')).toContainText('Feeder result');
});

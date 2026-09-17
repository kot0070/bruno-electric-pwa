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
function baseJob(){return{id:'human-walkthrough-job',quote:{customer:'Human Walkthrough',jobNumber:'HW-001'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function seedJob(page){await page.addInitScript(([k,v])=>{if(sessionStorage.getItem('__bruno_calc_human_seeded')==='1')return;localStorage.setItem(k,JSON.stringify(v));sessionStorage.setItem('__bruno_calc_human_seeded','1');},[JOB_KEY,baseJob()]);}
async function openTool(page,id){const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);if(compact){const picker=page.locator('#be-tool-select');await expect(picker).toBeVisible();await picker.selectOption(id);}else{const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();}await expect(page.locator(`#tool-${id}`)).toBeVisible();}
async function darkReadable(page,selector){const s=await page.locator(selector).evaluate(el=>{const cs=getComputedStyle(el);return{bg:cs.backgroundColor,color:cs.color,display:cs.display,visibility:cs.visibility};});expect(s.display).not.toBe('none');expect(s.visibility).not.toBe('hidden');expect(s.bg).not.toBe('rgb(255, 255, 255)');expect(s.color).not.toBe('rgb(255, 255, 255)');}
async function openTaskAdvanced(page){const d=page.locator('#tool-tasks details.et-advanced');await expect(d).toBeAttached();if((await d.getAttribute('open'))===null)await d.locator('summary').click();await expect(page.locator('#et-ambient')).toBeVisible();}
async function fillTaskDesign(page){await page.locator('#et-load').fill('20');await page.locator('#et-voltage').selectOption('240');await page.locator('#et-phase').selectOption('1');await page.locator('#et-distance').fill('50');await page.locator('#et-material').selectOption('Cu');await page.locator('#et-install').selectOption('EMT');await page.locator('#et-conductor').selectOption('THHN_THWN2');await page.locator('#et-load-basis').selectOption('NONCONTINUOUS');await page.locator('#et-vd').fill('3');await openTaskAdvanced(page);await page.locator('#et-ambient').fill('30');await page.locator('#et-ccc').fill('2');await page.locator('#et-terminal').selectOption('75');await page.locator('#et-parallel').selectOption('0');await page.locator('#et-raceway-strategy').selectOption('SEPARATE_SETS');await page.locator('#et-ocpd').fill('20');await page.locator('#et-neutral-mode').selectOption('NONE');await page.locator('#et-egc-material').selectOption('Cu');}

test.beforeEach(async({page})=>{errorsFor(page);await seedJob(page);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

test('HUMAN-CALC-01 walks every enabled electrical workspace like a user',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','Full workspace traversal runs once on desktop; responsive button audit runs on all viewports.');
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});
  const ids=await page.locator('#tool-nav [data-tool]').evaluateAll(rows=>rows.filter(x=>!x.disabled&&!x.hidden).map(x=>x.dataset.tool));
  expect(ids.length).toBeGreaterThan(8);
  for(const id of ids){await openTool(page,id);await expect(page.locator(`#tool-${id}`),`workspace ${id}`).toBeVisible();}
});

test('HUMAN-CALC-02 core calculators are operated through visible controls',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','Exact calculation walkthrough is viewport-independent.');
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});
  for(const x of [{id:'amp',run:'#run-amp',out:'#out-amp'},{id:'vd',run:'#run-vd',out:'#out-vd'},{id:'cf',run:'#run-cf',out:'#out-cf'},{id:'bf',run:'#run-bf',out:'#out-bf'}]){await openTool(page,x.id);await page.locator(x.run).click();await expect(page.locator(x.out)).toContainText('PASS');}
});

test('HUMAN-CALC-03 Electrical Tasks secondary actions remain dark, readable and reachable',async({page})=>{
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});
  await openTool(page,'tasks');
  await expect(page.locator('#et-solver-card')).toBeVisible();
  await darkReadable(page,'#et-solver-use');
  await darkReadable(page,'#et-apply-materials');
  await darkReadable(page,'#et-stage6-rename');
  await darkReadable(page,'#et-stage6-recalc');
  await darkReadable(page,'#et-stage6-refresh');
  await page.locator('#et-solver-text').fill('I need a 40A 240V single phase copper run 100 ft in EMT.');
  await page.locator('#et-solver-extract').click();
  await expect(page.locator('#et-solver-known')).not.toContainText('No supported facts');
  await page.locator('#et-solver-use').click();
  await expect(page.locator('#et-load')).not.toHaveValue('');
});

test('HUMAN-CALC-04 full electrician workflow calculate, document, save, reload, apply and update',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','Full stateful electrician journey runs once on desktop; viewport reachability is covered separately.');
  test.setTimeout(90000);
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});

  // 1. Use a normal field calculator and export the visible result as a customer-facing PDF.
  await openTool(page,'amp');
  await page.locator('#run-amp').click();
  await expect(page.locator('#out-amp')).toContainText('PASS');
  await expect(page.locator('#be-download-calc')).toBeVisible();
  let pdfConfirm='';
  page.once('dialog',async d=>{pdfConfirm=d.message();expect(d.type()).toBe('confirm');await d.accept();});
  const calcPdf=page.waitForEvent('download');
  await page.locator('#be-download-calc').click();
  const calcDownload=await calcPdf;
  expect(pdfConfirm).toContain('CURRENT calculator inputs and visible result');
  expect(calcDownload.suggestedFilename()).toMatch(/^Bruno-Electric-Calculation-.*\.pdf$/);

  // 2. Build a residential takeoff, save it without side effects, reload it, then explicitly apply it to the Job.
  await openTool(page,'res-live');
  const facts=page.locator('#tool-res-live details').filter({has:page.locator('#rl-sqft')});
  if((await facts.getAttribute('open'))===null)await facts.locator('summary').click();
  await page.locator('#rl-sqft').fill('1800');
  await page.locator('#rl-bed').fill('3');
  await page.locator('#rl-bath').fill('2');
  await page.locator('#rl-kitchen').fill('1');
  await page.locator('#rl-laundry').fill('1');
  await page.locator('#rl-sqft').dispatchEvent('input');
  await expect(page.locator('#rl-out')).not.toContainText('Live takeoff error');
  page.on('dialog',d=>d.accept());
  const before=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return(j.materialsUsed||[]).length+(j.materialsUnresolved||[]).length;},JOB_KEY);
  await page.locator('#rl-save-ux-btn').click();
  await expect(page.locator('#rl-save-state')).toContainText('SAVED · NOT APPLIED');
  expect(await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return(j.materialsUsed||[]).length+(j.materialsUnresolved||[]).length;},JOB_KEY)).toBe(before);
  await page.reload({waitUntil:'load'});
  await openTool(page,'res-live');
  await page.locator('#rl-save-archive-ux details > summary').click();
  await expect(page.locator('#rl-archive-overview')).toContainText('1800');
  await page.locator('#rl-archive-overview [data-ux-load]').first().click();
  await expect(page.locator('#rl-sqft')).toHaveValue('1800');
  await page.locator('#rl-save-ux-btn').click();
  await page.locator('#rl-apply-job-btn').click();
  await expect(page.locator('#rl-save-state')).toContainText('APPLIED TO JOB');
  const afterResidential=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));return(j.materialsUsed||[]).length+(j.materialsUnresolved||[]).length;},JOB_KEY);
  expect(afterResidential).toBeGreaterThan(before);

  // 3. Create an Electrical Task, calculate it, save, reload, build takeoff, apply, edit, and update the Job revision.
  await openTool(page,'tasks');
  await page.locator('#et-name').fill('Human Feeder');
  await fillTaskDesign(page);
  await page.locator('#et-calculate').click();
  await expect(page.locator('#et-calc-out')).toContainText('PASS');
  await expect(page.locator('#et-grounding-out')).toContainText('STAGE 4 PASS');
  await page.locator('#et-save').click();
  await expect(page.locator('#et-status')).toContainText('saved');
  await expect(page.locator('#et-stage6-status')).toContainText('SAVED');
  await page.reload({waitUntil:'load'});
  await openTool(page,'tasks');
  await expect(page.locator('#et-name')).toHaveValue('Human Feeder');
  await openTaskAdvanced(page);
  await page.locator('#et-calculate').click();
  await page.locator('#et-build-takeoff').click();
  await expect(page.locator('#et-takeoff-out')).toContainText('PASS');
  await expect(page.locator('#et-apply-materials')).toBeEnabled();
  await page.locator('#et-apply-materials').click();
  await expect(page.locator('#et-stage6-status')).toContainText('APPLIED TO JOB');
  await page.locator('#et-distance').fill('40');
  await page.locator('#et-save').click();
  await expect(page.locator('#et-stage6-status')).toContainText('CHANGED SINCE APPLY');
  await page.locator('#et-calculate').click();
  await page.locator('#et-stage6-update').click();
  await expect(page.locator('#et-stage6-message')).toContainText('Job updated from task revision');
  await expect(page.locator('#et-stage6-status')).toContainText('APPLIED TO JOB');

  const finalState=await page.evaluate(k=>{const j=JSON.parse(localStorage.getItem(k));const t=(j.electricalTasks||[]).find(x=>x.id===j.electricalTaskActiveId);return{materials:(j.materialsUsed||[]).length+(j.materialsUnresolved||[]).length,tasks:(j.electricalTasks||[]).length,revision:t&&t.revision,history:(j.electricalTaskMaterialHistory||[]).length};},JOB_KEY);
  expect(finalState.materials).toBeGreaterThan(afterResidential);
  expect(finalState.tasks).toBeGreaterThan(0);
  expect(Number(finalState.revision)).toBeGreaterThan(0);
  expect(finalState.history).toBeGreaterThan(0);
});

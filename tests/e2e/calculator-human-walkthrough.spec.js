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
async function seedJob(page){await page.addInitScript(([k,v])=>{localStorage.setItem(k,JSON.stringify(v));},[JOB_KEY,baseJob()]);}
async function openTool(page,id){const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);if(compact){const picker=page.locator('#be-tool-select');await expect(picker).toBeVisible();await picker.selectOption(id);}else{const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();}await expect(page.locator(`#tool-${id}`)).toBeVisible();}
async function darkReadable(page,selector){const s=await page.locator(selector).evaluate(el=>{const cs=getComputedStyle(el);return{bg:cs.backgroundColor,color:cs.color,display:cs.display,visibility:cs.visibility};});expect(s.display).not.toBe('none');expect(s.visibility).not.toBe('hidden');expect(s.bg).not.toBe('rgb(255, 255, 255)');expect(s.color).not.toBe('rgb(255, 255, 255)');}

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

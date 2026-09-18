const { test, expect } = require('@playwright/test');

const JOB_KEY='bruno-electric-v1';
const MODE_KEY='bruno-electric-project-mode-v1';
const PROJECT_KEY='bruno-electric-project-calculator-v1';
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
function baseJob(){return{id:'project-human-job',quote:{customer:'Project Human',jobNumber:'PC-001'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function openTool(page,id){
  const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);
  if(compact){const picker=page.locator('#be-tool-select');await expect(picker).toBeVisible();await picker.selectOption(id);}
  else{const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();}
  await expect(page.locator(`#tool-${id}`)).toBeVisible();
}
async function expectAlert(page,expected,action){
  let message='';
  page.once('dialog',async d=>{message=d.message();await d.accept();});
  await action();
  await expect.poll(()=>message).toContain(expected);
}

test.beforeEach(async({page})=>{
  errorsFor(page);
  await page.addInitScript(([j,m,p,v])=>{localStorage.setItem(j,JSON.stringify(v));localStorage.removeItem(m);localStorage.removeItem(p);},[JOB_KEY,MODE_KEY,PROJECT_KEY,baseJob()]);
});
test.afterEach(async({page},testInfo)=>{
  const rows=errorsFor(page);
  if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});
  expect(rows,rows.join('\n')).toEqual([]);
});

test('HUMAN-CALC-06 project calculator validates input and switches residential/commercial workflow like a user',async({page})=>{
  test.setTimeout(90000);
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});
  await openTool(page,'project');
  await expect(page.locator('.be-project-hub')).toBeVisible();
  await page.locator('[data-hub="quick"]').click();
  await expect(page.locator('.pc-hero')).toBeVisible();

  // Blank required area must fail closed and keep the user on Project Calculator.
  await page.locator('#pc-sqft').fill('');
  await expectAlert(page,'Enter building square footage',()=>page.locator('#pc-calculate').click());
  await expect(page.locator('#tool-project')).toBeVisible();
  expect(await page.evaluate(k=>localStorage.getItem(k),MODE_KEY)).toBeNull();

  // Negative/non-physical room count must also be rejected instead of silently normalized.
  await page.locator('#pc-sqft').fill('2100');
  await page.locator('#pc-bed').fill('-1');
  await expectAlert(page,'Room quantities must be whole numbers 0 or greater',()=>page.locator('#pc-calculate').click());
  expect(await page.evaluate(k=>localStorage.getItem(k),MODE_KEY)).toBeNull();

  // Residential path: correct the inputs and hand off into the live residential calculator.
  await page.locator('#pc-bed').fill('3');
  await page.locator('#pc-bath').fill('2');
  await page.locator('#pc-kitchen').fill('1');
  await page.locator('#pc-laundry').fill('1');
  await page.locator('#pc-calculate').click();
  await expect(page.locator('#tool-res-live')).toBeVisible();
  await expect(page.locator('#rl-sqft')).toHaveValue('2100');
  await expect(page.locator('#rl-bed')).toHaveValue('3');
  expect(await page.evaluate(k=>localStorage.getItem(k),MODE_KEY)).toBe('residential');
  const residentialSaved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),PROJECT_KEY);
  expect(residentialSaved.projectType).toBe('residential');
  expect(residentialSaved.squareFeet).toBe(2100);

  // Commercial path: residential-only tools disappear/disable, while generic tools remain usable.
  await openTool(page,'project');
  await page.locator('#pc-type').selectOption('commercial');
  await page.locator('#pc-sqft').fill('12000');
  await page.locator('#pc-bed').fill('0');
  await page.locator('#pc-bath').fill('4');
  await page.locator('#pc-office').fill('8');
  await page.locator('#pc-other').fill('6');
  await page.locator('#pc-calculate').click();
  await expect(page.locator('#pc-commercial-out')).toContainText('Commercial project started');
  await expect(page.locator('#pc-commercial-out')).toContainText('12,000 ft²');
  await expect(page.locator('#pc-commercial-out')).toContainText('cannot be determined safely');
  expect(await page.evaluate(k=>localStorage.getItem(k),MODE_KEY)).toBe('commercial');

  const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);
  if(compact){
    await expect(page.locator('#be-tool-select option[value="res-live"]')).toHaveCount(0);
    await expect(page.locator('#be-tool-select option[value="amp"]')).toHaveCount(1);
  }else{
    await expect(page.locator('#tool-nav [data-tool="res-live"]')).toBeHidden();
    await expect(page.locator('#tool-nav [data-tool="amp"]')).toBeVisible();
  }
  await page.locator('#pc-commercial-amp').click();
  await expect(page.locator('#tool-amp')).toBeVisible();
  await page.locator('#run-amp').click();
  await expect(page.locator('#out-amp')).toContainText('PASS');

  // Switching the same project back to residential restores the dwelling workflow.
  await openTool(page,'project');
  await page.locator('#pc-type').selectOption('residential');
  await page.locator('#pc-sqft').fill('2200');
  await page.locator('#pc-bed').fill('4');
  await page.locator('#pc-calculate').click();
  await expect(page.locator('#tool-res-live')).toBeVisible();
  await expect(page.locator('#rl-sqft')).toHaveValue('2200');
  expect(await page.evaluate(k=>localStorage.getItem(k),MODE_KEY)).toBe('residential');
});

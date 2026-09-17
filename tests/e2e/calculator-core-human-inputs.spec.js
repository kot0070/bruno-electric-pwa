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
function baseJob(){return{id:'core-human-job',quote:{customer:'Core Calculator Human',jobNumber:'CORE-001'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function openTool(page,id){const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);if(compact){await page.locator('#be-tool-select').selectOption(id);}else{await page.locator(`#tool-nav [data-tool="${id}"]`).click();}await expect(page.locator(`#tool-${id}`)).toBeVisible();}

test.beforeEach(async({page})=>{
  errorsFor(page);
  await page.addInitScript(([k,v])=>{localStorage.setItem(k,JSON.stringify(v));localStorage.removeItem('bruno-electric-project-mode-v1');},[JOB_KEY,baseJob()]);
});
test.afterEach(async({page},testInfo)=>{
  const rows=errorsFor(page);
  if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});
  expect(rows,rows.join('\n')).toEqual([]);
});

test('HUMAN-CALC-07 core calculators fail, recover and recalculate through visible user controls',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','Deep numeric field manipulation runs once on desktop; responsive reachability is covered separately.');
  test.setTimeout(90000);
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});

  // Ampacity: make a deliberately overloaded branch, observe FAIL, then correct the load.
  await openTool(page,'amp');
  await page.locator('#a-mat').selectOption('Cu');
  await page.locator('#a-size').selectOption('12');
  await page.locator('#a-ins').selectOption('90');
  await page.locator('#a-term').selectOption('75');
  await page.locator('#a-ccc').fill('3');
  await page.locator('#a-amb').fill('30');
  await page.locator('#a-load').fill('40');
  await page.locator('#a-cont').selectOption('0');
  await page.locator('#run-amp').click();
  await expect(page.locator('#out-amp')).toContainText('FAIL');
  await page.locator('#a-load').fill('15');
  await page.locator('#run-amp').click();
  await expect(page.locator('#out-amp')).toContainText('PASS');
  await page.locator('#a-load').fill('');
  await page.locator('#run-amp').click();
  await expect(page.locator('#out-amp')).toContainText('Input error');
  await page.locator('#a-load').fill('15');
  await page.locator('#run-amp').click();
  await expect(page.locator('#out-amp')).toContainText('PASS');

  // Voltage drop is a design-review result when above the target. Verify a poor run is REVIEW, then improve the design below target and recover to PASS.
  await openTool(page,'vd');
  await page.locator('#v-v').fill('120');
  await page.locator('#v-ph').selectOption('1');
  await page.locator('#v-m').selectOption('Cu');
  await page.locator('#v-s').selectOption('14');
  await page.locator('#v-d').fill('200');
  await page.locator('#v-i').fill('15');
  await page.locator('#v-pf').fill('1');
  await page.locator('#v-t').fill('3');
  await page.locator('#run-vd').click();
  await expect(page.locator('#out-vd')).toContainText('REVIEW');
  await expect(page.locator('#out-vd')).toContainText('15.69 %');
  await page.locator('#v-s').selectOption('6');
  await page.locator('#v-d').fill('50');
  await page.locator('#v-i').fill('10');
  await page.locator('#run-vd').click();
  await expect(page.locator('#out-vd')).toContainText('PASS');
  await expect(page.locator('#out-vd')).toContainText('0.41 %');
  await page.locator('#v-d').fill('');
  await page.locator('#run-vd').click();
  await expect(page.locator('#out-vd')).toContainText('Input error');

  // Conduit fill: manipulate actual conductor rows and quantity instead of calling calculation APIs directly.
  await openTool(page,'cf');
  await page.locator('#c-r').selectOption('EMT');
  await page.locator('#c-ts').selectOption('1/2');
  let first=page.locator('#c-rows .c-row').first();
  await first.locator('.c-size').selectOption('10');
  await first.locator('.c-qty').fill('10');
  await page.locator('#run-cf').click();
  await expect(page.locator('#out-cf')).toContainText('FAIL');
  await page.locator('#c-ts').selectOption('3/4');
  await first.locator('.c-size').selectOption('12');
  await first.locator('.c-qty').fill('3');
  await page.locator('#c-add').click();
  const second=page.locator('#c-rows .c-row').nth(1);
  await second.locator('.c-size').selectOption('14');
  await second.locator('.c-qty').fill('1');
  await page.locator('#run-cf').click();
  await expect(page.locator('#out-cf')).toContainText('PASS');
  await second.locator('.c-qty').fill('');
  await page.locator('#run-cf').click();
  await expect(page.locator('#out-cf')).toContainText('Input error');
  await second.locator('.c-qty').fill('1');
  await page.locator('#run-cf').click();
  await expect(page.locator('#out-cf')).toContainText('PASS');

  // Box fill: force insufficient box volume, recover, then prove blank volume fails closed.
  await openTool(page,'bf');
  await page.locator('#b-s').selectOption('12');
  await page.locator('#b-i').fill('4');
  await page.locator('#b-g').fill('2');
  await page.locator('#b-y').fill('1');
  await page.locator('#b-c').selectOption('1');
  await page.locator('#b-v').fill('10');
  await page.locator('#run-bf').click();
  await expect(page.locator('#out-bf')).toContainText('FAIL');
  await page.locator('#b-v').fill('30');
  await page.locator('#run-bf').click();
  await expect(page.locator('#out-bf')).toContainText('PASS');
  await page.locator('#b-v').fill('');
  await page.locator('#run-bf').click();
  await expect(page.locator('#out-bf')).toContainText('Input error');
});

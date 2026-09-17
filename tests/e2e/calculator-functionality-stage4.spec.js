const { test, expect } = require('@playwright/test');

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
function desktopOnly(testInfo){return testInfo.project.name!=='chromium-desktop';}
async function openTool(page,id){
  const button=page.locator(`#tool-nav [data-tool="${id}"]`);
  await expect(button).toBeVisible();await button.click();await expect(page.locator(`#tool-${id}`)).toBeVisible();
}
test.beforeEach(async({page})=>{errorsFor(page);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

test('STAGE4-CALC-01 core calculator UI returns exact expected results',async({page},testInfo)=>{
  test.skip(desktopOnly(testInfo),'Calculator contract is viewport-independent; run once on desktop Chromium.');
  await page.goto('/electrical-tools.html',{waitUntil:'load'});

  await openTool(page,'amp');
  await expect(page.locator('#out-amp')).toContainText('PASS');
  await expect(page.locator('#out-amp')).toContainText('Final allowable ampacity');
  await expect(page.locator('#out-amp')).toContainText('65 A');
  await expect(page.locator('#out-amp')).toContainText('Required ampacity');
  await expect(page.locator('#out-amp')).toContainText('50 A');

  await openTool(page,'vd');
  await page.locator('#run-vd').click();
  await expect(page.locator('#out-vd')).toContainText('PASS');
  await expect(page.locator('#out-vd')).toContainText('3.93 V');
  await expect(page.locator('#out-vd')).toContainText('1.64 %');

  await openTool(page,'cf');
  await page.locator('#run-cf').click();
  await expect(page.locator('#out-cf')).toContainText('PASS');
  await expect(page.locator('#out-cf')).toContainText('0.0399 in²');
  await expect(page.locator('#out-cf')).toContainText('40 %');

  await openTool(page,'bf');
  await page.locator('#run-bf').click();
  await expect(page.locator('#out-bf')).toContainText('PASS');
  await expect(page.locator('#out-bf')).toContainText('15.75 in³');
  await expect(page.locator('#out-bf')).toContainText('20.3 in³');
});

test('STAGE4-CALC-02 blank required inputs remain blank and fail closed',async({page},testInfo)=>{
  test.skip(desktopOnly(testInfo),'Calculator contract is viewport-independent; run once on desktop Chromium.');
  await page.goto('/electrical-tools.html',{waitUntil:'load'});

  await openTool(page,'amp');
  await page.locator('#a-load').fill('');
  await page.locator('#run-amp').click();
  await expect(page.locator('#out-amp')).toContainText('Input error');
  await expect(page.locator('#out-amp')).toContainText('load amps is required');

  await openTool(page,'vd');
  await page.locator('#v-i').fill('');
  await page.locator('#run-vd').click();
  await expect(page.locator('#out-vd')).toContainText('Input error');
  await expect(page.locator('#out-vd')).toContainText('current is required');

  await page.locator('#v-i').fill('40');
  await page.locator('#v-d').fill('');
  await page.locator('#run-vd').click();
  await expect(page.locator('#out-vd')).toContainText('Input error');
  await expect(page.locator('#out-vd')).toContainText('one-way distance is required');

  await page.locator('#v-d').fill('100');
  await page.locator('#v-t').fill('');
  await page.locator('#run-vd').click();
  await expect(page.locator('#out-vd')).toContainText('Calculation path');
  await expect(page.locator('#out-vd')).not.toContainText('Input error');
  await expect(page.locator('#out-vd')).toContainText('1.64 %');
});

const { test, expect } = require('@playwright/test');

const DATA_KEY='bruno-electric-dispatch-journal-v2';
const SETTINGS_KEY='bruno-electric-dispatch-settings-v2';
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

test.beforeEach(async({page})=>{
  errorsFor(page);
  await page.addInitScript(([d,s])=>{
    const guard='__bruno_helper_consistency_reset__';
    if(sessionStorage.getItem(guard)==='1')return;
    localStorage.removeItem(d);localStorage.removeItem(s);sessionStorage.setItem(guard,'1');
  },[DATA_KEY,SETTINGS_KEY]);
});

test.afterEach(async({page},testInfo)=>{
  const rows=errorsFor(page);
  if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});
  expect(rows,rows.join('\n')).toEqual([]);
});

async function openJournal(page){
  await page.goto('/index.html',{waitUntil:'load'});
  await expect(page.locator('#panel-dispatch')).toBeVisible();
  await expect(page.locator('#dj-helper-add')).toBeVisible();
}

async function helperMetric(page){
  return page.locator('.dj-metric').filter({hasText:'Helpers gross'}).locator('.v');
}
async function businessMetric(page){
  return page.locator('.dj-metric').filter({hasText:'Business net'}).locator('.v');
}

test('JOURNAL-HELPER-HUMAN-01 helper row and summary stay numerically consistent through save and reload',async({page})=>{
  await openJournal(page);

  // Disable owner reserve so the expected business-net arithmetic is transparent to a field user.
  const details=page.locator('#dj-settings-body').locator('xpath=ancestor::details[1]');
  if(!(await details.getAttribute('open')))await details.locator('summary').click();
  await page.locator('#djs-tax-enabled').uncheck();
  await page.locator('#djs-helper-enabled').uncheck();
  await page.locator('#djs-save').click();

  // Create a normal helper exactly like the mobile screenshot scenario: $20/hr x 8 h = $160/day.
  await page.locator('#dj-helper-add').click();
  await expect(page.locator('#djh-name')).toBeVisible();
  await page.locator('#djh-name').fill('Helper');
  await page.locator('#djh-mode').selectOption('hourly');
  await page.locator('#djh-rate').fill('20');
  await page.locator('#djh-hours').fill('8');
  await page.locator('#djh-tax-enabled').uncheck();
  await page.locator('#djh-active').check();
  await page.locator('#djh-days').selectOption('weekdays');
  await page.locator('#djh-save').click();

  let row=page.locator('.dj-helper').filter({hasText:'Helper'}).first();
  await expect(row).toContainText('$20.00/hr');
  await expect(row).toContainText('8 h');
  await expect(row.locator('.dj-helper-cost strong')).toContainText('-$160.00');
  await expect(await helperMetric(page)).toHaveText('-$160.00');

  // Add a completed fixed-price call so business net must equal 200 - 160 = 40.
  await page.locator('#dj-add').click();
  await page.locator('#djc-address').fill('Helper consistency job');
  await page.locator('#djc-pricing-mode').selectOption('fixed');
  await page.locator('#djc-price').fill('200');
  await page.locator('#djc-status').selectOption('completed');
  await page.locator('#djc-save').click();
  await expect(await helperMetric(page)).toHaveText('-$160.00');
  await expect(await businessMetric(page)).toHaveText('$40.00');

  // A user refresh must not produce a transient or persisted astronomical helper amount.
  await page.reload({waitUntil:'load'});
  row=page.locator('.dj-helper').filter({hasText:'Helper'}).first();
  await expect(row.locator('.dj-helper-cost strong')).toContainText('-$160.00');
  await expect(await helperMetric(page)).toHaveText('-$160.00');
  await expect(await businessMetric(page)).toHaveText('$40.00');

  const visibleMetrics=await page.locator('.dj-metric .v').allTextContents();
  expect(visibleMetrics.join(' ')).not.toMatch(/000 000 000 000|000,000,000,000|e\+\d+/i);
});

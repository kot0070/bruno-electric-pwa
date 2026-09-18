const { test, expect } = require('@playwright/test');

test.use({ locale:'uk-UA' });

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
function amount(re){return new RegExp(re.replace('.', '[,.]'))}

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
  await page.goto('/index.html#be=JOB&tab=dispatch',{waitUntil:'load'});
  await expect(page.locator('#panel-dispatch')).toBeVisible();
  await expect(page.locator('#dj-helper-add')).toBeVisible();
}

function metric(page,label){
  return page.locator('.dj-metric').filter({hasText:new RegExp('^'+label,'i')}).locator('.v');
}

test('JOURNAL-HELPER-HUMAN-01 current helper contributes exactly once to Helper and Business Net through save, period changes and reload',async({page})=>{
  await openJournal(page);
  const selectedDate=await page.locator('#dj-date').inputValue();
  expect(selectedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  // Every-day schedule makes the regression independent of the CI runner weekday.
  await page.locator('#dj-helper-add').click();
  await expect(page.locator('#djh-name')).toBeVisible();
  await page.locator('#djh-name').fill('Helper');
  await page.locator('#djh-mode').selectOption('hourly');
  await page.locator('#djh-rate').fill('20');
  await page.locator('#djh-hours').fill('8');
  await page.locator('#djh-active').check();
  await page.locator('#djh-days').selectOption('all');
  await page.locator('#djh-save').click();

  let row=page.locator('.dj-helper').filter({hasText:'Helper'}).first();
  await expect(row).toContainText(amount('20.00'));
  await expect(row).toContainText('8 h');
  await expect(row.locator('.dj-helper-cost strong')).toContainText(amount('160.00'));
  await expect(metric(page,'Helper')).toContainText(amount('160.00'));
  await expect(metric(page,'Business Net')).toContainText(amount('160.00'));

  // Period changes must use the same effective revision and multiply only by applicable days.
  await page.locator('#dj-mode').selectOption('week');
  await expect(metric(page,'Helper')).toContainText(amount('1120.00'));
  await expect(metric(page,'Business Net')).toContainText(amount('1120.00'));
  await page.locator('#dj-mode').selectOption('day');
  await expect(metric(page,'Helper')).toContainText(amount('160.00'));

  // Give observers multiple cycles; helper must not disappear or be multiplied repeatedly.
  await page.waitForTimeout(500);
  await expect(metric(page,'Helper')).toContainText(amount('160.00'));

  // Real reload must preserve helper economics and selected-current-day calculation.
  await page.reload({waitUntil:'load'});
  row=page.locator('.dj-helper').filter({hasText:'Helper'}).first();
  await expect(row.locator('.dj-helper-cost strong')).toContainText(amount('160.00'));
  await expect(metric(page,'Helper')).toContainText(amount('160.00'));
  await expect(metric(page,'Business Net')).toContainText(amount('160.00'));

  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).helpers[0],DATA_KEY);
  const active=saved.revisions.find(r=>r.from<=selectedDate&&(!r.to||r.to>=selectedDate));
  expect(active,'No active helper revision for selected journal date '+selectedDate).toBeTruthy();
  expect(active.rate).toBe(20);
  expect(active.hours).toBe(8);
  expect(active.days).toEqual([1,2,3,4,5,6,7]);
});

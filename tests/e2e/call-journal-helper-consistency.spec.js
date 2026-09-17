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
  await page.goto('/index.html',{waitUntil:'load'});
  await expect(page.locator('#panel-dispatch')).toBeVisible();
  await expect(page.locator('#dj-helper-add')).toBeVisible();
}

function helperMetric(page){
  return page.locator('.dj-metric').filter({hasText:'Helpers gross'}).locator('.v');
}

test('JOURNAL-HELPER-HUMAN-01 comma-decimal locale keeps helper row and summary numerically consistent through save edit and reload',async({page})=>{
  await openJournal(page);

  // Reproduce the reported mobile setup in a comma-decimal locale: $20/hr x 8 h = $160/day.
  await page.locator('#dj-helper-add').click();
  await expect(page.locator('#djh-name')).toBeVisible();
  await page.locator('#djh-name').fill('Helper');
  await page.locator('#djh-mode').selectOption('hourly');
  await page.locator('#djh-rate').fill('20');
  await page.locator('#djh-hours').fill('8');
  await page.locator('#djh-active').check();
  await page.locator('#djh-days').selectOption('weekdays');
  await page.locator('#djh-save').click();

  let row=page.locator('.dj-helper').filter({hasText:'Helper'}).first();
  await expect(row).toContainText(amount('20.00'));
  await expect(row).toContainText('8 h');
  await expect(row.locator('.dj-helper-cost strong')).toContainText(amount('160.00'));
  await expect(helperMetric(page)).toContainText(amount('160.00'));

  // Give the MutationObserver several patch cycles; the old defect multiplied 160 by 100 each cycle.
  await page.waitForTimeout(350);
  await expect(row.locator('.dj-helper-cost strong')).toContainText(amount('160.00'));
  await expect(helperMetric(page)).toContainText(amount('160.00'));

  // Force another render through a normal edit/save without changing the economics.
  await row.locator('[data-hedit]').click();
  await expect(page.locator('#djh-rate')).toHaveValue('20');
  await expect(page.locator('#djh-hours')).toHaveValue('8');
  await page.locator('#djh-save').click();
  row=page.locator('.dj-helper').filter({hasText:'Helper'}).first();
  await page.waitForTimeout(250);
  await expect(row.locator('.dj-helper-cost strong')).toContainText(amount('160.00'));
  await expect(helperMetric(page)).toContainText(amount('160.00'));

  // A real refresh must preserve the same helper economics and never produce an astronomical summary.
  await page.reload({waitUntil:'load'});
  row=page.locator('.dj-helper').filter({hasText:'Helper'}).first();
  await page.waitForTimeout(350);
  await expect(row.locator('.dj-helper-cost strong')).toContainText(amount('160.00'));
  await expect(helperMetric(page)).toContainText(amount('160.00'));
  const visibleMetrics=await page.locator('.dj-metric .v').allTextContents();
  expect(visibleMetrics.join(' ')).not.toMatch(/000[\s\u00a0\u202f,.]*000[\s\u00a0\u202f,.]*000|e\+\d+/i);

  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).helpers[0],DATA_KEY);
  const active=saved.revisions.find(r=>r.from<='2026-09-17'&&(!r.to||r.to>='2026-09-17'));
  expect(active.rate).toBe(20);
  expect(active.hours).toBe(8);
});

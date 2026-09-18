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
    const guard='__bruno_helper_consistency_reset_v2__';
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
  await expect(page.locator('.dj-settings')).toBeVisible();
}

async function openSettings(page){
  const details=page.locator('.dj-settings');
  await details.evaluate(el=>{el.open=true;});
  await expect(details).toHaveAttribute('open','');
  await expect(page.locator('#djs-helper-enabled')).toBeVisible();
}

function metric(page,label){
  return page.locator('.dj-metric').filter({hasText:new RegExp('^'+label,'i')}).locator('.v');
}

test('JOURNAL-HELPER-HUMAN-01 helper is configured once and counted only on dates explicitly switched ON',async({page})=>{
  await openJournal(page);
  const selectedDate=await page.locator('#dj-date').inputValue();
  expect(selectedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  await openSettings(page);
  await page.locator('#djs-helper-enabled').check();
  await page.locator('#djs-helper-name').fill('Helper');
  await page.locator('#djs-helper-mode').selectOption('hourly');
  await page.locator('#djs-helper-rate').fill('20');
  await page.locator('#djs-helper-hours').fill('8');
  await page.locator('#djs-helper-tax-enabled').uncheck();
  await page.locator('#djs-save').click();

  let row=page.locator('.dj-helper').filter({hasText:'Helper'}).first();
  await expect(row).toContainText(amount('20.00'));
  await expect(row).toContainText('8 h');
  await expect(row).toContainText('OFF today');
  await expect(row.locator('.dj-helper-cost strong')).toContainText(amount('0.00'));
  await expect(metric(page,'Helper')).toContainText(amount('0.00'));

  await page.locator('#dj-helper-worked').check();
  row=page.locator('.dj-helper').filter({hasText:'Helper'}).first();
  await expect(row).toContainText('ON today');
  await expect(row.locator('.dj-helper-cost strong')).toContainText(amount('160.00'));
  await expect(metric(page,'Helper')).toContainText(amount('160.00'));
  await expect(metric(page,'Business Net')).toContainText(amount('160.00'));

  await page.locator('#dj-mode').selectOption('week');
  await expect(metric(page,'Helper')).toContainText(amount('160.00'));
  await expect(metric(page,'Business Net')).toContainText(amount('160.00'));

  await page.locator('#dj-mode').selectOption('day');
  await page.locator('#dj-next').click();
  await expect(page.locator('.dj-helper').filter({hasText:'Helper'})).toContainText('OFF today');
  await expect(metric(page,'Helper')).toContainText(amount('0.00'));

  await page.locator('#dj-prev').click();
  await expect(page.locator('#dj-date')).toHaveValue(selectedDate);
  await expect(page.locator('#dj-helper-worked')).toBeChecked();
  await expect(metric(page,'Helper')).toContainText(amount('160.00'));

  await page.reload({waitUntil:'load'});
  await expect(page.locator('#dj-date')).toHaveValue(selectedDate);
  await expect(page.locator('#dj-helper-worked')).toBeChecked();
  await expect(metric(page,'Helper')).toContainText(amount('160.00'));

  const saved=await page.evaluate(([d,s])=>({data:JSON.parse(localStorage.getItem(d)),settings:JSON.parse(localStorage.getItem(s))}),[DATA_KEY,SETTINGS_KEY]);
  expect(saved.settings.helperEnabled).toBe(true);
  expect(saved.settings.helperRate).toBe(20);
  expect(saved.settings.helperHours).toBe(8);
  expect(saved.data.helperDays[selectedDate]).toBe(true);
  expect(saved.data.helpers).toBeUndefined();
});

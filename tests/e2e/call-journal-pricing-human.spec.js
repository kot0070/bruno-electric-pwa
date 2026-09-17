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
    const guard='__bruno_journal_pricing_test_reset__';
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
  await expect(page.locator('#dj-add')).toBeVisible();
  await expect(page.locator('#djs-service-rate')).toBeAttached();
}

async function saveInvoiceSettings(page){
  const body=page.locator('#dj-settings-body');
  const details=body.locator('xpath=ancestor::details[1]');
  if(await details.count()){if(!(await details.getAttribute('open')))await details.locator('summary').click();}
  await expect(page.locator('#djs-service-rate')).toBeVisible();
  await page.locator('#djs-service-rate').fill('175');
  await page.locator('#djs-company').fill('Bruno Electric Services LLC');
  await page.locator('#djs-address').fill('Dripping Springs, TX');
  await page.locator('#djs-phone').fill('512-555-0100');
  await page.locator('#djs-license').fill('TECL 28137');
  page.once('dialog',d=>d.accept());
  await page.locator('#djs-customer-save').click();
}

test('JOURNAL-PRICING-HUMAN-01 user can switch a service call between hourly and fixed pricing',async({page})=>{
  await openJournal(page);
  await saveInvoiceSettings(page);

  await page.locator('#dj-add').click();
  await expect(page.locator('#djc-pricing-mode')).toBeVisible();
  await page.locator('#djc-customer').fill('Pricing Customer');
  await page.locator('#djc-address').fill('500 Flexible Price Rd');
  await page.locator('#djc-call-type').selectOption('residential');
  await page.locator('#djc-pricing-mode').selectOption('hourly');
  await expect(page.locator('#djc-hourly-rate-field')).toBeVisible();
  await page.locator('#djc-hourly-rate').fill('175');
  await page.locator('#djc-hours').fill('2.5');
  await expect(page.locator('#djc-price')).toHaveValue('437.50');
  await expect(page.locator('#djc-price')).toHaveAttribute('readonly','');
  await page.locator('#djc-material-mode').selectOption('quick');
  await page.locator('#djc-material-total').fill('80');
  await page.locator('#djc-status').selectOption('completed');
  await page.locator('#djc-desc').fill('Hourly troubleshooting and repair.');
  await page.locator('#djc-save').click();

  let row=page.locator('.dj-call').filter({hasText:'500 Flexible Price Rd'}).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText('$437.50');
  await row.locator('[data-invoice]').click();
  let inv=row.locator('.dj-invoice');
  await expect(inv).toContainText('Hourly');
  await expect(inv).toContainText('2.50 h');
  await expect(inv).toContainText('$175.00/hr');
  await expect(inv).toContainText('Service / job price');
  await expect(inv).toContainText('$437.50');
  await expect(inv).toContainText('Included materials reference');
  await expect(inv).toContainText('$80.00');
  await expect(inv).toContainText('Amount due');
  await expect(inv).toContainText('$437.50');

  let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls.find(c=>c.address==='500 Flexible Price Rd'),DATA_KEY);
  expect(saved.pricingMode).toBe('hourly');
  expect(saved.hourlyRateApplied).toBe(175);
  expect(saved.price).toBe(437.5);

  await page.reload({waitUntil:'load'});
  row=page.locator('.dj-call').filter({hasText:'500 Flexible Price Rd'}).first();
  await expect(row).toBeVisible();
  await row.locator('[data-edit]').click();
  await expect(page.locator('#djc-pricing-mode')).toHaveValue('hourly');
  await expect(page.locator('#djc-hourly-rate')).toHaveValue('175');
  await expect(page.locator('#djc-price')).toHaveValue('437.5');

  await page.locator('#djc-pricing-mode').selectOption('fixed');
  await expect(page.locator('#djc-hourly-rate-field')).toBeHidden();
  await expect(page.locator('#djc-price')).not.toHaveAttribute('readonly','');
  await page.locator('#djc-price').fill('525');
  await page.locator('#djc-desc').fill('Converted to agreed fixed job price.');
  await page.locator('#djc-save').click();

  row=page.locator('.dj-call').filter({hasText:'500 Flexible Price Rd'}).first();
  await expect(row).toContainText('$525.00');
  await row.locator('[data-invoice]').click();
  inv=row.locator('.dj-invoice');
  await expect(inv).toContainText('Fixed job price');
  await expect(inv).toContainText('$525.00');
  await expect(inv).toContainText('Included materials reference');
  await expect(inv).toContainText('$80.00');
  await expect(inv).toContainText('Amount due');
  await expect(inv).toContainText('$525.00');

  saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls.find(c=>c.address==='500 Flexible Price Rd'),DATA_KEY);
  expect(saved.pricingMode).toBe('fixed');
  expect(saved.hourlyRateApplied).toBeNull();
  expect(saved.price).toBe(525);

  const downloadPromise=page.waitForEvent('download');
  await row.locator('[data-pdf]').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Bruno-Electric-SC-.*\.pdf$/);
});

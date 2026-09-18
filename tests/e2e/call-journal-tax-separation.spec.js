const { test, expect } = require('@playwright/test');

const DATA_KEY='bruno-electric-dispatch-journal-v2';
const SETTINGS_KEY='bruno-electric-dispatch-settings-v2';
const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);page.on('pageerror',e=>rows.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'){const text=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(text))rows.push('console.error: '+text);}});page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))rows.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});return rows;}
function amount(v){return new RegExp(String(v).replace('.', '[,.]'))}

test.beforeEach(async({page})=>{errorsFor(page);await page.addInitScript(([d,s])=>{const guard='__bruno_tax_separation_reset__';if(sessionStorage.getItem(guard)==='1')return;localStorage.removeItem(d);localStorage.removeItem(s);sessionStorage.setItem(guard,'1');},[DATA_KEY,SETTINGS_KEY]);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

async function openJournal(page){await page.goto('/index.html',{waitUntil:'load'});await expect(page.locator('#panel-dispatch')).toBeVisible();await expect(page.locator('#dj-add')).toBeVisible();await expect(page.locator('#djs-service-rate')).toBeAttached();await expect(page.locator('#djs-business-reserve')).toBeAttached();await expect.poll(()=>page.evaluate(()=>!!window.BrunoCustomerInvoicePatch)).toBe(true);}
async function settings(page){const details=page.locator('#dj-settings-body').locator('xpath=ancestor::details[1]');if(await details.count()&&!(await details.getAttribute('open')))await details.locator('summary').click();await page.locator('#djs-business-reserve').fill('20');await page.locator('#djs-commercial-tax').fill('8.25');await page.locator('#djs-address').fill('Dripping Springs, TX');await page.locator('#djs-phone').fill('512-555-0100');await page.locator('#djs-license').fill('TECL 28137');page.once('dialog',d=>d.accept());await page.locator('#djs-customer-save').click();await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)).ownerTaxPct,SETTINGS_KEY)).toBe(20);}
function metric(page,label){return page.locator('.dj-metric').filter({hasText:label}).locator('.v')}
async function preview(page,address){const row=page.locator('.dj-call').filter({hasText:address}).first();await row.locator('[data-invoice]').click();await expect(page.locator('#be-doc-preview')).toBeVisible();return page.locator('#be-doc-preview-paper')}
async function close(page){await page.locator('#be-preview-close-bottom').click();await expect(page.locator('#be-doc-preview')).toBeHidden()}
function invoiceRow(page,label){return page.locator('#be-doc-preview-paper .be-doc-row').filter({has:page.locator('span',{hasText:label})})}

test('JOURNAL-TAX-SEPARATION-01 reserve always tracks business while customer sales tax follows Texas service treatment',async({page})=>{
  await openJournal(page);await settings(page);
  await page.locator('#dj-add').click();
  await page.locator('#djc-address').fill('Tax Separation Test');
  await page.locator('#djc-price').fill('400');
  await page.locator('#djc-hours').fill('2');
  await page.locator('#djc-call-type').selectOption('residential');
  await expect(page.locator('#djc-invoice-charge-tax')).toBeVisible();
  await expect(page.locator('.be-customer-tax-toggle')).toContainText('Show residential tax treatment note');
  await expect(page.locator('#djc-invoice-charge-tax')).not.toBeChecked();
  await page.locator('#djc-status').selectOption('completed');
  await page.locator('#djc-save').click();

  await expect(metric(page,'Gross earned')).toContainText(amount('400.00'));
  await expect(metric(page,'Tax reserve')).toContainText(amount('80.00'));
  await expect(metric(page,'Business net')).toContainText(amount('320.00'));
  let paper=await preview(page,'Tax Separation Test');
  await expect(invoiceRow(page,'Sales tax')).toBeHidden();
  await expect(invoiceRow(page,'Amount due')).toContainText(amount('400.00'));
  await expect(page.locator('#be-residential-tax-treatment')).toHaveCount(0);
  await close(page);

  // Residential lump-sum option controls disclosure only; it must never add 8.25% to the full service price.
  let row=page.locator('.dj-call').filter({hasText:'Tax Separation Test'}).first();
  await row.locator('[data-edit]').click();
  await page.locator('#djc-invoice-charge-tax').check();
  await page.locator('#djc-save').click();
  await expect.poll(()=>page.evaluate(k=>{const c=JSON.parse(localStorage.getItem(k)).calls[0];return [c.invoiceChargeSalesTax,c.invoiceShowTaxTreatment,c.customerSalesTaxPctApplied];},DATA_KEY)).toEqual([false,true,0]);

  await expect(metric(page,'Gross earned')).toContainText(amount('400.00'));
  await expect(metric(page,'Tax reserve')).toContainText(amount('80.00'));
  await expect(metric(page,'Business net')).toContainText(amount('320.00'));
  paper=await preview(page,'Tax Separation Test');
  await expect(invoiceRow(page,'Sales tax')).toBeHidden();
  await expect(page.locator('#be-residential-tax-treatment')).toContainText('Not separately charged');
  await expect(invoiceRow(page,'Amount due')).toContainText(amount('400.00'));
  await close(page);

  // Commercial repair/remodel charges customer sales tax automatically while internal reserve remains independent.
  row=page.locator('.dj-call').filter({hasText:'Tax Separation Test'}).first();
  await row.locator('[data-edit]').click();
  await page.locator('#djc-call-type').selectOption('commercial_repair');
  await expect(page.locator('#djc-invoice-charge-tax')).toBeChecked();
  await expect(page.locator('#djc-invoice-charge-tax')).toBeDisabled();
  await page.locator('#djc-save').click();
  await expect(metric(page,'Tax reserve')).toContainText(amount('80.00'));
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls[0],DATA_KEY);
  expect(saved.callType).toBe('commercial_repair');
  expect(saved.invoiceChargeSalesTax).toBe(true);
  expect(saved.customerSalesTaxPctApplied).toBe(8.25);

  paper=await preview(page,'Tax Separation Test');
  await expect(invoiceRow(page,'Sales tax')).toBeVisible();
  await expect(invoiceRow(page,'Sales tax')).toContainText('8.25%');
  await expect(invoiceRow(page,'Sales tax')).toContainText(amount('33.00'));
  await expect(invoiceRow(page,'Amount due')).toContainText(amount('433.00'));
});

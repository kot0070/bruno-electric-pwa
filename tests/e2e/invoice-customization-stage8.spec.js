const { test, expect } = require('@playwright/test');
const fs=require('fs');

const DATA_KEY='bruno-electric-dispatch-journal-v2';
const SETTINGS_KEY='bruno-electric-dispatch-settings-v2';
const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);page.on('pageerror',e=>rows.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'){const text=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(text))rows.push('console.error: '+text);}});page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))rows.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});return rows;}
test.beforeEach(async({page})=>{errorsFor(page);await page.addInitScript(([d,s])=>{localStorage.removeItem(d);localStorage.removeItem(s);},[DATA_KEY,SETTINGS_KEY]);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

async function openJournal(page){await page.goto('/index.html',{waitUntil:'load'});await expect(page.locator('#panel-dispatch')).toBeVisible();await expect(page.locator('#dj-add')).toBeVisible();await expect(page.locator('#djs-service-rate')).toBeAttached();await expect.poll(()=>page.evaluate(()=>!!window.BrunoCustomerInvoicePatch)).toBe(true);}
async function fillCompany(page){const details=page.locator('#dj-settings-body').locator('xpath=ancestor::details[1]');if(await details.count())if(!(await details.getAttribute('open')))await details.locator('summary').click();await page.locator('#djs-address').fill('Dripping Springs, TX');await page.locator('#djs-phone').fill('512-555-0100');await page.locator('#djs-license').fill('TECL 28137');await page.locator('#djs-commercial-tax').fill('8.25');page.once('dialog',d=>d.accept());await page.locator('#djs-customer-save').click();}
async function preview(page,address){const row=page.locator('.dj-call').filter({hasText:address}).first();await expect(row).toBeVisible();await row.locator('[data-invoice]').click();await expect(page.locator('#be-doc-preview')).toBeVisible();await expect(page.locator('#be-doc-preview-heading')).toHaveText('Service invoice preview');return page.locator('#be-doc-preview-paper');}
async function pdfText(page){const p=page.waitForEvent('download');await page.locator('#be-preview-download').click();const d=await p,path=await d.path();return fs.readFileSync(path,'utf8');}
function row(page,label){return page.locator('#be-doc-preview-paper .be-doc-row').filter({has:page.locator('span',{hasText:label})});}

test('STAGE8-INVOICE-01 invoice rows are conditional and commercial repair tax is visibly calculated',async({page})=>{
  await openJournal(page);await fillCompany(page);
  await page.locator('#dj-add').click();
  await expect(page.locator('#djc-invoice-show-materials')).toBeVisible();
  await page.locator('#djc-address').fill('Invoice UX Test');
  await page.locator('#djc-price').fill('200');
  await page.locator('#djc-hours').fill('1');
  await page.locator('#djc-call-type').selectOption('residential');
  await page.locator('#djc-material-mode').selectOption('quick');
  await page.locator('#djc-material-total').fill('50');
  await expect(page.locator('#djc-tool-pct')).toBeHidden();
  await expect(page.locator('.be-invoice-tax-note')).toContainText('not charged');
  await expect(page.locator('#djc-invoice-show-materials')).not.toBeChecked();
  await page.locator('#djc-status').selectOption('completed');
  await page.locator('#djc-save').click();
  await expect.poll(()=>page.evaluate(k=>{const d=JSON.parse(localStorage.getItem(k)||'{}');return d.calls&&d.calls[0]&&d.calls[0].invoiceShowMaterials;},DATA_KEY)).toBe(false);

  let paper=await preview(page,'Invoice UX Test');
  await expect(row(page,'Included materials reference')).toBeHidden();
  await expect(row(page,'Tool / consumables')).toBeHidden();
  await expect(row(page,'Sales tax')).toBeHidden();
  await expect(row(page,'Amount due')).toContainText('$200.00');
  let text=await pdfText(page);
  expect(text).toContain('AMOUNT DUE: $200.00');
  expect(text).not.toContain('Included materials reference');
  expect(text).not.toContain('Tool / consumables');
  expect(text).not.toContain('sales tax');
  expect(text).toContain('Texas Department of Licensing and Regulation');
  await page.locator('#be-preview-close-bottom').click();

  const callRow=page.locator('.dj-call').filter({hasText:'Invoice UX Test'}).first();await callRow.locator('[data-edit]').click();
  await expect(page.locator('#djc-invoice-show-materials')).toBeVisible();
  await page.locator('#djc-call-type').selectOption('commercial_repair');
  await page.locator('#djc-invoice-show-materials').check();
  await expect(page.locator('.be-invoice-tax-note')).toContainText('8.25%');
  await expect(page.locator('.be-invoice-tax-note')).toContainText('$16.50');
  await expect(page.locator('.be-invoice-tax-note')).toContainText('$216.50');
  await page.locator('#djc-save').click();
  await expect.poll(()=>page.evaluate(k=>{const d=JSON.parse(localStorage.getItem(k));const c=d.calls[0];return [c.callType,c.taxPctApplied,c.invoiceShowMaterials];},DATA_KEY)).toEqual(['commercial_repair',8.25,true]);

  paper=await preview(page,'Invoice UX Test');
  await expect(row(page,'Included materials reference')).toBeVisible();
  await expect(row(page,'Included materials reference')).toContainText('$50.00');
  await expect(row(page,'Tool / consumables')).toBeHidden();
  await expect(row(page,'Sales tax')).toBeVisible();
  await expect(row(page,'Sales tax')).toContainText('8.25%');
  await expect(row(page,'Sales tax')).toContainText('$16.50');
  await expect(row(page,'Amount due')).toContainText('$216.50');
  text=await pdfText(page);
  expect(text).toContain('Included materials reference: $50.00');
  expect(text).toContain('sales tax (8.25%): $16.50');
  expect(text).not.toContain('Tool / consumables');
});
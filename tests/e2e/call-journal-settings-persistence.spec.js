const { test, expect } = require('@playwright/test');

const DATA_KEY='bruno-electric-dispatch-journal-v2';
const SETTINGS_KEY='bruno-electric-dispatch-settings-v2';

function amount(v){return new RegExp(String(v).replace('.', '[,.]'))}

test.beforeEach(async({page})=>{
  await page.addInitScript(([d,s])=>{localStorage.removeItem(d);localStorage.removeItem(s)},[DATA_KEY,SETTINGS_KEY]);
});

test('JOURNAL-SETTINGS-PERSIST-01 settings survive reload and commercial invoice uses saved rate',async({page})=>{
  await page.goto('/index.html',{waitUntil:'load'});
  await expect(page.locator('#panel-dispatch')).toBeVisible();
  const details=page.locator('#dj-settings-body').locator('xpath=ancestor::details[1]');
  if(!(await details.getAttribute('open')))await details.locator('summary').click();

  await page.locator('#djs-business-reserve').fill('17');
  await page.locator('#djs-commercial-tax').fill('10');
  await page.locator('#djs-address').fill('123 Test St, Dripping Springs, TX');
  await page.locator('#djs-phone').fill('512-555-0100');
  page.once('dialog',d=>d.accept());
  await page.locator('#djs-customer-save').click();

  await expect.poll(()=>page.evaluate(k=>{
    const s=JSON.parse(localStorage.getItem(k)||'{}');
    return [s.businessReservePct,s.ownerTaxPct,s.commercialTaxPct,s.invoiceAddress,s.invoicePhone];
  },SETTINGS_KEY)).toEqual([17,17,10,'123 Test St, Dripping Springs, TX','512-555-0100']);

  await page.locator('#dj-add').click();
  await page.locator('#djc-address').fill('Commercial Tax Test');
  await page.locator('#djc-price').fill('400');
  await page.locator('#djc-hours').fill('2');
  await page.locator('#djc-call-type').selectOption('commercial_repair');
  await page.locator('#djc-status').selectOption('completed');
  await page.locator('#djc-save').click();

  const row=page.locator('.dj-call').filter({hasText:'Commercial Tax Test'}).first();
  await row.locator('[data-invoice]').click();
  await expect(page.locator('#be-doc-preview')).toBeVisible();
  const taxRow=page.locator('#be-doc-preview-paper .be-doc-row').filter({hasText:'Sales tax'});
  await expect(taxRow).toContainText('10.00%');
  await expect(taxRow).toContainText(amount('40.00'));
  await expect(page.locator('#be-doc-preview-paper .be-doc-row').filter({hasText:'Amount due'})).toContainText(amount('440.00'));
  await page.locator('#be-preview-close-bottom').click();

  await page.reload({waitUntil:'load'});
  await expect(page.locator('#djs-business-reserve')).toHaveValue('17');
  await expect(page.locator('#djs-commercial-tax')).toHaveValue('10');
});
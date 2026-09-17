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
    const guard='__bruno_journal_materials_test_reset__';
    if(sessionStorage.getItem(guard)==='1')return;
    localStorage.removeItem(d);localStorage.removeItem(s);sessionStorage.setItem(guard,'1');
  },[DATA_KEY,SETTINGS_KEY]);
});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

async function openJournal(page){
  await page.goto('/index.html',{waitUntil:'load'});
  await expect(page.locator('#panel-dispatch')).toBeVisible();
  await expect(page.locator('#dj-add')).toBeVisible();
  await expect(page.locator('#djs-service-rate')).toBeAttached();
}
async function addQuickCall(page,{address='100 Main St',price='100',materials='25',tool=true,type='residential',status='completed'}={}){
  await page.locator('#dj-add').click();
  await expect(page.locator('#djc-call-type')).toBeVisible();
  await page.locator('#djc-address').fill(address);
  await page.locator('#djc-hours').fill('1.5');
  await page.locator('#djc-price').fill(price);
  await page.locator('#djc-call-type').selectOption(type);
  await page.locator('#djc-material-mode').selectOption('quick');
  await page.locator('#djc-material-total').fill(materials);
  if(tool){await page.locator('#djc-tool-enabled').check();await page.locator('#djc-tool-pct').fill('5');}
  await page.locator('#djc-status').selectOption(status);
  await page.locator('#djc-desc').fill('Service call with replacement parts');
  await page.locator('#djc-save').click();
  await expect.poll(()=>page.evaluate(k=>{const d=JSON.parse(localStorage.getItem(k));return d&&d.calls&&d.calls[0]&&d.calls[0].includedMaterialsTotal;},DATA_KEY)).toBe(Number(materials));
}

test('JOURNAL-MATERIALS-01 residential materials are included, not added to customer total',async({page})=>{
  await openJournal(page);await addQuickCall(page);
  const row=page.locator('.dj-call').filter({hasText:'100 Main St'}).first();
  await expect(row).toContainText('$105.00');
  await row.locator('[data-invoice]').click();
  const inv=row.locator('.dj-invoice');await expect(inv).toBeVisible();
  await expect(inv).toContainText('Service / job price');await expect(inv).toContainText('$100.00');
  await expect(inv).toContainText('Included materials reference');await expect(inv).toContainText('$25.00');
  await expect(inv).toContainText('Tool / consumables');await expect(inv).toContainText('$5.00');
  await expect(inv).toContainText('Sales tax · 0.00%');
  await expect(inv).toContainText('Amount due');await expect(inv).toContainText('$105.00');
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls[0],DATA_KEY);
  expect(saved.materialsTotal).toBe(0);expect(saved.includedMaterialsTotal).toBe(25);expect(saved.taxPctApplied).toBe(0);expect(saved.toolFeeEnabled).toBe(true);
});

test('JOURNAL-MATERIALS-02 itemized included materials persist without increasing service price',async({page})=>{
  await openJournal(page);await addQuickCall(page);
  let row=page.locator('.dj-call').filter({hasText:'100 Main St'}).first();await row.locator('[data-edit]').click();
  await expect(page.locator('#djc-call-type')).toBeVisible();
  await page.locator('#djc-material-mode').selectOption('itemized');
  const first=page.locator('#djc-material-items .dj-material-row').first();
  await first.locator('.djm-name').fill('20A breaker');await first.locator('.djm-qty').fill('2');await first.locator('.djm-unit').fill('12.50');
  await page.locator('#djc-material-add').click();
  const second=page.locator('#djc-material-items .dj-material-row').nth(1);
  await second.locator('.djm-name').fill('THHN wire');await second.locator('.djm-qty').fill('10');await second.locator('.djm-unit').fill('1.50');
  await page.locator('#djc-save').click();
  await expect.poll(()=>page.evaluate(k=>{const c=JSON.parse(localStorage.getItem(k)).calls[0];return c.includedMaterialItems&&c.includedMaterialItems.length;},DATA_KEY)).toBe(2);
  row=page.locator('.dj-call').filter({hasText:'100 Main St'}).first();await expect(row).toContainText('$105.00');
  await row.locator('[data-invoice]').click();const inv=row.locator('.dj-invoice');await expect(inv).toBeVisible();
  await expect(inv).toContainText('Included materials reference');await expect(inv).toContainText('$40.00');
  await expect(inv).toContainText('Amount due');await expect(inv).toContainText('$105.00');
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls[0],DATA_KEY);
  expect(saved.materialsTotal).toBe(0);expect(saved.materialItems).toHaveLength(0);expect(saved.includedMaterialItems).toHaveLength(2);
});

test('JOURNAL-MATERIALS-03 scheduled call preview excludes included materials and is not earned',async({page})=>{
  await openJournal(page);await addQuickCall(page,{address:'Scheduled Job',price:'200',materials:'50',tool:false,status:'scheduled'});
  const row=page.locator('.dj-call').filter({hasText:'Scheduled Job'}).first();await expect(row).toContainText('invoice preview');await expect(row).toContainText('$200.00');
  const gross=page.locator('.dj-metric').filter({hasText:'Gross earned'});await expect(gross).toContainText('$0.00');
});

test('JOURNAL-TAX-01 commercial repair defaults to editable 8.25 percent sales tax',async({page})=>{
  await openJournal(page);await addQuickCall(page,{address:'Commercial Repair',price:'200',materials:'50',tool:false,type:'commercial_repair'});
  const row=page.locator('.dj-call').filter({hasText:'Commercial Repair'}).first();await row.locator('[data-invoice]').click();const inv=row.locator('.dj-invoice');await expect(inv).toBeVisible();
  await expect(inv).toContainText('Sales tax · 8.25%');await expect(inv).toContainText('$16.50');await expect(inv).toContainText('Amount due');await expect(inv).toContainText('$216.50');
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls[0],DATA_KEY);expect(saved.callType).toBe('commercial_repair');expect(saved.taxPctApplied).toBe(8.25);
});

test('JOURNAL-HUMAN-01 complete service-call workflow through visible UI, reload, edit, invoice and PDF',async({page})=>{
  await openJournal(page);

  const settingsBody=page.locator('#dj-settings-body');
  const details=settingsBody.locator('xpath=ancestor::details[1]');
  if(await details.count()){if(!(await details.getAttribute('open')))await details.locator('summary').click();}
  await expect(page.locator('#djs-service-rate')).toBeVisible();
  await page.locator('#djs-service-rate').fill('175');
  await page.locator('#djs-commercial-tax').fill('8.25');
  await page.locator('#djs-company').fill('Bruno Electric Services LLC');
  await page.locator('#djs-address').fill('Dripping Springs, TX');
  await page.locator('#djs-phone').fill('512-555-0100');
  await page.locator('#djs-license').fill('TECL 28137');
  await page.locator('#djs-email').fill('service@example.com');
  page.once('dialog',d=>d.accept());
  await page.locator('#djs-customer-save').click();

  await page.locator('#dj-add').click();
  await expect(page.locator('#djc-call-type')).toBeVisible();
  await page.locator('#djc-customer').fill('Live Customer');
  await page.locator('#djc-address').fill('175 Live Oak Rd');
  await page.locator('#djc-call-type').selectOption('residential');
  await page.locator('#djc-pricing-mode').selectOption('hourly');
  await expect(page.locator('#djc-hourly-rate-field')).toBeVisible();
  await page.locator('#djc-hourly-rate').fill('175');
  await page.locator('#djc-hours').fill('2');
  await expect(page.locator('#djc-price')).toHaveValue('350.00');
  await page.locator('#djc-material-mode').selectOption('quick');
  await page.locator('#djc-material-total').fill('62.50');
  await page.locator('#djc-tool-enabled').check();
  await page.locator('#djc-tool-pct').fill('3');
  await page.locator('#djc-status').selectOption('completed');
  await page.locator('#djc-desc').fill('Diagnose failed circuit and replace damaged breaker.');
  await page.locator('#djc-save').click();

  let row=page.locator('.dj-call').filter({hasText:'175 Live Oak Rd'}).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText('$360.50');
  await row.locator('[data-invoice]').click();
  let inv=row.locator('.dj-invoice');
  await expect(inv).toContainText('Hourly');
  await expect(inv).toContainText('2.00 h');
  await expect(inv).toContainText('$175.00/hr');
  await expect(inv).toContainText('Service / job price');
  await expect(inv).toContainText('$350.00');
  await expect(inv).toContainText('Included materials reference');
  await expect(inv).toContainText('$62.50');
  await expect(inv).toContainText('Tool / consumables');
  await expect(inv).toContainText('$10.50');
  await expect(inv).toContainText('Sales tax · 0.00%');
  await expect(inv).toContainText('Amount due');
  await expect(inv).toContainText('$360.50');

  await page.reload({waitUntil:'load'});
  row=page.locator('.dj-call').filter({hasText:'175 Live Oak Rd'}).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText('$360.50');
  await row.locator('[data-edit]').click();
  await expect(page.locator('#djc-customer')).toHaveValue('Live Customer');
  await expect(page.locator('#djc-pricing-mode')).toHaveValue('hourly');
  await expect(page.locator('#djc-hourly-rate')).toHaveValue('175');
  await expect(page.locator('#djc-material-total')).toHaveValue('62.5');
  await page.locator('#djc-call-type').selectOption('commercial_repair');
  await page.locator('#djc-material-mode').selectOption('itemized');
  const first=page.locator('#djc-material-items .dj-material-row').first();
  await first.locator('.djm-name').fill('2-pole breaker');
  await first.locator('.djm-qty').fill('1');
  await first.locator('.djm-unit').fill('42.50');
  await page.locator('#djc-material-add').click();
  const second=page.locator('#djc-material-items .dj-material-row').nth(1);
  await second.locator('.djm-name').fill('THHN');
  await second.locator('.djm-qty').fill('20');
  await second.locator('.djm-unit').fill('1');
  await page.locator('#djc-desc').fill('Commercial troubleshooting and breaker replacement.');
  await page.locator('#djc-save').click();

  row=page.locator('.dj-call').filter({hasText:'175 Live Oak Rd'}).first();
  await row.locator('[data-invoice]').click();
  inv=row.locator('.dj-invoice');
  await expect(inv).toContainText('Included materials reference');
  await expect(inv).toContainText('$62.50');
  await expect(inv).toContainText('Sales tax · 8.25%');
  await expect(inv).toContainText('$29.74');
  await expect(inv).toContainText('Amount due');
  await expect(inv).toContainText('$390.24');

  const downloadPromise=page.waitForEvent('download');
  await row.locator('[data-pdf]').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Bruno-Electric-SC-.*\.pdf$/);

  const persisted=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls.find(c=>c.address==='175 Live Oak Rd'),DATA_KEY);
  expect(persisted.customer).toBe('Live Customer');
  expect(persisted.callType).toBe('commercial_repair');
  expect(persisted.pricingMode).toBe('hourly');
  expect(persisted.hourlyRateApplied).toBe(175);
  expect(persisted.includedMaterialsMode).toBe('itemized');
  expect(persisted.includedMaterialItems).toHaveLength(2);
  expect(persisted.taxPctApplied).toBe(8.25);
});

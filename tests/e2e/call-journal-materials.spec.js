const { test, expect } = require('@playwright/test');

const DATA_KEY='bruno-electric-dispatch-journal-v2';
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
test.beforeEach(async({page})=>{errorsFor(page);await page.addInitScript(k=>localStorage.removeItem(k),DATA_KEY);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

async function openJournal(page){await page.goto('/index.html',{waitUntil:'load'});await expect(page.locator('#panel-dispatch')).toBeVisible();await expect(page.locator('#dj-add')).toBeVisible();}

async function addQuickCall(page){
  await page.locator('#dj-add').click();
  await page.locator('#djc-address').fill('100 Main St');
  await page.locator('#djc-hours').fill('1.5');
  await page.locator('#djc-price').fill('100');
  await page.locator('#djc-material-mode').selectOption('quick');
  await page.locator('#djc-material-total').fill('25');
  await page.locator('#djc-tool-enabled').check();
  await page.locator('#djc-tool-pct').fill('5');
  await page.locator('#djc-desc').fill('Service call with replacement parts');
  await page.locator('#djc-save').click();
}

test('JOURNAL-MATERIALS-01 quick materials and tool fee create a mini invoice',async({page})=>{
  await openJournal(page);await addQuickCall(page);
  const row=page.locator('.dj-call').filter({hasText:'100 Main St'}).first();
  await expect(row).toContainText('materials $25.00');
  await expect(row).toContainText('$130.00');
  await row.locator('[data-invoice]').click();
  const inv=row.locator('.dj-invoice');await expect(inv).toBeVisible();
  await expect(inv).toContainText('Service / labor');await expect(inv).toContainText('$100.00');
  await expect(inv).toContainText('Materials');await expect(inv).toContainText('$25.00');
  await expect(inv).toContainText('Tool / consumables · 5%');await expect(inv).toContainText('$5.00');
  await expect(inv).toContainText('Mini invoice total');await expect(inv).toContainText('$130.00');
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls[0],DATA_KEY);
  expect(saved.materialsMode).toBe('quick');expect(saved.materialsTotal).toBe(25);expect(saved.toolFeeEnabled).toBe(true);expect(saved.toolFeePct).toBe(5);
});

test('JOURNAL-MATERIALS-02 itemized materials persist and recalculate invoice total',async({page})=>{
  await openJournal(page);await addQuickCall(page);
  let row=page.locator('.dj-call').filter({hasText:'100 Main St'}).first();await row.locator('[data-edit]').click();
  await page.locator('#djc-material-mode').selectOption('itemized');
  const first=page.locator('#djc-material-items .dj-material-row').first();
  await first.locator('.djm-name').fill('20A breaker');await first.locator('.djm-qty').fill('2');await first.locator('.djm-unit').fill('12.50');
  await page.locator('#djc-material-add').click();
  const second=page.locator('#djc-material-items .dj-material-row').nth(1);
  await second.locator('.djm-name').fill('THHN wire');await second.locator('.djm-qty').fill('10');await second.locator('.djm-unit').fill('1.50');
  await page.locator('#djc-save').click();
  row=page.locator('.dj-call').filter({hasText:'100 Main St'}).first();
  await expect(row).toContainText('materials $40.00');await expect(row).toContainText('$145.00');
  await row.locator('[data-invoice]').click();const inv=row.locator('.dj-invoice');await expect(inv).toBeVisible();
  await expect(inv).toContainText('20A breaker · 2 × $12.50 = $25.00');
  await expect(inv).toContainText('THHN wire · 10 × $1.50 = $15.00');
  await expect(inv).toContainText('Mini invoice total');await expect(inv).toContainText('$145.00');
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls[0],DATA_KEY);
  expect(saved.materialsMode).toBe('itemized');expect(saved.materialItems).toHaveLength(2);
});

test('JOURNAL-MATERIALS-03 scheduled call shows invoice preview but is not earned',async({page})=>{
  await openJournal(page);
  await page.locator('#dj-add').click();await page.locator('#djc-address').fill('Scheduled Job');await page.locator('#djc-price').fill('200');await page.locator('#djc-material-total').fill('50');await page.locator('#djc-status').selectOption('scheduled');await page.locator('#djc-save').click();
  const row=page.locator('.dj-call').filter({hasText:'Scheduled Job'}).first();await expect(row).toContainText('invoice preview');await expect(row).toContainText('$250.00');
  const gross=page.locator('.dj-metric').filter({hasText:'Gross earned'});await expect(gross).toContainText('$0.00');
});

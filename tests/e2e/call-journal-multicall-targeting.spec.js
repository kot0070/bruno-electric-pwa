const { test, expect } = require('@playwright/test');

const DATA_KEY='bruno-electric-dispatch-journal-v2';
const SETTINGS_KEY='bruno-electric-dispatch-settings-v2';
const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);page.on('pageerror',e=>rows.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'){const text=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(text))rows.push('console.error: '+text);}});page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))rows.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});return rows;}

test.beforeEach(async({page})=>{errorsFor(page);await page.addInitScript(([d,s])=>{const guard='__bruno_multicall_targeting_reset__';if(sessionStorage.getItem(guard)==='1')return;localStorage.removeItem(d);localStorage.removeItem(s);sessionStorage.setItem(guard,'1');},[DATA_KEY,SETTINGS_KEY]);});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

async function openJournal(page){await page.goto('/index.html',{waitUntil:'load'});await expect(page.locator('#panel-dispatch')).toBeVisible();await expect(page.locator('#dj-add')).toBeVisible();await expect.poll(()=>page.evaluate(()=>!!window.BrunoCustomerInvoicePatch)).toBe(true);}
async function addCall(page,description,showMaterials){await page.locator('#dj-add').click();await expect(page.locator('#djc-invoice-show-materials')).toBeVisible();await page.locator('#djc-time').fill('10:00');await page.locator('#djc-address').fill('100 Same Address Rd');await page.locator('#djc-desc').fill(description);await page.locator('#djc-price').fill('200');await page.locator('#djc-material-mode').selectOption('quick');await page.locator('#djc-material-total').fill('25');if(showMaterials)await page.locator('#djc-invoice-show-materials').check();await page.locator('#djc-status').selectOption('completed');await page.locator('#djc-save').click();await expect(page.locator('.dj-call').filter({hasText:description})).toBeVisible();}

test('JOURNAL-MULTICALL-01 duplicate date time address calls keep invoice customization bound to the clicked call id',async({page})=>{
  await openJournal(page);
  await addCall(page,'Collision call A',false);
  await addCall(page,'Collision call B',true);

  let rows=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls.map(c=>({id:c.id,description:c.description,date:c.date,time:c.time,address:c.address,invoiceShowMaterials:c.invoiceShowMaterials})),DATA_KEY);
  expect(rows).toHaveLength(2);
  expect(rows[0].id).not.toBe(rows[1].id);
  expect(rows[0].date).toBe(rows[1].date);
  expect(rows[0].time).toBe(rows[1].time);
  expect(rows[0].address).toBe(rows[1].address);
  expect(rows.find(c=>c.description==='Collision call A').invoiceShowMaterials).toBe(false);
  expect(rows.find(c=>c.description==='Collision call B').invoiceShowMaterials).toBe(true);

  const rowB=page.locator('.dj-call').filter({hasText:'Collision call B'}).first();
  await rowB.locator('[data-edit]').click();
  await expect(page.locator('#djc-desc')).toHaveValue('Collision call B');
  await expect(page.locator('#djc-invoice-show-materials')).toBeChecked();
  await page.locator('#djc-invoice-show-materials').uncheck();
  await page.locator('#djc-save').click();

  const rowA=page.locator('.dj-call').filter({hasText:'Collision call A'}).first();
  await rowA.locator('[data-edit]').click();
  await expect(page.locator('#djc-desc')).toHaveValue('Collision call A');
  await expect(page.locator('#djc-invoice-show-materials')).not.toBeChecked();
  await page.locator('#djc-invoice-show-materials').check();
  await page.locator('#djc-save').click();

  await page.reload({waitUntil:'load'});
  rows=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).calls.map(c=>({id:c.id,description:c.description,invoiceShowMaterials:c.invoiceShowMaterials})),DATA_KEY);
  expect(rows.find(c=>c.description==='Collision call A').invoiceShowMaterials).toBe(true);
  expect(rows.find(c=>c.description==='Collision call B').invoiceShowMaterials).toBe(false);

  await page.locator('.dj-call').filter({hasText:'Collision call B'}).first().locator('[data-edit]').click();
  await expect(page.locator('#djc-invoice-show-materials')).not.toBeChecked();
});

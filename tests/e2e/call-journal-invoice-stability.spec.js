const { test, expect } = require('@playwright/test');

const DATA_KEY='bruno-electric-dispatch-journal-v2';
const SETTINGS_KEY='bruno-electric-dispatch-settings-v2';

function amount(v){return new RegExp(String(v).replace('.', '[,.]'))}

async function openJournal(page){
  await page.goto('/index.html',{waitUntil:'load'});
  await expect(page.locator('#panel-dispatch')).toBeVisible();
  await expect(page.locator('#dj-add')).toBeVisible();
  await expect(page.locator('#djs-commercial-tax')).toBeAttached();
  await expect(page.locator('#djs-business-reserve')).toBeAttached();
}

function invoiceRow(page,label){
  return page.locator('#be-doc-preview-paper .be-doc-row').filter({has:page.locator('span',{hasText:label})});
}

test('JOURNAL-INVOICE-STABILITY-01 commercial preview cannot fall back to stale per-call tax snapshot',async({page})=>{
  await openJournal(page);

  await page.evaluate(([dk,sk])=>{
    localStorage.setItem(sk,JSON.stringify({
      serviceHourlyRate:175,
      commercialTaxPct:10,
      businessReservePct:15,
      taxEnabled:true,
      ownerTaxPct:15,
      stateTaxPct:0,
      localTaxPct:0,
      invoiceCompanyName:'Bruno Electric Services LLC',
      invoiceAddress:'Dripping Springs, TX',
      invoicePhone:'512-555-0100',
      invoiceLicense:'TECL 28137',
      invoiceTerms:'Due upon receipt'
    }));
    localStorage.setItem(dk,JSON.stringify({calls:[{
      id:'stale-tax-call',date:'2026-09-17',time:'20:07',address:'Stable Invoice Test',hours:0,price:400,status:'completed',description:'Electrical service',callType:'commercial_repair',pricingMode:'fixed',taxPct:8.25,taxPctApplied:8.25,customerSalesTaxPctApplied:8.25,includedMaterialsMode:'quick',includedMaterialsTotal:0,includedMaterialItems:[],toolFeeEnabled:false,toolFeePct:0
    }],helpers:[]}));
  },[DATA_KEY,SETTINGS_KEY]);

  await page.reload({waitUntil:'load'});
  await expect(page.locator('.dj-call').filter({hasText:'Stable Invoice Test'})).toBeVisible();

  await expect.poll(()=>page.evaluate(k=>{
    const c=JSON.parse(localStorage.getItem(k)).calls[0];
    return [c.taxPct,c.taxPctApplied,c.customerSalesTaxPctApplied];
  },DATA_KEY)).toEqual([10,10,10]);

  await page.locator('.dj-call').filter({hasText:'Stable Invoice Test'}).locator('[data-invoice]').click();
  await expect(page.locator('#be-doc-preview')).toBeVisible();
  await expect(invoiceRow(page,'Sales tax')).toContainText('10.00%');
  await expect(invoiceRow(page,'Sales tax')).toContainText(amount('40.00'));
  await expect(invoiceRow(page,'Amount due')).toContainText(amount('440.00'));

  await page.waitForTimeout(800);
  await expect(invoiceRow(page,'Sales tax')).toContainText('10.00%');
  await expect(invoiceRow(page,'Sales tax')).toContainText(amount('40.00'));
  await expect(invoiceRow(page,'Amount due')).toContainText(amount('440.00'));
});

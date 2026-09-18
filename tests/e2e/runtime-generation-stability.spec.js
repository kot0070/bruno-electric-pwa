const { test, expect } = require('@playwright/test');

const DATA_KEY='bruno-electric-dispatch-journal-v2';
const SETTINGS_KEY='bruno-electric-dispatch-settings-v2';
const VERSION='v1.17';
const JOURNAL_URL='/index.html#be=JOB&tab=dispatch';

async function expectStableGeneration(page){
  await expect(page.locator('.ver-badge')).toHaveText(VERSION);
  await expect.poll(()=>page.evaluate(()=>({
    global: window.BRUNO_APP_VERSION,
    html: document.documentElement.getAttribute('data-be-app-version'),
    bootstrap: document.documentElement.getAttribute('data-be-bootstrap'),
    loader: !!document.getElementById('be-modern-shell-loader'),
    pending: document.documentElement.getAttribute('data-be-shell-pending')
  }))).toEqual({global:VERSION,html:VERSION,bootstrap:'single-runtime-v3',loader:false,pending:null});

  const scripts=await page.evaluate(()=>Array.from(document.scripts)
    .map(s=>String(s.src||''))
    .filter(Boolean)
    .map(src=>src.replace(/[?&]v=[^&]+/g,'')));
  expect(scripts.some(s=>s.includes('electric-customer-invoice-patch.js'))).toBeFalsy();
  expect(scripts.some(s=>s.includes('electric-journal-customer-metrics.js'))).toBeFalsy();
  const runtimeScripts=scripts.filter(s=>/\/electric-[^/]+\.js$/.test(s));
  expect(new Set(runtimeScripts).size).toBe(runtimeScripts.length);
}

test('STAGE8-RUNTIME-01 human phone journey boots, opens Journal, reloads and previews invoice without generation regression',async({page})=>{
  const errors=[];
  const failedRequests=[];
  page.on('pageerror',e=>errors.push(String(e.message||e)));
  page.on('requestfailed',r=>failedRequests.push(String(r.url())));

  await page.goto(JOURNAL_URL,{waitUntil:'domcontentloaded'});
  await expect(page.locator('#be-modern-shell-loader')).toHaveCount(0,{timeout:12000});
  await expectStableGeneration(page);
  await expect(page.locator('#panel-dispatch')).toBeVisible();
  await expect(page.getByText('Call Journal',{exact:true}).first()).toBeVisible();
  const journalDate=await page.locator('#dj-date').inputValue();
  expect(journalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  await page.waitForTimeout(1500);
  await expectStableGeneration(page);

  await page.evaluate(([dk,sk,date])=>{
    localStorage.setItem(sk,JSON.stringify({
      serviceHourlyRate:175,
      commercialTaxPct:8.25,
      estimatedTaxSetAsidePct:0,
      businessReservePct:0,
      invoiceCompanyName:'Bruno Electric Services LLC',
      invoiceAddress:'Dripping Springs, TX',
      invoicePhone:'512-555-0100',
      invoiceEmail:'',
      invoiceLicense:'TECL 28137',
      invoiceTerms:'Due upon receipt'
    }));
    localStorage.setItem(dk,JSON.stringify({calls:[{
      id:'runtime-stability-call',date:date,time:'21:07',customer:'Runtime Stability',address:'1 Test Way',hours:2,price:400,status:'completed',description:'Electrical service',callType:'commercial_repair',pricingMode:'fixed',taxPct:8.25,taxPctApplied:8.25,customerSalesTaxPctApplied:8.25,includedMaterialsMode:'quick',includedMaterialsTotal:0,includedMaterialItems:[],toolFeeEnabled:false,toolFeePct:0
    }],helpers:[]}));
  },[DATA_KEY,SETTINGS_KEY,journalDate]);

  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#be-modern-shell-loader')).toHaveCount(0,{timeout:12000});
  await expectStableGeneration(page);
  await expect(page.locator('#panel-dispatch')).toBeVisible();
  const call=page.locator('.dj-call').filter({hasText:'Runtime Stability'});
  await expect(call).toBeVisible();
  await call.locator('[data-invoice]').click();
  await expect(page.locator('#be-doc-preview')).toBeVisible();
  await expect(page.locator('#be-doc-preview-paper')).toContainText('Runtime Stability');

  await page.waitForTimeout(1500);
  await expectStableGeneration(page);
  expect(errors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

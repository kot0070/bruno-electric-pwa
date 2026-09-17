const { test, expect } = require('@playwright/test');

const JOB_KEY='bruno-electric-v1';
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
function baseJob(){return{id:'catalog-human-job',quote:{customer:'Catalog Human',jobNumber:'CAT-001'},company:{name:'Bruno Electric Services LLC'},catalog:[{id:'manual-custom-row',item:'Manual custom item',unit:'EA',unitCost:99.5}],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function openTool(page,id){const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();await expect(page.locator(`#tool-${id}`)).toBeVisible();}

test.beforeEach(async({page})=>{
  errorsFor(page);
  await page.addInitScript(([k,v])=>{localStorage.setItem(k,JSON.stringify(v));localStorage.removeItem('bruno-electric-project-mode-v1');},[JOB_KEY,baseJob()]);
});
test.afterEach(async({page},testInfo)=>{
  const rows=errorsFor(page);
  if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});
  expect(rows,rows.join('\n')).toEqual([]);
});

test('HUMAN-CALC-08 electrician seeds catalog idempotently and can reach code references through visible UI',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','Detailed catalog mutation runs once on desktop; workspace reachability is covered across responsive projects elsewhere.');
  test.setTimeout(60000);
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});

  await openTool(page,'cat');
  await expect(page.locator('#cat-grid')).toBeVisible();
  await expect(page.locator('#tool-cat')).toContainText('starter items');
  const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).catalog.length,JOB_KEY);
  expect(before).toBe(1);

  let firstMessage='';
  page.once('dialog',async d=>{firstMessage=d.message();await d.accept();});
  await page.locator('#seed-cat').click();
  await expect.poll(()=>firstMessage).toContain('Catalog seeded safely');
  const afterFirst=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).catalog.length,JOB_KEY);
  expect(afterFirst).toBeGreaterThan(before);
  const customAfterFirst=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).catalog.find(x=>x.id==='manual-custom-row'),JOB_KEY);
  expect(customAfterFirst.item).toBe('Manual custom item');
  expect(customAfterFirst.unitCost).toBe(99.5);

  let secondMessage='';
  page.once('dialog',async d=>{secondMessage=d.message();await d.accept();});
  await page.locator('#seed-cat').click();
  await expect.poll(()=>secondMessage).toContain('0 missing items added');
  const afterSecond=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).catalog.length,JOB_KEY);
  expect(afterSecond).toBe(afterFirst);

  await openTool(page,'ref');
  await expect(page.locator('#tool-ref')).toContainText('Texas');
  await expect(page.locator('#tool-ref')).toContainText('NEC 2026');
  await expect(page.locator('#tool-ref a')).toHaveCount(2);
  const hrefs=await page.locator('#tool-ref a').evaluateAll(as=>as.map(a=>a.href));
  expect(hrefs.every(h=>/^https:\/\//.test(h))).toBe(true);
  await expect(page.locator('#tool-ref a').first()).toHaveAttribute('target','_blank');
  await expect(page.locator('#tool-ref a').first()).toHaveAttribute('rel','noopener');
});

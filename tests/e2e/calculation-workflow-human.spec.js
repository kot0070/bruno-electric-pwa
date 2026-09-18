const { test, expect } = require('@playwright/test');

const LIB='bruno-electric-calculation-library-v1';
const PROJECTS='bruno-electric-saved-projects-v1';
const CURRENT='bruno-electric-current-project-id-v1';
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
async function openTool(page,id){
  const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);
  if(compact){const picker=page.locator('#be-tool-select');await expect(picker).toBeVisible();await picker.selectOption(id);}else{const b=page.locator(`#tool-nav [data-tool="${id}"]`);await expect(b).toBeVisible();await b.click();}
  await expect(page.locator(`#tool-${id}`)).toBeVisible();
}
async function answerPrompt(page,text,action){
  page.once('dialog',async d=>{expect(d.type()).toBe('prompt');await d.accept(text);});
  await action();
}

test.beforeEach(async({page})=>{
  errorsFor(page);
  await page.addInitScript(([lib,projects,current])=>{localStorage.removeItem(lib);localStorage.removeItem(projects);localStorage.removeItem(current);},[LIB,PROJECTS,CURRENT]);
});
test.afterEach(async({page},testInfo)=>{
  const rows=errorsFor(page);
  if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});
  expect(rows,rows.join('\n')).toEqual([]);
});

test('project hub exposes new/archive/quick and quick mode resets stale project fields',async({page})=>{
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});
  await openTool(page,'project');
  await expect(page.locator('.be-project-hub')).toBeVisible();
  await expect(page.locator('[data-hub="new"]')).toBeVisible();
  await expect(page.locator('[data-hub="archive"]')).toBeVisible();
  await expect(page.locator('[data-hub="quick"]')).toBeVisible();
  await expect(page.locator('.pc-hero')).toBeHidden();

  await page.locator('[data-hub="quick"]').click();
  await expect(page.locator('.pc-hero')).toBeVisible();
  await expect(page.locator('#pc-name')).toHaveValue('');
  await expect(page.locator('#pc-sqft')).toHaveValue('');
  await expect(page.locator('#pc-bed')).toHaveValue('3');
  await expect(page.locator('#pc-bath')).toHaveValue('2');
  await expect(page.locator('#pc-saved-hint')).toContainText('Quick calculation');
  expect(await page.evaluate(k=>localStorage.getItem(k),CURRENT)).toBeNull();
});

test('voltage drop calculation can be saved, templated, reloaded, and stays isolated to its calculator',async({page})=>{
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});
  await openTool(page,'vd');
  await expect(page.locator('#tool-vd .be-calc-flow')).toBeVisible();
  await page.locator('#v-v').fill('240');
  await page.locator('#v-d').fill('175');
  await page.locator('#v-i').fill('36');
  await page.locator('#v-t').fill('3');
  await page.locator('#run-vd').click();

  await answerPrompt(page,'Shop feeder baseline',()=>page.locator('#tool-vd [data-act="save"]').click());
  await answerPrompt(page,'240V feeder template',()=>page.locator('#tool-vd [data-act="template"]').click());
  const library=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'[]'),LIB);
  expect(library).toHaveLength(2);
  expect(library.every(x=>x.tool==='vd')).toBe(true);
  expect(new Set(library.map(x=>x.kind))).toEqual(new Set(['calculation','template']));

  await page.locator('#v-d').fill('25');
  await page.locator('#v-i').fill('10');
  await page.locator('#tool-vd [data-act="library"]').click();
  await expect(page.locator('#tool-vd .be-calc-flow-panel')).toBeVisible();
  await expect(page.locator('#tool-vd .be-calc-lib-item')).toHaveCount(2);
  const savedRow=page.locator('#tool-vd .be-calc-lib-item').filter({hasText:'Shop feeder baseline'});
  await savedRow.locator('[data-open]').click();
  await expect(page.locator('#v-d')).toHaveValue('175');
  await expect(page.locator('#v-i')).toHaveValue('36');
  await expect(page.locator('#tool-vd .be-calc-flow-status')).toContainText('Loaded · Shop feeder baseline');

  await openTool(page,'amp');
  await page.locator('#tool-amp [data-act="library"]').click();
  await expect(page.locator('#tool-amp .be-calc-empty')).toContainText('No saved calculations or templates');
});

test('saved calculator record links to active project when one is open',async({page})=>{
  const project={id:'prj-test-1',name:'Smith Residence',projectType:'residential',squareFeet:2100,rooms:{bedrooms:3,bathrooms:2}};
  await page.addInitScript(([projects,current,p])=>{localStorage.setItem(projects,JSON.stringify([p]));localStorage.setItem(current,p.id);},[PROJECTS,CURRENT,project]);
  await page.goto('/electrical-tools.html',{waitUntil:'load'});
  await page.locator('#be-tool-select').waitFor({state:'attached'});
  await openTool(page,'vd');
  await answerPrompt(page,'Smith voltage drop',()=>page.locator('#tool-vd [data-act="save"]').click());
  const row=(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'[]'),LIB))[0];
  expect(row.projectId).toBe('prj-test-1');
  expect(row.projectName).toBe('Smith Residence');
  await page.locator('#tool-vd [data-act="library"]').click();
  await expect(page.locator('#tool-vd .be-calc-flow-panel')).toContainText('Project · Smith Residence');
});

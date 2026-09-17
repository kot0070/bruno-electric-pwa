const { test, expect } = require('@playwright/test');

const JOB_KEY='bruno-electric-v1';
const MODE_KEY='bruno-electric-project-mode-v1';
const PROJECT_KEY='bruno-electric-project-calculator-v1';
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
function baseJob(){return{id:'project-human-job',quote:{customer:'Project Human',jobNumber:'PC-001'},company:{name:'Bruno Electric Services LLC'},catalog:[],materialsUsed:[],materialsUnresolved:[],personnel:{employees:[],burden:[]},electricalTasks:[],electricalTaskActiveId:null,changeOrders:[],summary:{},residentialHistory:[],necEdition:'2026 NEC',jurisdiction:'Texas'};}
async function openTool(page,id){const compact=await page.evaluate(()=>matchMedia('(max-width:1199.98px)').matches);if(compact){await page.locator('#be-tool-select').selectOption(id);}else{await page.locator(`#tool-nav [data-tool="${id}"]`).click();}await expect(page.locator(`#tool-${id}`)).toBeVisible();}

test.beforeEach(async({page})=>{
  errorsFor(page);
  await page.addInitScript(([j,m,p,v])=>{localStorage.setItem(j,JSON.stringify(v));localStorage.removeItem(m);localStorage.removeItem(p);},[JOB_KEY,MODE_KEY,PROJECT_KEY,baseJob()]);
});
test.afterEach(async({page},testInfo})=>{});

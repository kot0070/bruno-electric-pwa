const { test, expect } = require('@playwright/test');

const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);page.on('pageerror',e=>rows.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'){const text=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(text))rows.push('console.error: '+text);}});page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});return rows;}
test.beforeEach(async({page})=>{errorsFor(page);await page.addInitScript(()=>{window.__beLegacyPaints=[];let frames=0;function sample(){frames++;const nav=document.getElementById('nav-tabs');if(nav){const cs=getComputedStyle(nav),r=nav.getBoundingClientRect();if(cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)>0&&r.width>1&&r.height>1)window.__beLegacyPaints.push({frame:frames,workspace:document.documentElement.dataset.beWorkspace||'',visibility:cs.visibility,display:cs.display});}if(frames<180)requestAnimationFrame(sample)}requestAnimationFrame(sample);});});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

test('STAGE8-SHELL-01 controlled refresh never paints the legacy tab grid before the current shell',async({page})=>{
  await page.goto('/index.html',{waitUntil:'load'});
  await expect.poll(()=>page.evaluate(async()=>!!(navigator.serviceWorker&&await navigator.serviceWorker.ready))).toBe(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.beWorkspace||'')).toBe('1');
  await expect(page.locator('.be-bottom, .be-side').first()).toBeAttached();
  await page.waitForTimeout(650);
  const paints=await page.evaluate(()=>window.__beLegacyPaints||[]);
  expect(paints,'legacy #nav-tabs became visibly paintable during refresh: '+JSON.stringify(paints)).toEqual([]);
});
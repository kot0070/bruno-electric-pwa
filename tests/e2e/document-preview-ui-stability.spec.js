const { test, expect } = require('@playwright/test');

const ALLOWED_CONSOLE_ERRORS=new Set(["The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element."]);
const runtimeErrors=new WeakMap();
function errorsFor(page){let rows=runtimeErrors.get(page);if(rows)return rows;rows=[];runtimeErrors.set(page,rows);page.on('pageerror',e=>rows.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!ALLOWED_CONSOLE_ERRORS.has(t))rows.push('console.error: '+t);}});page.on('response',r=>{if(['script','serviceworker'].includes(r.request().resourceType())&&r.status()>=400)rows.push(`required ${r.request().resourceType()} ${r.status()}: ${r.url()}`);});page.on('requestfailed',r=>{if(['script','serviceworker'].includes(r.resourceType()))rows.push(`required ${r.resourceType()} failed: ${r.url()} · ${(r.failure()||{}).errorText||''}`);});return rows;}
function luminance(color){const m=String(color).match(/[\d.]+/g)||[];const rgb=m.slice(0,3).map(Number);if(rgb.length<3)return 0;return rgb.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}

test.beforeEach(async({page})=>{
  errorsFor(page);
  await page.addInitScript(()=>{
    window.__brunoLegacyVisibleFrames=0;window.__brunoFrameSamples=0;
    function sample(){window.__brunoFrameSamples++;const a=document.querySelector('.header-actions');if(a){const s=getComputedStyle(a);const legacy=[...a.querySelectorAll('#btn-print-quote,#btn-print-tm,#btn-export,#btn-import,#btn-export-app,#btn-import-app,#btn-blank')].some(el=>{const x=getComputedStyle(el),r=el.getBoundingClientRect();return x.display!=='none'&&x.visibility!=='hidden'&&r.width>0&&r.height>0;});if(a.dataset.beCompact!=='1'&&s.visibility!=='hidden'&&legacy)window.__brunoLegacyVisibleFrames++;}if(performance.now()<2500)requestAnimationFrame(sample)}
    requestAnimationFrame(sample);
  });
});
test.afterEach(async({page},testInfo)=>{const rows=errorsFor(page);if(rows.length)await testInfo.attach('runtime-errors.txt',{body:Buffer.from(rows.join('\n')),contentType:'text/plain'});expect(rows,rows.join('\n')).toEqual([]);});

test('UI-STABILITY-01 reload never presents the legacy wide header as a visible animation frame',async({page})=>{
  await page.goto('/index.html',{waitUntil:'load'});await expect(page.locator('#btn-compact-more')).toBeVisible();await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.beShellReady)).toBe('1');await page.waitForTimeout(350);
  let state=await page.evaluate(()=>({legacy:window.__brunoLegacyVisibleFrames,samples:window.__brunoFrameSamples,ready:document.documentElement.classList.contains('be-current-shell-ready')}));expect(state.samples).toBeGreaterThan(0);expect(state.legacy).toBe(0);expect(state.ready).toBe(true);
  await page.reload({waitUntil:'load'});await expect(page.locator('#btn-compact-more')).toBeVisible();await page.waitForTimeout(350);state=await page.evaluate(()=>({legacy:window.__brunoLegacyVisibleFrames,samples:window.__brunoFrameSamples}));expect(state.samples).toBeGreaterThan(0);expect(state.legacy).toBe(0);
});

test('UI-STABILITY-02 letterhead and disabled native controls stay dark and readable',async({page})=>{
  await page.goto('/index.html',{waitUntil:'load'});
  const quote=page.locator('#nav-tabs .nav-tab[data-tab="quote"]');if(await quote.count())await quote.click();
  const select=page.locator('.letterhead-strip select').first();await expect(select).toBeVisible();
  const style=await select.evaluate(el=>{const s=getComputedStyle(el);return{bg:s.backgroundColor,fg:s.color,disabled:el.disabled}});expect(luminance(style.bg),`letterhead background ${style.bg}`).toBeLessThan(0.35);expect(luminance(style.fg),`letterhead foreground ${style.fg}`).toBeGreaterThan(0.45);
  const offenders=await page.evaluate(()=>[...document.querySelectorAll('select:disabled,input:disabled,textarea:disabled,input[readonly],textarea[readonly]')].filter(el=>{const r=el.getBoundingClientRect();if(!r.width||!r.height)return false;const m=(getComputedStyle(el).backgroundColor.match(/[\d.]+/g)||[]).slice(0,3).map(Number);if(m.length<3)return false;const lum=m.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);return lum>.7;}).map(el=>({id:el.id,cls:el.className,tag:el.tagName,bg:getComputedStyle(el).backgroundColor})));
  expect(offenders,JSON.stringify(offenders)).toEqual([]);
});

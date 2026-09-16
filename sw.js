/* Bruno Electric Estimating — app shell offline cache. Previous cache: bruno-electric-v42. */
const CACHE = 'bruno-electric-v43';
const OWNED_CACHE_RE = /^bruno-electric-v\d+$/;
const CORE_SHELL = [
  './','./index.html','./electrical-tools.html','./manifest.webmanifest','./sw-register.js',
  './electric-app-navigation.js','./electric-workspace.js','./electric-compact-header.js','./electric-navigation-bridge.js',
  './electric-dispatch-journal-v2.js','./electric-catalog-cost-semantics.js','./electric-pricing-margins-semantics.js',
  './electric-reference-data.js','./electric-calculators.js','./electric-catalog-v1.js','./electric-bom.js',
  './electric-residential-rules.js','./electric-residential.js','./electric-residential-pricing.js','./electric-residential-catalog-bridge.js','./electric-residential-takeoff.js',
  './electric-residential-live.js','./electric-residential-live-levels.js','./electric-residential-live-history.js','./electric-residential-live-workspace.js',
  './electric-phase3-rules.js','./electric-phase3.js','./electrical-tools-ui.js','./electrical-bom-ui.js','./electrical-residential-ui.js',
  './electrical-residential-pricing-ui.js','./electrical-residential-takeoff-ui.js','./electrical-residential-live-ui.js','./electrical-residential-live-levels-ui.js',
  './electrical-phase3-ui.js','./electrical-project-calculator-ui.js','./electrical-tools-shell.js'
];
const OPTIONAL_SHELL = ['./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
const SHELL = CORE_SHELL.concat(OPTIONAL_SHELL);
self.addEventListener('install',(event)=>{event.waitUntil(caches.open(CACHE).then((cache)=>cache.addAll(CORE_SHELL).then(()=>Promise.all(OPTIONAL_SHELL.map((url)=>cache.add(url).catch(() => null))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',(event)=>{event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((k)=>OWNED_CACHE_RE.test(k)&&k!==CACHE).map((k)=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',(event)=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;event.respondWith(caches.match(req).then((cached)=>{const net=fetch(req).then((res)=>{if(res&&res.ok&&(req.mode==='navigate'||SHELL.some((p)=>url.pathname.endsWith(p.replace('./','/'))||url.pathname.endsWith(p.replace('./',''))))){const copy=res.clone();caches.open(CACHE).then((c)=>c.put(req,copy))}return res}).catch(()=>cached);if(req.mode==='navigate')return net.then((r)=>r||cached||caches.match('./index.html'));return cached||net}))});

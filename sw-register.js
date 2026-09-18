/* Bruno Electric — deterministic runtime bootstrap.
 * No shell service worker is registered here. The previous offline cache could
 * mix old and new generations of runtime modules, so it is explicitly retired.
 * Journal/invoice ownership is now: dispatch data -> customer documents ->
 * runtime authority. Legacy invoice/metrics patch modules are not loaded.
 */
(function(){
'use strict';

var RETIRE_RELOAD_KEY='bruno-sw-retired-reload-v1';
var BUILD_VERSION='1.12';
var isTools=/electrical-tools\.html$/i.test(location.pathname);

function installShellGuard(){
  if(isTools||!document.body)return;
  document.documentElement.setAttribute('data-be-shell-pending','1');
  if(!document.getElementById('be-shell-prepaint-style')){
    var st=document.createElement('style');
    st.id='be-shell-prepaint-style';
    st.textContent='html[data-be-shell-pending="1"] body>.app-header,html[data-be-shell-pending="1"] body>.live-totals,html[data-be-shell-pending="1"] body>#nav-tabs,html[data-be-shell-pending="1"] body>main{visibility:hidden!important}#be-modern-shell-loader{position:fixed;inset:0;z-index:2147483000;padding:18px;background:#0f1419;color:#e8eef6;font:700 16px/1.35 system-ui,-apple-system,Segoe UI,sans-serif}#be-modern-shell-loader>div{max-width:520px;margin:auto;padding:14px 16px;border:1px solid #2e3a4a;border-radius:12px;background:#17212c}#be-modern-shell-loader small{display:block;margin-top:3px;color:#8b9bb0}';
    document.head.appendChild(st);
  }
  if(!document.getElementById('be-modern-shell-loader')){
    var loader=document.createElement('div');loader.id='be-modern-shell-loader';loader.innerHTML='<div>Bruno Electric Services LLC<small>Loading current workspace…</small></div>';document.body.appendChild(loader);
  }
}
function clearShellGuard(){document.documentElement.removeAttribute('data-be-shell-pending');var x=document.getElementById('be-modern-shell-loader');if(x)x.remove()}

function removeLegacyCaches(){
  if(!('caches' in window))return Promise.resolve();
  return caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return /^bruno-electric-v\d+$/.test(k)}).map(function(k){return caches.delete(k)}))}).catch(function(){})
}
function retireServiceWorkers(){
  if(!('serviceWorker' in navigator))return removeLegacyCaches().then(function(){return false});
  var hadController=!!navigator.serviceWorker.controller;
  return navigator.serviceWorker.getRegistrations().then(function(regs){return Promise.all(regs.map(function(r){return r.unregister()}))}).catch(function(){}).then(removeLegacyCaches).then(function(){return hadController})
}

function cleanSrc(v){return String(v||'').split('?')[0]}
function hasScript(src){var target=cleanSrc(src);return Array.prototype.some.call(document.scripts,function(s){var v=cleanSrc(s.getAttribute('src')||'');return v===target||v.endsWith('/'+target.replace(/^\.\//,''))})}
function load(src){return new Promise(function(resolve){if(hasScript(src)){resolve();return}var s=document.createElement('script');s.src=src+(src.indexOf('?')>=0?'&':'?')+'v='+encodeURIComponent(BUILD_VERSION);s.async=false;s.onload=resolve;s.onerror=function(){console.error('Required runtime module failed: '+src);resolve()};document.head.appendChild(s)})}
function sequence(list){return list.reduce(function(p,src){return p.then(function(){return load(src)})},Promise.resolve())}

var APP_MODULES=[
  './electric-catalog-cost-semantics.js',
  './electric-pricing-margins-semantics.js',
  './electric-job-material-cost-semantics.js',
  './electric-job-summary-semantics.js',
  './electric-pricing-domain-guard.js',
  './electric-quote-lifecycle.js',
  './electric-fixed-price-invoice.js',
  './electric-custom-materials.js',
  './electric-catalog-job-ux-semantics.js',
  './electric-compact-header.js',
  './electric-dispatch-journal-v2.js',
  './electric-customer-documents.js',
  './electric-residential-pricing.js',
  './electric-residential-live-workspace.js',
  './electric-residential-history-job-scope.js',
  './electric-residential-wire-takeoff.js',
  './electric-residential-apply-job.js',
  './electric-residential-save-archive-ux.js',
  './electric-app-navigation.js',
  './electric-workspace.js',
  './electric-navigation-bridge.js',
  './electric-runtime-authority-v1.js'
];
var TOOLS_MODULES=[
  './electric-customer-documents.js',
  './electric-electrical-tasks.js',
  './electric-electrical-task-engine.js',
  './electric-raceway-engine.js',
  './electric-grounding-reference.js',
  './electric-grounding-engine.js',
  './electric-electrical-task-material-takeoff.js',
  './electric-electrical-task-advanced.js',
  './electric-electrical-task-archive.js',
  './electrical-tasks-ui.js',
  './electrical-tasks-stage2-ui.js',
  './electrical-tasks-stage3-ui.js',
  './electrical-tasks-stage4-ui.js',
  './electrical-tasks-stage5-ui.js',
  './electrical-tasks-stage6-ui.js',
  './electrical-tasks-stage7-ui.js',
  './electric-electrical-task-solver.js',
  './electrical-tasks-stage8-ui.js'
];

function boot(){
  installShellGuard();
  retireServiceWorkers().then(function(hadController){
    if(hadController&&sessionStorage.getItem(RETIRE_RELOAD_KEY)!=='1'){
      sessionStorage.setItem(RETIRE_RELOAD_KEY,'1');location.reload();return;
    }
    sessionStorage.removeItem(RETIRE_RELOAD_KEY);
    return sequence(isTools?TOOLS_MODULES:APP_MODULES).then(function(){
      document.documentElement.setAttribute('data-be-bootstrap','single-runtime-v2');clearShellGuard();
    })
  }).catch(function(){clearShellGuard()})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

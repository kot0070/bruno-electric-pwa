/* Bruno Electric — Catalog Your Cost semantics guard.
 * Blank/missing Your Cost is unresolved. Explicit numeric 0 is a known $0 cost.
 * This module protects the legacy Catalog/Pricing editors from coercing blank to zero.
 */
(function(root){
'use strict';
var JOB_KEY='bruno-electric-v1';
function parse(raw){
  if(raw==null||String(raw).trim()==='')return{known:false,value:''};
  var n=Number(raw);
  if(!Number.isFinite(n)||n<0)return{known:false,value:''};
  return{known:true,value:Math.round(n*100)/100};
}
function readJob(){try{return JSON.parse(localStorage.getItem(JOB_KEY)||'null')}catch(e){return null}}
function writeJob(job){localStorage.setItem(JOB_KEY,JSON.stringify(job))}
function rowId(input){
  if(!input)return'';
  if(input.dataset&&input.dataset.id)return String(input.dataset.id);
  var tr=input.closest&&input.closest('[data-id]');
  return tr&&tr.dataset&&tr.dataset.id?String(tr.dataset.id):'';
}
function removePersistedCost(id){
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(!k||!/-catalog-costs-v1$/.test(k))continue;
      try{var m=JSON.parse(localStorage.getItem(k)||'{}');if(m&&typeof m==='object'&&!Array.isArray(m)&&Object.prototype.hasOwnProperty.call(m,id)){delete m[id];localStorage.setItem(k,JSON.stringify(m))}}catch(e){}
    }
  }catch(e){}
}
function persistBlank(id){
  if(!id)return false;
  var job=readJob();if(!job||!Array.isArray(job.catalog))return false;
  var found=false;
  job.catalog.forEach(function(c){if(c&&String(c.id)===id){c.yourCost='';found=true}});
  if(!found)return false;
  writeJob(job);removePersistedCost(id);return true;
}
function persistedBlank(id){
  var job=readJob();if(!job||!Array.isArray(job.catalog))return false;
  for(var i=0;i<job.catalog.length;i++){var c=job.catalog[i];if(c&&String(c.id)===id)return c.yourCost==null||c.yourCost===''}
  return false;
}
function isYourCostInput(t){return !!(t&&t.classList&&(t.classList.contains('cat-your')||t.classList.contains('mrg-your')))}
function protect(e){
  var t=e&&e.target;if(!isYourCostInput(t))return;
  var p=parse(t.value);if(p.known)return; // explicit 0 and positive numbers continue through the native editor path
  var id=rowId(t);if(!id)return;
  if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  persistBlank(id);t.value='';t.dataset.costState='unresolved';t.setAttribute('aria-label',(t.getAttribute('aria-label')||'Your Cost')+' — unresolved');
  if(e.type==='change'&&root.location&&typeof root.location.reload==='function')setTimeout(function(){root.location.reload()},0);
}
function syncBlankInputs(scope){
  var host=scope&&scope.querySelectorAll?scope:document,inputs=host.querySelectorAll?host.querySelectorAll('.cat-your,.mrg-your'):[];
  for(var i=0;i<inputs.length;i++){var t=inputs[i],id=rowId(t);if(id&&persistedBlank(id)){t.value='';t.dataset.costState='unresolved';t.placeholder='Unresolved'}}
}
function install(){
  if(typeof document==='undefined'||typeof document.addEventListener!=='function')return;
  document.addEventListener('input',protect,true);
  document.addEventListener('change',protect,true);
  syncBlankInputs(document);
  if(root.MutationObserver&&document.documentElement){var mo=new MutationObserver(function(ms){ms.forEach(function(m){for(var i=0;i<m.addedNodes.length;i++){var n=m.addedNodes[i];if(n&&n.nodeType===1)syncBlankInputs(n)}})});mo.observe(document.documentElement,{childList:true,subtree:true})}
}
if(typeof document!=='undefined'&&typeof document.addEventListener==='function'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install()}
root.BrunoCatalogCostSemantics=Object.freeze({parse:parse,persistBlank:persistBlank,persistedBlank:persistedBlank,_rowId:rowId,_protect:protect});
})(window);

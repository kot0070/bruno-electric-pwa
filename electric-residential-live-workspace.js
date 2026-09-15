/* Bruno Electric — expose active Residential Live estimate in workspace top totals.
 * Customer/Your Cost are recalculated from the current Catalog on every render.
 * Same-tab Catalog edits explicitly trigger a refresh; browser storage events only
 * cover other documents/tabs.
 */
(function(){
'use strict';
var JOB_KEY='bruno-electric-v1';
var refreshTimer=null;
function read(){try{return JSON.parse(localStorage.getItem(JOB_KEY)||'null')}catch(e){return null}}
function money(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function ensureChip(){var bar=document.querySelector('.live-totals');if(!bar)return null;var chip=document.getElementById('chip-res-live-wrap');if(chip)return chip;chip=document.createElement('div');chip.id='chip-res-live-wrap';chip.className='total-chip';chip.innerHTML='<span class="lbl">Residential materials · customer</span><span class="val" id="chip-res-live">—</span>';bar.appendChild(chip);return chip}
function price(a,j){var P=window.BrunoResidentialPricing;if(!P||typeof P.priceRows!=='function'||!a)return null;return P.priceRows(Array.isArray(a.bom)?a.bom:[],Array.isArray(j&&j.catalog)?j.catalog:[])}
function render(){var chip=ensureChip();if(!chip)return;var j=read(),a=j&&j.residentialLiveActive,p=price(a,j);if(!a||!p){chip.style.display='none';return}chip.style.display='flex';var v=document.getElementById('chip-res-live');if(v)v.textContent=money(p.customerMaterialTotal);chip.title=(a.name||'Active Residential estimate')+' · LIVE Catalog price · Your Cost '+money(p.yourMaterialCost)+' · saved '+(a.savedAt||'')}
function scheduleRender(){if(refreshTimer!==null)clearTimeout(refreshTimer);refreshTimer=setTimeout(function(){refreshTimer=null;render()},0)}
function inCatalog(target){return !!(target&&target.closest&&target.closest('#panel-catalog'))}
function onSameDocumentCatalogEdit(e){if(inCatalog(e&&e.target))scheduleRender()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(render,0)},{once:true});else setTimeout(render,0);
window.addEventListener('storage',function(e){if(!e||e.key===JOB_KEY)render()});
window.addEventListener('focus',render);
/* Same document: storage event does not fire in the source window. Re-render after
 * the Catalog editor's input/change handler has had a chance to persist state. */
document.addEventListener('input',onSameDocumentCatalogEdit,true);
document.addEventListener('change',onSameDocumentCatalogEdit,true);
/* Explicit hook for current/future Catalog save paths. */
window.addEventListener('bruno:catalog-changed',scheduleRender);
window.BrunoResidentialLiveWorkspace={render:render,notifyCatalogChanged:scheduleRender};
})();
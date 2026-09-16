/* Bruno Electric — expose applied Residential calculation provenance in Job workspace.
 * Saved/live calculation and applied-to-Job calculation are intentionally distinct.
 * Residential materials remain LIVE Catalog informational context only; Job mutation
 * still occurs solely through explicit Apply-to-Job transaction.
 */
(function(){
'use strict';
var JOB_KEY='bruno-electric-v1',refreshTimer=null;
function read(){try{return JSON.parse(localStorage.getItem(JOB_KEY)||'null')}catch(e){return null}}
function money(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function ensureChip(){var bar=document.querySelector('.live-totals');if(!bar)return null;var chip=document.getElementById('chip-res-live-wrap');if(chip)return chip;chip=document.createElement('div');chip.id='chip-res-live-wrap';chip.className='total-chip';chip.innerHTML='<span class="lbl">Job · applied Residential</span><span class="val" id="chip-res-live">—</span>';bar.appendChild(chip);return chip}
function priceRows(a,j){var P=window.BrunoResidentialPricing;if(!P||typeof P.priceRows!=='function'||!a)return null;return P.priceRows(Array.isArray(a.bom)?a.bom:[],Array.isArray(j&&j.catalog)?j.catalog:[])}
function render(){var chip=ensureChip();if(!chip)return;var j=read(),p=j&&j.residentialAppliedCalculation,a=j&&j.residentialLiveActive;if(!p){chip.style.display='none';return}chip.style.display='flex';var v=document.getElementById('chip-res-live');if(v)v.textContent=p.name||'Residential calculation';var newer=!!(a&&a.id&&a.id!==p.calculationId),livePrice=!newer&&a&&a.id===p.calculationId?priceRows(a,j):null;chip.setAttribute('data-applied-calculation-id',p.calculationId||'');chip.setAttribute('data-applied-state',newer?'SAVED_NEWER_NOT_APPLIED':'APPLIED_CURRENT');chip.title='Applied '+(p.appliedAt||'')+' · source '+(p.sourceVersion||'')+(livePrice?' · Residential materials LIVE Catalog customer '+money(livePrice.customerMaterialTotal)+' · Your Cost '+money(livePrice.yourMaterialCost):'')+(newer?' · A newer saved Residential calculation exists and is NOT applied to this Job.':' · matches current saved calculation.')}
function scheduleRender(){if(refreshTimer!==null)clearTimeout(refreshTimer);refreshTimer=setTimeout(function(){refreshTimer=null;render()},0)}
function inCatalog(target){return !!(target&&target.closest&&target.closest('#panel-catalog'))}
function onSameDocumentCatalogEdit(e){if(inCatalog(e&&e.target))scheduleRender()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(render,0)},{once:true});else setTimeout(render,0);
window.addEventListener('storage',function(e){if(!e||e.key===JOB_KEY)render()});
window.addEventListener('focus',render);
document.addEventListener('input',onSameDocumentCatalogEdit,true);
document.addEventListener('change',onSameDocumentCatalogEdit,true);
window.addEventListener('bruno:catalog-changed',scheduleRender);
window.addEventListener('bruno:residential-applied',scheduleRender);
window.BrunoResidentialLiveWorkspace={render:render,notifyCatalogChanged:scheduleRender,notifyAppliedChanged:scheduleRender};
})();
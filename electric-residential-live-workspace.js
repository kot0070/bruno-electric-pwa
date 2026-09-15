/* Bruno Electric — expose active Residential Live estimate in workspace top totals. */
(function(){
'use strict';
var JOB_KEY='bruno-electric-v1';
function read(){try{return JSON.parse(localStorage.getItem(JOB_KEY)||'null')}catch(e){return null}}
function money(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function ensureChip(){var bar=document.querySelector('.live-totals');if(!bar)return null;var chip=document.getElementById('chip-res-live-wrap');if(chip)return chip;chip=document.createElement('div');chip.id='chip-res-live-wrap';chip.className='total-chip';chip.innerHTML='<span class="lbl">Residential materials · customer</span><span class="val" id="chip-res-live">—</span>';bar.appendChild(chip);return chip}
function render(){var chip=ensureChip();if(!chip)return;var j=read(),a=j&&j.residentialLiveActive,p=a&&a.pricing;if(!a||!p){chip.style.display='none';return}chip.style.display='flex';var v=document.getElementById('chip-res-live');if(v)v.textContent=money(p.customerMaterialTotal);chip.title=(a.name||'Active Residential estimate')+' · Your Cost '+money(p.yourMaterialCost)+' · saved '+(a.savedAt||'')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(render,0)},{once:true});else setTimeout(render,0);
window.addEventListener('storage',function(e){if(!e||e.key===JOB_KEY)render()});window.BrunoResidentialLiveWorkspace={render:render};
})();

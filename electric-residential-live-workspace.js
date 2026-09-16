/* Bruno Electric — expose applied Residential calculation provenance in Job workspace.
 * Saved/live calculation and applied-to-Job calculation are intentionally distinct.
 */
(function(){
'use strict';
var JOB_KEY='bruno-electric-v1',refreshTimer=null;
function read(){try{return JSON.parse(localStorage.getItem(JOB_KEY)||'null')}catch(e){return null}}
function ensureChip(){var bar=document.querySelector('.live-totals');if(!bar)return null;var chip=document.getElementById('chip-res-live-wrap');if(chip)return chip;chip=document.createElement('div');chip.id='chip-res-live-wrap';chip.className='total-chip';chip.innerHTML='<span class="lbl">Job · applied Residential</span><span class="val" id="chip-res-live">—</span>';bar.appendChild(chip);return chip}
function render(){var chip=ensureChip();if(!chip)return;var j=read(),p=j&&j.residentialAppliedCalculation,a=j&&j.residentialLiveActive;if(!p){chip.style.display='none';return}chip.style.display='flex';var v=document.getElementById('chip-res-live');if(v)v.textContent=p.name||'Residential calculation';var newer=!!(a&&a.id&&a.id!==p.calculationId);chip.setAttribute('data-applied-calculation-id',p.calculationId||'');chip.setAttribute('data-applied-state',newer?'SAVED_NEWER_NOT_APPLIED':'APPLIED_CURRENT');chip.title='Applied '+(p.appliedAt||'')+' · source '+(p.sourceVersion||'')+(newer?' · A newer saved Residential calculation exists and is NOT applied to this Job.':' · matches current saved calculation.')}
function scheduleRender(){if(refreshTimer!==null)clearTimeout(refreshTimer);refreshTimer=setTimeout(function(){refreshTimer=null;render()},0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(render,0)},{once:true});else setTimeout(render,0);
window.addEventListener('storage',function(e){if(!e||e.key===JOB_KEY)render()});
window.addEventListener('focus',render);
window.addEventListener('bruno:residential-applied',scheduleRender);
window.BrunoResidentialLiveWorkspace={render:render,notifyAppliedChanged:scheduleRender};
})();
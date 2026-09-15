/* Bruno Electric — Residential Live dependency-level UI. */
(function(){
'use strict';
var L=window.BrunoResidentialLiveLevels;if(!L)return;
var FIELD_KEY={
 'rl-sqft':'squareFeet','rl-bed':'bedrooms','rl-bath':'bathrooms','rl-powder':'powderRooms','rl-living':'livingRooms','rl-dining':'diningRooms','rl-office':'offices','rl-kitchen':'kitchens','rl-laundry':'laundryAreas','rl-garage':'garageBays','rl-outdoor':'outdoorGfci','rl-wall-segments':'qualifyingWallSegmentsFt',
 'rl-general-recs':'generalReceptacles','rl-bath-recs':'bathroomReceptacles','rl-kitchen-recs':'kitchenReceptacles','rl-outdoor-design':'outdoorReceptacles','rl-lights':'lights','rl-switches':'switches','rl-general-amps':'generalCircuitAmps','rl-grouping':'receptaclesPerGeneralCircuit'
};
function f(id){return document.getElementById(id)}
function install(){var tool=f('tool-res-live');if(!tool||f('rl-levels'))return false;var card=tool.querySelector('.card');if(!card)return false;var host=document.createElement('div');host.id='rl-levels';host.style.cssText='display:grid;grid-template-columns:repeat(7,minmax(95px,1fr));gap:6px;margin:10px 0 16px;overflow:auto';L.levels.forEach(function(x){var d=document.createElement('div');d.dataset.level=x.id;d.style.cssText='min-width:95px;padding:7px 8px;border:1px solid var(--border);border-radius:8px;background:var(--elev);color:var(--muted);font-size:11px';d.innerHTML='<b style="color:var(--text)">'+x.id+' · '+x.label+'</b><div style="margin-top:3px">'+x.detail+'</div>';host.appendChild(d)});var p=card.querySelector('p');if(p&&p.nextSibling)card.insertBefore(host,p.nextSibling);else card.insertBefore(host,card.firstChild);
 function mark(key){var live=L.liveAffectedFrom?L.liveAffectedFrom(key):L.affectedFrom(key).filter(function(id){return id!=='L6'}),pending=L.pendingCommitFrom?L.pendingCommitFrom(key):['L6'];Array.prototype.forEach.call(host.children,function(n){var id=n.dataset.level;if(live.indexOf(id)>=0){n.style.borderColor='var(--accent)';n.style.color='var(--text)';n.style.opacity='1'}else if(pending.indexOf(id)>=0){n.style.borderColor='var(--blue)';n.style.color='var(--text)';n.style.opacity='.9'}else{n.style.borderColor='var(--border)';n.style.color='var(--muted)';n.style.opacity='.75'}});host.title='Changed '+key+' → live recalculation '+live.join(' → ')+'; '+pending.join(' → ')+' is affected but updates only on Confirm & Save'}
 Object.keys(FIELD_KEY).forEach(function(id){var e=f(id);if(!e)return;e.addEventListener('input',function(){mark(FIELD_KEY[id])},true);e.addEventListener('change',function(){mark(FIELD_KEY[id])},true)});mark('squareFeet');return true}
function boot(){var tries=0,t=setInterval(function(){if(install()||++tries>40)clearInterval(t)},50)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

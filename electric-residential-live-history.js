/* Bruno Electric — Residential Live material-calculation archive.
 * Archive stores calculation structure/BOM. Prices are always hydrated from the current Catalog.
 */
(function(root){
'use strict';
var JOB_KEY='bruno-electric-v1',LIB_KEY='bruno-residential-live-library-v1',MAX=60;
function clone(x){return JSON.parse(JSON.stringify(x))}
function readJson(k,fallback){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?fallback:v}catch(e){return fallback}}
function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
function now(){return new Date().toISOString()}
function id(){return 'rl-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function readJob(){return readJson(JOB_KEY,null)}
function library(){var x=readJson(LIB_KEY,[]);return Array.isArray(x)?x:[]}
function stripPricing(snapshot){var s=clone(snapshot||{});delete s.pricing;delete s.livePricing;s.pricingMode='LIVE_CATALOG';return s}
function currentPricing(snapshot,job){var P=root.BrunoResidentialPricing;if(!P||typeof P.priceRows!=='function')return null;var rows=snapshot&&Array.isArray(snapshot.bom)?snapshot.bom:[];var catalog=job&&Array.isArray(job.catalog)?job.catalog:[];return P.priceRows(rows,catalog)}
function hydrate(snapshot,job){if(!snapshot)return null;var s=clone(snapshot);s.pricing=currentPricing(s,job||readJob());s.pricingMode='LIVE_CATALOG';return s}
function active(){var j=readJob();return j&&j.residentialLiveActive?hydrate(j.residentialLiveActive,j):null}
function list(){var j=readJob();return library().slice().sort(function(a,b){return String(b.savedAt||'').localeCompare(String(a.savedAt||''))}).map(function(x){return hydrate(x,j)})}
function save(snapshot){var j=readJob();if(!j)throw new Error('No saved Bruno Electric job found');var s=stripPricing(snapshot||{});s.id=s.id||id();s.savedAt=now();s.name=String(s.name||('Residential '+(s.inputs&&s.inputs.squareFeet||'')+' ft²')).trim();j.residentialLiveActive=clone(s);writeJson(JOB_KEY,j);var lib=library().filter(function(x){return x&&x.id!==s.id});lib.unshift(clone(s));if(lib.length>MAX)lib.length=MAX;writeJson(LIB_KEY,lib);return hydrate(s,j)}
function remove(historyId){var lib=library().filter(function(x){return x&&x.id!==historyId});writeJson(LIB_KEY,lib);return lib.length}
function duplicate(historyId){var src=library().find(function(x){return x&&x.id===historyId});if(!src)throw new Error('Saved calculation not found');var d=stripPricing(src);d.id=id();d.savedAt='';d.name=(d.name||'Residential calculation')+' copy';return hydrate(d,readJob())}
function clearActive(){var j=readJob();if(!j)return;j.residentialLiveActive=null;writeJson(JOB_KEY,j)}
function reprice(snapshot){return hydrate(stripPricing(snapshot||{}),readJob())}
root.BrunoResidentialLiveHistory=Object.freeze({save:save,active:active,list:list,remove:remove,duplicate:duplicate,clearActive:clearActive,reprice:reprice,_keys:{job:JOB_KEY,library:LIB_KEY},_test:{stripPricing:stripPricing,currentPricing:currentPricing}});
})(window);

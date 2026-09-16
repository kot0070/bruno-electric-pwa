/* Bruno Electric — Residential Live material-calculation archive.
 * Archive stores calculation structure/BOM. Prices are always hydrated from the current Catalog.
 * Confirm is a rollback-protected state transition across job BOM/active snapshot and archive.
 */
(function(root){
'use strict';
var JOB_KEY='bruno-electric-v1',LIB_KEY='bruno-residential-live-library-v1',MAX=60;
function clone(x){return JSON.parse(JSON.stringify(x))}
function readJson(k,fallback){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?fallback:v}catch(e){return fallback}}
function parseRaw(raw,fallback){try{var v=JSON.parse(raw||'null');return v==null?fallback:v}catch(e){return fallback}}
function now(){return new Date().toISOString()}
function id(){return 'rl-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function readJob(){return readJson(JOB_KEY,null)}
function library(){var x=readJson(LIB_KEY,[]);return Array.isArray(x)?x:[]}
function stripPricing(snapshot){var s=clone(snapshot||{});delete s.pricing;delete s.livePricing;s.pricingMode='LIVE_CATALOG';return s}
function comparable(snapshot){var s=stripPricing(snapshot||{});delete s.id;delete s.savedAt;delete s.wireTakeoff;delete s.applyState;return JSON.stringify(s)}
function sameCore(a,b){return !!(a&&b&&comparable(a)===comparable(b))}
function currentPricing(snapshot,job){var P=root.BrunoResidentialPricing;if(!P||typeof P.priceRows!=='function')return null;var rows=snapshot&&Array.isArray(snapshot.bom)?snapshot.bom:[];var catalog=job&&Array.isArray(job.catalog)?job.catalog:[];return P.priceRows(rows,catalog)}
function hydrate(snapshot,job){if(!snapshot)return null;var s=clone(snapshot);s.pricing=currentPricing(s,job||readJob());s.pricingMode='LIVE_CATALOG';return s}
function active(){var j=readJob();return j&&j.residentialLiveActive?hydrate(j.residentialLiveActive,j):null}
function list(){var j=readJob();return library().slice().sort(function(a,b){return String(b.savedAt||'').localeCompare(String(a.savedAt||''))}).map(function(x){return hydrate(x,j)})}
function finalizeSnapshot(snapshot,currentActive){var s=stripPricing(snapshot||{});if(!s.id&&sameCore(s,currentActive))s.id=currentActive.id;s.id=s.id||id();s.savedAt=now();s.name=String(s.name||('Residential '+(s.inputs&&s.inputs.squareFeet||'')+' ft²')).trim();return s}
function nextLibrary(oldLib,s){var lib=(Array.isArray(oldLib)?oldLib:[]).filter(function(x){return x&&x.id!==s.id});lib.unshift(clone(s));if(lib.length>MAX)lib.length=MAX;return lib}
function restoreRaw(key,raw){if(raw==null)localStorage.removeItem(key);else localStorage.setItem(key,raw)}
function commitPair(nextJob,nextLib){var oldJobRaw=localStorage.getItem(JOB_KEY),oldLibRaw=localStorage.getItem(LIB_KEY),jobWritten=false,libWritten=false;try{
  localStorage.setItem(JOB_KEY,JSON.stringify(nextJob));jobWritten=true;
  localStorage.setItem(LIB_KEY,JSON.stringify(nextLib));libWritten=true;
 }catch(err){var rollbackErrors=[];try{if(jobWritten)restoreRaw(JOB_KEY,oldJobRaw)}catch(e){rollbackErrors.push('job rollback: '+e.message)}try{if(libWritten)restoreRaw(LIB_KEY,oldLibRaw)}catch(e2){rollbackErrors.push('archive rollback: '+e2.message)}
  var jobOk=localStorage.getItem(JOB_KEY)===oldJobRaw,libOk=localStorage.getItem(LIB_KEY)===oldLibRaw;if(!jobOk||!libOk||rollbackErrors.length)throw new Error('Confirm failed and rollback could not fully restore prior state. Reload before continuing. '+rollbackErrors.join('; '));throw err;
 }
 return{oldJobRaw:oldJobRaw,oldLibRaw:oldLibRaw};
}
function save(snapshot){var j=readJob();if(!j)throw new Error('No saved Bruno Electric job found');var s=finalizeSnapshot(snapshot,j.residentialLiveActive),lib=nextLibrary(library(),s),nextJob=clone(j);nextJob.residentialLiveActive=clone(s);commitPair(nextJob,lib);return hydrate(s,nextJob)}
function confirmAtomic(snapshot,sourceTag,rows){var B=root.BrunoElectricBOM;if(!B||typeof B.prepareReplacement!=='function')throw new Error('BOM transaction helper unavailable');var currentJob=readJob();if(!currentJob)throw new Error('No saved Bruno Electric job found');var prepared=B.prepareReplacement(currentJob,sourceTag,rows),s=finalizeSnapshot(snapshot,currentJob.residentialLiveActive),nextJob=prepared.state;nextJob.residentialLiveActive=clone(s);var lib=nextLibrary(library(),s);commitPair(nextJob,lib);return{saved:hydrate(s,nextJob),bomResult:prepared.result}}
function remove(historyId){var lib=library().filter(function(x){return x&&x.id!==historyId});localStorage.setItem(LIB_KEY,JSON.stringify(lib));return lib.length}
function duplicate(historyId){var src=library().find(function(x){return x&&x.id===historyId});if(!src)throw new Error('Saved calculation not found');var d=stripPricing(src);d.id=id();d.savedAt='';d.name=(d.name||'Residential calculation')+' copy';return hydrate(d,readJob())}
function clearActive(){var j=readJob();if(!j)return;j.residentialLiveActive=null;localStorage.setItem(JOB_KEY,JSON.stringify(j))}
function reprice(snapshot){return hydrate(stripPricing(snapshot||{}),readJob())}
root.BrunoResidentialLiveHistory=Object.freeze({save:save,confirmAtomic:confirmAtomic,active:active,list:list,remove:remove,duplicate:duplicate,clearActive:clearActive,reprice:reprice,_keys:{job:JOB_KEY,library:LIB_KEY},_test:{stripPricing:stripPricing,currentPricing:currentPricing,commitPair:commitPair,parseRaw:parseRaw,comparable:comparable,sameCore:sameCore}});
})(window);

/* Bruno Electric — v50 corrective: job-owned Residential archive authority.
 * Replaces the legacy device-global history API at runtime while leaving the
 * old global key untouched as an explicit recovery source only.
 * Also virtualizes legacy history storage calls so preloaded legacy closures
 * transparently read/write the active Job archive rather than a device-global list.
 */
(function(root){
'use strict';
var JOB_KEY='bruno-electric-v1',LEGACY_LIB_KEY='bruno-residential-live-library-v1',ARCHIVE_FIELD='residentialLiveArchive',MAX=60;
var ls=root.localStorage,rawGet=ls&&ls.getItem?ls.getItem.bind(ls):null,rawSet=ls&&ls.setItem?ls.setItem.bind(ls):null,rawRemove=ls&&ls.removeItem?ls.removeItem.bind(ls):null,adapterInstalled=false;
function clone(x){return x==null?x:JSON.parse(JSON.stringify(x))}
function parse(raw,fallback){try{var v=JSON.parse(raw||'null');return v==null?fallback:v}catch(e){return fallback}}
function rawJob(){var j=parse(rawGet?rawGet(JOB_KEY):null,null);return j&&typeof j==='object'&&!Array.isArray(j)?j:null}
function archiveOf(j){return Array.isArray(j&&j[ARCHIVE_FIELD])?j[ARCHIVE_FIELD]:[]}
function installStorageAdapter(){if(adapterInstalled||!ls||!rawGet||!rawSet)return;adapterInstalled=true;ls.getItem=function(k){if(String(k)===LEGACY_LIB_KEY){var j=rawJob();return JSON.stringify(archiveOf(j))}return rawGet(k)};ls.setItem=function(k,v){if(String(k)===LEGACY_LIB_KEY){var j=rawJob();if(!j)throw new Error('No saved Bruno Electric job found for Residential archive write');var a=parse(String(v),null);if(!Array.isArray(a))throw new Error('Residential archive write must be an array');j[ARCHIVE_FIELD]=a;rawSet(JOB_KEY,JSON.stringify(j));return}rawSet(k,v)};ls.removeItem=function(k){if(String(k)===LEGACY_LIB_KEY){var j=rawJob();if(j){j[ARCHIVE_FIELD]=[];rawSet(JOB_KEY,JSON.stringify(j))}return}if(rawRemove)rawRemove(k)}}
function readJson(k,fallback){try{var v=parse(ls.getItem(k),fallback);return v==null?fallback:v}catch(e){return fallback}}
function now(){return new Date().toISOString()}
function uid(){return 'rl-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function readJob(){var j=readJson(JOB_KEY,null);return j&&typeof j==='object'&&!Array.isArray(j)?j:null}
function write(j){ls.setItem(JOB_KEY,JSON.stringify(j));return j}
function stripPricing(snapshot){var s=clone(snapshot||{});delete s.pricing;delete s.livePricing;s.pricingMode='LIVE_CATALOG';return s}
function comparable(snapshot){var s=stripPricing(snapshot||{});delete s.id;delete s.savedAt;delete s.wireTakeoff;delete s.applyState;delete s.legacyRecoveredAt;delete s.legacyOriginalId;return JSON.stringify(s)}
function sameCore(a,b){return !!(a&&b&&comparable(a)===comparable(b))}
function price(snapshot,j){var P=root.BrunoResidentialPricing;if(!P||typeof P.priceRows!=='function')return null;return P.priceRows(snapshot&&Array.isArray(snapshot.bom)?snapshot.bom:[],j&&Array.isArray(j.catalog)?j.catalog:[])}
function hydrate(snapshot,j){if(!snapshot)return null;var s=clone(snapshot);s.pricing=price(s,j||readJob());s.pricingMode='LIVE_CATALOG';return s}
function finalize(snapshot,current){var s=stripPricing(snapshot||{});if(!s.id&&sameCore(s,current))s.id=current.id;s.id=s.id||uid();s.savedAt=now();s.name=String(s.name||('Residential '+(s.inputs&&s.inputs.squareFeet||'')+' ft²')).trim();return s}
function nextArchive(old,s){var a=(Array.isArray(old)?old:[]).filter(function(x){return x&&x.id!==s.id});a.unshift(clone(s));if(a.length>MAX)a.length=MAX;return a}
function active(){var j=readJob();return j&&j.residentialLiveActive?hydrate(j.residentialLiveActive,j):null}
function list(){var j=readJob();if(!j)return[];return archiveOf(j).slice().sort(function(a,b){return String(b.savedAt||'').localeCompare(String(a.savedAt||''))}).map(function(x){return hydrate(x,j)})}
function save(snapshot){var j=readJob();if(!j)throw new Error('No saved Bruno Electric job found');var s=finalize(snapshot,j.residentialLiveActive);j.residentialLiveActive=clone(s);j[ARCHIVE_FIELD]=nextArchive(archiveOf(j),s);write(j);return hydrate(s,j)}
function confirmAtomic(snapshot){var j=readJob();if(!j)throw new Error('No saved Bruno Electric job found');var beforeUsed=JSON.stringify(j.materialsUsed||[]),beforeUnresolved=JSON.stringify(j.materialsUnresolved||[]),s=finalize(snapshot,j.residentialLiveActive);j.residentialLiveActive=clone(s);j[ARCHIVE_FIELD]=nextArchive(archiveOf(j),s);write(j);if(JSON.stringify(j.materialsUsed||[])!==beforeUsed||JSON.stringify(j.materialsUnresolved||[])!==beforeUnresolved)throw new Error('Save Calculation must not mutate Job Materials');return{saved:hydrate(s,j),bomResult:{added:0,preserved:(j.materialsUsed||[]).length,unresolved:0,unresolvedPreserved:(j.materialsUnresolved||[]).length,saveOnly:true}}}
function remove(id){var j=readJob();if(!j)return 0;j[ARCHIVE_FIELD]=archiveOf(j).filter(function(x){return x&&x.id!==id});if(j.residentialLiveActive&&j.residentialLiveActive.id===id)j.residentialLiveActive=null;write(j);return j[ARCHIVE_FIELD].length}
function duplicate(id){var j=readJob();if(!j)throw new Error('No saved Bruno Electric job found');var src=archiveOf(j).find(function(x){return x&&x.id===id});if(!src)throw new Error('Saved calculation not found in this Job');var d=stripPricing(src);d.id=uid();d.savedAt='';d.name=(d.name||'Residential calculation')+' copy';return hydrate(d,j)}
function clearActive(){var j=readJob();if(!j)return;j.residentialLiveActive=null;write(j)}
function reprice(snapshot){return hydrate(stripPricing(snapshot||{}),readJob())}
function legacyList(){var a=parse(rawGet?rawGet(LEGACY_LIB_KEY):null,[]);return Array.isArray(a)?clone(a):[]}
function importLegacyToCurrent(ids){var j=readJob();if(!j)throw new Error('No saved Bruno Electric job found');var wanted=Array.isArray(ids)?ids.map(String):null,legacy=legacyList(),chosen=legacy.filter(function(x){return x&&(!wanted||wanted.indexOf(String(x.id))>=0)});if(!chosen.length)return{imported:0,archiveCount:archiveOf(j).length};var a=archiveOf(j).slice();chosen.forEach(function(src){var c=stripPricing(src);c.legacyOriginalId=String(src.id||'');c.id=uid();c.savedAt=now();c.legacyRecoveredAt=c.savedAt;c.name=String(c.name||'Recovered Residential calculation')+' · recovered';a.unshift(c)});if(a.length>MAX)a.length=MAX;j[ARCHIVE_FIELD]=a;write(j);return{imported:chosen.length,archiveCount:a.length}}
installStorageAdapter();
var api=Object.freeze({save:save,confirmAtomic:confirmAtomic,active:active,list:list,remove:remove,duplicate:duplicate,clearActive:clearActive,reprice:reprice,legacyList:legacyList,importLegacyToCurrent:importLegacyToCurrent,_keys:{job:JOB_KEY,legacyLibrary:LEGACY_LIB_KEY,archiveField:ARCHIVE_FIELD},_test:{archiveOf:archiveOf,stripPricing:stripPricing,comparable:comparable,sameCore:sameCore,adapterInstalled:function(){return adapterInstalled}},version:'job-scoped-v2'});
root.BrunoResidentialLiveHistory=api;
root.dispatchEvent&&root.dispatchEvent(new root.CustomEvent('bruno:residential-history-job-scoped'));
})(typeof window!=='undefined'?window:globalThis);

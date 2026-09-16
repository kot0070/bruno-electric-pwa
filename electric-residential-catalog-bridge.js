/* Bruno Electric — Residential Live <-> legacy Catalog compatibility bridge.
 * Keeps the shared pricing/BOM engines strict while providing deterministic aliases
 * from the current Residential Live BOM vocabulary to established Catalog rows.
 */
(function(root){
'use strict';
var P=root.BrunoResidentialPricing,B=root.BrunoElectricBOM;if(!P||!B)return;
function norm(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ')}
var ALIASES={
 '15a duplex receptacle':['120v 15 amp white receptacle (standard)'],
 '20a duplex receptacle':['120v 20 amp white receptacle'],
 '20a gfci receptacle':['120v 20 amp gfci receptacle'],
 '20a 1-pole breaker':['20 amp single pole'],
 '12/2 nm-b with ground':['12/2 romex with ground'],
 '14/2 nm-b with ground':['14/2 romex with ground'],
 '1-gang device wall plate allowance':['single gang receptacle cover -white']
};
function exact(catalog,name){var n=norm(name);return (catalog||[]).find(function(x){return norm(x&&x.item)===n})||null}
function resolve(catalog,item){var m=exact(catalog,item);if(m)return m;var a=ALIASES[norm(item)]||[];for(var i=0;i<a.length;i++){m=exact(catalog,a[i]);if(m)return m}return null}
function aliasCatalog(rows,catalog){var out=Array.isArray(catalog)?catalog.slice():[];(rows||[]).forEach(function(r){var item=String(r&&r.item||'');if(!item||exact(out,item))return;var m=resolve(out,item);if(!m)return;var clone=Object.assign({},m,{item:item,catalogAliasOf:m.item,catalogAliasSourceId:m.id});out.push(clone)});return out}
function readMap(key){try{var x=JSON.parse(localStorage.getItem(key)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(e){return{}}}
function knownCost(raw){if(raw==null||raw==='')return{known:false,value:''};var n=Number(raw);return Number.isFinite(n)&&n>=0?{known:true,value:n}:{known:false,value:''}}
function overlayPersistentPrices(state){if(!state||!Array.isArray(state.catalog))return state;var priceMaps=[readMap('bruno-electric-catalog-prices-v1'),readMap('bruno-job-catalog-prices-v1'),readMap('bruno-catalog-prices-v1')],costMaps=[readMap('bruno-electric-catalog-costs-v1'),readMap('bruno-job-catalog-costs-v1'),readMap('bruno-catalog-costs-v1')];state.catalog.forEach(function(c){if(!c||c.id==null)return;var id=String(c.id);priceMaps.forEach(function(m){if(Object.prototype.hasOwnProperty.call(m,id)){var p=Number(m[id]);if(Number.isFinite(p)&&p>=0)c.unitCost=p}});costMaps.forEach(function(m){if(Object.prototype.hasOwnProperty.call(m,id)){var v=knownCost(m[id]);c.yourCost=v.known?v.value:''}})});return state}
var originalPriceRows=P.priceRows;
root.BrunoResidentialPricing=Object.freeze(Object.assign({},P,{priceRows:function(rows,catalog){return originalPriceRows(rows,aliasCatalog(rows,catalog))},_catalogBridge:Object.freeze({resolve:resolve,aliasCatalog:aliasCatalog,knownCost:knownCost,overlayPersistentPrices:overlayPersistentPrices})}));
var originalRead=B.readJob,originalPrepare=B.prepareReplacement;
function readJob(){return overlayPersistentPrices(originalRead())}
function prepareReplacement(state,sourceTag,rows){var s=state?JSON.parse(JSON.stringify(state)):state;if(s){overlayPersistentPrices(s);s.catalog=aliasCatalog(rows,s.catalog)}return originalPrepare(s,sourceTag,rows)}
function replaceGenerated(sourceTag,rows){var prepared=prepareReplacement(readJob(),sourceTag,rows);localStorage.setItem(B._storageKey,JSON.stringify(prepared.state));return prepared.result}
root.BrunoElectricBOM=Object.freeze(Object.assign({},B,{readJob:readJob,prepareReplacement:prepareReplacement,replaceGenerated:replaceGenerated,_catalogBridge:Object.freeze({resolve:resolve,aliasCatalog:aliasCatalog,knownCost:knownCost,overlayPersistentPrices:overlayPersistentPrices})}));
})(window);

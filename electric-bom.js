/* Bruno Electric — generated BOM integration contract.
 * Manual material rows are never deleted. Recalculation replaces only rows with the same generated source tag.
 * Pricing integrity contract:
 * - known positive Your Cost => resolved numeric Job Material
 * - explicit Your Cost 0 => resolved numeric zero Job Material
 * - blank/missing/invalid Your Cost => first-class unresolved material, stored separately and excluded from numeric material-cost math
 */
(function(root){
'use strict';
var STORAGE='bruno-electric-v1';
function clone(x){return JSON.parse(JSON.stringify(x))}
function read(){try{return JSON.parse(localStorage.getItem(STORAGE)||'null')}catch(e){return null}}
function save(s){localStorage.setItem(STORAGE,JSON.stringify(s))}
function norm(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ')}
function catalogMatch(catalog,item){var n=norm(item);if(!n)return null;var exact=(catalog||[]).find(function(x){return norm(x&&x.item)===n});return exact||null}
function knownCost(raw){if(raw==null||String(raw).trim()==='')return{known:false,value:null};var n=Number(raw);if(!Number.isFinite(n)||n<0)return{known:false,value:null};return{known:true,value:Math.round(n*100)/100}}
function sameSource(x,sourceTag){return !!(x&&x.generatedBy&&x.generatedBy.source===sourceTag)}
function makeBase(r,m,sourceTag,i,status){return{
  qty:Number(r.qty)||0,item:String(r.item||''),part:m&&m.part||'',units:String(r.unit||r.units||m&&m.units||'EA'),lastPriceUpdate:m&&m.lastPriceUpdate||'',crew:Number(m&&m.crew)||1,prod:Number(m&&m.prod)||0,prodUnit:m&&m.prodUnit||'EA',
  generatedBy:{source:sourceTag,version:String(r.version||'phase1'),index:i},bomStatus:status,codeSource:r.codeSource||'',catalogMatchId:m&&m.id||null
}}
function prepareReplacement(state,sourceTag,rows){if(!sourceTag)throw new Error('sourceTag required');if(!state)throw new Error('No saved Bruno Electric job found');var s=clone(state);s.materialsUsed=Array.isArray(s.materialsUsed)?s.materialsUsed:[];s.materialsUnresolved=Array.isArray(s.materialsUnresolved)?s.materialsUnresolved:[];s.catalog=Array.isArray(s.catalog)?s.catalog:[];
  var keep=s.materialsUsed.filter(function(x){return !sameSource(x,sourceTag)});
  var keepUnresolved=s.materialsUnresolved.filter(function(x){return !sameSource(x,sourceTag)});
  var added=[],unresolved=[];
  (rows||[]).forEach(function(r,i){var m=catalogMatch(s.catalog,r.item),kc=knownCost(m&&m.yourCost);if(!m||!kc.known){var u=makeBase(r,m,sourceTag,i,'Unresolved');u.unitCost=null;u.costState='UNRESOLVED';u.unresolvedReason=!m?'CATALOG_UNMATCHED':'YOUR_COST_UNRESOLVED';unresolved.push(u);return;}var status=r.status||(kc.value===0?'Field Verify':'Required'),a=makeBase(r,m,sourceTag,i,status);a.unitCost=kc.value;a.costState='RESOLVED';added.push(a)});
  s.materialsUsed=keep.concat(added);s.materialsUnresolved=keepUnresolved.concat(unresolved);return{state:s,result:{added:added.length,preserved:keep.length,unresolved:unresolved.length,unresolvedPreserved:keepUnresolved.length}};
}
function replaceGenerated(sourceTag,rows){var prepared=prepareReplacement(read(),sourceTag,rows);save(prepared.state);return prepared.result}
root.BrunoElectricBOM=Object.freeze({replaceGenerated:replaceGenerated,prepareReplacement:prepareReplacement,readJob:read,_match:catalogMatch,_knownCost:knownCost,_storageKey:STORAGE});
})(window);

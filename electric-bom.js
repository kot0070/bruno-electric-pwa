/* Bruno Electric — generated BOM integration contract.
 * Manual material rows are never deleted. Recalculation replaces only rows with the same generated source tag.
 */
(function(root){
'use strict';
var STORAGE='bruno-electric-v1';
function clone(x){return JSON.parse(JSON.stringify(x))}
function read(){try{return JSON.parse(localStorage.getItem(STORAGE)||'null')}catch(e){return null}}
function save(s){localStorage.setItem(STORAGE,JSON.stringify(s))}
function norm(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ')}
function catalogMatch(catalog,item){var n=norm(item);if(!n)return null;var exact=(catalog||[]).find(function(x){return norm(x&&x.item)===n});return exact||null}
function replaceGenerated(sourceTag,rows){if(!sourceTag)throw new Error('sourceTag required');var s=read();if(!s)throw new Error('No saved Bruno Electric job found');s.materialsUsed=Array.isArray(s.materialsUsed)?s.materialsUsed:[];s.catalog=Array.isArray(s.catalog)?s.catalog:[];
  // Preserve every manual row and generated rows belonging to other calculators.
  var keep=s.materialsUsed.filter(function(x){return !(x&&x.generatedBy&&x.generatedBy.source===sourceTag)});
  var added=(rows||[]).map(function(r,i){var m=catalogMatch(s.catalog,r.item),hasYourCost=!!(m&&m.yourCost!=null&&m.yourCost!==''),price=hasYourCost?Number(m.yourCost):0;if(!Number.isFinite(price)||price<0)price=0;var status=!m||!hasYourCost?'Unresolved':(r.status||(price===0?'Field Verify':'Required'));return {
    qty:Number(r.qty)||0,item:String(r.item||''),part:m&&m.part||'',units:String(r.unit||r.units||m&&m.units||'EA'),unitCost:price,lastPriceUpdate:m&&m.lastPriceUpdate||'',crew:Number(m&&m.crew)||1,prod:Number(m&&m.prod)||0,prodUnit:m&&m.prodUnit||'EA',
    generatedBy:{source:sourceTag,version:String(r.version||'phase1'),index:i},bomStatus:status,codeSource:r.codeSource||'',catalogMatchId:m&&m.id||null
  }});
  s.materialsUsed=keep.concat(added);save(s);return {added:added.length,preserved:keep.length,unresolved:added.filter(function(x){return x.bomStatus==='Unresolved'}).length};
}
root.BrunoElectricBOM=Object.freeze({replaceGenerated:replaceGenerated,readJob:read,_match:catalogMatch});
})(window);

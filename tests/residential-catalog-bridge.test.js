'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function eq(a,b){if(Math.abs(Number(a)-Number(b))>1e-6)throw new Error('expected '+b+', got '+a)}
var storage={};
var sandbox={window:{},localStorage:{getItem:function(k){return Object.prototype.hasOwnProperty.call(storage,k)?storage[k]:null},setItem:function(k,v){storage[k]=String(v)}},console:console};sandbox.window=sandbox;
['electric-residential-pricing.js','electric-bom.js','electric-residential-catalog-bridge.js'].forEach(function(name){vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),sandbox,{filename:name})});
var P=sandbox.BrunoResidentialPricing,B=sandbox.BrunoElectricBOM;
test('legacy Catalog alias resolves Residential Live customer price without fuzzy matching',function(){var p=P.priceRows([{item:'20A GFCI receptacle',qty:2,unit:'EA'}],[{id:'c-2604',item:'120v 20 amp GFCI receptacle',unitCost:11,yourCost:7,units:'EA'}]);is(p.resolvedLineCount,1);is(p.unmatchedLineCount,0);eq(p.customerMaterialTotal,22);eq(p.yourMaterialCost,14)});
test('exact Catalog item wins before compatibility alias',function(){var p=P.priceRows([{item:'20A GFCI receptacle',qty:1}],[{id:'exact',item:'20A GFCI receptacle',unitCost:20,yourCost:10},{id:'legacy',item:'120v 20 amp GFCI receptacle',unitCost:11,yourCost:7}]);is(p.lines[0].catalogMatchId,'exact');eq(p.customerMaterialTotal,20)});
test('unsupported Residential BOM item remains unmatched instead of guessed',function(){var p=P.priceRows([{item:'Panelboard / service equipment — rating pending major loads',qty:1}], [{id:'x',item:'200A main breaker panel 40-space',unitCost:1000,yourCost:800}]);is(p.unmatchedLineCount,1);is(p.lines[0].status,'UNMATCHED')});
test('persistent Catalog price and cost maps are applied before live pricing',function(){storage['bruno-electric-v1']=JSON.stringify({catalog:[{id:'c-2604',item:'120v 20 amp GFCI receptacle',unitCost:11,yourCost:7}],materialsUsed:[]});storage['bruno-electric-catalog-prices-v1']=JSON.stringify({'c-2604':13});storage['bruno-electric-catalog-costs-v1']=JSON.stringify({'c-2604':8});var job=B.readJob(),p=P.priceRows([{item:'20A GFCI receptacle',qty:2}],job.catalog);eq(p.customerMaterialTotal,26);eq(p.yourMaterialCost,16)});
test('generated Job Materials uses alias Your Cost and catalog match metadata',function(){storage['bruno-electric-v1']=JSON.stringify({catalog:[{id:'m-2872',item:'20 amp single pole',unitCost:6.53,yourCost:4.25,units:'EA'}],materialsUsed:[{item:'manual'}]});B.replaceGenerated('residential-live-v2',[{item:'20A 1-pole breaker',qty:3,unit:'EA'}]);var s=JSON.parse(storage['bruno-electric-v1']),r=s.materialsUsed[1];is(r.item,'20A 1-pole breaker');eq(r.unitCost,4.25);is(r.catalogMatchId,'m-2872')});
global.BRUNO_TEST_RESULTS=out;
})();
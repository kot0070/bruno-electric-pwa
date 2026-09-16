'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var M=global.BrunoCustomMaterials;
function seed(job){localStorage.clear();localStorage.setItem('bruno-electric-v1',JSON.stringify(job||{catalog:[],materialsUsed:[],materialsUnresolved:[]}))}

test('custom material saves project-scoped Catalog row with metadata',function(){seed();var r=M.saveCatalogItem({item:'Special fixture',part:'SP-42',vendor:'Vendor X',units:'EA',customerPrice:'125.50',yourCost:'80',qty:'2'});ok(r.customMaterial);is(r.materialType,'CUSTOM_SPECIAL_ORDER');is(r.projectScoped,true);is(r.unitCost,125.5);is(r.yourCost,80);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.catalog.length,1);is(j.catalog[0].part,'SP-42')});

test('blank Your Cost remains unresolved in Catalog',function(){seed();var r=M.saveCatalogItem({item:'Made-to-order cover',customerPrice:'200',yourCost:'',qty:'1'});is(r.yourCost,'');var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.catalog[0].yourCost,'')});

test('custom known positive Your Cost adds to numeric Job Materials',function(){seed();var r=M.saveCatalogItem({item:'Custom assembly',customerPrice:'300',yourCost:'175',qty:'3'});var m=M.addToJob(r.id,3),j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(m.costState,'RESOLVED');is(m.unitCost,175);is(j.materialsUsed.length,1);is(j.materialsUnresolved.length,0);is(j.materialsUsed[0].qty,3);is(j.materialsUsed[0].catalogMatchId,r.id)});

test('custom explicit zero is a known resolved zero',function(){seed();var r=M.saveCatalogItem({item:'Warranty replacement',customerPrice:'99',yourCost:'0',qty:'1'});M.addToJob(r.id,1);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.materialsUsed.length,1);is(j.materialsUsed[0].unitCost,0);is(j.materialsUsed[0].costState,'RESOLVED');is(j.materialsUnresolved.length,0)});

test('custom blank Your Cost is excluded from materialsUsed and stored unresolved',function(){seed();var r=M.saveCatalogItem({item:'Special-order transformer',customerPrice:'900',yourCost:'',qty:'1'});M.addToJob(r.id,2);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.materialsUsed.length,0);is(j.materialsUnresolved.length,1);is(j.materialsUnresolved[0].unitCost,null);is(j.materialsUnresolved[0].costState,'UNRESOLVED');is(j.materialsUnresolved[0].unresolvedReason,'YOUR_COST_UNRESOLVED');is(j.materialsUnresolved[0].qty,2)});

test('negative price and nonpositive quantity fail closed',function(){seed();var threw=false;try{M.saveCatalogItem({item:'Bad',customerPrice:'-1',yourCost:'',qty:'1'})}catch(e){threw=true}ok(threw,'negative price accepted');threw=false;try{M.saveCatalogItem({item:'Bad qty',customerPrice:'1',yourCost:'',qty:'0'})}catch(e2){threw=true}ok(threw,'zero qty accepted')});

test('custom material removal affects Catalog only and does not rewrite Job Materials history',function(){seed();var r=M.saveCatalogItem({item:'One-off part',customerPrice:'50',yourCost:'20',qty:'1'});M.addToJob(r.id,1);is(M.remove(r.id),true);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.catalog.length,0);is(j.materialsUsed.length,1);is(j.materialsUsed[0].item,'One-off part')});

global.BRUNO_TEST_RESULTS=out;
})();

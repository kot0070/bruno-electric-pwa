'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var M=global.BrunoCustomMaterials;
function seed(job){localStorage.clear();localStorage.setItem('bruno-electric-v1',JSON.stringify(job||{catalog:[],materialsUsed:[],materialsUnresolved:[]}))}

test('custom material saves project-scoped Catalog row with metadata and persisted qty',function(){seed();var r=M.saveCatalogItem({item:'Special fixture',part:'SP-42',vendor:'Vendor X',units:'EA',customerPrice:'125.50',yourCost:'80',qty:'2'});ok(r.customMaterial);is(r.materialType,'CUSTOM_SPECIAL_ORDER');is(r.projectScoped,true);is(r.unitCost,125.5);is(r.yourCost,80);is(r.qty,2);is(r.prodUnit,'EA');var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.catalog.length,1);is(j.catalog[0].part,'SP-42');is(j.catalog[0].qty,2)});

test('blank Your Cost remains unresolved in Catalog',function(){seed();var r=M.saveCatalogItem({item:'Made-to-order cover',customerPrice:'200',yourCost:'',qty:'1'});is(r.yourCost,'');var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.catalog[0].yourCost,'')});

test('Save to Catalog qty survives reload/read and Add existing defaults to saved qty',function(){seed();var r=M.saveCatalogItem({item:'Reload fixture',customerPrice:'225',yourCost:'100',qty:'5'});var saved=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(saved.catalog[0].qty,5);var listed=M.list();is(listed[0].qty,5);M.addToJob(r.id);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.materialsUsed.length,1);is(j.materialsUsed[0].qty,5);is(j.materialsUsed[0].catalogQty,5)});

test('Add existing accepts explicit row-specific quantity override without mutating saved Catalog qty',function(){seed();var r=M.saveCatalogItem({item:'Override fixture',customerPrice:'225',yourCost:'100',qty:'5'});M.addToJob(r.id,'2.5');var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.materialsUsed[0].qty,2.5);is(j.materialsUsed[0].catalogQty,5);is(j.catalog[0].qty,5)});

test('repeated Add existing uses saved qty and does not mutate prior rows',function(){seed();var r=M.saveCatalogItem({item:'Repeat fixture',customerPrice:'300',yourCost:'150',qty:'4'});M.addToJob(r.id);M.addToJob(r.id);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.materialsUsed.length,2);is(j.materialsUsed[0].qty,4);is(j.materialsUsed[1].qty,4);j.materialsUsed[1].qty=9;is(j.materialsUsed[0].qty,4)});

test('edit custom Catalog item preserves id and createdAt while persisting new qty price cost and metadata',function(){seed();var r=M.saveCatalogItem({item:'Editable',part:'OLD',vendor:'Vendor A',units:'EA',customerPrice:'100',yourCost:'60',qty:'2'}),created=r.createdAt;var u=M.updateCatalogItem(r.id,{item:'Editable revised',part:'NEW',vendor:'Vendor B',units:'FT',customerPrice:'120',yourCost:'',qty:'7'});is(u.id,r.id);is(u.createdAt,created);is(u.item,'Editable revised');is(u.part,'NEW');is(u.vendor,'Vendor B');is(u.units,'FT');is(u.prodUnit,'FT');is(u.unitCost,120);is(u.yourCost,'');is(u.qty,7);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.catalog.length,1);is(j.catalog[0].qty,7)});

test('editing Catalog item does not rewrite already-added Job Material history',function(){seed();var r=M.saveCatalogItem({item:'History part',customerPrice:'100',yourCost:'40',qty:'2'});M.addToJob(r.id);M.updateCatalogItem(r.id,{item:'History part revised',customerPrice:'150',yourCost:'70',qty:'9'});var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.materialsUsed.length,1);is(j.materialsUsed[0].item,'History part');is(j.materialsUsed[0].unitCost,40);is(j.materialsUsed[0].qty,2);is(j.catalog[0].item,'History part revised');is(j.catalog[0].qty,9)});

test('custom known positive Your Cost adds to numeric Job Materials',function(){seed();var r=M.saveCatalogItem({item:'Custom assembly',customerPrice:'300',yourCost:'175',qty:'3'});var m=M.addToJob(r.id),j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(m.costState,'RESOLVED');is(m.unitCost,175);is(j.materialsUsed.length,1);is(j.materialsUnresolved.length,0);is(j.materialsUsed[0].qty,3);is(j.materialsUsed[0].catalogMatchId,r.id);is(j.materialsUsed[0].customerUnitPrice,300)});

test('custom explicit zero is a known resolved zero',function(){seed();var r=M.saveCatalogItem({item:'Warranty replacement',customerPrice:'99',yourCost:'0',qty:'1'});M.addToJob(r.id);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.materialsUsed.length,1);is(j.materialsUsed[0].unitCost,0);is(j.materialsUsed[0].costState,'RESOLVED');is(j.materialsUnresolved.length,0)});

test('custom blank Your Cost is excluded from materialsUsed and stored unresolved with saved qty',function(){seed();var r=M.saveCatalogItem({item:'Special-order transformer',customerPrice:'900',yourCost:'',qty:'2'});M.addToJob(r.id);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.materialsUsed.length,0);is(j.materialsUnresolved.length,1);is(j.materialsUnresolved[0].unitCost,null);is(j.materialsUnresolved[0].costState,'UNRESOLVED');is(j.materialsUnresolved[0].unresolvedReason,'YOUR_COST_UNRESOLVED');is(j.materialsUnresolved[0].qty,2)});

test('negative price and nonpositive quantity fail closed on create update and add',function(){seed();var r=M.saveCatalogItem({item:'Good',customerPrice:'1',yourCost:'',qty:'1'}),threw=false;try{M.saveCatalogItem({item:'Bad',customerPrice:'-1',yourCost:'',qty:'1'})}catch(e){threw=true}ok(threw,'negative price accepted');threw=false;try{M.updateCatalogItem(r.id,{item:'Bad update',customerPrice:'1',yourCost:'',qty:'0'})}catch(e2){threw=true}ok(threw,'zero update qty accepted');threw=false;try{M.addToJob(r.id,'0')}catch(e3){threw=true}ok(threw,'zero add qty accepted')});

test('custom material removal affects Catalog only and does not rewrite Job Materials history',function(){seed();var r=M.saveCatalogItem({item:'One-off part',customerPrice:'50',yourCost:'20',qty:'1'});M.addToJob(r.id);is(M.remove(r.id),true);var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(j.catalog.length,0);is(j.materialsUsed.length,1);is(j.materialsUsed[0].item,'One-off part')});

global.BRUNO_TEST_RESULTS=out;
})();

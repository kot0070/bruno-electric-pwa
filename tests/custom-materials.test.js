'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var M=global.BrunoCustomMaterials,JOB='bruno-electric-v1',OLD_REG='bruno-electric-custom-materials-v1';
function seed(job){localStorage.clear();localStorage.setItem(JOB,JSON.stringify(job||{catalog:[],materialsUsed:[],materialsUnresolved:[]}))}
function job(){return JSON.parse(localStorage.getItem(JOB))}

test('custom material saves project-scoped Catalog row with persisted qty',function(){seed();var r=M.saveCatalogItem({item:'Special fixture',part:'SP-42',vendor:'Vendor X',units:'EA',customerPrice:'125.50',yourCost:'80',qty:'2'},{reload:false});ok(r.customMaterial);is(r.materialType,'CUSTOM_SPECIAL_ORDER');is(r.projectScoped,true);is(r.unitCost,125.5);is(r.yourCost,80);is(r.qty,2);is(job().catalog[0].qty,2)});

test('Save/reload/Add existing defaults to saved qty',function(){seed();var r=M.saveCatalogItem({item:'Reload fixture',customerPrice:'225',yourCost:'100',qty:'5'},{reload:false});is(M.list()[0].qty,5);M.addToJob(r.id,null,{reload:false});var j=job();is(j.materialsUsed.length,1);is(j.materialsUsed[0].qty,5);is(j.materialsUsed[0].catalogQty,5)});

test('row-specific Add Qty override does not mutate Catalog qty',function(){seed();var r=M.saveCatalogItem({item:'Override fixture',customerPrice:'225',yourCost:'100',qty:'5'},{reload:false});M.addToJob(r.id,'2.5',{reload:false});var j=job();is(j.materialsUsed[0].qty,2.5);is(j.materialsUsed[0].catalogQty,5);is(j.catalog[0].qty,5)});

test('edit preserves stable id createdAt and Job Material history',function(){seed();var r=M.saveCatalogItem({item:'History part',part:'OLD',vendor:'V1',units:'EA',customerPrice:'100',yourCost:'40',qty:'2'},{reload:false}),created=r.createdAt;M.addToJob(r.id,null,{reload:false});var u=M.updateCatalogItem(r.id,{item:'History revised',part:'NEW',vendor:'V2',units:'FT',customerPrice:'150',yourCost:'70',qty:'9'},{reload:false});is(u.id,r.id);is(u.createdAt,created);ok(!!u.updatedAt);var j=job();is(j.catalog[0].item,'History revised');is(j.catalog[0].qty,9);is(j.materialsUsed[0].item,'History part');is(j.materialsUsed[0].unitCost,40);is(j.materialsUsed[0].qty,2)});

test('delete affects Catalog only and preserves Job history',function(){seed();var r=M.saveCatalogItem({item:'One-off part',customerPrice:'50',yourCost:'20',qty:'1'},{reload:false});M.addToJob(r.id,null,{reload:false});is(M.remove(r.id,{reload:false}),true);var j=job();is(j.catalog.length,0);is(j.materialsUsed.length,1);is(j.materialsUsed[0].item,'One-off part')});

test('strict Custom blank Your Cost routes unresolved and never Customer Price',function(){seed();var r=M.saveCatalogItem({item:'Blank special',customerPrice:'900',yourCost:'',qty:'2'},{reload:false});M.routeCatalogAdd(r.id,{reload:false});var j=job();is(j.materialsUsed.length,0);is(j.materialsUnresolved.length,1);is(j.materialsUnresolved[0].unitCost,null);is(j.materialsUnresolved[0].customerUnitPrice,900);is(j.materialsUnresolved[0].costState,'UNRESOLVED')});

test('strict Custom explicit zero routes resolved zero',function(){seed();var r=M.saveCatalogItem({item:'Zero special',customerPrice:'99',yourCost:'0',qty:'1'},{reload:false});M.routeCatalogAdd(r.id,{reload:false});var j=job();is(j.materialsUsed.length,1);is(j.materialsUsed[0].unitCost,0);is(j.materialsUsed[0].customerUnitPrice,99);is(j.materialsUsed[0].costState,'RESOLVED')});

test('strict Custom positive Your Cost routes contractor cost not Customer Price',function(){seed();var r=M.saveCatalogItem({item:'Positive special',customerPrice:'300',yourCost:'175',qty:'3'},{reload:false});M.routeCatalogAdd(r.id,{reload:false});var j=job();is(j.materialsUsed.length,1);is(j.materialsUsed[0].unitCost,175);is(j.materialsUsed[0].customerUnitPrice,300);is(j.materialsUsed[0].catalogMatchId,r.id);is(j.materialsUsed[0].catalogQty,3)});

test('ordinary Catalog route ignores non-custom rows',function(){seed({catalog:[{id:'ordinary',item:'Ordinary',unitCost:12}],materialsUsed:[],materialsUnresolved:[]});is(M.routeCatalogAdd('ordinary',{reload:false}),false);is(job().materialsUsed.length,0)});

test('Job A to Job B replacement preserves only Job B Custom definitions',function(){seed();M.saveCatalogItem({item:'Job A custom',customerPrice:'10',yourCost:'5',qty:'1'},{reload:false});var jobB={catalog:[{id:'b-custom',item:'Job B custom',unitCost:20,yourCost:7,qty:4,customMaterial:true,materialType:'CUSTOM_SPECIAL_ORDER',projectScoped:true}],materialsUsed:[],materialsUnresolved:[],quote:{jobNumber:'B'}};localStorage.setItem(JOB,JSON.stringify(jobB));var rows=M.list();is(rows.length,1);is(rows[0].id,'b-custom');is(rows[0].item,'Job B custom');is(job().catalog.filter(function(x){return x.item==='Job A custom'}).length,0)});

test('legacy device-global registry content cannot overwrite active job',function(){seed({catalog:[{id:'active-custom',item:'Active job custom',unitCost:30,yourCost:'',qty:2,customMaterial:true,materialType:'CUSTOM_SPECIAL_ORDER',projectScoped:true}],materialsUsed:[],materialsUnresolved:[]});localStorage.setItem(OLD_REG,JSON.stringify([{id:'wrong',item:'Other job custom',customMaterial:true,materialType:'CUSTOM_SPECIAL_ORDER'}]));var rows=M.list();is(rows.length,1);is(rows[0].id,'active-custom');is(job().catalog[0].id,'active-custom')});

test('malformed legacy registry cannot erase valid current-job Custom definitions',function(){seed({catalog:[{id:'valid-custom',item:'Valid current custom',unitCost:40,yourCost:12,qty:2,customMaterial:true,materialType:'CUSTOM_SPECIAL_ORDER',projectScoped:true}],materialsUsed:[],materialsUnresolved:[]});localStorage.setItem(OLD_REG,'{bad json');var rows=M.list();is(rows.length,1);is(rows[0].id,'valid-custom');is(job().catalog.length,1)});

test('valid non-array legacy registry cannot erase current-job Custom definitions',function(){seed({catalog:[{id:'valid-custom-2',item:'Valid current custom 2',unitCost:40,yourCost:12,qty:2,customMaterial:true,materialType:'CUSTOM_SPECIAL_ORDER',projectScoped:true}],materialsUsed:[],materialsUnresolved:[]});localStorage.setItem(OLD_REG,JSON.stringify({rows:[]}));is(M.list()[0].id,'valid-custom-2');is(job().catalog.length,1)});

test('negative price and nonpositive quantity fail closed',function(){seed();var threw=false;try{M.saveCatalogItem({item:'Bad',customerPrice:'-1',yourCost:'',qty:'1'},{reload:false})}catch(e){threw=true}ok(threw);var r=M.saveCatalogItem({item:'Good',customerPrice:'1',yourCost:'',qty:'1'},{reload:false});threw=false;try{M.addToJob(r.id,'0',{reload:false})}catch(e2){threw=true}ok(threw)});

if(typeof require==='function'){
 var fs=require('fs'),path=require('path'),src=fs.readFileSync(path.join(__dirname,'..','electric-custom-materials.js'),'utf8');
 test('legacy Catalog plus is capture-intercepted and fail-closed into strict route',function(){ok(src.indexOf("closest('.cat-add')")>=0,'cat-add capture missing');ok(src.indexOf('stopImmediatePropagation')>=0,'legacy handler not blocked');ok(src.indexOf('routeCatalogAdd(id)')>=0,'strict route not invoked')});
 test('Custom module has no device-global registry authority',function(){ok(src.indexOf("CUSTOM_KEY='bruno-electric-custom-materials-v1'")<0,'global custom registry authority returned');ok(src.indexOf('ensureRegistry')<0,'global registry reconciliation returned');ok(src.indexOf('reconcile(')<0,'global registry reconciliation returned')});
}

global.BRUNO_TEST_RESULTS=out;
})();

'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
var src=fs.readFileSync(path.join(__dirname,'..','electric-catalog-job-ux-semantics.js'),'utf8');
function load(){var w={document:null,localStorage:{getItem:function(){return null}},addEventListener:function(){},setTimeout:setTimeout};var sb={window:w,globalThis:w,console:console,Number:Number,String:String,Array:Array,Object:Object,JSON:JSON};vm.runInNewContext(src,sb,{filename:'electric-catalog-job-ux-semantics.js'});return w.BrunoCatalogJobUXSemantics}
test('usage aggregates resolved and unresolved Job Material snapshots by catalog id',function(){var M=load(),u=M.usage({materialsUsed:[{catalogMatchId:'a',qty:2},{catalogMatchId:'a',qty:1}],materialsUnresolved:[{catalogMatchId:'b',qty:3}]});is(u.a,3);is(u.b,3)});
test('Catalog row semantics explicitly show Catalog Custom and Used on Job state',function(){var M=load(),tags=M.catalogSemantics({id:'c1',customMaterial:true,materialType:'CUSTOM_SPECIAL_ORDER'},{c1:2});is(tags[0],'CATALOG');ok(tags.indexOf('CUSTOM / SPECIAL ORDER')>=0,'custom marker missing');ok(tags.indexOf('USED ON JOB ×2')>=0,'used marker missing')});
test('unused ordinary Catalog row does not falsely claim Used on Job',function(){var M=load(),tags=M.catalogSemantics({id:'c2',item:'Wire'},{});is(tags.join('|'),'CATALOG')});
test('Job Material source distinguishes custom catalog generated and manual snapshots',function(){var M=load();is(M.jobSource({customMaterial:true}),'CUSTOM SNAPSHOT');is(M.jobSource({catalogMatchId:'c1'}),'CATALOG SNAPSHOT');is(M.jobSource({generatedBy:{source:'residential-saved-calculation:1'}}),'GENERATED · residential-saved-calculation:1');is(M.jobSource({item:'Manual'}),'MANUAL JOB SNAPSHOT')});
test('UX copy explicitly separates Catalog definitions from historical Job snapshots',function(){ok(src.indexOf('Catalog = reusable definition for this Job')>=0,'Catalog definition explanation missing');ok(src.indexOf('Job Materials = historical calculation snapshots')>=0,'Job snapshot explanation missing');ok(src.indexOf('does not rewrite existing Job Material snapshots')>=0,'immutability explanation missing')});
test('Catalog decorator exposes row-level used and custom state attributes',function(){ok(src.indexOf("data-used-on-job")>=0,'used-state attribute missing');ok(src.indexOf("data-custom-material")>=0,'custom-state attribute missing');ok(src.indexOf(".cat-add[data-id]")>=0,'Catalog Add row binding missing')});
test('Job decorator exposes row-level source marker',function(){ok(src.indexOf('data-job-material-source')>=0,'Job source row marker missing');ok(src.indexOf('be-job-source')>=0,'Job source badge missing')});
test('responsive semantics include phone breakpoint',function(){ok(src.indexOf('@media(max-width:767.98px)')>=0,'phone breakpoint missing')});
global.BRUNO_TEST_RESULTS=out;
})();

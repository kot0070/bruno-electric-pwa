'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function near(a,b,t){if(Math.abs(a-b)>(t||1e-9))throw new Error('expected '+b+', got '+a)}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
var src=fs.readFileSync(path.join(__dirname,'..','electric-catalog-labor-estimator.js'),'utf8');
function load(){var store={};var w={document:null,localStorage:{getItem:function(k){return store[k]||null},setItem:function(k,v){store[k]=String(v)}},addEventListener:function(){},setTimeout:setTimeout};var sb={window:w,globalThis:w,console:console,Number:Number,String:String,Array:Array,Object:Object,JSON:JSON,Math:Math};vm.runInNewContext(src,sb,{filename:'electric-catalog-labor-estimator.js'});return w.BrunoCatalogLaborEstimator}
test('legacy Day formula matches Excel qty/productivity*crew*8',function(){var M=load();near(M.legacyHours({crew:1,prod:170,prodUnit:'Day'},1),8/170)});
test('legacy Day formula includes crew count unlike duration-only K column',function(){var M=load();near(M.legacyHours({crew:2,prod:120,prodUnit:'Day'},1),16/120)});
test('legacy Hour formula matches Excel qty/productivity*crew without times eight',function(){var M=load();near(M.legacyHours({crew:2,prod:750,prodUnit:'Hour'},1),2/750)});
test('legacy quantity scales exact workbook labor relationship',function(){var M=load();near(M.legacyHours({crew:1,prod:25,prodUnit:'Day'},9),2.88)});
test('labor cost is hours times explicit independent labor cost rate',function(){var M=load();near(M.laborCost({crew:1,prod:25,prodUnit:'Day'},9,50),144)});
test('missing crew or productivity does not invent labor',function(){var M=load();near(M.legacyHours({crew:0,prod:25,prodUnit:'Day'},1),0);near(M.legacyHours({crew:1,prod:0,prodUnit:'Day'},1),0)});
test('module labels old numbers as Legacy Excel rather than modern benchmark',function(){ok(src.indexOf('Legacy Excel baseline')>=0,'legacy source label missing');ok(src.indexOf('historical baseline')>=0,'stale-data warning missing')});
global.BRUNO_TEST_RESULTS=out;
})();

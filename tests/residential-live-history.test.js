'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
var H=global.BrunoResidentialLiveHistory;
function seed(){localStorage.clear();localStorage.setItem('bruno-electric-v1',JSON.stringify({materialsUsed:[],catalog:[]}))}
test('confirmed residential calculation becomes active job estimate and history entry',function(){seed();var s=H.save({name:'House A',inputs:{squareFeet:2100},pricing:{customerMaterialTotal:1234.56,yourMaterialCost:900}});ok(s.id,'id missing');is(H.active().name,'House A');is(H.list().length,1);is(H.active().pricing.customerMaterialTotal,1234.56);var job=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(job.residentialLiveActive.id,s.id)});
test('saving another confirmed calculation keeps history and replaces active only',function(){seed();var a=H.save({name:'House A',inputs:{squareFeet:2100},pricing:{customerMaterialTotal:100}});var b=H.save({name:'House B',inputs:{squareFeet:2400},pricing:{customerMaterialTotal:200}});is(H.active().id,b.id);is(H.list().length,2);ok(H.list().some(function(x){return x.id===a.id}),'first history snapshot lost')});
test('duplicate creates reusable editable copy without overwriting source',function(){seed();var a=H.save({name:'Builder Plan 1',inputs:{squareFeet:1800,overrides:{generalReceptacles:20}},pricing:{customerMaterialTotal:500}});var d=H.duplicate(a.id);ok(d.id!==a.id,'duplicate reused id');is(d.inputs.squareFeet,1800);is(d.inputs.overrides.generalReceptacles,20);ok(d.name.indexOf('copy')>=0,'copy name missing');is(H.list().length,1)});
test('history survives active clear for reuse on another job workflow',function(){seed();H.save({name:'Reusable Plan',inputs:{squareFeet:2000},pricing:{customerMaterialTotal:700}});H.clearActive();ok(!H.active(),'active not cleared');is(H.list().length,1)});
global.BRUNO_TEST_RESULTS=out;
})();

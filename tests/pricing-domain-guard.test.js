'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]},G=global.BrunoPricingDomainGuard;
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'expected truthy')}
function invalid(job,path){var r=G.validateJob(job);ok(!r.valid,'job unexpectedly valid');ok(r.errors.some(function(e){return e.path===path}),path+' not reported')}
function base(){return{materialsUsed:[],laborEquip:{equipment:[],smallTools:[],subcontractors:[],blocks:[]},tm:{equipmentLines:[],laborLines:[],materialAmount:0,subAmount:0},summary:{ohRate:.2,profitMargin:.2},changeOrders:[]}}

test('valid estimating state passes domain guard',function(){ok(G.validateJob(base()).valid)});
test('negative Job Material qty fails closed',function(){var j=base();j.materialsUsed=[{qty:-1,unitCost:50}];invalid(j,'materialsUsed[0].qty')});
test('negative Job Material cost fails closed',function(){var j=base();j.materialsUsed=[{qty:1,unitCost:-50}];invalid(j,'materialsUsed[0].unitCost')});
test('blank persisted material cost fails closed',function(){var j=base();j.materialsUsed=[{qty:1,unitCost:''}];invalid(j,'materialsUsed[0].unitCost')});
test('negative equipment cost fails closed',function(){var j=base();j.laborEquip.equipment=[{cost:-10}];invalid(j,'laborEquip.equipment[0].cost')});
test('negative small-tool qty fails closed',function(){var j=base();j.laborEquip.smallTools=[{qty:-2,unitCost:5}];invalid(j,'laborEquip.smallTools[0].qty')});
test('negative subcontractor price fails closed',function(){var j=base();j.laborEquip.subcontractors=[{price:-100}];invalid(j,'laborEquip.subcontractors[0].price')});
test('negative labor hours fail closed',function(){var j=base();j.laborEquip.blocks=[{persons:1,days:1,hoursPerDay:-8,satPersons:0,satDays:0,satHours:0,sunPersons:0,sunDays:0,sunHours:0}];invalid(j,'laborEquip.blocks[0].hoursPerDay')});
test('negative T&M equipment qty fails closed',function(){var j=base();j.tm.equipmentLines=[{qty:-2,rate:100}];invalid(j,'tm.equipmentLines[0].qty')});
test('negative T&M labor rate fails closed',function(){var j=base();j.tm.laborLines=[{hours:8,rate:-50}];invalid(j,'tm.laborLines[0].rate')});
test('negative T&M material amount fails closed',function(){var j=base();j.tm.materialAmount=-1;invalid(j,'tm.materialAmount')});
test('negative overhead fails closed',function(){var j=base();j.summary.ohRate=-.01;invalid(j,'summary.ohRate')});
test('profit exactly 1 fails closed',function(){var j=base();j.summary.profitMargin=1;invalid(j,'summary.profitMargin')});
test('profit over 1 fails closed',function(){var j=base();j.summary.profitMargin=1.2;invalid(j,'summary.profitMargin')});
test('profit .99 remains valid domain',function(){var j=base();j.summary.profitMargin=.99;ok(G.validateJob(j).valid)});
test('negative approved Change Order remains valid signed credit domain',function(){var j=base();j.changeOrders=[{amount:-250,status:'approved'}];ok(G.validateJob(j).valid)});
test('assertValid throws on invalid state',function(){var j=base(),hit=false;j.tm.subAmount=-2;try{G.assertValid(j)}catch(e){hit=true;ok(e.message.indexOf('INVALID PRICING INPUT')>=0)}ok(hit)});

global.BRUNO_TEST_RESULTS=out;
})();

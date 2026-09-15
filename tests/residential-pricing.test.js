'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function eq(a,b){if(Math.abs(Number(a)-Number(b))>1e-6)throw new Error('expected '+b+', got '+a)}
function throws(fn){var ok=false;try{fn()}catch(e){ok=true}if(!ok)throw new Error('expected error')}
var P=global.BrunoResidentialPricing;

test('code scope preserves layout-driven general receptacles',function(){var s=P.codeScope({});var r=s.find(function(x){return x.reference.indexOf('210.52(A)(1)-(2)')>0});is(r.quantity,'Layout Required');is(r.basis,'Layout Required')});
test('code scope requires two kitchen small appliance circuits',function(){var s=P.codeScope({});var r=s.find(function(x){return x.reference.indexOf('210.11(C)(1)')>0});is(r.quantity,2);is(r.unit,'20A circuits')});
test('garage bays produce one receptacle each plus one garage circuit',function(){var s=P.codeScope({garageBays:2});var bay=s.find(function(x){return x.reference.indexOf('210.52(G)(1)')>0}),c=s.find(function(x){return x.reference.indexOf('210.11(C)(4)')>0});is(bay.quantity,2);is(c.quantity,1)});
test('one family at grade produces front and back outdoor receptacles',function(){var s=P.codeScope({oneFamilyAtGrade:true});var r=s.find(function(x){return x.reference.indexOf('210.52(E)(1)')>0});is(r.quantity,2)});
test('hallway count maps to 210.52(H)',function(){var s=P.codeScope({hallways10ft:3});var r=s.find(function(x){return x.reference.indexOf('210.52(H)')>0});is(r.quantity,3)});
test('island count produces future provision rows',function(){var s=P.codeScope({kitchenIslandPeninsulas:2});var r=s.find(function(x){return x.reference.indexOf('210.52(C)(2)')>0});is(r.quantity,2)});
test('scope rejects fractional room counts',function(){throws(function(){P.codeScope({garageBays:1.5})})});

test('dual pricing uses customer unitCost and discounted yourCost',function(){var p=P.priceRows([{qty:100,unit:'FT',item:'12/2 NM-B with ground'}],[{id:'x',item:'12/2 NM-B with ground',unitCost:1.25,yourCost:.80,units:'FT'}]);eq(p.customerMaterialTotal,125);eq(p.yourMaterialCost,80);eq(p.materialGrossProfit,45);eq(p.materialMarginPct,36);is(p.matchedLineCount,1);is(p.unmatchedLineCount,0)});
test('explicit zero yourCost is preserved as 100 percent material margin',function(){var p=P.priceRows([{qty:2,item:'20A 1-pole breaker'}],[{id:'b',item:'20A 1-pole breaker',unitCost:20,yourCost:0}]);eq(p.customerMaterialTotal,40);eq(p.yourMaterialCost,0);eq(p.materialGrossProfit,40);eq(p.materialMarginPct,100)});
test('blank yourCost falls back to customer price',function(){var p=P.priceRows([{qty:2,item:'20A 1-pole breaker'}],[{id:'b',item:'20A 1-pole breaker',unitCost:20,yourCost:''}]);eq(p.customerMaterialTotal,40);eq(p.yourMaterialCost,40);eq(p.materialGrossProfit,0)});
test('unmatched residential BOM row is counted and not silently priced',function(){var p=P.priceRows([{qty:1,item:'Unknown field verify item'}],[]);is(p.unmatchedLineCount,1);eq(p.customerMaterialTotal,0);eq(p.yourMaterialCost,0)});
test('zero customer price remains unpriced',function(){var p=P.priceRows([{qty:1,item:'20A 1-pole breaker'}],[{id:'b',item:'20A 1-pole breaker',unitCost:0,yourCost:0}]);is(p.unpricedLineCount,1);is(p.lines[0].status,'UNPRICED')});

global.BRUNO_TEST_RESULTS=out;
})();

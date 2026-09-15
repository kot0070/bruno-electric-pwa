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
test('blank project counts do not fabricate garage hallway deck island or room scope',function(){var s=P.codeScope({});is(!!s.find(function(x){return x.reference.indexOf('210.52(G)(1)')>0}),false);is(!!s.find(function(x){return x.reference.indexOf('210.52(H)')>0}),false);is(!!s.find(function(x){return x.reference.indexOf('210.52(E)(3)')>0}),false);is(!!s.find(function(x){return x.reference.indexOf('210.52(C)(2)')>0}),false);is(!!s.find(function(x){return x.area==='Habitable rooms'}),false)});
test('garage bays produce one receptacle each plus one garage circuit',function(){var s=P.codeScope({garageBays:2});var bay=s.find(function(x){return x.reference.indexOf('210.52(G)(1)')>0}),c=s.find(function(x){return x.reference.indexOf('210.11(C)(4)')>0});is(bay.quantity,2);is(c.quantity,1)});
test('one family at grade must be explicitly confirmed for front and back outdoor receptacles',function(){is(!!P.codeScope({}).find(function(x){return x.reference.indexOf('210.52(E)(1)')>0}),false);var r=P.codeScope({oneFamilyAtGrade:true}).find(function(x){return x.reference.indexOf('210.52(E)(1)')>0});is(r.quantity,2)});
test('hallway count maps to 210.52(H)',function(){var s=P.codeScope({hallways10ft:3});var r=s.find(function(x){return x.reference.indexOf('210.52(H)')>0});is(r.quantity,3)});
test('island future provisions count only user declared islands without installed receptacle',function(){var s=P.codeScope({islandsWithoutReceptacle:2});var r=s.find(function(x){return x.reference.indexOf('210.52(C)(2)')>0});is(r.quantity,2);is(r.basis,'User Fact + Code Requirement')});
test('explicit zero laundry areas stays zero and emits no laundry circuit receptacle or light rows',function(){var s=P.codeScope({laundryAreas:0});is(s.filter(function(x){return x.area==='Laundry'}).length,0)});
test('positive laundry count emits laundry circuit receptacle and lighting rows',function(){var s=P.codeScope({laundryAreas:2});var a=s.filter(function(x){return x.area==='Laundry'});is(a.length,3);is(a.find(function(x){return x.reference.indexOf('210.52(F)')>0}).quantity,2)});
test('deck row is explicitly user-qualified',function(){var r=P.codeScope({deckPorchAreas:1}).find(function(x){return x.reference.indexOf('210.52(E)(3)')>0});is(r.basis,'User Qualified Count + Code Minimum')});
test('lighting scope contains explicit partial plans-required row',function(){var r=P.codeScope({}).find(function(x){return x.area==='Lighting — additional dwelling locations'});is(r.basis,'Not Fully Modeled / Plans Required');if(r.requirement.indexOf('PARTIAL SUMMARY ONLY')<0)throw new Error('partial warning missing')});
test('scope rejects fractional room counts',function(){throws(function(){P.codeScope({garageBays:1.5})})});
test('scope rejects negative counts',function(){throws(function(){P.codeScope({bathrooms:-1})})});

test('dual pricing uses customer unitCost and discounted yourCost',function(){var p=P.priceRows([{qty:100,unit:'FT',item:'12/2 NM-B with ground'}],[{id:'x',item:'12/2 NM-B with ground',unitCost:1.25,yourCost:.80,units:'FT'}]);eq(p.customerMaterialTotal,125);eq(p.resolvedCustomerMaterialTotal,125);eq(p.yourMaterialCost,80);eq(p.materialGrossProfit,45);eq(p.materialMarginPct,36);is(p.resolvedLineCount,1);is(p.unmatchedLineCount,0)});
test('10 x 8 customer and 5 cost gives 80 50 30 and 37.5 percent',function(){var p=P.priceRows([{qty:10,item:'x'}],[{id:'x',item:'x',unitCost:8,yourCost:5}]);eq(p.customerMaterialTotal,80);eq(p.yourMaterialCost,50);eq(p.materialGrossProfit,30);eq(p.materialMarginPct,37.5)});
test('explicit zero yourCost is preserved as valid 100 percent material margin',function(){var p=P.priceRows([{qty:2,item:'20A 1-pole breaker'}],[{id:'b',item:'20A 1-pole breaker',unitCost:20,yourCost:0}]);eq(p.customerMaterialTotal,40);eq(p.yourMaterialCost,0);eq(p.materialGrossProfit,40);eq(p.materialMarginPct,100);is(p.lines[0].status,'PRICED')});
test('blank yourCost becomes unresolved and is excluded from material profit',function(){var p=P.priceRows([{qty:2,item:'20A 1-pole breaker'}],[{id:'b',item:'20A 1-pole breaker',unitCost:20,yourCost:''}]);eq(p.customerMaterialTotal,40);eq(p.resolvedCustomerMaterialTotal,0);eq(p.yourMaterialCost,0);eq(p.materialGrossProfit,0);is(p.yourCostUnresolvedLineCount,1);is(p.lines[0].status,'YOUR_COST_UNRESOLVED');is(p.lines[0].yourUnitCost,null)});
test('null and missing yourCost remain unresolved',function(){var rows=[{qty:1,item:'a'},{qty:1,item:'b'}],cat=[{id:'a',item:'a',unitCost:10,yourCost:null},{id:'b',item:'b',unitCost:20}];var p=P.priceRows(rows,cat);is(p.yourCostUnresolvedLineCount,2);is(p.lines[0].status,'YOUR_COST_UNRESOLVED');is(p.lines[1].status,'YOUR_COST_UNRESOLVED')});
test('negative BOM quantity is rejected',function(){throws(function(){P.priceRows([{qty:-1,item:'x'}],[{id:'x',item:'x',unitCost:10,yourCost:5}])})});
test('nonnumeric BOM quantity is rejected',function(){throws(function(){P.priceRows([{qty:'abc',item:'x'}],[{id:'x',item:'x',unitCost:10,yourCost:5}])})});
test('negative customer price is rejected',function(){throws(function(){P.priceRows([{qty:1,item:'x'}],[{id:'x',item:'x',unitCost:-10,yourCost:5}])})});
test('nonnumeric customer price is rejected',function(){throws(function(){P.priceRows([{qty:1,item:'x'}],[{id:'x',item:'x',unitCost:'bad',yourCost:5}])})});
test('negative yourCost is rejected instead of becoming zero',function(){throws(function(){P.priceRows([{qty:1,item:'x'}],[{id:'x',item:'x',unitCost:10,yourCost:-1}])})});
test('nonnumeric yourCost is rejected instead of becoming zero',function(){throws(function(){P.priceRows([{qty:1,item:'x'}],[{id:'x',item:'x',unitCost:10,yourCost:'bad'}])})});
test('unmatched residential BOM row is counted and line-identifiable',function(){var p=P.priceRows([{qty:1,item:'Unknown field verify item'}],[]);is(p.unmatchedLineCount,1);is(p.lines[0].status,'UNMATCHED');is(p.lines[0].item,'Unknown field verify item')});
test('zero customer price remains unpriced and excluded from resolved profit',function(){var p=P.priceRows([{qty:1,item:'20A 1-pole breaker'}],[{id:'b',item:'20A 1-pole breaker',unitCost:0,yourCost:0}]);is(p.unpricedLineCount,1);is(p.lines[0].status,'UNPRICED');eq(p.resolvedCustomerMaterialTotal,0)});
test('catalog matching normalizes case and whitespace only',function(){var p=P.priceRows([{qty:1,item:'  12/2   NM-B WITH GROUND '}],[{id:'x',item:'12/2 NM-B with ground',unitCost:10,yourCost:5}]);is(p.lines[0].status,'PRICED')});
test('catalog matching does not fuzzy collide 12/2 and 10/2',function(){var p=P.priceRows([{qty:1,item:'12/2 NM-B with ground'}],[{id:'x',item:'10/2 NM-B with ground',unitCost:10,yourCost:5}]);is(p.lines[0].status,'UNMATCHED')});
test('yourCost above customer price produces legitimate negative material margin',function(){var p=P.priceRows([{qty:1,item:'x'}],[{id:'x',item:'x',unitCost:10,yourCost:12}]);eq(p.materialGrossProfit,-2);eq(p.materialMarginPct,-20)});

global.BRUNO_TEST_RESULTS=out;
})();

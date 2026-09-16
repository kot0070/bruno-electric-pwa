'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]},C=global.BrunoElectricalCalc,E=global.BrunoResidentialLive;
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function eq(a,b,tol){tol=tol==null?1e-9:tol;if(Math.abs(Number(a)-Number(b))>tol)throw new Error('expected '+b+', got '+a)}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
var factors={60:[[10,1.29],[15,1.22],[20,1.15],[25,1.08],[30,1],[35,.91],[40,.82],[45,.71],[50,.58],[55,.41]],75:[[10,1.20],[15,1.15],[20,1.11],[25,1.05],[30,1],[35,.94],[40,.88],[45,.82],[50,.75],[55,.67],[60,.58],[65,.47],[70,.33]],90:[[10,1.15],[15,1.12],[20,1.08],[25,1.04],[30,1],[35,.96],[40,.91],[45,.87],[50,.82],[55,.76],[60,.71],[65,.65],[70,.58],[75,.50],[80,.41]]};
Object.keys(factors).forEach(function(rating){factors[rating].forEach(function(row){test('math corrective temp '+rating+'C through '+row[0]+'C',function(){eq(C._test.tempFactor(Number(rating),row[0]),row[1])})})});
function residential(sqft,amps,recs,group){return E.calculate({squareFeet:sqft,bedrooms:0,bathrooms:0,powderRooms:0,livingRooms:0,diningRooms:0,offices:0,kitchens:0,laundryAreas:0,garageBays:0,outdoorGfci:0,generalCircuitAmps:amps,receptaclesPerGeneralCircuit:group||5,overrides:{generalReceptacles:recs==null?0:recs,lights:0,switches:0,bathroomReceptacles:0,kitchenReceptacles:0,outdoorReceptacles:0}})}
[
 [1,20,1],[799,20,1],[800,20,1],[801,20,2],[1599,20,2],[1600,20,2],[1601,20,3],
 [1,15,1],[599,15,1],[600,15,1],[601,15,2],[1199,15,2],[1200,15,2],[1201,15,3]
].forEach(function(x){test('120.13 floor '+x[0]+' sqft at '+x[1]+'A => '+x[2]+' circuit(s)',function(){var r=residential(x[0],x[1],0,50);is(r.summary.generalCircuitCodeMinimum,x[2]);is(r.summary.generalCircuits,x[2])})});
test('design grouping can exceed 120.13 floor',function(){var r=residential(800,20,11,5);is(r.summary.generalCircuitCodeMinimum,1);is(r.summary.generalCircuitGroupingCount,3);is(r.summary.generalCircuits,3)});
test('120.13 load VA is exactly 3 VA per sqft',function(){var r=residential(1234,20,0,50);is(r.summary.generalBranchCircuitLoadVA,3702)});
test('service floor-area bucket remains exactly 2 VA per sqft',function(){var r=residential(1234,20,0,50);is(r.summary.generalLoadVA,2468)});
global.BRUNO_TEST_RESULTS=out;
})();

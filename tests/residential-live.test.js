'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'expected truthy')}
function findBom(r,item){return r.bom.find(function(x){return x.item===item})}
var E=global.BrunoResidentialLive;
function base(){return{squareFeet:2000,bedrooms:3,bathrooms:1,powderRooms:1,livingRooms:1,diningRooms:1,offices:0,kitchens:1,laundryAreas:1,garageBays:2,outdoorGfci:2,generalCircuitAmps:20,receptaclesPerGeneralCircuit:5}}

test('live engine requires positive square footage',function(){var threw=false;try{E.calculate({squareFeet:0})}catch(e){threw=true}ok(threw,'zero square footage accepted')});
test('room-count-only run labels general receptacle minimum as layout required',function(){var r=E.calculate(base());ok(!r.codeMinimums.generalReceptacles.known,'general minimum falsely claimed from room count');is(r.status,'ESTIMATE / LAYOUT REQUIRED')});
test('qualifying wall segments calculate independent 210.52A spacing minimum',function(){var x=E.wallMinimum('10,8,14,1');is(x.count,4);is(x.segments.length,3);ok(x.reference.indexOf('210.52(A)')>=0)});
test('wall-derived general minimum drives initial live design',function(){var x=base();x.qualifyingWallSegmentsFt='10,8,14';var r=E.calculate(x);is(r.codeMinimums.generalReceptacles.value,4);is(r.design.generalReceptacles,4);is(r.violations.length,0)});
test('below wall-derived general minimum is flagged non-compliant',function(){var x=base();x.qualifyingWallSegmentsFt='13,13';x.overrides={generalReceptacles:2};var r=E.calculate(x);is(r.codeMinimums.generalReceptacles.value,4);ok(r.violations.some(function(v){return v.key==='generalReceptacles'}),'general under-minimum not flagged');is(r.status,'NON-COMPLIANT')});
test('bathroom and powder-room minimum reacts to room count and override',function(){var x=base();x.overrides={bathroomReceptacles:1};var r=E.calculate(x);is(r.codeMinimums.bathroomReceptacles.value,2);ok(r.violations.some(function(v){return v.key==='bathroomReceptacles'}),'bathroom under-minimum not flagged')});
test('adding receptacles can add general circuit and breaker automatically',function(){var x=base();x.overrides={generalReceptacles:5};var a=E.calculate(x);x.overrides={generalReceptacles:6};var b=E.calculate(x);is(a.summary.generalCircuits,1);is(b.summary.generalCircuits,2);is(findBom(a,'20A 1-pole breaker').qty+1,findBom(b,'20A 1-pole breaker').qty)});
test('adding receptacles automatically increases estimated cable and BOM devices',function(){var x=base();x.overrides={generalReceptacles:5};var a=E.calculate(x);x.overrides={generalReceptacles:10};var b=E.calculate(x);ok(b.summary.totalCableFt>a.summary.totalCableFt,'cable did not increase');is(findBom(a,'15A duplex receptacle').qty,5);is(findBom(b,'15A duplex receptacle').qty,10)});
test('switching general circuit 20A to 15A changes conductor and breaker family',function(){var x=base();x.overrides={generalReceptacles:6};x.generalCircuitAmps=20;var a=E.calculate(x);x.generalCircuitAmps=15;var b=E.calculate(x);ok(findBom(a,'12/2 NM-B with ground'),'20A general cable missing');ok(findBom(b,'14/2 NM-B with ground'),'15A general cable missing');ok(findBom(b,'15A 1-pole breaker'),'15A breaker missing')});
test('kitchen laundry bathroom and garage circuit requirements appear from room inputs',function(){var r=E.calculate(base());['Kitchen small-appliance','Bathroom receptacles','Laundry','Garage receptacles'].forEach(function(name){ok(r.circuits.some(function(c){return c.label===name}),name+' missing')})});
test('ordinary receptacle count changes branch takeoff but not floor-area service VA',function(){var x=base();x.overrides={generalReceptacles:5};var a=E.calculate(x);x.overrides={generalReceptacles:20};var b=E.calculate(x);is(a.summary.generalLoadVA,b.summary.generalLoadVA);ok(b.summary.totalCircuits>a.summary.totalCircuits,'branch circuits did not respond')});
test('live BOM includes panel-space-driving breakers wire devices staples and connectors',function(){var r=E.calculate(base());['20A 1-pole breaker','12/2 NM-B with ground','15A duplex receptacle','NM cable staple allowance','Small wire connector allowance'].forEach(function(item){ok(findBom(r,item),item+' missing')})});
global.BRUNO_TEST_RESULTS=out;
})();
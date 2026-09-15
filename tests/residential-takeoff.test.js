'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'expected truthy')}
function throws(fn){var yes=false;try{fn()}catch(e){yes=true}if(!yes)throw new Error('expected error')}
function findBom(r,item){return r.bom.find(function(x){return x.item===item})}
var T=global.BrunoResidentialTakeoff;

test('Bruno default room preset produces four receptacles per room',function(){var r=T.calculate({habitableRooms:2,kitchens:0});is(r.summary.generalReceptacles,8);is(findBom(r,'15A duplex receptacle').qty,8)});
test('general default groups five receptacles per circuit',function(){var r=T.calculate({habitableRooms:3,kitchens:0,receptaclesPerRoom:4,receptaclesPerGeneralCircuit:5});is(r.summary.generalCircuits,3)});
test('20A general circuit uses 12-2 NM-B and 12 Cu basis',function(){var r=T.calculate({habitableRooms:1,kitchens:0,generalCircuitAmps:20});var c=r.circuits[0];is(c.amps,20);ok(c.wire.indexOf('#12 Cu')>=0);is(c.cableItem,'12/2 NM-B with ground')});
test('15A general circuit uses 14-2 NM-B and 14 Cu basis',function(){var r=T.calculate({habitableRooms:1,kitchens:0,generalCircuitAmps:15});var c=r.circuits[0];is(c.amps,15);ok(c.wire.indexOf('#14 Cu')>=0);is(c.cableItem,'14/2 NM-B with ground')});
test('unsupported general amp rating rejects',function(){throws(function(){T.calculate({generalCircuitAmps:30})})});
test('kitchen creates two 20A circuits per kitchen',function(){var r=T.calculate({kitchens:2});var c=r.circuits.find(function(x){return x.label==='Kitchen small-appliance'});is(c.count,4);is(c.amps,20);ok(c.reference.indexOf('210.11(C)(1)')>=0)});
test('kitchen practical preset is three GFCI plus three standard per kitchen',function(){var r=T.calculate({kitchens:1});is(findBom(r,'20A GFCI receptacle').qty,3);is(findBom(r,'20A duplex receptacle').qty,3)});
test('kitchen practical preset is editable and not hard code minimum',function(){var r=T.calculate({kitchens:1,kitchenGfciPerKitchen:1,kitchenStandardReceptaclesPerKitchen:5});is(findBom(r,'20A GFCI receptacle').qty,1);is(findBom(r,'20A duplex receptacle').qty,5);ok(r.warnings.join(' ').indexOf('editable')>=0)});
test('bathroom receptacle circuit uses 20A and 12-2 NM-B',function(){var r=T.calculate({kitchens:0,bathrooms:2});var c=r.circuits.find(function(x){return x.label==='Bathroom receptacles'});is(c.count,1);is(c.amps,20);ok(c.wire.indexOf('#12 Cu')>=0)});
test('laundry adds one 20A circuit when laundry exists',function(){var r=T.calculate({kitchens:0,laundryAreas:1});var c=r.circuits.find(function(x){return x.label==='Laundry'});is(c.count,1);is(c.amps,20)});
test('zero laundry creates no laundry circuit',function(){var r=T.calculate({kitchens:0,laundryAreas:0});ok(!r.circuits.some(function(x){return x.label==='Laundry'}))});
test('garage adds code-minimum 20A circuit when garage exists',function(){var r=T.calculate({kitchens:0,garageBays:2});var c=r.circuits.find(function(x){return x.label==='Garage receptacles'});is(c.count,1);is(c.amps,20)});
test('room wire defaults to 75 feet per room',function(){var r=T.calculate({habitableRooms:2,kitchens:0});is(findBom(r,'12/2 NM-B with ground').qty,150)});
test('explicit room wire footage overrides estimating default',function(){var r=T.calculate({habitableRooms:2,kitchens:0,roomCableFt:90});is(findBom(r,'12/2 NM-B with ground').qty,90)});
test('negative material-driving inputs reject',function(){throws(function(){T.calculate({habitableRooms:-1})});throws(function(){T.calculate({roomCableFt:-1})});throws(function(){T.calculate({kitchenGfciPerKitchen:-1})})});
test('fractional project counts reject',function(){throws(function(){T.calculate({habitableRooms:1.5})});throws(function(){T.calculate({bathrooms:1.2})})});
test('BOM includes boxes switches lights staples and connectors',function(){var r=T.calculate({habitableRooms:1,kitchens:0});['1-gang new-work device box','Single-pole switch','4 in LED wafer light allowance','NM cable staple allowance','Small wire connector allowance'].forEach(function(x){ok(findBom(r,x),x+' missing')})});
test('outdoor allowance uses GFCI weatherproof box and in-use cover',function(){var r=T.calculate({kitchens:0,outdoorGfci:2});is(findBom(r,'20A GFCI receptacle').qty,2);is(findBom(r,'1-gang weatherproof box').qty,2);is(findBom(r,'Extra-duty in-use weatherproof cover').qty,2)});
test('warnings distinguish Bruno defaults from NEC minimums',function(){var r=T.calculate({});ok(r.warnings[0].indexOf('not NEC minimums')>=0);ok(r.warnings.join(' ').indexOf('210.52(A)')>=0);ok(r.warnings.join(' ').indexOf('210.52(C)')>=0)});
global.BRUNO_TEST_RESULTS=out;
})();

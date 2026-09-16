'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'expected truthy')}
function throws(fn,m){var hit=false;try{fn()}catch(e){hit=true}ok(hit,m||'expected throw')}
function findBom(r,item){return r.bom.find(function(x){return x.item===item})}
var E=global.BrunoResidentialLive;
function base(sqft){return{squareFeet:sqft||2000,bedrooms:3,bathrooms:1,powderRooms:1,livingRooms:1,diningRooms:1,offices:0,kitchens:1,laundryAreas:1,garageBays:2,outdoorGfci:2,generalCircuitAmps:20,receptaclesPerGeneralCircuit:5}}

test('live engine requires positive square footage',function(){throws(function(){E.calculate({squareFeet:0})})});
test('room-count run keeps layout device minimums unresolved but branch circuit minimum known',function(){var r=E.calculate(base());ok(!r.codeMinimums.generalReceptacles.known);ok(r.codeMinimums.generalBranchCircuits.known);is(r.codeMinimums.generalBranchCircuits.value,3);is(r.status,'NO KNOWN CONFLICTS / LAYOUT REQUIRED')});
test('1000 sqft 20A general branch minimum is 2 circuits',function(){var x=base(1000);x.overrides={generalReceptacles:1};var r=E.calculate(x);is(r.summary.generalCircuitCodeMinimum,2);is(r.summary.generalCircuits,2);is(r.codeMinimums.generalBranchCircuits.loadVA,3000);is(r.codeMinimums.generalBranchCircuits.ampsPerCircuit,20)});
test('2000 sqft 20A general branch minimum is 3 circuits',function(){var r=E.calculate(base(2000));is(r.summary.generalCircuitCodeMinimum,3);is(r.summary.generalCircuits,3);is(r.summary.generalBranchCircuitLoadVA,6000)});
test('1000 sqft 15A general branch minimum remains 2 circuits',function(){var x=base(1000);x.generalCircuitAmps=15;x.overrides={generalReceptacles:1};var r=E.calculate(x);is(r.summary.generalCircuitCodeMinimum,2);is(r.summary.generalCircuits,2);ok(findBom(r,'15A 1-pole breaker'),'15A breaker missing')});
test('receptacle grouping can increase but never reduce code minimum',function(){var x=base(1000);x.overrides={generalReceptacles:11};var r=E.calculate(x);is(r.summary.generalCircuitCodeMinimum,2);is(r.summary.generalCircuitGroupingCount,3);is(r.summary.generalCircuits,3)});
test('code minimum dominates low receptacle grouping count',function(){var x=base(2000);x.overrides={generalReceptacles:1};x.receptaclesPerGeneralCircuit=10;var r=E.calculate(x);is(r.summary.generalCircuitGroupingCount,1);is(r.summary.generalCircuitCodeMinimum,3);is(r.summary.generalCircuits,3)});
test('service floor area load remains separate 2 VA per sqft',function(){var r=E.calculate(base(2000));is(r.summary.generalLoadVA,4000);is(r.summary.generalBranchCircuitLoadVA,6000)});

test('qualifying wall segments calculate independent 210.52A spacing minimum',function(){var x=E.wallMinimum('10,8,14,1');is(x.count,4);is(x.segments.length,3);is(x.nonqualifyingSegments.length,1);ok(x.reference.indexOf('210.52(A)')>=0)});
test('malformed wall segment fails closed',function(){throws(function(){E.wallMinimum('13,abc,13')});throws(function(){E.calculate(Object.assign(base(),{qualifyingWallSegmentsFt:'13,,13'}))});throws(function(){E.calculate(Object.assign(base(),{qualifyingWallSegmentsFt:'13,-4,13'}))})});
test('valid segments below 2ft remain nonqualifying not malformed',function(){var x=E.wallMinimum('1,1.5,13');is(x.count,2);is(x.nonqualifyingSegments.length,2);ok(x.known)});
test('wall-derived receptacle minimum drives live device design',function(){var x=base();x.qualifyingWallSegmentsFt='10,8,14';var r=E.calculate(x);is(r.codeMinimums.generalReceptacles.value,4);is(r.design.generalReceptacles,4);is(r.violations.length,0)});
test('below wall-derived receptacle minimum is non-compliant',function(){var x=base();x.qualifyingWallSegmentsFt='13,13';x.overrides={generalReceptacles:2};var r=E.calculate(x);is(r.codeMinimums.generalReceptacles.value,4);ok(r.violations.some(function(v){return v.key==='generalReceptacles'}));is(r.status,'NON-COMPLIANT')});
test('bathroom device quantity remains layout required',function(){var x=base();x.overrides={bathroomReceptacles:1};var r=E.calculate(x);ok(!r.codeMinimums.bathroomReceptacles.known);is(r.codeMinimums.bathroomReceptacles.value,null);is(r.design.bathroomReceptacles,1)});
test('powder rooms alone do not create bathroom code circuit',function(){var x=base();x.bathrooms=0;x.powderRooms=2;var r=E.calculate(x);ok(!r.circuits.some(function(c){return c.label==='Bathroom receptacles'}))});

test('general breaker BOM follows max of code minimum and grouping design',function(){var x=base(1000);x.overrides={generalReceptacles:11};var r=E.calculate(x);var total20=findBom(r,'20A 1-pole breaker').qty;var special=2+1+1+1;is(total20-special,3)});
test('adding receptacles beyond code floor increases cable and devices',function(){var x=base(1000);x.overrides={generalReceptacles:5};var a=E.calculate(x);x.overrides={generalReceptacles:15};var b=E.calculate(x);ok(b.summary.generalCircuits>a.summary.generalCircuits);ok(b.summary.totalCableFt>a.summary.totalCableFt);is(findBom(a,'15A duplex receptacle').qty,5);is(findBom(b,'15A duplex receptacle').qty,15)});
test('switching 20A to 15A changes conductor and breaker family',function(){var x=base(2000);x.overrides={generalReceptacles:6};x.generalCircuitAmps=20;var a=E.calculate(x);x.generalCircuitAmps=15;var b=E.calculate(x);ok(findBom(a,'12/2 NM-B with ground'));ok(findBom(b,'14/2 NM-B with ground'));ok(findBom(b,'15A 1-pole breaker'));ok(b.summary.generalCircuitCodeMinimum>=a.summary.generalCircuitCodeMinimum)});
test('kitchen laundry bathroom and garage circuit requirements still appear',function(){var r=E.calculate(base());['Kitchen small-appliance','Bathroom receptacles','Laundry','Garage receptacles'].forEach(function(name){ok(r.circuits.some(function(c){return c.label===name}),name+' missing')})});
test('live BOM includes panel-driving breakers cable devices staples connectors',function(){var r=E.calculate(base());['20A 1-pole breaker','12/2 NM-B with ground','15A duplex receptacle','NM cable staple allowance','Small wire connector allowance'].forEach(function(item){ok(findBom(r,item),item+' missing')})});

global.BRUNO_TEST_RESULTS=out;
})();

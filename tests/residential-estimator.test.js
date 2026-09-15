'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function eq(a,b,t){t=t==null?1e-6:t;if(Math.abs(Number(a)-Number(b))>t)throw new Error('expected '+b+', got '+a)}
function throws(fn){var ok=false;try{fn()}catch(e){ok=true}if(!ok)throw new Error('expected error')}
var E=global.BrunoResidential,R=global.BrunoResidentialRules;

test('residential rules version locked',function(){is(R.version,'residential-phase2-2026')});
test('2026 dwelling minimum unit load is 3 VA/ft2',function(){is(R.minimum.generalVAperFt2,3)});
test('minimum small appliance circuits is two',function(){is(R.minimum.smallApplianceCircuits,2);is(R.minimum.smallApplianceVAperCircuit,1500)});
test('minimum laundry load is 1500 VA',function(){is(R.minimum.laundryCircuits,1);is(R.minimum.laundryVAperCircuit,1500)});
test('fixed appliance demand threshold is four at 75 percent',function(){is(R.fixedApplianceDemand.minimumCount,4);eq(R.fixedApplianceDemand.factor,.75)});
test('single dryer fallback is 5000 VA',function(){is(R.dryer.fallbackVA,5000)});
test('single cooking auto scope capped at 12 kW',function(){is(R.singleCooking.maxAutoNameplateKW,12);is(R.singleCooking.columnCDemandVA,8000)});

test('120.45 demand under 3000 remains 100 percent',function(){eq(E._test.demand12045(2500),2500)});
test('120.45 demand at 3000 remains 3000',function(){eq(E._test.demand12045(3000),3000)});
test('120.45 demand 7500 equals 4575',function(){eq(E._test.demand12045(7500),4575)});
test('120.45 demand above 120k uses 25 percent remainder',function(){eq(E._test.demand12045(130000),46450)});

test('service candidate starts at 100A',function(){is(E._test.serviceCandidate(1),100);is(E._test.serviceCandidate(100),100)});
test('service candidate boundary 100.1 to 125A',function(){is(E._test.serviceCandidate(100.1),125)});
test('service candidate boundary 200.1 to 225A',function(){is(E._test.serviceCandidate(200.1),225)});
test('service candidate over 400 unsupported',function(){is(E._test.serviceCandidate(400.1),null)});

function base(extra){return Object.assign({squareFeet:1500,smallApplianceCircuits:2,laundryCircuits:1,fixedAppliances:[],dryer:false,cooking:false,heatVA:0,coolVA:0,largestMotorVA:0,otherVA:0,serviceMaterial:'Al'},extra||{})}
test('1500 sqft base load follows Annex-D style 5100 VA demand',function(){var r=E.calculate(base());is(r.result.generalVA,4500);is(r.result.baseConnectedVA,9000);is(r.result.baseDemandVA,5100);is(r.result.totalVA,5100)});
test('1500 sqft + 5.5k dryer + 12k range = 18600 VA',function(){var r=E.calculate(base({dryer:true,dryerVA:5500,cooking:true,cookingKW:12}));is(r.result.dryerDemandVA,5500);is(r.result.cookingDemandVA,8000);is(r.result.totalVA,18600)});
test('dryer uses 5000 minimum when nameplate below fallback',function(){var r=E.calculate(base({dryer:true,dryerVA:4200}));is(r.result.dryerDemandVA,5000)});
test('dryer uses higher nameplate',function(){var r=E.calculate(base({dryer:true,dryerVA:6200}));is(r.result.dryerDemandVA,6200)});
test('four fixed appliances receive 75 percent demand',function(){var r=E.calculate(base({fixedAppliances:[{name:'a',va:1000},{name:'b',va:1000},{name:'c',va:1000},{name:'d',va:1000}]}));is(r.result.fixedConnectedVA,4000);eq(r.result.fixedDemandFactor,.75);is(r.result.fixedDemandVA,3000)});
test('three fixed appliances remain 100 percent',function(){var r=E.calculate(base({fixedAppliances:[{va:1000},{va:1000},{va:1000}]}));eq(r.result.fixedDemandFactor,1);is(r.result.fixedDemandVA,3000)});
test('HVAC noncoincident uses larger entered load',function(){var r=E.calculate(base({heatVA:10000,coolVA:6000}));is(r.result.hvacDemandVA,10000)});
test('largest motor input adds exactly 25 percent',function(){var r=E.calculate(base({largestMotorVA:4000}));is(r.result.motorAdderVA,1000)});
test('other VA is included at 100 percent',function(){var r=E.calculate(base({otherVA:2500}));is(r.result.totalVA,7600)});
test('Cu 100A service candidate maps to #4',function(){var r=E.calculate(base({serviceMaterial:'Cu'}));is(r.result.serviceCandidateA,100);is(r.result.serviceConductor,'4');is(r.result.serviceMaterial,'Cu')});
test('Al 100A service candidate maps to #2',function(){var r=E.calculate(base({serviceMaterial:'Al'}));is(r.result.serviceConductor,'2')});
test('unknown service material rejected',function(){throws(function(){E.calculate(base({serviceMaterial:'foo'}))})});
test('blank service material rejected',function(){throws(function(){E.calculate(base({serviceMaterial:''}))})});
test('cooking over 12 kW rejects automatic demand',function(){throws(function(){E.calculate(base({cooking:true,cookingKW:12.1}))})});
test('cooking at or below 1.75 kW rejects this automation path',function(){throws(function(){E.calculate(base({cooking:true,cookingKW:1.75}))})});
test('zero square feet rejected',function(){throws(function(){E.calculate(base({squareFeet:0}))})});
test('fractional small appliance circuit count rejected',function(){throws(function(){E.calculate(base({smallApplianceCircuits:2.5}))})});

test('circuit plan always contains two SA, laundry and bathroom 20A circuits',function(){var c=E.circuits(base());is(c.length,4);is(c[0].amps,20);is(c[1].amps,20);is(c[2].amps,20);is(c[3].amps,20);is(c[0].status,'Code Required')});
test('circuit plan adds field-verify dryer and cooking loads',function(){var c=E.circuits(base({dryer:true,dryerVA:5500,cooking:true,cookingKW:12}));is(c.length,6);is(c[4].id,'dryer');is(c[4].loadAmps,22.9);is(c[5].id,'cooking');is(c[5].loadAmps,50);is(c[5].status,'Field Verify')});
test('fixed appliance circuit uses entered voltage when supplied',function(){var c=E.circuits(base({fixedAppliances:[{name:'Water heater',va:4500,voltage:240}]}));is(c[4].voltage,240);is(c[4].loadAmps,18.8)});

test('residential BOM includes four minimum 20A circuit allowances',function(){var i=base({estimatedRunFt:50});var r=E.calculate(i),b=E.bom(i,r);is(b[0].item,'12/2 NM-B with ground');is(b[0].qty,200);is(b[1].item,'20A 1-pole breaker');is(b[1].qty,4)});
test('residential BOM adds service candidate and conductor field-verify rows',function(){var i=base({estimatedRunFt:50});var r=E.calculate(i),b=E.bom(i,r);is(b[2].item,'Service equipment 100A — field verify');is(b[2].status,'Field Verify');is(b[3].codeSource,'310.12')});
test('residential BOM for 200A uses existing 200A meter-main catalog name',function(){var i=base({otherVA:40000,estimatedRunFt:50});var r=E.calculate(i);is(r.result.serviceCandidateA,200);var b=E.bom(i,r);is(b[2].item,'200A meter/main combo')});
test('residential BOM rejects zero run length instead of fabricating footage',function(){var i=base({estimatedRunFt:0}),r=E.calculate(i);throws(function(){E.bom(i,r)})});

global.BRUNO_TEST_RESULTS=out;
})();

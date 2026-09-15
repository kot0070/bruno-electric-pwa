'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function eq(a,b,t){t=t==null?1e-6:t;if(Math.abs(Number(a)-Number(b))>t)throw new Error('expected '+b+', got '+a)}
function throws(fn){var ok=false;try{fn()}catch(e){ok=true}if(!ok)throw new Error('expected error')}
var E=global.BrunoResidential,R=global.BrunoResidentialRules;

function base(extra){return Object.assign({squareFeet:1500,smallApplianceCircuits:2,laundryCircuits:1,fixedAppliances:[],dryer:false,cooking:false,heatVA:0,coolVA:0,hvacRelationship:'',largestMotorVA:0,largestMotorAlreadyIncluded:false,otherVA:0,serviceMaterial:'Al',table31012Eligible:true},extra||{})}
function eligible(name,va,category,voltage){return{name:name,va:va,category:category||'other-fixed',voltage:voltage||120,eligible12053:true,fastenedInPlace:true,sameService:true}}

test('residential corrective rules version locked',function(){is(R.version,'residential-phase2-2026-r2')});
test('2026 dwelling feeder/service unit load is 2 VA/ft2',function(){is(R.minimum.generalVAperFt2,2)});
test('branch-circuit planning constant remains separately documented as 3 VA/ft2',function(){is(R.minimum.branchCircuitGeneralVAperFt2,3)});
test('minimum small appliance circuits is two',function(){is(R.minimum.smallApplianceCircuits,2);is(R.minimum.smallApplianceVAperCircuit,1500)});
test('minimum laundry load is 1500 VA',function(){is(R.minimum.laundryCircuits,1);is(R.minimum.laundryVAperCircuit,1500)});
test('fixed appliance demand threshold is four at 75 percent',function(){is(R.fixedApplianceDemand.minimumCount,4);eq(R.fixedApplianceDemand.factor,.75);is(R.fixedApplianceDemand.minimumWatts,500)});
test('single dryer fallback is 5000 VA',function(){is(R.dryer.fallbackVA,5000)});
test('single cooking auto scope capped at 12 kW',function(){is(R.singleCooking.maxAutoNameplateKW,12);is(R.singleCooking.columnCDemandVA,8000)});

test('120.45 demand under 3000 remains 100 percent',function(){eq(E._test.demand12045(2500),2500)});
test('120.45 exact 3000 boundary',function(){eq(E._test.demand12045(3000),3000)});
test('120.45 3000.1 enters 35 percent band',function(){eq(E._test.demand12045(3000.1),3000.035)});
test('120.45 demand 7500 equals 4575',function(){eq(E._test.demand12045(7500),4575)});
test('120.45 exact 120000 boundary',function(){eq(E._test.demand12045(120000),43950)});
test('120.45 120000.1 enters 25 percent remainder',function(){eq(E._test.demand12045(120000.1),43950.025)});
test('120.45 demand above 120k',function(){eq(E._test.demand12045(130000),46450)});

test('service candidate starts at 100A',function(){is(E._test.serviceCandidate(1),100);is(E._test.serviceCandidate(100),100)});
test('service candidate 100.1 to 125A',function(){is(E._test.serviceCandidate(100.1),125)});
test('service candidate 125 to 125A and 125.1 to 150A',function(){is(E._test.serviceCandidate(125),125);is(E._test.serviceCandidate(125.1),150)});
test('service candidate 200 and 200.1 boundaries',function(){is(E._test.serviceCandidate(200),200);is(E._test.serviceCandidate(200.1),225)});
test('service candidate 400 exact and over unsupported',function(){is(E._test.serviceCandidate(400),400);is(E._test.serviceCandidate(400.1),null)});

test('1500 sqft corrected base load is 4575 VA demand',function(){var r=E.calculate(base());is(r.result.generalVA,3000);is(r.result.baseConnectedVA,7500);is(r.result.baseDemandVA,4575);is(r.result.totalVA,4575)});
test('1500 sqft + 5.5k dryer + 12k range = 18075 VA',function(){var r=E.calculate(base({dryer:true,dryerVA:5500,cooking:true,cookingKW:12}));is(r.result.dryerDemandVA,5500);is(r.result.cookingDemandVA,8000);is(r.result.totalVA,18075)});
test('dryer uses 5000 minimum when nameplate below fallback',function(){is(E.calculate(base({dryer:true,dryerVA:4200})).result.dryerDemandVA,5000)});
test('dryer uses higher nameplate',function(){is(E.calculate(base({dryer:true,dryerVA:6200})).result.dryerDemandVA,6200)});

test('four explicitly eligible fixed appliances receive 75 percent demand',function(){var a=[eligible('a',1000),eligible('b',1000),eligible('c',1000),eligible('d',1000)],r=E.calculate(base({fixedAppliances:a}));is(r.result.fixedEligibleCount,4);eq(r.result.fixedDemandFactor,.75);is(r.result.fixedDemandVA,3000)});
test('three eligible fixed appliances remain 100 percent',function(){var a=[eligible('a',1000),eligible('b',1000),eligible('c',1000)],r=E.calculate(base({fixedAppliances:a}));eq(r.result.fixedDemandFactor,1);is(r.result.fixedDemandVA,3000)});
test('unqualified appliance never helps reach 120.53 threshold',function(){var a=[eligible('a',1000),eligible('b',1000),eligible('c',1000),{name:'Countertop microwave',va:1000,voltage:120,eligible12053:false}],r=E.calculate(base({fixedAppliances:a}));is(r.result.fixedEligibleCount,3);is(r.result.fixedDemandVA,4000)});
test('ineligible loads remain 100 percent when four other appliances qualify',function(){var a=[eligible('a',1000),eligible('b',1000),eligible('c',1000),eligible('d',1000),{name:'Other',va:2000,voltage:120,eligible12053:false}],r=E.calculate(base({fixedAppliances:a}));is(r.result.fixedDemandVA,5000)});
test('excluded cooking category cannot be marked 120.53 eligible',function(){throws(function(){E.calculate(base({fixedAppliances:[eligible('range',8000,'cooking',240)]}))})});
test('eligible appliance requires fastened-in-place confirmation',function(){var a=eligible('dishwasher',1000,'dishwasher',120);a.fastenedInPlace=false;throws(function(){E.calculate(base({fixedAppliances:[a]}))})});
test('eligible appliance requires same-service confirmation',function(){var a=eligible('dishwasher',1000,'dishwasher',120);a.sameService=false;throws(function(){E.calculate(base({fixedAppliances:[a]}))})});
test('eligible appliance below 500VA and below quarter hp rejected',function(){throws(function(){E.calculate(base({fixedAppliances:[eligible('tiny',400)]}))})});

test('single entered HVAC load needs no noncoincident assertion',function(){var r=E.calculate(base({heatVA:10000,coolVA:0}));is(r.result.hvacDemandVA,10000);is(r.result.hvacRelationship,'single-entered-load')});
test('two HVAC loads require relationship',function(){throws(function(){E.calculate(base({heatVA:10000,coolVA:6000,hvacRelationship:''}))})});
test('verified noncoincident HVAC uses larger complete mode load',function(){var r=E.calculate(base({heatVA:10000,coolVA:6000,hvacRelationship:'verified-noncoincident'}));is(r.result.hvacDemandVA,10000)});
test('coincident HVAC adds both loads',function(){var r=E.calculate(base({heatVA:10000,coolVA:6000,hvacRelationship:'coincident'}));is(r.result.hvacDemandVA,16000)});
test('invalid HVAC relationship rejected',function(){throws(function(){E.calculate(base({heatVA:10000,coolVA:6000,hvacRelationship:'guess'}))})});

test('largest motor adder requires base load already included',function(){throws(function(){E.calculate(base({largestMotorVA:4000,largestMotorAlreadyIncluded:false}))})});
test('largest motor included confirmation adds exactly 25 percent',function(){var r=E.calculate(base({largestMotorVA:4000,largestMotorAlreadyIncluded:true}));is(r.result.motorAdderVA,1000)});
test('other VA is included at 100 percent',function(){is(E.calculate(base({otherVA:2500})).result.totalVA,7075)});

test('310.12 eligible Cu 100A maps to #4',function(){var r=E.calculate(base({serviceMaterial:'Cu',table31012Eligible:true}));is(r.result.serviceCandidateA,100);is(r.result.serviceConductor,'4')});
test('310.12 eligible Al 100A maps to #2',function(){is(E.calculate(base({serviceMaterial:'Al',table31012Eligible:true})).result.serviceConductor,'2')});
test('310.12 ineligible case withholds conductor size',function(){var r=E.calculate(base({table31012Eligible:false}));is(r.result.serviceCandidateA,100);is(r.result.serviceConductor,null);is(r.result.table31012Eligible,false)});
test('unknown service material rejected',function(){throws(function(){E.calculate(base({serviceMaterial:'foo'}))})});
test('Copper service material rejected',function(){throws(function(){E.calculate(base({serviceMaterial:'Copper'}))})});
test('blank service material rejected',function(){throws(function(){E.calculate(base({serviceMaterial:''}))})});
test('null service material rejected',function(){throws(function(){E.calculate(base({serviceMaterial:null}))})});
test('cooking over 12 kW rejects automatic demand',function(){throws(function(){E.calculate(base({cooking:true,cookingKW:12.1}))})});
test('cooking at or below 1.75 kW rejects this automation path',function(){throws(function(){E.calculate(base({cooking:true,cookingKW:1.75}))})});
test('zero square feet rejected',function(){throws(function(){E.calculate(base({squareFeet:0}))})});
test('blank square feet rejected',function(){throws(function(){E.calculate(base({squareFeet:''}))})});
test('fractional small appliance circuit count rejected',function(){throws(function(){E.calculate(base({smallApplianceCircuits:2.5}))})});
test('blank explicit other VA rejected rather than coerced',function(){throws(function(){E.calculate(base({otherVA:''}))})});

test('circuit plan contains two SA, laundry and bathroom 20A circuits',function(){var c=E.circuits(base());is(c.length,4);is(c[0].amps,20);is(c[1].amps,20);is(c[2].amps,20);is(c[3].amps,20);is(c[0].status,'Code Required')});
test('circuit plan adds field-verify dryer and cooking loads',function(){var c=E.circuits(base({dryer:true,dryerVA:5500,cooking:true,cookingKW:12}));is(c.length,6);is(c[4].loadAmps,22.9);is(c[5].loadAmps,50);is(c[5].status,'Field Verify')});
test('fixed appliance circuit uses entered voltage and Field Verify',function(){var c=E.circuits(base({fixedAppliances:[{name:'Water heater',va:4500,voltage:240,eligible12053:false}]}));is(c[4].voltage,240);is(c[4].loadAmps,18.8);is(c[4].status,'Field Verify')});
test('fixed appliance circuit blank voltage rejected',function(){throws(function(){E.circuits(base({fixedAppliances:[{name:'x',va:1000,voltage:'',eligible12053:false}]}))})});

test('residential BOM includes four minimum 20A circuit allowances',function(){var i=base({estimatedRunFt:50}),r=E.calculate(i),b=E.bom(i,r);is(b[0].item,'12/2 NM-B with ground');is(b[0].qty,200);is(b[1].qty,4)});
test('310.12 eligible BOM adds conductor field-verify row',function(){var i=base({estimatedRunFt:50,table31012Eligible:true}),r=E.calculate(i),b=E.bom(i,r);is(b[2].item,'Service equipment 100A — field verify');is(b[3].codeSource,'310.12')});
test('310.12 ineligible BOM emits generic review row, not a table size',function(){var i=base({estimatedRunFt:50,table31012Eligible:false}),r=E.calculate(i),b=E.bom(i,r);is(b[3].item,'Dwelling service/feeder conductors — size requires 310.12 applicability/ampacity review');is(b[3].status,'Field Verify')});
test('residential BOM for 200A uses existing catalog name',function(){var i=base({otherVA:39000,estimatedRunFt:50}),r=E.calculate(i);is(r.result.serviceCandidateA,200);var b=E.bom(i,r);is(b[2].item,'200A meter/main combo')});
test('residential BOM rejects zero run length',function(){var i=base({estimatedRunFt:0}),r=E.calculate(i);throws(function(){E.bom(i,r)})});

global.BRUNO_TEST_RESULTS=out;
})();

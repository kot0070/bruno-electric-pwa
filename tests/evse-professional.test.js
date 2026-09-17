'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function near(a,b,t){t=t==null?0.02:t;if(Math.abs(Number(a)-Number(b))>t)throw new Error('expected ~'+b+', got '+a)}
function yes(v){if(!v)throw new Error('expected truthy value')}
function throws(fn){var ok=false;try{fn()}catch(e){ok=true}if(!ok)throw new Error('expected error')}
var P=global.BrunoEvseProfessional;
function base(extra){return Object.assign({profileId:'TESLA_48_60',terminalRating:75,ambientC:30,ccc:2,distanceFt:50,vdTargetPct:3,vehicleMaxA:'',batteryUsableKwh:75,startSocPct:20,targetSocPct:80,efficiencyPct:90},extra||{})}

test('professional EVSE engine version exists',function(){is(P.version,'evse-professional-v1')});
test('Tesla 48A preset uses 60A breaker and #6 Cu at 75C',function(){var r=P.calculate(base()).result;is(r.configuredEvseCurrentA,48);is(r.continuousRequiredAmpacityA,60);is(r.breakerA,60);is(r.phaseConductorSize,'6');is(r.phaseConductorMaterial,'Cu');is(r.egcSize,'10');near(r.chargingPowerKw,11.52)});
test('Tesla 48A preset at 60C terminal requires #4 Cu',function(){is(P.calculate(base({terminalRating:60})).result.phaseConductorSize,'4')});
test('Tesla 48A 300ft 3 percent target upsizes to #3 Cu',function(){var r=P.calculate(base({distanceFt:300})).result;is(r.phaseConductorSize,'3');yes(r.voltageDropPct<=3)});
test('Tesla 32A / 40A preset selects #8 Cu',function(){var r=P.calculate(base({profileId:'TESLA_32_40'})).result;is(r.breakerA,40);is(r.configuredEvseCurrentA,32);is(r.phaseConductorSize,'8')});
test('Tesla 16A / 20A honors small-conductor protection and selects #12 Cu',function(){var r=P.calculate(base({profileId:'TESLA_16_20'})).result;is(r.breakerA,20);is(r.phaseConductorSize,'12')});
test('Tesla 12A / 15A can select #14 Cu',function(){var r=P.calculate(base({profileId:'TESLA_12_15'})).result;is(r.breakerA,15);is(r.phaseConductorSize,'14')});
test('240.4D helper caps #14 Cu at 15A and #10 Al at 25A',function(){is(P._test.smallConductorOcpdCap('Cu','14'),15);is(P._test.smallConductorOcpdCap('Al','10'),25)});
test('Tesla preset rejects aluminum termination path',function(){throws(function(){P.calculate(base({conductorMaterial:'Al',egcMaterial:'Al'}))})});
test('generic 48A 240V aluminum path selects supported #4 Al',function(){var r=P.calculate({profileId:'GENERIC',maxLoadA:48,voltage:240,conductorMaterial:'Al',egcMaterial:'Cu',terminalRating:75,ambientC:30,ccc:2,distanceFt:50,vdTargetPct:3}).result;is(r.breakerA,60);is(r.phaseConductorSize,'4');is(r.phaseConductorMaterial,'Al')});
test('75kWh 20 to 80 at 90 percent estimates 50kWh wall and about 4.34h at 48A',function(){var c=P.calculate(base()).result.chargeEstimate;near(c.batteryEnergyAddedKwh,45);near(c.estimatedWallEnergyKwh,50);near(c.estimatedHours,4.34)});
test('32A vehicle cap changes charge power/time but not circuit breaker or conductor',function(){var r=P.calculate(base({vehicleMaxA:32})).result;is(r.breakerA,60);is(r.phaseConductorSize,'6');near(r.vehicleLimitedCurrentA,32);near(r.chargingPowerKw,7.68);near(r.chargeEstimate.estimatedHours,6.51)});
test('charge estimate rejects target SOC not above start SOC',function(){throws(function(){P.calculate(base({startSocPct:80,targetSocPct:80}))})});
test('formula metadata exposes continuous load power voltage-drop and charge-time math',function(){var labels=P.calculate(base()).formulas.map(function(x){return x.label}).join('|');yes(labels.indexOf('Continuous-load circuit ampacity')>=0);yes(labels.indexOf('AC charging power')>=0);yes(labels.indexOf('Voltage drop')>=0);yes(labels.indexOf('Charge-time estimate')>=0)});
test('professional EVSE BOM contains actual selected phase conductor breaker and EGC',function(){var r=P.calculate(base()),rows=P.bom(r),text=rows.map(function(x){return x.item}).join('|');is(rows.length,3);yes(text.indexOf('#6 Cu')>=0);yes(text.indexOf('60A 2-pole Tesla Wall Connector')>=0);yes(text.indexOf('#10 Cu equipment grounding conductor')>=0)});
test('vehicle cap never increases above configured EVSE output',function(){var r=P.calculate(base({vehicleMaxA:80})).result;is(r.vehicleLimitedCurrentA,48);is(r.breakerA,60)});
global.BRUNO_TEST_RESULTS=out;
})();

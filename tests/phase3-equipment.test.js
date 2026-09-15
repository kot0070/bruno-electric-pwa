'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function eq(a,b,t){t=t==null?1e-6:t;if(Math.abs(Number(a)-Number(b))>t)throw new Error('expected '+b+', got '+a)}
function throws(fn){var ok=false;try{fn()}catch(e){ok=true}if(!ok)throw new Error('expected error')}
var E=global.BrunoPhase3,R=global.BrunoPhase3Rules;

test('phase3 rules version locked',function(){is(R.version,'electrical-phase3-2026')});
test('EVSE continuous factor is 125 percent',function(){eq(R.evse.continuousFactor,1.25)});
test('motor conductor factor is 125 percent',function(){eq(R.motor.conductorFactor,1.25)});
test('motor common AC inverse-time breaker factor is 250 percent',function(){eq(R.motor.commonAcScgf.inverseTimeBreaker,2.5)});
test('motor common AC time-delay fuse factor is 175 percent',function(){eq(R.motor.commonAcScgf.timeDelayFuse,1.75)});
test('motor common AC non-time-delay fuse factor is 300 percent',function(){eq(R.motor.commonAcScgf.nonTimeDelayFuse,3)});

test('240.6 common standard list includes 10A',function(){is(R.standardOcpd[0],10);is(E._test.standardUp(10),10)});
test('240.6 fuse-only list includes 1 3 6 and 601A',function(){is(R.fuseOnlyOcpd.join(','),'1,3,6,601')});
test('standard OCPD exact 35 remains 35',function(){is(E._test.standardUp(35),35)});
test('standard OCPD 35.1 advances to 40',function(){is(E._test.standardUp(35.1),40)});
test('standard OCPD 50.1 advances to 60',function(){is(E._test.standardUp(50.1),60)});
test('fuse path can select 601A',function(){is(E._test.standardUp(600.25,'timeDelayFuse'),601)});
test('breaker path skips fuse-only 601A',function(){is(E._test.standardUp(600.25,'inverseTimeBreaker'),700)});
test('standardExact accepts fuse-only 601A',function(){is(E._test.standardExact(601),601)});
test('standard OCPD over 6000 unsupported',function(){is(E._test.standardUp(6000.1),null)});

test('EGC 10A Cu uses <=15A row #14',function(){var r=E.egc({ocpdA:10,material:'Cu'});is(r.size,'14');is(r.status,'REVIEW')});
test('EGC 15A Cu is #14',function(){is(E.egc({ocpdA:15,material:'Cu'}).size,'14')});
test('EGC 15A Al is #12',function(){is(E.egc({ocpdA:15,material:'Al'}).size,'12')});
test('EGC 20A Cu is #12',function(){is(E.egc({ocpdA:20,material:'Cu'}).size,'12')});
test('EGC 25A Cu uses <=60A table row #10',function(){is(E.egc({ocpdA:25,material:'Cu'}).size,'10')});
test('EGC 60A Cu is #10',function(){is(E.egc({ocpdA:60,material:'Cu'}).size,'10')});
test('EGC 70A Cu uses <=100A row #8',function(){is(E.egc({ocpdA:70,material:'Cu'}).size,'8')});
test('EGC 100A Al is #6',function(){is(E.egc({ocpdA:100,material:'Al'}).size,'6')});
test('EGC 200A Cu is #6',function(){is(E.egc({ocpdA:200,material:'Cu'}).size,'6')});
test('EGC 601A fuse rating maps to <=800A row',function(){is(E.egc({ocpdA:601,material:'Cu'}).size,'1/0')});
test('EGC 5000A Al is 1250 kcmil',function(){is(E.egc({ocpdA:5000,material:'Al'}).size,'1250 kcmil')});
test('EGC rejects nonstandard 55A OCPD',function(){throws(function(){E.egc({ocpdA:55,material:'Cu'})})});
test('EGC rejects unknown material',function(){throws(function(){E.egc({ocpdA:60,material:'Copper'})})});

test('EVSE 48A produces 60A minimum/candidate',function(){var r=E.evse({maxLoadA:48,voltage:240,egcMaterial:'Cu'}).result;is(r.minimumCircuitAmpacityA,60);is(r.standardOcpdCandidateA,60);is(r.egcSize,'10');is(r.loadVA,11520)});
test('EVSE 40A produces 50A candidate',function(){is(E.evse({maxLoadA:40,voltage:240,egcMaterial:'Cu'}).result.standardOcpdCandidateA,50)});
test('EVSE 32A produces 40A candidate',function(){is(E.evse({maxLoadA:32,voltage:240,egcMaterial:'Cu'}).result.standardOcpdCandidateA,40)});
test('EVSE 16A 240V produces 20A and requires individual branch',function(){var r=E.evse({maxLoadA:16,voltage:240,egcMaterial:'Cu'}).result;is(r.standardOcpdCandidateA,20);is(r.individualBranchCircuitRequired,true)});
test('EVSE 16A 120V does not assert individual branch required',function(){is(E.evse({maxLoadA:16,voltage:120,egcMaterial:'Cu'}).result.individualBranchCircuitRequired,false)});
test('EVSE managed multiple path does not assert individual branch required',function(){var r=E.evse({maxLoadA:48,voltage:240,egcMaterial:'Cu',controlledMultipleEvse:true}).result;is(r.individualBranchCircuitRequired,false);is(r.controlledMultipleEvse,true)});
test('EVSE 80A produces 100A candidate',function(){is(E.evse({maxLoadA:80,voltage:240,egcMaterial:'Al'}).result.standardOcpdCandidateA,100)});
test('EVSE rejects unsupported 230V enum',function(){throws(function(){E.evse({maxLoadA:32,voltage:230,egcMaterial:'Cu'})})});
test('EVSE rejects blank load',function(){throws(function(){E.evse({maxLoadA:'',voltage:240,egcMaterial:'Cu'})})});
test('EVSE rejects zero load',function(){throws(function(){E.evse({maxLoadA:0,voltage:240,egcMaterial:'Cu'})})});
test('EVSE rejects missing EGC material',function(){throws(function(){E.evse({maxLoadA:32,voltage:240})})});

test('HVAC MCA/MOCP workflow accepts 32/50 with 50A OCPD',function(){var r=E.hvac({mcaA:32,mocpA:50,ocpdA:50,voltage:240,egcMaterial:'Cu'}).result;is(r.minimumConductorAmpacityA,32);is(r.selectedOcpdA,50);is(r.egcSize,'10')});
test('HVAC supports legitimate 10A standard OCPD',function(){is(E.hvac({mcaA:8,mocpA:15,ocpdA:10,voltage:240,egcMaterial:'Cu'}).result.selectedOcpdA,10)});
test('HVAC accepts selected OCPD below MOCP',function(){is(E.hvac({mcaA:32,mocpA:50,ocpdA:45,voltage:240,egcMaterial:'Cu'}).result.selectedOcpdA,45)});
test('HVAC rejects OCPD above MOCP',function(){throws(function(){E.hvac({mcaA:32,mocpA:50,ocpdA:60,voltage:240,egcMaterial:'Cu'})})});
test('HVAC rejects nonstandard OCPD',function(){throws(function(){E.hvac({mcaA:32,mocpA:55,ocpdA:55,voltage:240,egcMaterial:'Cu'})})});
test('HVAC rejects MOCP below MCA in supported workflow',function(){throws(function(){E.hvac({mcaA:50,mocpA:40,ocpdA:40,voltage:240,egcMaterial:'Cu'})})});
test('HVAC rejects blank MCA',function(){throws(function(){E.hvac({mcaA:'',mocpA:50,ocpdA:50,voltage:240,egcMaterial:'Cu'})})});
test('HVAC rejects missing EGC material',function(){throws(function(){E.hvac({mcaA:8,mocpA:15,ocpdA:10,voltage:240})})});

test('motor 14A FLC inverse breaker gives 17.5A conductors and 35A OCPD',function(){var r=E.motor({tableFlcA:14,nameplateA:13.2,deviceType:'inverseTimeBreaker',serviceFactor115OrTempRise40:true,egcMaterial:'Cu'}).result;is(r.minimumBranchConductorAmpacityA,17.5);is(r.table43052CalculatedMaxA,35);is(r.standardOcpdCandidateA,35);is(r.overloadMaxA,16.5);is(r.egcSize,'10')});
test('motor 14A FLC time delay fuse gives 24.5 raw and 25A candidate',function(){var r=E.motor({tableFlcA:14,nameplateA:13.2,deviceType:'timeDelayFuse',serviceFactor115OrTempRise40:true,egcMaterial:'Cu'}).result;is(r.table43052CalculatedMaxA,24.5);is(r.standardOcpdCandidateA,25)});
test('motor 14A FLC non-time-delay fuse gives 42 raw and 45A candidate',function(){var r=E.motor({tableFlcA:14,nameplateA:13.2,deviceType:'nonTimeDelayFuse',serviceFactor115OrTempRise40:true,egcMaterial:'Cu'}).result;is(r.table43052CalculatedMaxA,42);is(r.standardOcpdCandidateA,45)});
test('motor fuse path uses fuse-only 601A standard rating',function(){var r=E.motor({tableFlcA:343,nameplateA:300,deviceType:'timeDelayFuse',serviceFactor115OrTempRise40:true,egcMaterial:'Cu'}).result;is(r.table43052CalculatedMaxA,600.25);is(r.standardOcpdCandidateA,601)});
test('motor ordinary overload uses 115 percent',function(){var r=E.motor({tableFlcA:14,nameplateA:13.2,deviceType:'inverseTimeBreaker',serviceFactor115OrTempRise40:false,egcMaterial:'Cu'}).result;eq(r.overloadMaxA,15.18);eq(r.overloadFactor,1.15)});
test('motor reference uses 2026 250.122(F)',function(){is(E.motor({tableFlcA:14,nameplateA:13.2,deviceType:'inverseTimeBreaker',serviceFactor115OrTempRise40:true,egcMaterial:'Cu'}).reference.egc,R.references.motorEgc);is(R.references.motorEgc.indexOf('250.122(F)')>=0,true)});
test('motor rejects unknown device type',function(){throws(function(){E.motor({tableFlcA:14,nameplateA:13.2,deviceType:'instantaneous',serviceFactor115OrTempRise40:true,egcMaterial:'Cu'})})});
test('motor rejects blank table FLC',function(){throws(function(){E.motor({tableFlcA:'',nameplateA:13.2,deviceType:'inverseTimeBreaker',serviceFactor115OrTempRise40:true,egcMaterial:'Cu'})})});
test('motor rejects blank nameplate current',function(){throws(function(){E.motor({tableFlcA:14,nameplateA:'',deviceType:'inverseTimeBreaker',serviceFactor115OrTempRise40:true,egcMaterial:'Cu'})})});
test('motor rejects missing EGC material',function(){throws(function(){E.motor({tableFlcA:14,nameplateA:13.2,deviceType:'inverseTimeBreaker',serviceFactor115OrTempRise40:true})})});

test('GEC base Cu service #2 to Cu GEC #8',function(){is(E._test.gecBase('Cu','2','Cu'),'8')});
test('GEC base Cu service #1 to Cu GEC #6',function(){is(E._test.gecBase('Cu','1','Cu'),'6')});
test('GEC base Cu service 2/0 to Cu GEC #4',function(){is(E._test.gecBase('Cu','2/0','Cu'),'4')});
test('GEC base Cu service 4/0 to Cu GEC #2',function(){is(E._test.gecBase('Cu','4/0','Cu'),'2')});
test('GEC base Al service 4/0 to Cu GEC #4',function(){is(E._test.gecBase('Al','4/0','Cu'),'4')});
test('GEC base Cu service 600kcmil to Al GEC 3/0',function(){is(E._test.gecBase('Cu','600 kcmil','Al'),'3/0')});
test('rod cap is not asserted without sole-path confirmation',function(){var r=E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'600 kcmil',gecMaterial:'Cu',electrodeType:'rod-pipe-plate'});is(r.status,'REVIEW');is(r.result.gecSize,'1/0')});
test('rod electrode caps large Cu GEC at #6 Cu after sole-path confirmation',function(){var r=E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'600 kcmil',gecMaterial:'Cu',electrodeType:'rod-pipe-plate',doesNotExtendToOtherElectrodes:true});is(r.status,'PASS');is(r.result.gecSize,'6')});
test('rod electrode Al cap returns REVIEW even after sole-path confirmation',function(){var r=E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'600 kcmil',gecMaterial:'Al',electrodeType:'rod-pipe-plate',doesNotExtendToOtherElectrodes:true});is(r.status,'REVIEW');is(r.result.gecSize,'4')});
test('concrete cap not asserted without sole-path confirmation',function(){var r=E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'600 kcmil',gecMaterial:'Cu',electrodeType:'concrete-encased'});is(r.status,'REVIEW');is(r.result.gecSize,'1/0')});
test('concrete electrode caps Cu GEC at #4 after sole-path confirmation',function(){var r=E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'600 kcmil',gecMaterial:'Cu',electrodeType:'concrete-encased',doesNotExtendToOtherElectrodes:true});is(r.status,'PASS');is(r.result.gecSize,'4')});
test('concrete electrode automation rejects Al GEC without topology confirmation',function(){throws(function(){E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'600 kcmil',gecMaterial:'Al',electrodeType:'concrete-encased'})})});
test('concrete electrode automation rejects Al GEC when cap path confirmed',function(){throws(function(){E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'600 kcmil',gecMaterial:'Al',electrodeType:'concrete-encased',doesNotExtendToOtherElectrodes:true})})});
test('ground ring returns REVIEW without fabricated GEC size',function(){var r=E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'2/0',gecMaterial:'Cu',electrodeType:'ground-ring',doesNotExtendToOtherElectrodes:true});is(r.status,'REVIEW');is(r.result.gecSize,null)});
test('GEC rejects unsupported service conductor size',function(){throws(function(){E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'5',gecMaterial:'Cu',electrodeType:'table'})})});

test('feeder 40A continuous plus 30A noncontinuous requires 80A',function(){var r=E.feeder({continuousA:40,noncontinuousA:30,egcMaterial:'Cu'}).result;is(r.minimumAmpacityA,80);is(r.planningOcpdCandidateA,80);is(r.egcSize,'8')});
test('feeder 8A noncontinuous can use 10A standard candidate',function(){is(E.feeder({continuousA:0,noncontinuousA:8,egcMaterial:'Cu'}).result.planningOcpdCandidateA,10)});
test('feeder 40A continuous only requires 50A',function(){var r=E.feeder({continuousA:40,noncontinuousA:0,egcMaterial:'Cu'}).result;is(r.minimumAmpacityA,50);is(r.planningOcpdCandidateA,50);is(r.egcSize,'10')});
test('feeder 100A noncontinuous only remains 100A',function(){var r=E.feeder({continuousA:0,noncontinuousA:100,egcMaterial:'Al'}).result;is(r.minimumAmpacityA,100);is(r.planningOcpdCandidateA,100);is(r.egcSize,'6')});
test('feeder zero plus zero rejects',function(){throws(function(){E.feeder({continuousA:0,noncontinuousA:0,egcMaterial:'Cu'})})});
test('feeder blank continuous load rejects',function(){throws(function(){E.feeder({continuousA:'',noncontinuousA:30,egcMaterial:'Cu'})})});
test('feeder rejects missing EGC material',function(){throws(function(){E.feeder({continuousA:10,noncontinuousA:10})})});

test('EVSE BOM uses preliminary EGC wording',function(){var r=E.evse({maxLoadA:48,voltage:240,egcMaterial:'Cu'}),b=E.bom('evse',r);is(b.length,3);is(b[0].status,'Field Verify');is(b[1].item,'60A EVSE OCPD planning candidate');is(b[2].item.indexOf('Table 250.122 EGC lookup')>0,true)});
test('HVAC BOM uses actual selected OCPD and nameplate MCA',function(){var r=E.hvac({mcaA:32,mocpA:50,ocpdA:45,voltage:240,egcMaterial:'Cu'}),b=E.bom('hvac',r);is(b[0].item.indexOf('MCA 32 A')>0,true);is(b[1].item.indexOf('45A HVAC OCPD')===0,true)});
test('motor BOM cites 250.122(F)',function(){var r=E.motor({tableFlcA:14,nameplateA:13.2,deviceType:'inverseTimeBreaker',serviceFactor115OrTempRise40:true,egcMaterial:'Cu'}),b=E.bom('motor',r);is(b.length,4);is(b[3].item.indexOf('250.122(F)')>0,true)});
test('ground-ring BOM does not fabricate conductor size',function(){var r=E.groundingElectrode({serviceMaterial:'Cu',serviceConductorSize:'2/0',gecMaterial:'Cu',electrodeType:'ground-ring',doesNotExtendToOtherElectrodes:true}),b=E.bom('gec',r);is(b.length,1);is(b[0].item.indexOf('requires field/code review')>0,true)});
test('feeder BOM labels OCPD planning candidate',function(){var r=E.feeder({continuousA:40,noncontinuousA:30,egcMaterial:'Cu'}),b=E.bom('feeder',r);is(b[1].item.indexOf('planning candidate')>0,true)});
test('BOM rejects unsupported Phase 3 module',function(){throws(function(){E.bom('bad',{result:{}})})});

global.BRUNO_TEST_RESULTS=out;
})();
'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function near(a,b,t){if(Math.abs(a-b)>(t||0.01))throw new Error('expected '+b+' ± '+(t||0.01)+', got '+a)}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function throws(fn,m){var hit=false;try{fn()}catch(e){hit=true}ok(hit,m||'expected throw')}
var E=global.BrunoGroundingEngine;
function base(o){var x={loadAmps:'300',voltage:'480',phase:'3',distanceFt:'50',material:'Cu',installation:'EMT',conductorType:'THHN_THWN2',loadBasis:'NONCONTINUOUS',vdTargetPct:'3',ambientC:'30',ccc:'3',terminalRating:'75',parallelAllowed:false,maxConductorSize:'',racewayStrategy:'SEPARATE_SETS'};Object.keys(o||{}).forEach(function(k){x[k]=o[k]});return x}

test('300A OCPD maps to #4 Cu base EGC',function(){var r=E.calculate(base(),{ocpdAmps:'300',egcMaterial:'Cu',neutralMode:'NONE'});is(r.status,'PASS');is(r.result.egcBaseSize,'4');is(r.result.egcSelectedSize,'4');is(r.result.egcUpsizeReviewRequired,false)});
test('400A OCPD maps to #3 Cu and #1 Al table rows',function(){is(E._test.egcRow(400).Cu,'3');is(E._test.egcRow(400).Al,'1')});
test('unsupported OCPD above Stage 4 table subset fails closed',function(){throws(function(){E.calculate(base(),{ocpdAmps:'1500',egcMaterial:'Cu',neutralMode:'NONE'})})});
test('neutral unresolved blocks final Stage 4 raceway composition',function(){var r=E.calculate(base(),{ocpdAmps:'300',egcMaterial:'Cu',neutralMode:'UNRESOLVED'});is(r.status,'INPUT REQUIRED');is(r.result,null)});
test('300A short-run 3ph no-neutral composition uses 2-1/2 EMT',function(){var r=E.calculate(base(),{ocpdAmps:'300',egcMaterial:'Cu',neutralMode:'NONE'});is(r.status,'PASS');is(r.result.finalRacewayTradeSize,'2-1/2');is(r.raceways[0].phaseConductors,3);is(r.raceways[0].neutral.count,0);is(r.raceways[0].egc.size,'4')});
test('300A long-run 700 Cu is REVIEW REQUIRED and never published as final EGC/raceway',function(){var r=E.calculate(base({distanceFt:'1500',parallelAllowed:true}),{ocpdAmps:'300',egcMaterial:'Cu',neutralMode:'NONE'});is(r.status,'REVIEW REQUIRED');is(r.raceways[0].phaseSize,'700');is(r.result.egcBaseSize,'4');is(r.result.egcUpsizeReviewRequired,true);near(r.result.egcUpsizeRatio,2,.001);is(r.result.egcSelectedSize,null);is(r.result.egcReviewCandidate,'1');is(r.result.finalRacewayTradeSize,null);is(r.result.reviewRacewayTradeSize,'3');ok(r.unresolved.join(' ').indexOf('increased-size review')>=0)});
test('full-size neutral remains explicit in review candidate and changes candidate raceway',function(){var a=E.calculate(base({distanceFt:'1500',parallelAllowed:true}),{ocpdAmps:'300',egcMaterial:'Cu',neutralMode:'NONE'}),b=E.calculate(base({distanceFt:'1500',parallelAllowed:true}),{ocpdAmps:'300',egcMaterial:'Cu',neutralMode:'FULL_SIZE'});is(a.status,'REVIEW REQUIRED');is(b.status,'REVIEW REQUIRED');is(a.result.reviewRacewayTradeSize,'3');is(b.result.reviewRacewayTradeSize,'3-1/2');is(b.result.neutralSize,'700')});
test('parallel feeder puts one EGC review candidate in each separate raceway',function(){var r=E.calculate(base({distanceFt:'1500',parallelAllowed:true,maxConductorSize:'500'}),{ocpdAmps:'300',egcMaterial:'Cu',neutralMode:'NONE'});is(r.status,'REVIEW REQUIRED');is(r.raceways.length,2);r.raceways.forEach(function(x){is(x.egc.count,1);is(x.egc.reviewCandidate,true)});ok(r.warnings.join(' ').indexOf('parallel-raceway EGC')>=0)});
test('EGC neutral GEC and bonding remain semantically distinct',function(){var r=E.calculate(base(),{ocpdAmps:'300',egcMaterial:'Al',neutralMode:'FULL_SIZE'});is(r.status,'PASS');is(r.result.egcMaterial,'Al');is(r.result.egcBaseSize,'2');is(r.result.neutralSize,'350');ok(r.unresolved.join(' ').indexOf('GEC')>=0);ok(r.unresolved.join(' ').indexOf('Bonding')>=0)});
test('blank OCPD and EGC material fail closed rather than coercing zero/default',function(){throws(function(){E.calculate(base(),{ocpdAmps:'',egcMaterial:'Cu',neutralMode:'NONE'})});throws(function(){E.calculate(base(),{ocpdAmps:'300',egcMaterial:'',neutralMode:'NONE'})})});
test('EGC proportional target beyond supported size range has no silent fallback size',function(){is(E._test.nextSizeForCmil(2000000),null)});
global.BRUNO_TEST_RESULTS=out;
})();
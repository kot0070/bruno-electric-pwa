'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function near(a,b,t){if(Math.abs(a-b)>(t||0.02))throw new Error('expected '+b+' ± '+(t||0.02)+', got '+a)}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function throws(fn,m){var hit=false;try{fn()}catch(e){hit=true}ok(hit,m||'expected throw')}
var E=global.BrunoElectricalTaskEngine;
function base(o){var x={loadAmps:'100',voltage:'120/240',phase:'1',distanceFt:'100',material:'Cu',installation:'EMT',conductorType:'THHN_THWN2',loadBasis:'NONCONTINUOUS',vdTargetPct:'3',ambientC:'30',ccc:'2',terminalRating:'75',parallelAllowed:false,maxConductorSize:'',racewayStrategy:'SEPARATE_SETS'};Object.keys(o||{}).forEach(function(k){x[k]=o[k]});return x}

test('100A 240V 1ph 100ft Cu selects 3 AWG in supported model',function(){var r=E.calculate(base());is(r.status,'PASS');is(r.result.size,'3');is(r.result.sets,1);near(r.result.voltageDropPct,2.04,.03);ok(r.result.combinedAmpacity>=100)});
test('200A 480V 3ph 300ft Cu selects 3/0',function(){var r=E.calculate(base({loadAmps:'200',voltage:'480',phase:'3',distanceFt:'300',ccc:'3'}));is(r.result.size,'3/0');is(r.result.sets,1);near(r.result.voltageDropPct,1.66,.03)});
test('300A 480V 3ph 1500ft Cu resolves long run with 2 parallel 350 kcmil',function(){var r=E.calculate(base({loadAmps:'300',voltage:'480',phase:'3',distanceFt:'1500',ccc:'3',parallelAllowed:true}));is(r.result.size,'350');is(r.result.sets,2);near(r.result.voltageDropPct,2.99,.04);ok(r.result.combinedAmpacity>=300)});
test('300A 480V 3ph 1500ft Al resolves with 2 parallel 600 kcmil',function(){var r=E.calculate(base({loadAmps:'300',voltage:'480',phase:'3',distanceFt:'1500',ccc:'3',material:'Al',parallelAllowed:true}));is(r.result.size,'600');is(r.result.sets,2);near(r.result.voltageDropPct,2.87,.04)});
test('300A continuous short run applies 125 percent design ampacity and selects 500 Cu',function(){var r=E.calculate(base({loadAmps:'300',voltage:'480',phase:'3',distanceFt:'100',ccc:'3',loadBasis:'CONTINUOUS'}));is(r.result.requiredAmpacity,375);is(r.result.size,'500');is(r.result.sets,1)});
test('CCC adjustment boundary can force larger feeder conductor',function(){var r=E.calculate(base({loadAmps:'300',voltage:'480',phase:'3',distanceFt:'50',ccc:'4'}));is(r.result.size,'400');near(r.candidates[0].ampacity.cccFactor,.8,.0001)});
test('ambient correction uses 90C adjustment basis and terminal limit',function(){var r=E.calculate(base({loadAmps:'300',voltage:'480',phase:'3',distanceFt:'50',ccc:'3',ambientC:'40'}));is(r.result.size,'350');near(r.candidates[0].ampacity.tempFactor,.91,.0001);near(r.candidates[0].ampacity.combinedAmpacity,310,.001)});
test('600A cannot invent unsupported single conductor when parallel is disabled',function(){var r=E.calculate(base({loadAmps:'600',voltage:'480',phase:'3',distanceFt:'50',ccc:'3',parallelAllowed:false}));is(r.status,'NO SUPPORTED CONFIGURATION');is(r.result,null)});
test('600A with parallel allowed returns supported parallel conductor set',function(){var r=E.calculate(base({loadAmps:'600',voltage:'480',phase:'3',distanceFt:'50',ccc:'3',parallelAllowed:true}));is(r.result.sets,2);is(r.result.size,'350');ok(r.result.combinedAmpacity>=600)});
test('parallel candidates never use conductors smaller than 1/0',function(){var s=E.search(base({loadAmps:'150',voltage:'480',phase:'3',distanceFt:'5000',ccc:'3',parallelAllowed:true,vdTargetPct:'3'}));s.candidates.filter(function(c){return c.sets>1}).forEach(function(c){ok(E._test.sizes.indexOf(c.size)>=E._test.sizes.indexOf('1/0'),'parallel size below 1/0')})});
test('voltage drop uses load current, effective parallel CMIL and resistance-only K method',function(){var n=E.normalize(base({loadAmps:'300',voltage:'480',phase:'3',distanceFt:'1500',ccc:'3',parallelAllowed:true})),v=E._test.vdFor(n,'350',2),expected=Math.sqrt(3)*12.9*300*1500/700000/480*100;near(v.percentDropped,expected,.0001);is(v.method,'RESISTANCE_ONLY_K')});
test('blank required feeder inputs fail closed',function(){['loadAmps','voltage','phase','distanceFt','material','installation','conductorType','loadBasis','vdTargetPct','ambientC','ccc','terminalRating'].forEach(function(k){var x=base();x[k]='';throws(function(){E.calculate(x)},k+' blank should fail')})});
test('zero negative and malformed domains fail closed',function(){['0','-1','abc'].forEach(function(v){throws(function(){E.calculate(base({loadAmps:v}))})});throws(function(){E.calculate(base({distanceFt:'0'}))});throws(function(){E.calculate(base({ccc:'3.5'}))});throws(function(){E.calculate(base({vdTargetPct:'0'}))})});
test('mixed load basis fails closed until load breakdown exists',function(){throws(function(){E.calculate(base({loadBasis:'MIXED'}))})});
test('max conductor size constraint can yield no supported configuration',function(){var r=E.calculate(base({loadAmps:'300',voltage:'480',phase:'3',distanceFt:'1500',ccc:'3',parallelAllowed:false,maxConductorSize:'350'}));is(r.status,'NO SUPPORTED CONFIGURATION')});
test('candidate ranking is explicit and non-opaque',function(){var r=E.calculate(base({loadAmps:'300',voltage:'480',phase:'3',distanceFt:'1500',ccc:'3',parallelAllowed:true}));is(r.candidates[0].selectionBasis,'MINIMUM_TOTAL_CIRCULAR_MIL_AREA_MEETING_SELECTED_CONSTRAINTS');ok(r.candidates.length>1);for(var i=1;i<r.candidates.length;i++)ok(r.candidates[i].totalCmil>=r.candidates[0].totalCmil)});
global.BRUNO_TEST_RESULTS=out;
})();

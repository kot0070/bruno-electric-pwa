'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function throws(fn,m){var hit=false;try{fn()}catch(e){hit=true}ok(hit,m||'expected throw')}
var A=global.BrunoElectricalTaskAdvanced;
function input(o){var x={loadAmps:'20',voltage:'240',phase:'1',distanceFt:'50',material:'Cu',installation:'EMT',conductorType:'THHN_THWN2',loadBasis:'NONCONTINUOUS',vdTargetPct:'3',ambientC:'30',ccc:'2',terminalRating:'75',parallelAllowed:false,maxConductorSize:'',racewayStrategy:'SEPARATE_SETS'};Object.keys(o||{}).forEach(function(k){x[k]=o[k]});return x}
function ground(o){var x={ocpdAmps:'20',neutralMode:'NONE',egcMaterial:'Cu'};Object.keys(o||{}).forEach(function(k){x[k]=o[k]});return x}
test('Stage 7A Branch Circuit reuses deterministic shared calculation chain',function(){var r=A.calculate('BRANCH_CIRCUIT_RUN',input(),ground());is(r.status,'PASS');ok(r.result,'branch result missing');ok((r.warnings||[]).some(function(x){return x.indexOf('Branch Circuit Run uses the shared deterministic')>=0}),'scope warning missing');is(r.taskTemplateEngineVersion,'electrical-task-advanced-v1')});
test('Branch Circuit missing compliance-critical current fails closed',function(){throws(function(){A.calculate('BRANCH_CIRCUIT_RUN',input({loadAmps:''}),ground())},'blank design current must throw/fail closed')});
test('Branch Circuit blank OCPD/neutral facts remain fail-closed in grounding chain',function(){throws(function(){A.calculate('BRANCH_CIRCUIT_RUN',input(),ground({ocpdAmps:'',neutralMode:'UNRESOLVED'}))},'unresolved grounding facts must throw/fail closed')});
test('Stage 7A adapter refuses templates not yet enabled by adapter',function(){throws(function(){A.calculate('EVSE_CIRCUIT',input(),ground())})});
global.BRUNO_TEST_RESULTS=out;
})();
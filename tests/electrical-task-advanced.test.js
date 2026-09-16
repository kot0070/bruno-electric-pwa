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
test('Stage 7A Branch Circuit reuses deterministic shared calculation chain',function(){var r=A.calculate('BRANCH_CIRCUIT_RUN',input(),ground());is(r.status,'PASS');ok(r.result,'branch result missing');ok((r.warnings||[]).some(function(x){return x.indexOf('Branch Circuit Run uses the shared deterministic')>=0}),'scope warning missing')});
test('Branch Circuit missing compliance-critical current fails closed',function(){throws(function(){A.calculate('BRANCH_CIRCUIT_RUN',input({loadAmps:''}),ground())})});
test('Branch Circuit blank OCPD/neutral facts remain fail-closed in grounding chain',function(){throws(function(){A.calculate('BRANCH_CIRCUIT_RUN',input(),ground({ocpdAmps:'',neutralMode:'UNRESOLVED'}))})});
test('Stage 7B EVSE requires explicit continuous load basis',function(){throws(function(){A.calculate('EVSE_CIRCUIT',input({loadBasis:'NONCONTINUOUS'}),ground())},'EVSE must not silently convert load basis');var r=A.calculate('EVSE_CIRCUIT',input({loadBasis:'CONTINUOUS'}),ground());is(r.status,'PASS');ok((r.warnings||[]).some(function(x){return x.indexOf('EVSE Circuit uses the shared deterministic')>=0}),'EVSE scope warning missing')});
test('EVSE missing design current fails closed',function(){throws(function(){A.calculate('EVSE_CIRCUIT',input({loadBasis:'CONTINUOUS',loadAmps:''}),ground())})});
test('Stage 7C HVAC reuses deterministic shared calculation chain from explicit equipment facts',function(){var r=A.calculate('HVAC_CIRCUIT',input({loadAmps:'32',loadBasis:'NONCONTINUOUS'}),ground({ocpdAmps:'40'}));is(r.status,'PASS');ok(r.result,'HVAC result missing');ok((r.warnings||[]).some(function(x){return x.indexOf('HVAC Circuit treats Load / Design Current as an explicit equipment-derived conductor design current')>=0}),'HVAC scope warning missing')});
test('HVAC missing equipment-derived design current fails closed',function(){throws(function(){A.calculate('HVAC_CIRCUIT',input({loadAmps:''}),ground({ocpdAmps:'40'}))})});
test('HVAC missing explicit OCPD fact fails closed',function(){throws(function(){A.calculate('HVAC_CIRCUIT',input({loadAmps:'32'}),ground({ocpdAmps:''}))})});
test('Stage 7D Motor requires already-derived conductor design current without generic second 125 percent factor',function(){throws(function(){A.calculate('MOTOR_CIRCUIT',input({loadAmps:'35',loadBasis:'CONTINUOUS'}),ground({ocpdAmps:'50'}))},'motor adapter must reject generic continuous multiplier path');var r=A.calculate('MOTOR_CIRCUIT',input({loadAmps:'35',loadBasis:'NONCONTINUOUS'}),ground({ocpdAmps:'50'}));is(r.status,'PASS');ok((r.warnings||[]).some(function(x){return x.indexOf('Motor Circuit treats Load / Design Current as an explicit already-derived motor conductor design current')>=0}),'Motor scope warning missing');is(r.taskTemplateEngineVersion,'electrical-task-advanced-v4')});
test('Motor missing already-derived conductor design current fails closed',function(){throws(function(){A.calculate('MOTOR_CIRCUIT',input({loadAmps:'',loadBasis:'NONCONTINUOUS'}),ground({ocpdAmps:'50'}))})});
test('Motor missing explicit OCPD fact fails closed',function(){throws(function(){A.calculate('MOTOR_CIRCUIT',input({loadAmps:'35',loadBasis:'NONCONTINUOUS'}),ground({ocpdAmps:''}))})});
test('Stage 7D adapter refuses later templates',function(){['TRANSFORMER_FEED','GENERATOR_FEEDER'].forEach(function(t){throws(function(){A.calculate(t,input(),ground())},t+' should remain locked')})});
global.BRUNO_TEST_RESULTS=out;
})();

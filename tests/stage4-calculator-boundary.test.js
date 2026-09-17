'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function throwsMessage(fn,needle){var hit=null;try{fn()}catch(e){hit=e}ok(hit,'expected throw');ok(String(hit.message).indexOf(needle)>=0,'expected error containing '+JSON.stringify(needle)+', got '+JSON.stringify(hit.message))}
var C=global.BrunoElectricalCalc;

test('Stage 4 Box Fill explicit blank insulated count fails instead of coercing to zero',function(){
  throwsMessage(function(){C.boxFill({size:'12',insulatedCount:'',groundCount:2,yokeCount:1,boxVolume:20.3})},'insulated conductor count is required');
});

test('Stage 4 Box Fill explicit blank ground count fails instead of coercing to zero',function(){
  throwsMessage(function(){C.boxFill({size:'12',insulatedCount:4,groundCount:'',yokeCount:1,boxVolume:20.3})},'ground count is required');
});

test('Stage 4 Box Fill explicit blank yoke count fails instead of coercing to zero',function(){
  throwsMessage(function(){C.boxFill({size:'12',insulatedCount:4,groundCount:2,yokeCount:'',boxVolume:20.3})},'device/yoke count is required');
});

test('Stage 4 Box Fill omitted legacy counts still default to zero',function(){
  var r=C.boxFill({size:'12',boxVolume:20.3});
  is(r.result.totalUnits,0);is(r.result.requiredVolume,0);is(r.status,'PASS');
});

test('Stage 4 Box Fill explicit zero counts remain valid and distinct from blank',function(){
  var r=C.boxFill({size:'12',insulatedCount:0,groundCount:0,yokeCount:0,boxVolume:20.3});
  is(r.result.totalUnits,0);is(r.result.requiredVolume,0);is(r.status,'PASS');
});

global.BRUNO_TEST_RESULTS=out;
})();

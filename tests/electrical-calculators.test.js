(function(){
'use strict';
var C=window.BrunoElectricalCalc, results=[];
function test(name,fn){try{fn();results.push({name:name,ok:true})}catch(e){results.push({name:name,ok:false,error:e.message})}}
function eq(a,b,tol){tol=tol==null?1e-6:tol;if(Math.abs(Number(a)-Number(b))>tol)throw new Error('expected '+b+', got '+a)}
function is(v,b){if(v!==b)throw new Error('expected '+b+', got '+v)}
function throws(fn){var ok=false;try{fn()}catch(e){ok=true}if(!ok)throw new Error('expected error')}

test('ampacity normal: #6 Cu 90C / 75C terminals',function(){var r=C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:75,ccc:3,ambientC:30,loadAmps:50,continuous:false});eq(r.result.baseAmpacity,75);eq(r.result.finalAllowableAmpacity,65);is(r.status,'PASS')});
test('ampacity boundary: 4 CCC adjustment',function(){var r=C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:75,ccc:4,ambientC:30,loadAmps:60,continuous:false});eq(r.result.cccFactor,.8);eq(r.result.finalAllowableAmpacity,60);is(r.status,'PASS')});
test('ampacity fail above adjusted ampacity',function(){var r=C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:75,ccc:4,ambientC:30,loadAmps:61});is(r.status,'FAIL')});
test('ampacity invalid conductor',function(){throws(function(){C.ampacity({material:'Cu',size:'5',loadAmps:20})})});

test('voltage drop normal',function(){var r=C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'6',distanceFt:100,current:40,powerFactor:1,targetPct:3});eq(r.result.voltsDropped,3.93,.01);eq(r.result.percentDropped,1.64,.01);is(r.status,'PASS')});
test('voltage drop recommendation review',function(){var r=C.voltageDrop({voltage:120,phase:1,material:'Cu',size:'14',distanceFt:200,current:15,powerFactor:1,targetPct:3});is(r.status,'REVIEW')});
test('voltage drop invalid PF',function(){throws(function(){C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:50,current:10,powerFactor:1.2})})});

test('conduit fill normal 3x #12 THHN in 3/4 EMT',function(){var r=C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[{size:'12',qty:3}]});eq(r.result.totalConductorArea,.0399,.0001);eq(r.result.allowedFillPct,40);is(r.status,'PASS')});
test('conduit fill boundary rule single conductor = 53%',function(){var r=C.conduitFill({racewayType:'EMT',tradeSize:'1/2',conductors:[{size:'4',qty:1}]});eq(r.result.allowedFillPct,53);is(r.status,'PASS')});
test('conduit fill fail overload',function(){var r=C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[{size:'12',qty:20}]});is(r.status,'FAIL')});
test('conduit fill invalid empty rows',function(){throws(function(){C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[]})})});

test('box fill normal same-gauge model',function(){var r=C.boxFill({size:'12',insulatedCount:4,groundCount:2,yokeCount:1,internalClamp:false,boxVolume:20.3});eq(r.result.requiredVolume,15.75);is(r.status,'PASS')});
test('box fill fail small box',function(){var r=C.boxFill({size:'12',insulatedCount:4,groundCount:2,yokeCount:1,internalClamp:true,boxVolume:14});is(r.status,'FAIL')});
test('box fill invalid volume',function(){throws(function(){C.boxFill({size:'12',insulatedCount:1,boxVolume:0})})});

test('transformer current single phase',function(){var r=C.transformerCurrent({kva:25,phase:1,primaryVoltage:240,secondaryVoltage:120});eq(r.result.primaryAmps,104.17,.01);eq(r.result.secondaryAmps,208.33,.01)});
test('transformer current three phase',function(){var r=C.transformerCurrent({kva:75,phase:3,primaryVoltage:480,secondaryVoltage:208});eq(r.result.primaryAmps,90.21,.02);eq(r.result.secondaryAmps,208.18,.02)});

var pass=results.filter(function(x){return x.ok}).length,fail=results.length-pass;
window.BRUNO_TEST_RESULTS={total:results.length,pass:pass,fail:fail,results:results};
var host=document.getElementById('results');if(host){host.innerHTML='<h1>Electrical Calculator Tests</h1><p><b>'+pass+'/'+results.length+' passed</b></p>'+results.map(function(x){return '<div style="padding:6px;color:'+(x.ok?'#3dd68c':'#f07178')+'">'+(x.ok?'PASS':'FAIL')+' — '+x.name+(x.error?' — '+x.error:'')+'</div>'}).join('')}
if(fail)console.error('Bruno Electrical tests failed',results);else console.log('Bruno Electrical tests passed',results);
})();

(function(){
'use strict';
var C=window.BrunoElectricalCalc,R=window.BrunoElectricalRules,results=[];
function test(name,fn){try{fn();results.push({name:name,ok:true})}catch(e){results.push({name:name,ok:false,error:e.message})}}
function eq(a,b,tol){tol=tol==null?1e-6:tol;if(Math.abs(Number(a)-Number(b))>tol)throw new Error('expected '+b+', got '+a)}
function is(v,b){if(v!==b)throw new Error('expected '+b+', got '+v)}
function ok(v,m){if(!v)throw new Error(m||'expected truthy')}
function throws(fn){var hit=false;try{fn()}catch(e){hit=true}if(!hit)throw new Error('expected error')}

var amp={Cu:{'14':[15,20,25],'12':[20,25,30],'10':[30,35,40],'8':[40,50,55],'6':[55,65,75],'4':[70,85,95],'3':[85,100,115],'2':[95,115,130],'1':[110,130,145],'1/0':[125,150,170],'2/0':[145,175,195],'3/0':[165,200,225],'4/0':[195,230,260]},Al:{'12':[15,20,25],'10':[25,30,35],'8':[35,40,45],'6':[40,50,55],'4':[55,65,75],'3':[65,75,85],'2':[75,90,100],'1':[85,100,115],'1/0':[100,120,135],'2/0':[115,135,150],'3/0':[130,155,175],'4/0':[150,180,205]}};
Object.keys(amp).forEach(function(mat){Object.keys(amp[mat]).forEach(function(size){[60,75,90].forEach(function(t,i){test('Table 310.16 '+mat+' #'+size+' '+t+'C',function(){eq(R.AMPACITY[mat][size][i],amp[mat][size][i])})})})});

[[3,1],[4,.8],[6,.8],[7,.7],[9,.7],[10,.5],[20,.5],[21,.45],[30,.45],[31,.4],[40,.4],[41,.35]].forEach(function(x){test('CCC boundary '+x[0],function(){eq(C._test.cccFactor(x[0]),x[1])})});
['',0,-1,3.5,NaN].forEach(function(v){test('CCC invalid '+String(v),function(){throws(function(){C._test.cccFactor(v)})})});
[[10,1.15],[10.1,1.12],[15,1.12],[15.1,1.08],[30,1],[30.1,.96],[35,.96],[35.1,.91],[80,.41]].forEach(function(x){test('90C temp boundary '+x[0],function(){eq(C._test.tempFactor(90,x[0]),x[1])})});
test('ambient below supported range rejected',function(){throws(function(){C._test.tempFactor(90,9.9)})});
test('ambient above supported range rejected',function(){throws(function(){C._test.tempFactor(90,80.1)})});

test('ampacity normal terminal cap',function(){var r=C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:75,ccc:3,ambientC:30,loadAmps:50});eq(r.result.baseAmpacity,75);eq(r.result.finalAllowableAmpacity,65);is(r.status,'PASS')});
test('ampacity continuous threshold',function(){var r=C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:75,ccc:3,ambientC:30,loadAmps:52,continuous:true});eq(r.result.requiredAmpacity,65);is(r.status,'PASS')});
test('ampacity above adjusted limit fails',function(){var r=C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:75,ccc:4,ambientC:30,loadAmps:61});is(r.status,'FAIL')});
test('ampacity blank required load rejected',function(){throws(function(){C.ampacity({material:'Cu',size:'6',loadAmps:''})})});
test('ampacity missing required load rejected',function(){throws(function(){C.ampacity({material:'Cu',size:'6'})})});
test('ampacity explicit zero insulation rejected not defaulted',function(){throws(function(){C.ampacity({material:'Cu',size:'6',insulationRating:0,terminalRating:75,loadAmps:20})})});
test('ampacity blank insulation rejected not defaulted',function(){throws(function(){C.ampacity({material:'Cu',size:'6',insulationRating:'',terminalRating:75,loadAmps:20})})});
test('ampacity explicit zero terminal rejected not defaulted',function(){throws(function(){C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:0,loadAmps:20})})});

test('voltage drop 1 phase K-method',function(){var r=C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'6',distanceFt:100,current:40,powerFactor:1,targetPct:3});eq(r.result.voltsDropped,3.93,.01);eq(r.result.percentDropped,1.64,.01);is(r.status,'PASS');is(r.result.method,'RESISTANCE_ONLY_K')});
test('voltage drop 3 phase resistance-only does not shrink by PF',function(){var r=C.voltageDrop({voltage:480,phase:3,material:'Cu',size:'6',distanceFt:100,current:50,powerFactor:.9,targetPct:3});eq(r.result.voltsDropped,4.26,.02);eq(r.result.percentDropped,.89,.02)});
test('PF cannot turn 3.29 percent K drop into false PASS',function(){var r=C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:100,current:20,powerFactor:.8,targetPct:3});eq(r.result.voltsDropped,7.9,.02);eq(r.result.percentDropped,3.29,.02);is(r.status,'REVIEW')});
test('voltage drop blank current rejected',function(){throws(function(){C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:50,current:''})})});
test('voltage drop blank distance rejected',function(){throws(function(){C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:'',current:10})})});
test('voltage drop invalid PF rejected',function(){throws(function(){C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:50,current:10,powerFactor:1.2})})});
test('voltage drop omitted target defaults 3',function(){eq(C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:10,current:5}).result.targetPct,3)});
test('voltage drop blank target defaults 3',function(){eq(C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:10,current:5,targetPct:''}).result.targetPct,3)});
[2,0,'foo',''].forEach(function(v){test('voltage drop invalid phase '+JSON.stringify(v),function(){throws(function(){C.voltageDrop({voltage:240,phase:v,material:'Cu',size:'12',distanceFt:50,current:10})})})});

 test('conduit fill 3x #12 THHN in 3/4 EMT',function(){var r=C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[{size:'12',qty:3}]});eq(r.result.totalConductorArea,.0399,.0001);eq(r.result.allowedFillPct,40);is(r.status,'PASS')});
test('conduit fill one conductor 53 percent',function(){eq(C.conduitFill({racewayType:'EMT',tradeSize:'1/2',conductors:[{size:'4',qty:1}]}).result.allowedFillPct,53)});
test('conduit fill two conductors 31 percent',function(){eq(C.conduitFill({racewayType:'EMT',tradeSize:'1/2',conductors:[{size:'12',qty:2}]}).result.allowedFillPct,31)});
test('conduit fill overload fails',function(){is(C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[{size:'12',qty:20}]}).status,'FAIL')});
[2.5,0,-1,'',NaN].forEach(function(v){test('conduit invalid qty '+String(v),function(){throws(function(){C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[{size:'12',qty:v}]})})})});

test('box fill same gauge model',function(){var r=C.boxFill({size:'12',insulatedCount:4,groundCount:2,yokeCount:1,internalClamp:false,boxVolume:20.3});eq(r.result.requiredVolume,15.75);is(r.status,'PASS')});
test('box fill >4 EGC unsupported',function(){throws(function(){C.boxFill({size:'12',insulatedCount:4,groundCount:5,yokeCount:1,boxVolume:30})})});
test('box fill fractional counts rejected',function(){throws(function(){C.boxFill({size:'12',insulatedCount:4.5,groundCount:2,yokeCount:1,boxVolume:30})})});

test('transformer current single phase',function(){var r=C.transformerCurrent({kva:25,phase:1,primaryVoltage:240,secondaryVoltage:120});eq(r.result.primaryAmps,104.17,.01);eq(r.result.secondaryAmps,208.33,.01)});
test('transformer current three phase',function(){var r=C.transformerCurrent({kva:75,phase:3,primaryVoltage:480,secondaryVoltage:208});eq(r.result.primaryAmps,90.21,.02);eq(r.result.secondaryAmps,208.18,.02)});
[2,0,'foo',''].forEach(function(v){test('transformer invalid phase '+JSON.stringify(v),function(){throws(function(){C.transformerCurrent({kva:25,phase:v,primaryVoltage:240,secondaryVoltage:120})})})});

var pass=results.filter(function(x){return x.ok}).length,fail=results.length-pass;
window.BRUNO_TEST_RESULTS={total:results.length,pass:pass,fail:fail,results:results};
var host=document.getElementById('results');
if(host){host.innerHTML='<h1>Electrical Calculator Tests</h1><p><b>'+pass+'/'+results.length+' passed</b></p>'+results.map(function(x){return '<div style="padding:6px;color:'+(x.ok?'#3dd68c':'#f07178')+'">'+(x.ok?'PASS':'FAIL')+' — '+x.name+(x.error?' — '+x.error:'')+'</div>';}).join('');}
if(fail)console.error('Bruno Electrical tests failed',results);else console.log('Bruno Electrical tests passed',results);
})();

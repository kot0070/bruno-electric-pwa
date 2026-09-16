(function(){
'use strict';
var C=window.BrunoElectricalCalc,R=window.BrunoElectricalRules,results=[];
function test(name,fn){try{fn();results.push({name:name,ok:true})}catch(e){results.push({name:name,ok:false,error:e.message})}}
function eq(a,b,tol){tol=tol==null?1e-6:tol;if(Math.abs(Number(a)-Number(b))>tol)throw new Error('expected '+b+', got '+a)}
function is(v,b){if(v!==b)throw new Error('expected '+b+', got '+v)}
function throws(fn){var ok=false;try{fn()}catch(e){ok=true}if(!ok)throw new Error('expected error')}

var expectedAmpacity={
  Cu:{'14':[15,20,25],'12':[20,25,30],'10':[30,35,40],'8':[40,50,55],'6':[55,65,75],'4':[70,85,95],'3':[85,100,115],'2':[95,115,130],'1':[110,130,145],'1/0':[125,150,170],'2/0':[145,175,195],'3/0':[165,200,225],'4/0':[195,230,260]},
  Al:{'12':[15,20,25],'10':[25,30,35],'8':[35,40,45],'6':[40,50,55],'4':[55,65,75],'3':[65,75,85],'2':[75,90,100],'1':[85,100,115],'1/0':[100,120,135],'2/0':[115,135,150],'3/0':[130,155,175],'4/0':[150,180,205]}
};
Object.keys(expectedAmpacity).forEach(function(mat){Object.keys(expectedAmpacity[mat]).forEach(function(size){[60,75,90].forEach(function(temp,i){test('Table 310.16 '+mat+' #'+size+' '+temp+'C',function(){eq(R.AMPACITY[mat][size][i],expectedAmpacity[mat][size][i])})})})});

var expectedTemp={
  60:[[10,1.29],[15,1.22],[20,1.15],[25,1.08],[30,1],[35,.91],[40,.82],[45,.71],[50,.58],[55,.41]],
  75:[[10,1.20],[15,1.15],[20,1.11],[25,1.05],[30,1],[35,.94],[40,.88],[45,.82],[50,.75],[55,.67],[60,.58],[65,.47],[70,.33]],
  90:[[10,1.15],[15,1.12],[20,1.08],[25,1.04],[30,1],[35,.96],[40,.91],[45,.87],[50,.82],[55,.76],[60,.71],[65,.65],[70,.58],[75,.50],[80,.41]]
};
Object.keys(expectedTemp).forEach(function(k){expectedTemp[k].forEach(function(pair){test('Temp factor '+k+'C rating through '+pair[0]+'C ambient',function(){eq(C._test.tempFactor(Number(k),pair[0]),pair[1])})})});
[[10,1.15],[10.1,1.12],[15,1.12],[15.1,1.08],[30,1],[30.1,.96],[35,.96],[35.1,.91]].forEach(function(x){test('90C ambient boundary '+x[0]+'C',function(){eq(C._test.tempFactor(90,x[0]),x[1])})});
[[3,1],[4,.8],[6,.8],[7,.7],[9,.7],[10,.5],[20,.5],[21,.45],[30,.45],[31,.4],[40,.4],[41,.35]].forEach(function(x){test('CCC boundary '+x[0],function(){eq(C._test.cccFactor(x[0]),x[1])})});
test('CCC zero rejected',function(){throws(function(){C._test.cccFactor(0)})});
test('CCC negative rejected',function(){throws(function(){C._test.cccFactor(-1)})});
test('CCC blank rejected',function(){throws(function(){C._test.cccFactor('')})});
test('CCC NaN rejected',function(){throws(function(){C._test.cccFactor(NaN)})});
test('ambient below supported table range rejected',function(){throws(function(){C._test.tempFactor(90,9.9)})});

test('ampacity normal: #6 Cu 90C / 75C terminals',function(){var r=C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:75,ccc:3,ambientC:30,loadAmps:50,continuous:false});eq(r.result.baseAmpacity,75);eq(r.result.finalAllowableAmpacity,65);is(r.status,'PASS')});
test('ampacity corrected Cu #14 60C',function(){var r=C.ampacity({material:'Cu',size:'14',insulationRating:60,terminalRating:60,ccc:3,ambientC:30,loadAmps:15});eq(r.result.baseAmpacity,15);eq(r.result.finalAllowableAmpacity,15)});
test('ampacity corrected Cu #1 90C',function(){var r=C.ampacity({material:'Cu',size:'1',insulationRating:90,terminalRating:90,ccc:3,ambientC:30,loadAmps:145});eq(r.result.baseAmpacity,145)});
test('ampacity corrected Al #8 60C',function(){var r=C.ampacity({material:'Al',size:'8',insulationRating:60,terminalRating:60,ccc:3,ambientC:30,loadAmps:35});eq(r.result.baseAmpacity,35)});
test('ampacity 15C 90C factor',function(){var r=C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:90,ccc:3,ambientC:15,loadAmps:0});eq(r.result.tempFactor,1.12)});
test('ampacity fail above adjusted ampacity',function(){var r=C.ampacity({material:'Cu',size:'6',insulationRating:90,terminalRating:75,ccc:4,ambientC:30,loadAmps:61});is(r.status,'FAIL')});
test('ampacity invalid conductor',function(){throws(function(){C.ampacity({material:'Cu',size:'5',loadAmps:20})})});
['Copper','foo',''].forEach(function(v){test('ampacity invalid material '+JSON.stringify(v)+' rejected',function(){throws(function(){C.ampacity({material:v,size:'6',loadAmps:20})})})});
test('ampacity fractional CCC rejected',function(){throws(function(){C.ampacity({material:'Cu',size:'6',ccc:3.5,loadAmps:20})})});
test('ampacity blank required load rejected',function(){throws(function(){C.ampacity({material:'Cu',size:'6',loadAmps:''})})});
test('ampacity explicit zero insulation rating rejected rather than defaulted',function(){throws(function(){C.ampacity({material:'Cu',size:'6',insulationRating:0,terminalRating:75,loadAmps:20})})});
test('ampacity blank insulation rating rejected rather than defaulted',function(){throws(function(){C.ampacity({material:'Cu',size:'6',insulationRating:'',terminalRating:75,loadAmps:20})})});

test('voltage drop normal',function(){var r=C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'6',distanceFt:100,current:40,powerFactor:1,targetPct:3});eq(r.result.voltsDropped,3.93,.01);eq(r.result.percentDropped,1.64,.01);is(r.status,'PASS')});
test('voltage drop 3 phase resistance-only K method does not improve at lower PF',function(){var r=C.voltageDrop({voltage:480,phase:3,material:'Cu',size:'6',distanceFt:100,current:50,powerFactor:.9,targetPct:3});eq(r.result.voltsDropped,4.26,.02);eq(r.result.percentDropped,.89,.02);is(r.result.method,'RESISTANCE_ONLY_K')});
test('voltage drop PF cannot turn 3.29 percent K-drop into false PASS',function(){var r=C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:100,current:20,powerFactor:.8,targetPct:3});eq(r.result.voltsDropped,7.9,.02);eq(r.result.percentDropped,3.29,.02);is(r.status,'REVIEW')});
test('voltage drop blank current rejected',function(){throws(function(){C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:50,current:''})})});
test('voltage drop blank distance rejected',function(){throws(function(){C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:'',current:10})})});
test('voltage drop string phase 1 accepted',function(){var r=C.voltageDrop({voltage:240,phase:'1',material:'Cu',size:'6',distanceFt:10,current:5,targetPct:3});is(r.module,'voltageDrop')});
test('voltage drop string phase 3 accepted',function(){var r=C.voltageDrop({voltage:480,phase:'3',material:'Cu',size:'6',distanceFt:10,current:5,targetPct:3});is(r.module,'voltageDrop')});
test('voltage drop invalid PF',function(){throws(function(){C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:50,current:10,powerFactor:1.2})})});
[2,0,'foo',''].forEach(function(v){test('voltage drop invalid phase '+JSON.stringify(v)+' rejected',function(){throws(function(){C.voltageDrop({voltage:240,phase:v,material:'Cu',size:'12',distanceFt:50,current:10})})})});
['Copper','foo',''].forEach(function(v){test('voltage drop invalid material '+JSON.stringify(v)+' rejected',function(){throws(function(){C.voltageDrop({voltage:240,phase:1,material:v,size:'12',distanceFt:50,current:10})})})});
test('voltage drop target 2 valid',function(){var r=C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:10,current:5,targetPct:2});eq(r.result.targetPct,2)});
[0,-1,NaN].forEach(function(v){test('voltage drop invalid target '+String(v)+' rejected',function(){throws(function(){C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:50,current:10,targetPct:v})})})});
test('voltage drop omitted target defaults to 3',function(){var r=C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:10,current:5});eq(r.result.targetPct,3)});
test('voltage drop blank target defaults to 3',function(){var r=C.voltageDrop({voltage:240,phase:1,material:'Cu',size:'12',distanceFt:10,current:5,targetPct:''});eq(r.result.targetPct,3)});

test('conduit fill normal 3x #12 THHN in 3/4 EMT',function(){var r=C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[{size:'12',qty:3}]});eq(r.result.totalConductorArea,.0399,.0001);eq(r.result.allowedFillPct,40);is(r.status,'PASS')});
test('conduit fill one conductor = 53%',function(){var r=C.conduitFill({racewayType:'EMT',tradeSize:'1/2',conductors:[{size:'4',qty:1}]});eq(r.result.allowedFillPct,53)});
test('conduit fill two conductors = 31%',function(){var r=C.conduitFill({racewayType:'EMT',tradeSize:'1/2',conductors:[{size:'12',qty:2}]});eq(r.result.allowedFillPct,31)});
test('conduit fill mixed rows aggregate',function(){var r=C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[{size:'12',qty:2},{size:'10',qty:1}]});eq(r.result.totalConductorArea,.0477,.0001);eq(r.result.conductorCount,3)});
test('conduit fill fail overload',function(){var r=C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[{size:'12',qty:20}]});is(r.status,'FAIL')});
test('conduit fill invalid empty rows',function(){throws(function(){C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[]})})});
[2.5,0,-1,'',NaN].forEach(function(v){test('conduit fill invalid quantity '+String(v)+' rejected',function(){throws(function(){C.conduitFill({racewayType:'EMT',tradeSize:'3/4',conductors:[{size:'12',qty:v}]})})})});

test('box fill normal same-gauge model',function(){var r=C.boxFill({size:'12',insulatedCount:4,groundCount:2,yokeCount:1,internalClamp:false,boxVolume:20.3});eq(r.result.requiredVolume,15.75);is(r.status,'PASS')});
test('box fill exactly four EGC supported',function(){var r=C.boxFill({size:'12',insulatedCount:4,groundCount:4,yokeCount:1,internalClamp:false,boxVolume:15.75});eq(r.result.requiredVolume,15.75);is(r.status,'PASS')});
[5,8,20].forEach(function(v){test('box fill EGC '+v+' rejected',function(){throws(function(){C.boxFill({size:'12',insulatedCount:4,groundCount:v,yokeCount:1,internalClamp:false,boxVolume:30})})})});
test('box fill fail small box',function(){var r=C.boxFill({size:'12',insulatedCount:4,groundCount:2,yokeCount:1,internalClamp:true,boxVolume:14});is(r.status,'FAIL')});
test('box fill fractional counts rejected',function(){throws(function(){C.boxFill({size:'12',insulatedCount:4.5,groundCount:2,yokeCount:1,boxVolume:30})})});
test('box fill invalid volume',function(){throws(function(){C.boxFill({size:'12',insulatedCount:1,boxVolume:0})})});

test('transformer current single phase',function(){var r=C.transformerCurrent({kva:25,phase:1,primaryVoltage:240,secondaryVoltage:120});eq(r.result.primaryAmps,104.17,.01);eq(r.result.secondaryAmps,208.33,.01)});
test('transformer current three phase',function(){var r=C.transformerCurrent({kva:75,phase:3,primaryVoltage:480,secondaryVoltage:208});eq(r.result.primaryAmps,90.21,.02);eq(r.result.secondaryAmps,208.18,.02)});
test('transformer string phase 1 accepted',function(){var r=C.transformerCurrent({kva:25,phase:'1',primaryVoltage:240,secondaryVoltage:120});eq(r.result.primaryAmps,104.17,.01)});
test('transformer string phase 3 accepted',function(){var r=C.transformerCurrent({kva:75,phase:'3',primaryVoltage:480,secondaryVoltage:208});eq(r.result.primaryAmps,90.21,.02)});
[2,0,'foo',''].forEach(function(v){test('transformer invalid phase '+JSON.stringify(v)+' rejected',function(){throws(function(){C.transformerCurrent({kva:25,phase:v,primaryVoltage:240,secondaryVoltage:120})})})});

var pass=results.filter(function(x){return x.ok}).length,fail=results.length-pass;
window.BRUNO_TEST_RESULTS={total:results.length,pass:pass,fail:fail,results:results};
var host=document.getElementById('results');if(host){host.innerHTML='<h1>Electrical Calculator Tests</h1><p><b>'+pass+'/'+results.length+' passed</b></p>'+results.map(function(x){return '<div style="padding:6px;color:'+(x.ok?'#3dd68c':'#f07178')+'">'+(x.ok?'PASS':'FAIL')+' — '+x.name+(x.error?' — '+x.error:'')+'</div>').join('')}
if(fail)console.error('Bruno Electrical tests failed',results);else console.log('Bruno Electrical tests passed',results);
})();

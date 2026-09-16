'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
var T=global.BrunoElectricalTaskTakeoff;
function base(o){var x={loadAmps:'300',voltage:'480',phase:'3',distanceFt:'50',material:'Cu',installation:'EMT',conductorType:'THHN_THWN2',loadBasis:'NONCONTINUOUS',vdTargetPct:'3',ambientC:'30',ccc:'3',terminalRating:'75',parallelAllowed:false,maxConductorSize:'',racewayStrategy:'SEPARATE_SETS'};Object.keys(o||{}).forEach(function(k){x[k]=o[k]});return x}
function g(o){var x={ocpdAmps:'300',egcMaterial:'Cu',neutralMode:'NONE'};Object.keys(o||{}).forEach(function(k){x[k]=o[k]});return x}

test('short 300A feeder takeoff calculates phase EGC and raceway footage',function(){var r=T.calculate(base(),g());is(r.status,'PASS');is(r.rows.length,3);is(r.rows[0].role,'PHASE');is(r.rows[0].qty,150);is(r.rows[1].role,'EGC');is(r.rows[1].qty,50);is(r.rows[2].role,'RACEWAY');is(r.rows[2].qty,50)});
test('full size neutral adds explicit calculated neutral footage',function(){var r=T.calculate(base(),g({neutralMode:'FULL_SIZE'})),n=r.rows.filter(function(x){return x.role==='NEUTRAL'})[0];is(r.status,'PASS');ok(!!n,'neutral row missing');is(n.qty,50);is(n.basis,'CALCULATED')});
test('parallel 2-set takeoff multiplies conductor and raceway footage by sets',function(){var input=base({distanceFt:'1500',parallelAllowed:true,maxConductorSize:'500'}),stage4=global.BrunoGroundingEngine.calculate(input,g());is(stage4.status,'REVIEW REQUIRED');var r=T.calculate(input,g(),stage4);is(r.status,'REVIEW REQUIRED');is(r.rows.length,0);ok(r.warnings[0].indexOf('blocked')>=0)});
test('allowance and field verify rows have no invented numeric quantities',function(){var r=T.calculate(base(),g());ok(r.allowances.length>=5);r.allowances.forEach(function(x){is(x.qty,null);ok(x.basis==='ALLOWANCE'||x.basis==='FIELD_VERIFY')})});
test('takeoff never auto-adds waste to calculated conductor footage',function(){var r=T.calculate(base(),g());is(r.summary.phaseConductorFt,150);ok(r.allowances.some(function(x){return x.key==='CONDUCTOR_WASTE'}))});
test('calculated rows carry formula and semantic role',function(){var r=T.calculate(base(),g());r.rows.forEach(function(x){is(x.basis,'CALCULATED');ok(!!x.role);ok(!!x.formula)})});
global.BRUNO_TEST_RESULTS=out;
})();

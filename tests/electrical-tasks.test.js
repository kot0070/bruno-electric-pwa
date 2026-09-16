'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function throws(fn,m){var hit=false;try{fn()}catch(e){hit=true}ok(hit,m||'expected throw')}
var API=global.BrunoElectricalTasks;
function job(extra){var j={quote:{customer:'Test'},materialsUsed:[{item:'existing',qty:1,unitCost:5}],materialsUnresolved:[{item:'unknown'}],catalog:[]};Object.keys(extra||{}).forEach(function(k){j[k]=extra[k]});localStorage.setItem('bruno-electric-v1',JSON.stringify(j));return j}

test('Electrical Tasks requires a saved Job',function(){localStorage.clear();throws(function(){API.create('FEEDER_PANEL_RUN',{})});throws(function(){API.save({taskType:'FEEDER_PANEL_RUN'})})});
test('Feeder draft preserves blank and explicit zero as distinct raw values',function(){localStorage.clear();job();var a=API.create('FEEDER_PANEL_RUN',{inputs:{loadAmps:'',distanceFt:'0',vdTargetPct:'0'}});is(a.inputs.loadAmps,'');is(a.inputs.distanceFt,'0');is(a.inputs.vdTargetPct,'0')});
test('Save persists task inside active Job without touching Job Materials',function(){localStorage.clear();job({necEdition:'2026',jurisdiction:'Texas'});var before=JSON.parse(localStorage.getItem('bruno-electric-v1')),d=API.create('FEEDER_PANEL_RUN',{name:'300A feeder',inputs:{loadAmps:'300',distanceFt:'1500'}}),s=API.save(d),after=JSON.parse(localStorage.getItem('bruno-electric-v1'));is(after.electricalTasks.length,1);is(after.electricalTasks[0].id,s.id);is(after.electricalTaskActiveId,s.id);is(JSON.stringify(after.materialsUsed),JSON.stringify(before.materialsUsed));is(JSON.stringify(after.materialsUnresolved),JSON.stringify(before.materialsUnresolved));is(s.sourceEdition,'2026');is(s.jurisdiction,'Texas')});
test('Reload/list preserves saved task raw inputs',function(){var list=API.list();is(list.length,1);is(list[0].inputs.loadAmps,'300');is(list[0].inputs.distanceFt,'1500')});
test('Edit keeps id and createdAt but increments revision',function(){var a=API.list()[0],created=a.createdAt,id=a.id;a.name='edited';a.inputs.loadAmps='0';var b=API.save(a);is(b.id,id);is(b.createdAt,created);is(b.revision,2);is(b.inputs.loadAmps,'0')});
test('Duplicate creates new unsaved identity and copies raw inputs',function(){var a=API.list()[0],d=API.duplicate(a.id);ok(d.id!==a.id);is(d.inputs.loadAmps,a.inputs.loadAmps);ok(API.get(d.id)===null,'duplicate should remain unsaved until Save')});
test('Delete removes selected task and active id',function(){var id=API.list()[0].id;API.setActive(id);is(API.remove(id),1);is(API.list().length,0);is(JSON.parse(localStorage.getItem('bruno-electric-v1')).electricalTaskActiveId,null)});
test('Job A and Job B task stores stay isolated',function(){localStorage.clear();job({quote:{customer:'A'}});var a=API.save(API.create('FEEDER_PANEL_RUN',{name:'Job A',inputs:{loadAmps:'100'}}));var stateA=localStorage.getItem('bruno-electric-v1');job({quote:{customer:'B'}});is(API.list().length,0);var b=API.save(API.create('FEEDER_PANEL_RUN',{name:'Job B',inputs:{loadAmps:'200'}}));is(API.list()[0].name,'Job B');localStorage.setItem('bruno-electric-v1',stateA);is(API.list()[0].id,a.id);ok(API.list()[0].id!==b.id)});
test('Later templates fail closed while Stage 1 only enables Feeder Panel Run',function(){job();['BRANCH_CIRCUIT_RUN','LONG_DISTANCE_VD','RACEWAY_SIZING','EVSE_CIRCUIT','MOTOR_CIRCUIT'].forEach(function(t){throws(function(){API.create(t,{})},t+' should be locked')})});
test('Electrical Tasks uses only Job-owned fields and no device-global task registry',function(){ok(API._fields.tasks==='electricalTasks');ok(API._fields.activeId==='electricalTaskActiveId');ok(!localStorage.getItem('bruno-electrical-tasks-v1'),'unexpected global task registry')});
global.BRUNO_TEST_RESULTS=out;
})();

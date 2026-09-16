'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function throws(fn,m){var hit=false;try{fn()}catch(e){hit=true}ok(hit,m||'expected throw')}
var API=global.BrunoElectricalTasks,ARC=global.BrunoElectricalTaskArchive;
function put(j){localStorage.setItem('bruno-electric-v1',JSON.stringify(j));return j}
function read(){return JSON.parse(localStorage.getItem('bruno-electric-v1'))}

test('Stage 10 malformed Job JSON fails closed without rewriting storage',function(){localStorage.clear();localStorage.setItem('bruno-electric-v1','{broken');var before=localStorage.getItem('bruno-electric-v1');is(API.list().length,0);throws(function(){API.create('FEEDER_PANEL_RUN',{})});is(localStorage.getItem('bruno-electric-v1'),before)});

test('Stage 10 non-array electricalTasks legacy field is treated as empty and preserved until explicit save',function(){localStorage.clear();put({quote:{customer:'Legacy'},electricalTasks:{bad:true},futureSchema:{keep:1}});is(API.list().length,0);var d=API.create('FEEDER_PANEL_RUN',{inputs:{loadAmps:'20'}});API.save(d);var j=read();ok(Array.isArray(j.electricalTasks));is(j.futureSchema.keep,1);is(j.quote.customer,'Legacy')});

test('Stage 10 stale active task id does not fabricate a task or mutate Job',function(){localStorage.clear();put({quote:{customer:'A'},electricalTasks:[],electricalTaskActiveId:'missing',customUnknown:{x:7}});var before=localStorage.getItem('bruno-electric-v1');is(API.active(),null);is(localStorage.getItem('bruno-electric-v1'),before)});

test('Stage 10 task Save preserves unrelated Job Quote Invoice Catalog and unknown schema fields',function(){localStorage.clear();put({quote:{customer:'Protected',status:'APPROVED'},invoice:{number:'INV-1',total:123},catalog:[{id:'c1',item:'Wire',yourCost:2}],customUnknown:{nested:{keep:true}},materialsUsed:[{item:'manual',qty:1,unitCost:5}]});var before=read(),d=API.create('BRANCH_CIRCUIT_RUN',{inputs:{loadAmps:'20',voltage:'120'}});API.save(d);var after=read();is(JSON.stringify(after.quote),JSON.stringify(before.quote));is(JSON.stringify(after.invoice),JSON.stringify(before.invoice));is(JSON.stringify(after.catalog),JSON.stringify(before.catalog));is(JSON.stringify(after.customUnknown),JSON.stringify(before.customUnknown));is(JSON.stringify(after.materialsUsed),JSON.stringify(before.materialsUsed))});

test('Stage 10 remove affects only selected task and active pointer',function(){localStorage.clear();put({quote:{customer:'Protected'},futureSchema:'keep'});var a=API.save(API.create('FEEDER_PANEL_RUN',{name:'A'})),b=API.save(API.create('FEEDER_PANEL_RUN',{name:'B'}));API.setActive(a.id);is(API.remove(a.id),1);var j=read();is(j.electricalTasks.length,1);is(j.electricalTasks[0].id,b.id);is(j.electricalTaskActiveId,null);is(j.futureSchema,'keep');is(j.quote.customer,'Protected')});

test('Stage 10 Job A B isolation survives full storage swap with same task API instance',function(){localStorage.clear();put({quote:{customer:'A'},jobMarker:'A'});var a=API.save(API.create('FEEDER_PANEL_RUN',{name:'Task A'}));var stateA=localStorage.getItem('bruno-electric-v1');put({quote:{customer:'B'},jobMarker:'B'});var b=API.save(API.create('FEEDER_PANEL_RUN',{name:'Task B'}));is(API.list()[0].id,b.id);localStorage.setItem('bruno-electric-v1',stateA);is(API.list()[0].id,a.id);is(read().jobMarker,'A')});

test('Stage 10 archive list tolerates malformed application ledger without destructive migration',function(){localStorage.clear();put({quote:{customer:'A'},electricalTaskMaterialApplications:{bad:true}});var s=API.save(API.create('FEEDER_PANEL_RUN',{name:'Saved'}));var before=localStorage.getItem('bruno-electric-v1'),list=ARC.list();is(list.length,1);is(list[0].id,s.id);is(list[0].archiveStatus,'SAVED');is(localStorage.getItem('bruno-electric-v1'),before)});

test('Stage 10 unsupported partial saved task fails closed on recalculation and leaves Job byte-identical',function(){localStorage.clear();put({quote:{customer:'A'},electricalTasks:[{id:'bad1',taskType:'GENERIC_CUSTOM',name:'legacy partial',revision:1,inputs:{}}],electricalTaskActiveId:'bad1'});var before=localStorage.getItem('bruno-electric-v1');throws(function(){ARC.recalculate('bad1')});is(localStorage.getItem('bruno-electric-v1'),before)});

global.BRUNO_TEST_RESULTS=out;
})();

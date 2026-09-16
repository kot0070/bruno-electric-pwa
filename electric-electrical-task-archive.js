/* Bruno Electric — Electrical Tasks Stage 6 saved-task archive + explicit Job update workflow. */
(function(root){
'use strict';
var API=root.BrunoElectricalTasks,T=root.BrunoElectricalTaskMaterialTakeoff,G=root.BrunoGroundingEngine;
if(!API||!T||!G)throw new Error('Electrical Tasks, Stage 5 takeoff and grounding runtimes must load before Task Archive');
var VERSION='electrical-task-archive-v2',JOB_KEY='bruno-electric-v1';
function clone(x){return x==null?x:JSON.parse(JSON.stringify(x))}
function parse(raw){try{var x=JSON.parse(raw||'null');return x&&typeof x==='object'&&!Array.isArray(x)?x:null}catch(e){return null}}
function readJob(){return parse(root.localStorage&&root.localStorage.getItem(JOB_KEY))}
function writeJob(j){if(!j||typeof j!=='object'||Array.isArray(j))throw new Error('A saved Bruno Electric Job is required');root.localStorage.setItem(JOB_KEY,JSON.stringify(j));return j}
function applications(j,id){return (Array.isArray(j&&j.electricalTaskMaterialApplications)?j.electricalTaskMaterialApplications:[]).filter(function(x){return x&&String(x.sourceTaskId)===String(id)})}
function latestApplication(j,id){var a=applications(j,id);return a.length?a[a.length-1]:null}
function status(task,j){j=j||readJob();if(!task||!task.id)return'UNSAVED';var a=latestApplication(j,task.id);if(!a)return'SAVED';return Number(a.sourceTaskRevision)===Number(task.revision)?'APPLIED_TO_JOB':'CHANGED_SINCE_APPLY'}
function list(){var j=readJob();return API.list().map(function(t){var x=clone(t);x.archiveStatus=status(t,j);return x})}
function load(id){API.setActive(id);var t=API.get(id);if(!t)throw new Error('Electrical Task not found in active Job');return clone(t)}
function rename(id,name){var t=API.get(id);if(!t)throw new Error('Electrical Task not found in active Job');var n=String(name==null?'':name).trim();if(!n)throw new Error('Task name is required');t.name=n;return API.save(t)}
function duplicate(id){return API.duplicate(id)}
function remove(id){return API.remove(id)}
function groundingFromInputs(x){x=x||{};return{ocpdAmps:x.ocpdAmps,neutralMode:x.neutralMode,egcMaterial:x.egcMaterial}}
function calculateTask(t){if(t.taskType==='FEEDER_PANEL_RUN')return G.calculate(t.inputs||{},groundingFromInputs(t.inputs));if(t.taskType==='BRANCH_CIRCUIT_RUN'&&root.BrunoElectricalTaskAdvanced)return root.BrunoElectricalTaskAdvanced.calculate(t.taskType,t.inputs||{},groundingFromInputs(t.inputs));throw new Error('Recalculate is not supported for this task type yet')}
function recalculate(id){var t=API.get(id);if(!t)throw new Error('Electrical Task not found in active Job');var g=calculateTask(t);t.status=g.status;t.result=clone(g.result);t.candidates=clone(g.candidates||[]);t.calculationSteps=clone(g.calculationSteps||[]);t.warnings=clone(g.warnings||[]);t.unresolved=clone(g.unresolved||[]);t.engineVersion=g.taskTemplateEngineVersion||g.engineVersion||t.engineVersion;return API.save(t)}
function activeRows(j,id){var u=Array.isArray(j&&j.materialsUsed)?j.materialsUsed:[],r=Array.isArray(j&&j.materialsUnresolved)?j.materialsUnresolved:[];return{used:u.filter(function(x){return x&&String(x.sourceTaskId)===String(id)&&x.materialType==='ELECTRICAL_TASK_TAKEOFF'}),unresolved:r.filter(function(x){return x&&String(x.sourceTaskId)===String(id)&&x.materialType==='ELECTRICAL_TASK_TAKEOFF'})}}
function apply(plan){return T.apply(plan)}
function update(plan){if(!plan||!plan.sourceTask||!plan.sourceTask.id)throw new Error('A saved task material plan is required');var j=readJob();if(!j)throw new Error('No saved Bruno Electric Job found');var id=plan.sourceTask.id,rows=activeRows(j,id),hasOld=rows.used.length||rows.unresolved.length;if(!hasOld)return T.apply(plan);var original=clone(j),stamp=new Date().toISOString();j.electricalTaskMaterialHistory=Array.isArray(j.electricalTaskMaterialHistory)?j.electricalTaskMaterialHistory:[];j.electricalTaskMaterialHistory.push({sourceTaskId:id,replacedAt:stamp,replacedByRevision:plan.sourceTask.revision,materialsUsed:clone(rows.used),materialsUnresolved:clone(rows.unresolved)});j.materialsUsed=(Array.isArray(j.materialsUsed)?j.materialsUsed:[]).filter(function(x){return !(x&&String(x.sourceTaskId)===String(id)&&x.materialType==='ELECTRICAL_TASK_TAKEOFF')});j.materialsUnresolved=(Array.isArray(j.materialsUnresolved)?j.materialsUnresolved:[]).filter(function(x){return !(x&&String(x.sourceTaskId)===String(id)&&x.materialType==='ELECTRICAL_TASK_TAKEOFF')});writeJob(j);try{var r=T.apply(plan);r.updated=true;r.archived={used:rows.used.length,unresolved:rows.unresolved.length};return r}catch(e){writeJob(original);throw e}}
root.BrunoElectricalTaskArchive=Object.freeze({list:list,load:load,rename:rename,duplicate:duplicate,remove:remove,recalculate:recalculate,status:status,apply:apply,update:update,version:VERSION,_test:{applications:applications,latestApplication:latestApplication,groundingFromInputs:groundingFromInputs,activeRows:activeRows,calculateTask:calculateTask}});
})(typeof window!=='undefined'?window:globalThis);

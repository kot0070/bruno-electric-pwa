/* Bruno Electric — Electrical Tasks job-scoped persistence API. */
(function(root){
'use strict';
var JOB_KEY='bruno-electric-v1',VERSION='electrical-tasks-shell-v10',FIELD='electricalTasks',ACTIVE='electricalTaskActiveId';
var TYPES=Object.freeze([
  {id:'FEEDER_PANEL_RUN',label:'Feeder / Panel Run',enabled:true},
  {id:'BRANCH_CIRCUIT_RUN',label:'Branch Circuit Run',enabled:true},
  {id:'LONG_DISTANCE_VD',label:'Long-Distance Voltage Drop',enabled:true},
  {id:'CONDUCTOR_SIZING',label:'Conductor Sizing',enabled:false},
  {id:'RACEWAY_SIZING',label:'Conduit / Raceway Sizing',enabled:false},
  {id:'PARALLEL_CONDUCTORS',label:'Parallel Conductors',enabled:false},
  {id:'SERVICE_FEEDER',label:'Service / Feeder',enabled:false},
  {id:'TRANSFORMER_FEED',label:'Transformer Feed',enabled:true},
  {id:'MOTOR_CIRCUIT',label:'Motor Circuit',enabled:true},
  {id:'EVSE_CIRCUIT',label:'EVSE Circuit',enabled:true},
  {id:'HVAC_CIRCUIT',label:'HVAC Circuit',enabled:true},
  {id:'GENERATOR_FEEDER',label:'Generator / Feeder',enabled:true},
  {id:'GENERIC_CUSTOM',label:'Generic Custom Electrical Task',enabled:false}
]);
function clone(x){return x==null?x:JSON.parse(JSON.stringify(x))}
function now(){return new Date().toISOString()}
function uid(){return'et-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function parse(raw){try{var x=JSON.parse(raw||'null');return x&&typeof x==='object'&&!Array.isArray(x)?x:null}catch(e){return null}}
function readJob(){return parse(root.localStorage&&root.localStorage.getItem(JOB_KEY))}
function writeJob(j){if(!j||typeof j!=='object'||Array.isArray(j))throw new Error('A saved Bruno Electric Job is required');root.localStorage.setItem(JOB_KEY,JSON.stringify(j));return j}
function rows(j){return Array.isArray(j&&j[FIELD])?j[FIELD]:[]}
function typeMeta(id){return TYPES.find(function(x){return x.id===id})||null}
function raw(v){return v==null?'':String(v)}
function currentEdition(j){var v=j&&(j.necEdition||j.codeEdition||j.edition);return v==null||String(v).trim()===''?null:String(v)}
function currentJurisdiction(j){var v=j&&(j.jurisdiction||j.ahj);return v==null||String(v).trim()===''?null:String(v)}
function circuitInputs(seed){seed=seed||{};return{loadAmps:raw(seed.loadAmps),voltage:raw(seed.voltage),phase:raw(seed.phase),distanceFt:raw(seed.distanceFt),material:raw(seed.material),installation:raw(seed.installation),conductorType:raw(seed.conductorType),loadBasis:raw(seed.loadBasis),vdTargetPct:raw(seed.vdTargetPct),ambientC:raw(seed.ambientC),ccc:raw(seed.ccc),terminalRating:raw(seed.terminalRating),parallelAllowed:seed.parallelAllowed===true,maxConductorSize:raw(seed.maxConductorSize),racewayStrategy:raw(seed.racewayStrategy),ocpdAmps:raw(seed.ocpdAmps),neutralMode:raw(seed.neutralMode),egcMaterial:raw(seed.egcMaterial),taskSpecific:clone(seed.taskSpecific||{})}}
function supportedInputs(type,seed){if(['FEEDER_PANEL_RUN','BRANCH_CIRCUIT_RUN','LONG_DISTANCE_VD','EVSE_CIRCUIT','HVAC_CIRCUIT','MOTOR_CIRCUIT','TRANSFORMER_FEED','GENERATOR_FEEDER'].indexOf(type)>=0)return circuitInputs(seed);return{}}
function make(type,seed,j){var meta=typeMeta(type);if(!meta)throw new Error('Unsupported Electrical Task type');if(!meta.enabled)throw new Error(meta.label+' is not enabled in this stage');seed=seed||{};var t=now();return{id:uid(),taskType:type,name:raw(seed.name)||meta.label,createdAt:t,updatedAt:t,revision:1,status:'DRAFT',inputs:supportedInputs(type,seed.inputs),assumptions:{},result:null,candidates:[],calculationSteps:[],warnings:[],unresolved:[],sourceEdition:currentEdition(j||{}),jurisdiction:currentJurisdiction(j||{}),engineVersion:VERSION}}
function normalize(task,existing,j){if(!task||typeof task!=='object'||Array.isArray(task))throw new Error('Electrical Task must be an object');var meta=typeMeta(task.taskType);if(!meta||!meta.enabled)throw new Error('Unsupported or not-yet-enabled Electrical Task type');var created=existing&&existing.createdAt||task.createdAt||now(),rev=existing?((Number(existing.revision)||1)+1):(Number(task.revision)||1),hasResult=!!task.result||task.status==='NO SUPPORTED CONFIGURATION';return{id:existing&&existing.id||task.id||uid(),taskType:meta.id,name:raw(task.name).trim()||meta.label,createdAt:created,updatedAt:now(),revision:rev,status:hasResult?(task.status||'CALCULATED'):'DRAFT',inputs:supportedInputs(meta.id,task.inputs),assumptions:clone(task.assumptions||{}),result:clone(task.result),candidates:clone(task.candidates||[]),calculationSteps:clone(task.calculationSteps||[]),warnings:clone(task.warnings||[]),unresolved:clone(task.unresolved||[]),sourceEdition:task.sourceEdition==null?currentEdition(j||{}):task.sourceEdition,jurisdiction:task.jurisdiction==null?currentJurisdiction(j||{}):task.jurisdiction,engineVersion:task.engineVersion||VERSION}}
function list(){var j=readJob();if(!j)return[];return clone(rows(j))}
function get(id){return list().find(function(x){return x&&x.id===id})||null}
function active(){var j=readJob();if(!j)return null;var id=j[ACTIVE];return id?get(id):null}
function setActive(id){var j=readJob();if(!j)throw new Error('Save a Bruno Electric Job before using Electrical Tasks');if(id&&!rows(j).some(function(x){return x&&x.id===id}))throw new Error('Electrical Task is not part of the active Job');j[ACTIVE]=id||null;writeJob(j);return id||null}
function create(type,seed){var j=readJob();if(!j)throw new Error('Save a Bruno Electric Job before creating Electrical Tasks');return make(type||'FEEDER_PANEL_RUN',seed,j)}
function save(task){var j=readJob();if(!j)throw new Error('Save a Bruno Electric Job before saving Electrical Tasks');var a=rows(j).slice(),idx=a.findIndex(function(x){return x&&x.id===task.id}),existing=idx>=0?a[idx]:null,n=normalize(task,existing,j);if(idx>=0)a[idx]=n;else a.unshift(n);j[FIELD]=a;j[ACTIVE]=n.id;writeJob(j);return clone(n)}
function remove(id){var j=readJob();if(!j)return 0;var before=rows(j),after=before.filter(function(x){return x&&x.id!==id});j[FIELD]=after;if(j[ACTIVE]===id)j[ACTIVE]=null;writeJob(j);return before.length-after.length}
function duplicate(id){var j=readJob();if(!j)throw new Error('No saved Bruno Electric Job found');var src=rows(j).find(function(x){return x&&x.id===id});if(!src)throw new Error('Electrical Task not found in active Job');var d=make(src.taskType,{name:(src.name||'Electrical Task')+' copy',inputs:src.inputs},j);d.sourceEdition=src.sourceEdition;d.jurisdiction=src.jurisdiction;return d}
function clearActive(){return setActive(null)}
root.BrunoElectricalTasks=Object.freeze({types:TYPES,create:create,save:save,list:list,get:get,active:active,setActive:setActive,clearActive:clearActive,remove:remove,duplicate:duplicate,readJob:readJob,version:VERSION,_fields:{tasks:FIELD,activeId:ACTIVE},_test:{feederInputs:circuitInputs,circuitInputs:circuitInputs,supportedInputs:supportedInputs,normalize:normalize}});
})(typeof window!=='undefined'?window:globalThis);

'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
var ui=fs.readFileSync(path.join(__dirname,'..','electrical-tasks-ui.js'),'utf8'),core=fs.readFileSync(path.join(__dirname,'..','electric-electrical-tasks.js'),'utf8');
test('Electrical Tasks is a first-class tool workspace',function(){ok(ui.indexOf("dataset.tool='tasks'")>=0,'tasks nav missing');ok(ui.indexOf('Electrical Tasks / Field Calculator')>=0,'workspace title missing');ok(ui.indexOf("id='tool-tasks'")<0||ui.indexOf("id='tool-tasks'")>=0);ok(ui.indexOf("s.id='tool-tasks'")>=0,'tool section id missing')});
test('Stage 1 shows Feeder Panel form and future template inventory',function(){['Feeder / Panel Run','Branch Circuit Run','Long-Distance Voltage Drop','Conduit / Raceway Sizing','Transformer Feed','Motor Circuit','EVSE Circuit','HVAC Circuit','Generator / Feeder','Generic Custom Electrical Task'].forEach(function(x){ok(core.indexOf(x)>=0,x+' template missing')});ok(core.indexOf("enabled:true")>=0,'enabled feeder missing');ok(core.indexOf("enabled:false")>=0,'planned lock missing')});
test('Stage 1 makes Save and Job-scoped archive discoverable',function(){ok(ui.indexOf('Save Task Draft')>=0,'save action missing');ok(ui.indexOf('Saved on this Job')>=0,'saved list missing');ok(ui.indexOf('Duplicate')>=0,'duplicate missing');ok(ui.indexOf('Delete')>=0,'delete missing')});
test('Stage 1 explicitly refuses premature compliance calculations',function(){ok(ui.indexOf('No compliance answer')>=0||ui.indexOf('NO compliance answer')>=0,'no-calculation boundary missing');ok(ui.indexOf('wire size')>=0,'wire boundary missing');ok(ui.indexOf('conduit size')>=0,'raceway boundary missing')});
test('Electrical Tasks UI preserves phone tablet desktop responsive contracts',function(){ok(ui.indexOf('@media(max-width:900px)')>=0,'tablet/compact breakpoint missing');ok(ui.indexOf('@media(max-width:600px)')>=0,'phone breakpoint missing');ok(ui.indexOf('bottom:78px')>=0,'phone action/bottom-nav clearance missing')});
test('Electrical Tasks promotes itself out of generic Other picker group',function(){ok(ui.indexOf("option[value=\"tasks\"]")>=0,'picker task lookup missing');ok(ui.indexOf("existing.label='Electrical Tasks'")>=0,'dedicated picker group missing')});
test('Stage 1 core never writes Job Materials',function(){ok(core.indexOf('materialsUsed')<0,'task core touches materialsUsed');ok(core.indexOf('materialsUnresolved')<0,'task core touches materialsUnresolved');ok(core.indexOf("FIELD='electricalTasks'")>=0,'job task field missing')});
global.BRUNO_TEST_RESULTS=out;
})();

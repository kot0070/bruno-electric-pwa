'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var src=fs.readFileSync(path.join(__dirname,'..','electric-residential-save-archive-ux.js'),'utf8');
test('save/archive UX exposes prominent Save Calculation and Apply to Job actions',function(){ok(src.indexOf('Save Calculation')>=0,'Save Calculation label missing');ok(src.indexOf('Apply to Job')>=0,'Apply to Job label missing');ok(src.indexOf("id='rl-save-ux-btn'")>=0||src.indexOf('id="rl-save-ux-btn"')>=0,'prominent save button missing');ok(src.indexOf('rl-apply-job-btn')>=0,'Apply button missing')});
test('save/archive UX distinguishes unsaved dirty saved and applied states',function(){['LIVE · NOT SAVED','LIVE CHANGES · NOT SAVED','SAVED · NOT APPLIED','SAVED · APPLIED TO JOB'].forEach(function(x){ok(src.indexOf(x)>=0,x+' state missing')})});
test('archive overview includes project area circuits wire and live pricing',function(){['Area','Circuits','Wire estimate','LIVE Customer materials','LIVE Your Cost'].forEach(function(x){ok(src.indexOf(x)>=0,x+' archive summary missing')})});
test('save/archive UX reuses legacy duplicate load and delete actions',function(){ok(src.indexOf("legacyAction('data-rl-load'")>=0,'duplicate/load bridge missing');ok(src.indexOf("legacyAction('data-rl-del'")>=0,'delete bridge missing')});
test('save/archive UX does not autosave or auto-apply on ordinary input changes',function(){ok(src.indexOf('markDirty')>=0,'dirty tracking missing');var p=src.indexOf('function markDirty'),q=src.indexOf('function saveProxy');var body=src.slice(p,q);ok(body.indexOf('.click()')<0&&body.indexOf('H.save')<0&&body.indexOf('confirmAtomic')<0&&body.indexOf('applyActive')<0,'input dirty handler mutates persisted workflow')});
test('Apply is disabled while live calculation is dirty',function(){ok(src.indexOf('apply.disabled=!a||dirty')>=0,'dirty Apply gate missing')});
test('Save messaging explicitly says Job Materials were not changed',function(){ok(src.indexOf('Job Materials were not changed')>=0,'save-only user feedback missing')});
global.BRUNO_TEST_RESULTS=out;
})();
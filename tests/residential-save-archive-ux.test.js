'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var src=fs.readFileSync(path.join(__dirname,'..','electric-residential-save-archive-ux.js'),'utf8');
test('save/archive UX exposes prominent Save Calculation action',function(){ok(src.indexOf('Save Calculation')>=0,'Save Calculation label missing');ok(src.indexOf("id='rl-save-ux-btn'")>=0||src.indexOf('id="rl-save-ux-btn"')>=0,'prominent save button missing')});
test('save/archive UX distinguishes unsaved dirty and saved states',function(){['LIVE · NOT SAVED','LIVE CHANGES · NOT SAVED','SAVED CALCULATION'].forEach(function(x){ok(src.indexOf(x)>=0,x+' state missing')})});
test('archive overview includes project area circuits wire and live pricing',function(){['Area','Circuits','Wire estimate','LIVE Customer materials','LIVE Your Cost'].forEach(function(x){ok(src.indexOf(x)>=0,x+' archive summary missing')})});
test('save/archive UX reuses legacy duplicate load and delete actions',function(){ok(src.indexOf("legacyAction('data-rl-load'")>=0,'duplicate/load bridge missing');ok(src.indexOf("legacyAction('data-rl-del'")>=0,'delete bridge missing')});
test('save/archive UX does not autosave on ordinary input changes',function(){ok(src.indexOf('markDirty')>=0,'dirty tracking missing');var p=src.indexOf('function markDirty'),q=src.indexOf('function saveProxy');var body=src.slice(p,q);ok(body.indexOf('.click()')<0&&body.indexOf('H.save')<0&&body.indexOf('confirmAtomic')<0,'input dirty handler performs save')});
global.BRUNO_TEST_RESULTS=out;
})();
'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var src=fs.readFileSync(path.join(__dirname,'..','electric-dispatch-journal-v2.js'),'utf8');
var nav=fs.readFileSync(path.join(__dirname,'..','electric-app-navigation.js'),'utf8');
var reg=fs.readFileSync(path.join(__dirname,'..','sw-register.js'),'utf8');
var mode=fs.readFileSync(path.join(__dirname,'..','electric-project-mode.js'),'utf8');
test('dispatch journal is canonical home and supports archive period modes',function(){ok(nav.indexOf("label:'Journal'")>=0,'Journal primary nav missing');ok(nav.indexOf("defaultTab:'dispatch'")>=0,'dispatch not home default');['day','week','month','quarter'].forEach(function(x){ok(src.indexOf("value=\""+x+"\"")>=0,x+' view missing')})});
test('dispatch journal includes calls helpers and persistent tax settings',function(){['bruno-electric-dispatch-journal-v2','bruno-electric-dispatch-settings-v2','Add call','Helpers','Tax & journal settings','Dripping Springs, TX'].forEach(function(x){ok(src.indexOf(x)>=0,x+' missing')});ok(src.indexOf('businessNet:net-helperGross')>=0,'helper cost not deducted from net')});
test('project calculator exposes residential and commercial modes',function(){ok(mode.indexOf('Residential / dwelling')>=0,'residential mode missing');ok(mode.indexOf('Commercial')>=0,'commercial mode missing');ok(mode.indexOf("['res','res-live','res-takeoff']")>=0,'residential isolation list missing');ok(reg.indexOf('electric-project-mode.js')>=0,'project mode loader missing')});
global.BRUNO_TEST_RESULTS=out;
})();
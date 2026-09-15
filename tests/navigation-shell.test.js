'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var workspace=fs.readFileSync(path.join(__dirname,'..','electric-workspace.js'),'utf8');
var bridge=fs.readFileSync(path.join(__dirname,'..','electric-navigation-bridge.js'),'utf8');
var shell=fs.readFileSync(path.join(__dirname,'..','electrical-tools-shell.js'),'utf8');
var appNav=fs.readFileSync(path.join(__dirname,'..','electric-app-navigation.js'),'utf8');
var register=fs.readFileSync(path.join(__dirname,'..','sw-register.js'),'utf8');
var html=fs.readFileSync(path.join(__dirname,'..','electrical-tools.html'),'utf8');

test('Electrical section is a first-class page without iframe path',function(){ok(workspace.indexOf("location.href='./electrical-tools.html'")>=0,'standalone Electrical route missing');ok(workspace.indexOf('<iframe')<0,'iframe route returned');ok(register.indexOf('n.onload=loadWorkspaceEnhancement')>=0,'shared navigation is not loaded before workspace')});
test('shared IA is the single five-section source for all shells',function(){['Job','Estimate','Electrical','Billing','More'].forEach(function(label){ok(appNav.indexOf("label:'"+label+"'")>=0,label+' missing')});ok(workspace.indexOf('var groups=NAV.groups')>=0,'workspace does not consume canonical IA');ok(shell.indexOf('groups=NAV&&NAV.groups')>=0,'Electrical shell does not consume canonical IA');['JOB','ESTIMATE','ELECTRICAL','BILLING','MORE'].forEach(function(key){ok(workspace.indexOf("key:'"+key+"'")<0,'workspace duplicates canonical '+key+' definition')});ok(workspace.indexOf('||[')<0,'workspace contains fallback IA array');ok(workspace.indexOf("if(!NAV||!Array.isArray(NAV.groups)")>=0,'workspace does not fail open to legacy UI when canonical model is unavailable')});
test('phone tablet desktop presentation is responsive not separate IA',function(){['@media (max-width:767.98px)','@media (min-width:768px) and (max-width:1199.98px)','@media (min-width:1200px)'].forEach(function(rule){ok(workspace.indexOf(rule)>=0,'workspace breakpoint missing '+rule)});['@media(max-width:767.98px)','@media(min-width:768px) and (max-width:1199.98px)','@media(min-width:1200px)'].forEach(function(rule){ok(shell.indexOf(rule)>=0,'tools breakpoint missing '+rule)});ok(workspace.indexOf('padding-left:92px')>=0&&shell.indexOf('padding-left:92px')>=0,'tablet rail not consistent');ok(workspace.indexOf('padding-left:244px')>=0&&shell.indexOf('padding-left:244px')>=0,'desktop sidebar not consistent')});
test('cross-page bridge restores section and exact tab',function(){ok(bridge.indexOf('URLSearchParams')>=0,'canonical hash parser missing');ok(bridge.indexOf("p.get('tab')")>=0,'tab restore missing');ok(bridge.indexOf('.be-primary-btn[data-group=')>=0,'section restore target missing')});
test('Electrical standalone page loads shared navigation and makes no ineffective frame-ancestors meta claim',function(){ok(html.indexOf('./electric-app-navigation.js')>=0,'shared navigation script missing');ok(html.indexOf('frame-ancestors')<0,'frame-ancestors meta claim remains')});
global.BRUNO_TEST_RESULTS=out;
})();
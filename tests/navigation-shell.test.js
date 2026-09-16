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
test('Calculator remains a first-class standalone page without iframe',function(){ok(workspace.indexOf("location.href='./electrical-tools.html'")>=0,'standalone Calculator route missing');ok(workspace.indexOf('<iframe')<0,'iframe route returned');ok(register.indexOf('n.onload=loadWorkspaceEnhancement')>=0,'shared navigation not loaded before workspace')});
test('shared IA is the single five-section source for all shells',function(){['Journal','Calculator','Job','Catalog','More'].forEach(function(label){ok(appNav.indexOf("label:'"+label+"'")>=0,label+' missing')});ok(workspace.indexOf('var groups=NAV.groups')>=0,'workspace does not consume canonical IA');ok(shell.indexOf('groups=NAV&&NAV.groups')>=0,'tools shell does not consume canonical IA');['JOB','ESTIMATE','ELECTRICAL','BILLING','MORE'].forEach(function(key){ok(workspace.indexOf("key:'"+key+"'")<0,'workspace duplicates canonical '+key)});ok(workspace.indexOf('||[')<0,'workspace contains fallback IA array')});
test('phone tablet desktop presentation is responsive not separate IA',function(){['@media (max-width:767.98px)','@media (min-width:768px) and (max-width:1199.98px)','@media (min-width:1200px)'].forEach(function(rule){ok(workspace.indexOf(rule)>=0,'workspace breakpoint missing '+rule)});['@media(max-width:767.98px)','@media(min-width:768px) and (max-width:1199.98px)','@media(min-width:1200px)'].forEach(function(rule){ok(shell.indexOf(rule)>=0,'tools breakpoint missing '+rule)})});
test('cross-page bridge restores section and exact tab',function(){ok(bridge.indexOf('URLSearchParams')>=0,'canonical hash parser missing');ok(bridge.indexOf("p.get('tab')")>=0,'tab restore missing');ok(bridge.indexOf('.be-primary-btn[data-group=')>=0,'section restore target missing')});
test('Electrical Tools loads project-first calculator and no obsolete project selector',function(){ok(html.indexOf('./electrical-project-calculator-ui.js')>=0,'project calculator script missing');ok(register.indexOf('electric-project-mode.js')<0,'obsolete global mode selector still injected');ok(html.indexOf('frame-ancestors')<0,'ineffective frame-ancestors meta remains')});
global.BRUNO_TEST_RESULTS=out;
})();
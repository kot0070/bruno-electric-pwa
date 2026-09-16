'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var navSource=fs.readFileSync(path.join(__dirname,'..','electric-app-navigation.js'),'utf8');
var bridge=fs.readFileSync(path.join(__dirname,'..','electric-navigation-bridge.js'),'utf8');
function loadNav(hash){var sandbox={URLSearchParams:URLSearchParams,window:{location:{hash:hash||''}}};vm.runInNewContext(navSource,sandbox,{filename:'electric-app-navigation.js'});return sandbox.window.BrunoElectricAppNavigation}
test('Calculator to Job canonical href includes explicit quote tab',function(){var n=loadNav();is(n.workspaceHref('BILLING'),'./index.html#be=BILLING&tab=quote')});
test('canonical href includes default tab for Journal Catalog and More',function(){var n=loadNav();is(n.workspaceHref('JOB'),'./index.html#be=JOB&tab=dispatch');is(n.workspaceHref('ESTIMATE'),'./index.html#be=ESTIMATE&tab=catalog');is(n.workspaceHref('MORE'),'./index.html#be=MORE&tab=labor')});
test('explicit workspace tab survives canonical href generation',function(){var n=loadNav();is(n.workspaceHref('BILLING','tm'),'./index.html#be=BILLING&tab=tm');is(n.workspaceHref('ESTIMATE','materials'),'./index.html#be=ESTIMATE&tab=materials')});
test('workspace hash parser resolves missing and invalid tabs to group default',function(){var n=loadNav();var a=n.parseWorkspaceHash('#be=BILLING'),b=n.parseWorkspaceHash('#be=BILLING&tab=bogus'),c=n.parseWorkspaceHash('#be=ESTIMATE&tab=materials');is(a.key,'BILLING');is(a.tab,'quote');is(b.tab,'quote');is(c.tab,'materials')});
test('workspace hash parser rejects unknown groups',function(){var n=loadNav();is(n.parseWorkspaceHash('#be=UNKNOWN&tab=quote'),null)});
test('navigation bridge preserves URL hash and supports hashchange restore',function(){ok(bridge.indexOf('history.replaceState')<0,'bridge still clears deep-link hash');ok(bridge.indexOf("addEventListener('hashchange'")>=0,'hashchange restore missing');ok(bridge.indexOf('restoreSection()')>=0,'immediate restore missing')});
global.BRUNO_TEST_RESULTS=out;
})();
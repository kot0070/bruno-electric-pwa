'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
if(typeof require==='function'){
 var fs=require('fs'),path=require('path');
 var html=fs.readFileSync(path.join(__dirname,'..','electrical-tools.html'),'utf8');
 var shell=fs.readFileSync(path.join(__dirname,'..','electrical-tools-shell.js'),'utf8');
 var stage8=fs.readFileSync(path.join(__dirname,'..','electrical-tasks-stage8-ui.js'),'utf8');
 var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
 test('Stage 11 viewport explicitly supports safe-area-aware mobile layout',function(){ok(html.indexOf('viewport-fit=cover')>=0,'viewport-fit cover missing');ok(shell.indexOf('env(safe-area-inset-bottom')>=0,'bottom safe area missing');ok(shell.indexOf('env(safe-area-inset-left')>=0,'left safe area missing');ok(shell.indexOf('env(safe-area-inset-right')>=0,'right safe area missing')});
 test('Stage 11 canonical phone tablet desktop breakpoints remain present',function(){ok(shell.indexOf('@media(max-width:767.98px)')>=0,'phone breakpoint missing');ok(shell.indexOf('@media(min-width:768px) and (max-width:1199.98px)')>=0,'tablet breakpoint missing');ok(shell.indexOf('@media(min-width:1200px)')>=0,'desktop breakpoint missing')});
 test('Stage 11 phone bottom navigation remains fixed five-column canonical model',function(){ok(shell.indexOf('grid-template-columns:repeat(5,1fr)')>=0,'five-column mobile nav missing');ok(shell.indexOf('position:fixed;left:0;right:0;bottom:0')>=0,'fixed bottom nav missing');ok(shell.indexOf("nav.setAttribute('aria-label','Primary mobile navigation')")>=0,'mobile nav accessibility label missing')});
 test('Stage 11 Electrical Tools clamps document and cards against critical horizontal overflow',function(){ok(html.indexOf('html,body{max-width:100%;overflow-x:hidden}')>=0,'document overflow guard missing');ok(html.indexOf('.grid>*,.card{min-width:0}')>=0,'grid/card shrink guard missing');ok(html.indexOf('overflow-wrap:anywhere')>=0,'long-token wrapping missing')});
 test('Stage 11 result tables are fixed-layout and wrap long formula content',function(){ok(html.indexOf('.steps{width:100%;border-collapse:collapse;table-layout:fixed}')>=0,'fixed result table layout missing');ok(html.indexOf('word-break:break-word')>=0,'result table long-token break missing')});
 test('Stage 11 long solver forms collapse to one column and full-width actions on phone',function(){ok(stage8.indexOf('@media(max-width:650px)')>=0,'solver phone breakpoint missing');ok(stage8.indexOf('.et-solver-grid{grid-template-columns:1fr}')>=0,'solver one-column phone grid missing');ok(stage8.indexOf('.et-solver-actions>*{flex:1 1 100%}')>=0,'solver full-width phone actions missing');ok(stage8.indexOf('textarea{width:100%;box-sizing:border-box')>=0,'solver textarea width guard missing')});
 test('Stage 11 field controls shrink within grid and remain touch-sized',function(){ok(html.indexOf('.field input,.field select{width:100%;min-width:0;min-height:40px')>=0,'field shrink/touch sizing missing');ok(shell.indexOf('min-height:42px')>=0,'mobile tool selector touch size missing')});
 test('Stage 11 PWA cache advances and retains offline Electrical Tasks shell',function(){ok(sw.indexOf("const CACHE = 'bruno-electric-v71'")>=0,'current cache version missing');['./electrical-tools.html','./electric-electrical-tasks.js','./electric-electrical-task-solver.js','./electrical-tasks-stage8-ui.js','./electric-app-backup-dispatch.js'].forEach(function(x){ok(sw.indexOf("'"+x+"'")>=0,x+' missing from offline core shell')});ok(sw.indexOf('OWNED_CACHE_RE')>=0,'owned cache guard missing');ok(sw.indexOf("caches.match('./index.html')")>=0,'navigation offline fallback missing')});
}
global.BRUNO_TEST_RESULTS=out;
})();
'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function src(name){return fs.readFileSync(path.join(__dirname,'..',name),'utf8')}
var reg=src('sw-register.js'),sw=src('sw.js'),version=src('electric-app-version.js'),tools=src('electrical-tools.html');
function quotedVersion(s,re,label){var m=s.match(re);if(!m)throw new Error(label+' missing');return m[1]}
var build=quotedVersion(reg,/var BUILD_VERSION='([^']+)'/,'bootstrap build version');
var visible=quotedVersion(version,/var VERSION='v([^']+)'/,'visible app version');

test('single runtime build and visible app version remain identical',function(){ok(build===visible,'bootstrap '+build+' differs from visible '+visible);ok(tools.indexOf('sw-register.js?v='+build)>=0,'tools bootstrap cache-bust is not current version');ok(tools.indexOf('electrical-project-calculator-ui.js?v='+build)>=0,'project calculator cache-bust is not current version')});
test('production bootstrap preserves canonical app dependency order',function(){var nav=reg.indexOf("'./electric-app-navigation.js'"),workspace=reg.indexOf("'./electric-workspace.js'"),pricing=reg.indexOf("'./electric-residential-pricing.js'"),guard=reg.indexOf("'./electric-pricing-domain-guard.js'"),quote=reg.indexOf("'./electric-quote-lifecycle.js'"),fixed=reg.indexOf("'./electric-fixed-price-invoice.js'");ok(nav>=0&&workspace>nav,'app navigation must load before workspace');ok(pricing>=0&&workspace>pricing,'residential pricing must load before workspace');ok(guard>=0&&quote>guard&&fixed>quote,'pricing guard -> quote lifecycle -> fixed invoice order broken')});
test('tools bootstrap includes project templates and current electrical task chain',function(){['electrical-calculation-workflow.js','electric-electrical-tasks.js','electric-electrical-task-engine.js','electric-raceway-engine.js','electric-grounding-engine.js','electrical-tasks-stage8-ui.js'].forEach(function(name){ok(reg.indexOf("'./"+name+"'")>=0,name+' missing from tools bootstrap')})});
test('retired service worker deletes owned Bruno caches and unregisters itself',function(){ok(sw.indexOf("const OWNED_CACHE_RE=/^bruno-electric-v\\d+$/")>=0,'owned-cache matcher missing');ok(sw.indexOf('caches.keys()')>=0&&sw.indexOf('caches.delete(k)')>=0,'owned cache cleanup missing');ok(sw.indexOf('self.registration.unregister()')>=0,'service-worker unregister missing');ok(sw.indexOf("BRUNO_SW_RETIRED")>=0,'retirement notification missing')});
test('retired service worker is network pass-through and owns no offline shell cache',function(){ok(sw.indexOf("event.respondWith(fetch(event.request))")>=0,'network pass-through missing');ok(sw.indexOf('const CACHE =')<0,'retired worker unexpectedly defines an offline cache');ok(sw.indexOf('addAll(')<0,'retired worker unexpectedly installs an offline shell')});
test('bootstrap actively unregisters workers and removes legacy Bruno caches',function(){ok(reg.indexOf('navigator.serviceWorker.getRegistrations()')>=0,'registration retirement missing');ok(reg.indexOf('r.unregister()')>=0,'bootstrap unregister missing');ok(reg.indexOf('/^bruno-electric-v\\d+$/.test(k)')>=0,'legacy Bruno cache cleanup missing')});
global.BRUNO_TEST_RESULTS=out;
})();

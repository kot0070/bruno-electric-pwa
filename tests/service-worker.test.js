'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
var asyncTests=global.BRUNO_ASYNC_TESTS||(global.BRUNO_ASYNC_TESTS=[]);
function asyncTest(name,fn){out.total++;var p=Promise.resolve().then(fn).then(function(){out.pass++;out.results.push({name:name,ok:true})},function(e){out.fail++;out.results.push({name:name,ok:false,error:e&&e.message||String(e)})});asyncTests.push(p)}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}

asyncTest('service worker activation deletes only owned stale Bruno Electric caches',function(){
  var source=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
  var listeners={},deleted=[];
  var cacheNames=['bruno-electric-v23','bruno-electric-v24','bruno-electric-v25','bruno-electric-v26','bruno-electric-v27','bruno-electric-v28','bruno-electric-v29','bruno-electric-v30','bruno-ac-v99','other-pwa-cache','random-cache','bruno-electricity-v24','bruno-electrical-other-v24'];
  var sandbox={Promise:Promise,URL:URL,console:console,self:{location:{origin:'https://kot0070.github.io'},clients:{claim:function(){return Promise.resolve()}},skipWaiting:function(){return Promise.resolve()},addEventListener:function(name,handler){listeners[name]=handler}},caches:{keys:function(){return Promise.resolve(cacheNames.slice())},delete:function(name){deleted.push(name);return Promise.resolve(true)},open:function(){return Promise.resolve({addAll:function(){return Promise.resolve()},add:function(){return Promise.resolve()},put:function(){return Promise.resolve()}})},match:function(){return Promise.resolve(null)}},fetch:function(){return Promise.reject(new Error('network disabled in test'))}};
  vm.runInNewContext(source,sandbox,{filename:'sw.js'});if(typeof listeners.activate!=='function')throw new Error('activate handler not registered');var waited=null;listeners.activate({waitUntil:function(p){waited=p}});if(!waited||typeof waited.then!=='function')throw new Error('activate did not register waitUntil promise');
  return waited.then(function(){deleted.sort();is(deleted.join('|'),'bruno-electric-v23|bruno-electric-v24|bruno-electric-v25|bruno-electric-v26|bruno-electric-v27|bruno-electric-v28|bruno-electric-v29');var kept=cacheNames.filter(function(x){return deleted.indexOf(x)<0}).sort();is(kept.join('|'),['bruno-ac-v99','bruno-electric-v30','bruno-electrical-other-v24','bruno-electricity-v24','other-pwa-cache','random-cache'].sort().join('|'))});
});

asyncTest('service worker core shell includes residential takeoff plus accepted modules',function(){
  var source=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
  ['electric-workspace.js','electric-bom.js','electric-residential-rules.js','electric-residential.js','electric-residential-pricing.js','electric-residential-takeoff.js','electrical-residential-ui.js','electrical-residential-pricing-ui.js','electrical-residential-takeoff-ui.js','electric-phase3-rules.js','electric-phase3.js','electrical-phase3-ui.js'].forEach(function(name){if(source.indexOf("'./"+name+"'")<0)throw new Error(name+' missing from core shell')});
});

global.BRUNO_TEST_RESULTS=out;
})();

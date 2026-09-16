'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var storage={};
var ls={
 getItem:function(k){return Object.prototype.hasOwnProperty.call(storage,k)?storage[k]:null},
 setItem:function(k,v){storage[k]=String(v)},
 removeItem:function(k){delete storage[k]},
 key:function(i){return Object.keys(storage)[i]||null}
};
Object.defineProperty(ls,'length',{get:function(){return Object.keys(storage).length}});
var sandbox={window:{},localStorage:ls,console:console,setTimeout:function(fn){fn()}};sandbox.window=sandbox;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','electric-catalog-cost-semantics.js'),'utf8'),sandbox,{filename:'electric-catalog-cost-semantics.js'});
var C=sandbox.BrunoCatalogCostSemantics;

test('blank Your Cost parses as unresolved',function(){var x=C.parse('');is(x.known,false);is(x.value,'')});
test('missing Your Cost parses as unresolved',function(){var x=C.parse(null);is(x.known,false);is(x.value,'')});
test('explicit zero Your Cost parses as known zero',function(){var x=C.parse('0');is(x.known,true);is(x.value,0)});
test('positive Your Cost parses as known numeric cost',function(){var x=C.parse('7.25');is(x.known,true);is(x.value,7.25)});
test('clearing Your Cost persists blank and removes cost-map override',function(){storage={};storage['bruno-electric-v1']=JSON.stringify({catalog:[{id:'c1',item:'x',unitCost:10,yourCost:4}],materialsUsed:[]});storage['bruno-electric-catalog-costs-v1']=JSON.stringify({c1:4});is(C.persistBlank('c1'),true);var job=JSON.parse(storage['bruno-electric-v1']),map=JSON.parse(storage['bruno-electric-catalog-costs-v1']);is(job.catalog[0].yourCost,'');is(Object.prototype.hasOwnProperty.call(map,'c1'),false);is(C.persistedBlank('c1'),true)});
test('capture guard targets both Catalog and Margins Your Cost classes',function(){var src=fs.readFileSync(path.join(__dirname,'..','electric-catalog-cost-semantics.js'),'utf8');ok(src.indexOf("classList.contains('cat-your')")>=0,'Catalog editor guard missing');ok(src.indexOf("classList.contains('mrg-your')")>=0,'Margins editor guard missing');ok(src.indexOf("addEventListener('input',protect,true)")>=0,'capture input guard missing');ok(src.indexOf("addEventListener('change',protect,true)")>=0,'capture change guard missing');ok(src.indexOf('stopImmediatePropagation')>=0,'legacy coercive handler is not blocked for blank input')});
test('workspace bootstrap loads Your Cost semantics guard',function(){var src=fs.readFileSync(path.join(__dirname,'..','sw-register.js'),'utf8');ok(src.indexOf('electric-catalog-cost-semantics.js')>=0,'cost semantics module not bootstrapped')});
test('starter catalog Your Cost is unresolved, not explicit zero',function(){var src=fs.readFileSync(path.join(__dirname,'..','electric-catalog-v1.js'),'utf8');ok(src.indexOf("yourCost:''")>=0,'starter catalog still seeds Your Cost as known zero');ok(src.indexOf('yourCost:0')<0,'starter catalog contains ambiguous explicit zero seed')});

global.BRUNO_TEST_RESULTS=out;
})();

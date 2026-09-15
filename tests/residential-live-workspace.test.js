'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}

test('same-tab Catalog edit immediately refreshes Residential workspace total',function(){
  var source=fs.readFileSync(path.join(__dirname,'..','electric-residential-live-workspace.js'),'utf8');
  var state={catalog:[{item:'Wire',unitCost:10,yourCost:6}],residentialLiveActive:{name:'Plan',bom:[{item:'Wire',qty:10,unit:'FT'}],savedAt:'now'}};
  var listeners={};
  var chipValue={textContent:''};
  var chipWrap={style:{},title:''};
  var bar={appendChild:function(){}};
  var document={
    readyState:'complete',
    querySelector:function(sel){return sel==='.live-totals'?bar:null},
    getElementById:function(id){if(id==='chip-res-live-wrap')return chipWrap;if(id==='chip-res-live')return chipValue;return null},
    createElement:function(){return chipWrap},
    addEventListener:function(name,fn){listeners[name]=fn}
  };
  var sandbox={
    window:null,document:document,console:console,
    localStorage:{getItem:function(k){return k==='bruno-electric-v1'?JSON.stringify(state):null}},
    setTimeout:function(fn){fn();return 1},clearTimeout:function(){},
    BrunoResidentialPricing:null
  };
  sandbox.window=sandbox;
  sandbox.BrunoResidentialPricing={priceRows:function(bom,catalog){return{customerMaterialTotal:Number(bom[0].qty)*Number(catalog[0].unitCost),yourMaterialCost:Number(bom[0].qty)*Number(catalog[0].yourCost)}}};
  sandbox.addEventListener=function(name,fn){listeners['window:'+name]=fn};
  vm.runInNewContext(source,sandbox,{filename:'electric-residential-live-workspace.js'});
  is(chipValue.textContent,'$100.00');
  state.catalog[0].unitCost=14;
  ok(typeof listeners.input==='function','same-document input listener missing');
  listeners.input({target:{closest:function(sel){return sel==='#panel-catalog'?{}:null}}});
  is(chipValue.textContent,'$140.00');
});

test('same-tab refresh is scoped to Catalog panel and explicit hook exists',function(){
  var source=fs.readFileSync(path.join(__dirname,'..','electric-residential-live-workspace.js'),'utf8');
  ok(source.indexOf("closest('#panel-catalog')")>=0,'Catalog scope missing');
  ok(source.indexOf("bruno:catalog-changed")>=0,'explicit Catalog change hook missing');
  ok(source.indexOf('notifyCatalogChanged')>=0,'public refresh hook missing');
});

global.BRUNO_TEST_RESULTS=out;
})();
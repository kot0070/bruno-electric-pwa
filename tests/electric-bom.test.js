'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function throws(fn,m){var hit=false;try{fn()}catch(e){hit=true}ok(hit,m||'expected throw')}
var B=global.BrunoElectricBOM;
function state(){return{
  id:'job-bom',
  catalog:[
    {id:'wire-12',item:'12 AWG Cu THHN',part:'W12',units:'FT',unitCost:1.5,yourCost:'0.42'},
    {id:'wire-zero',item:'10 AWG Cu THHN',part:'W10',units:'FT',unitCost:2.5,yourCost:'0'},
    {id:'wire-blank',item:'8 AWG Cu THHN',part:'W8',units:'FT',unitCost:4.5,yourCost:''},
    {id:'wire-invalid',item:'6 AWG Cu THHN',part:'W6',units:'FT',unitCost:7.5,yourCost:'not-a-number'}
  ],
  materialsUsed:[
    {item:'Manual row',qty:1,unitCost:9},
    {item:'Old same-source resolved',qty:1,unitCost:1,generatedBy:{source:'phase3-hvac'}},
    {item:'Other generated',qty:1,unitCost:2,generatedBy:{source:'phase3-motor'}}
  ],
  materialsUnresolved:[
    {item:'Old same-source unresolved',qty:1,unitCost:null,generatedBy:{source:'phase3-hvac'}},
    {item:'Other unresolved',qty:1,unitCost:null,generatedBy:{source:'phase3-feeder'}}
  ]
}}

test('BOM prepareReplacement rejects missing source tag and missing Job state',function(){
  throws(function(){B.prepareReplacement(state(),'',[])});
  throws(function(){B.prepareReplacement(null,'phase3-hvac',[])});
});

test('BOM replacement preserves manual and other generated sources while replacing only matching source',function(){
  var p=B.prepareReplacement(state(),'phase3-hvac',[{item:'12 AWG Cu THHN',qty:25,unit:'FT'}]);
  is(p.result.added,1);is(p.result.unresolved,0);
  ok(p.state.materialsUsed.some(function(x){return x.item==='Manual row'}),'manual row lost');
  ok(p.state.materialsUsed.some(function(x){return x.item==='Other generated'}),'other generated source lost');
  ok(p.state.materialsUnresolved.some(function(x){return x.item==='Other unresolved'}),'other unresolved source lost');
  ok(!p.state.materialsUsed.some(function(x){return x.item==='Old same-source resolved'}),'old resolved same-source row survived');
  ok(!p.state.materialsUnresolved.some(function(x){return x.item==='Old same-source unresolved'}),'old unresolved same-source row survived');
  var added=p.state.materialsUsed.find(function(x){return x.catalogMatchId==='wire-12'});
  is(added.qty,25);is(added.unitCost,0.42);is(added.costState,'RESOLVED');is(added.generatedBy.source,'phase3-hvac');
});

test('BOM blank Your Cost remains unresolved while explicit zero remains resolved numeric zero',function(){
  var p=B.prepareReplacement(state(),'phase3-test',[
    {item:'8 AWG Cu THHN',qty:10,unit:'FT'},
    {item:'10 AWG Cu THHN',qty:20,unit:'FT'}
  ]);
  var blank=p.state.materialsUnresolved.find(function(x){return x.catalogMatchId==='wire-blank'});
  var zero=p.state.materialsUsed.find(function(x){return x.catalogMatchId==='wire-zero'});
  ok(blank,'blank Your Cost row missing from unresolved store');
  is(blank.unitCost,null);is(blank.costState,'UNRESOLVED');is(blank.unresolvedReason,'YOUR_COST_UNRESOLVED');
  ok(zero,'explicit zero Your Cost row missing from resolved store');
  is(zero.unitCost,0);is(zero.costState,'RESOLVED');
});

test('BOM invalid Your Cost and unmatched catalog item fail into explicit unresolved material state',function(){
  var p=B.prepareReplacement(state(),'phase3-test',[
    {item:'6 AWG Cu THHN',qty:5,unit:'FT'},
    {item:'Unsupported special item',qty:2,unit:'EA'}
  ]);
  var invalid=p.state.materialsUnresolved.find(function(x){return x.catalogMatchId==='wire-invalid'});
  var missing=p.state.materialsUnresolved.find(function(x){return x.item==='Unsupported special item'});
  ok(invalid&&missing,'expected unresolved rows missing');
  is(invalid.unresolvedReason,'YOUR_COST_UNRESOLVED');
  is(missing.unresolvedReason,'CATALOG_UNMATCHED');
  is(missing.unitCost,null);
});

test('BOM catalog matching is normalized for case and repeated whitespace',function(){
  var p=B.prepareReplacement(state(),'phase3-test',[{item:'  12   awg CU thhn  ',qty:3,unit:'FT'}]);
  is(p.result.added,1);
  is(p.state.materialsUsed.find(function(x){return x.generatedBy&&x.generatedBy.source==='phase3-test'}).catalogMatchId,'wire-12');
});

test('BOM replaceGenerated persists replacement and does not duplicate same source across reruns',function(){
  localStorage.clear();localStorage.setItem('bruno-electric-v1',JSON.stringify(state()));
  var a=B.replaceGenerated('phase3-hvac',[{item:'12 AWG Cu THHN',qty:10,unit:'FT'}]);
  var b=B.replaceGenerated('phase3-hvac',[{item:'12 AWG Cu THHN',qty:30,unit:'FT'}]);
  var j=JSON.parse(localStorage.getItem('bruno-electric-v1'));
  var rows=j.materialsUsed.filter(function(x){return x.generatedBy&&x.generatedBy.source==='phase3-hvac'});
  is(a.added,1);is(b.added,1);is(rows.length,1);is(rows[0].qty,30);
  ok(j.materialsUsed.some(function(x){return x.item==='Manual row'}),'manual row lost after persisted replacement');
  ok(j.materialsUsed.some(function(x){return x.item==='Other generated'}),'other generated source lost after persisted replacement');
});

global.BRUNO_TEST_RESULTS=out;
})();

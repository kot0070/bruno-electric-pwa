'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
var src=fs.readFileSync(path.join(__dirname,'..','electric-job-summary-semantics.js'),'utf8');
function load(){var w={document:null,localStorage:{getItem:function(){return null}},addEventListener:function(){},setTimeout:setTimeout,clearTimeout:clearTimeout};var sb={window:w,globalThis:w,console:console,Number:Number,String:String,Array:Array,Object:Object,Math:Math};vm.runInNewContext(src,sb,{filename:'electric-job-summary-semantics.js'});return w.BrunoJobSummarySemantics}
test('Job summary semantics treats unresolved rows as incomplete contractor cost',function(){var M=load(),x=M.materialState({materialsUnresolved:[{item:'A',generatedBy:{source:'x'}},{item:'B'}]});is(x.complete,false);is(x.unresolvedCount,2);is(x.generatedUnresolvedCount,1)});
test('Job summary semantics treats empty unresolved store as complete',function(){var M=load(),x=M.materialState({materialsUnresolved:[]});is(x.complete,true);is(x.unresolvedCount,0)});
test('metric labels explicitly distinguish contractor cost recommended price and customer quote',function(){['Material Cost · resolved','Labor Cost','Equipment Cost','Estimated Job Cost','Recommended Customer Price · exact','Customer Quote Total','Approved Change Orders'].forEach(function(x){ok(src.indexOf(x)>=0,'missing semantic label '+x)})});
test('unresolved cost disclosure says excluded from contractor cost and profit math',function(){ok(src.indexOf('INCOMPLETE MATERIAL COST')>=0,'incomplete cost warning missing');ok(src.indexOf('excluded from contractor-cost/profit math')>=0,'exclusion disclosure missing')});
test('header Summary parity guard compares authoritative rendered values',function(){['chip-mat','sum-c-mat','chip-cost','sum-c-total','chip-sales','sum-s-total'].forEach(function(x){ok(src.indexOf(x)>=0,x+' parity endpoint missing')});ok(src.indexOf('METRIC PARITY WARNING')>=0,'parity warning missing');ok(src.indexOf("data-summary-parity")>=0,'parity state marker missing')});
test('applied calculation provenance is surfaced in Summary semantic layer',function(){ok(src.indexOf('residentialAppliedCalculation')>=0,'applied calculation read missing');ok(src.indexOf('Applied calculation:')>=0,'applied calculation disclosure missing')});
test('semantic layer documents exact vs rounded plus approved CO quote boundary',function(){ok(src.indexOf('Method A exact selling price before rounding')>=0,'exact recommended price definition missing');ok(src.indexOf('rounded base quote + approved Change Orders')>=0,'quote total definition missing')});
test('Stage 5 layer does not reimplement legacy sales or quote formulas',function(){ok(src.indexOf('withOHP')<0,'semantic layer duplicated OHP formula');ok(src.indexOf('profitMargin')<0,'semantic layer duplicated profit formula');ok(src.indexOf('ohRate')<0,'semantic layer duplicated overhead formula')});
global.BRUNO_TEST_RESULTS=out;
})();
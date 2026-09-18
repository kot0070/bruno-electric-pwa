'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function read(name){return fs.readFileSync(path.join(__dirname,'..',name),'utf8')}
var src=read('electric-customer-documents.js');
var authority=read('electric-runtime-authority-v1.js');
var header=read('electric-compact-header.js');
var reg=read('sw-register.js');
var version=read('electric-app-version.js');

test('current customer document and authority runtimes are syntactically valid JavaScript',function(){new Function(src);new Function(authority);new Function(header);new Function(reg);new Function(version)});
test('service invoice carries Texas electrical contractor customer-document fields',function(){['invoiceCompanyName','invoiceAddress','invoicePhone','invoiceLicense','TECL 28137','Texas Department of Licensing and Regulation','www.tdlr.texas.gov/complaints','Service address','Amount due'].forEach(function(x){ok(src.indexOf(x)>=0,x+' missing')})});
test('sales tax runtime uses settings source and has no 8.25 fallback literal',function(){ok(src.indexOf('commercialTaxPct:0')>=0,'customer document settings tax default must be zero/fetched from saved settings');ok(authority.indexOf('commercialTaxPct:0')>=0,'authority tax default must be zero/fetched from saved settings');ok(src.indexOf('commercialTaxPct:8.25')<0,'legacy 8.25 customer document fallback remains');ok(authority.indexOf('commercialTaxPct:8.25')<0,'legacy 8.25 authority fallback remains')});
test('materials are reference breakdown inside service price and never added to customer subtotal',function(){ok(src.indexOf('function subtotal(c){return Math.max(0,n(c.price))+tool(c)}')>=0,'customer subtotal is not service price plus optional tool only');ok(src.indexOf('Included materials reference')>=0,'included-material reference missing');ok(src.indexOf('NOT added on top')>=0,'included material UI explanation missing')});
test('service pricing modes and preview-first print controls are first-class',function(){['serviceHourlyRate:175','pricingMode','Hourly / time based','Fixed job price','Preview invoice','openHtmlPreview','printOpenPreview','Save / Print PDF'].forEach(function(x){ok(src.indexOf(x)>=0,x+' missing')})});
test('customer document output is gated behind rendered preview actions',function(){ok(src.indexOf("heading:'Service invoice preview'")>=0,'service invoice preview missing');ok(src.indexOf("heading:'Calculation report preview'")>=0,'calculation preview missing');ok(src.indexOf("id:'be-preview-download'")>=0,'preview print action missing');ok(src.indexOf('Complete invoice settings before customer PDF')>=0,'missing company output guard missing')});
test('journal metrics and settings have one active authority chain',function(){['Tax + Estimated','Net Profit','Business Net','Helper','Estimated tax set-aside %','djs-customer-save'].forEach(function(x){ok(authority.indexOf(x)>=0,x+' authority behavior missing')});ok(!fs.existsSync(path.join(__dirname,'..','electric-journal-customer-metrics.js')),'obsolete journal metric writer still exists')});
test('retired invoice patch is physically absent and cannot be dynamically resurrected',function(){ok(!fs.existsSync(path.join(__dirname,'..','electric-customer-invoice-patch.js')),'obsolete invoice patch still exists');ok(header.indexOf('electric-customer-invoice-patch.js')<0,'compact header still references obsolete invoice patch');ok(header.indexOf('loadInvoicePatch')<0,'compact header still contains obsolete patch loader');ok(reg.indexOf('electric-customer-invoice-patch.js')<0,'bootstrap still references obsolete invoice patch')});
test('single runtime build source is wired through deterministic bootstrap',function(){ok(reg.indexOf("BUILD_VERSION='1.17'")>=0,'bootstrap build version is not v1.17');ok(version.indexOf("var VERSION='v1.17'")>=0,'visible app version is not v1.17');ok(reg.indexOf("'./electric-app-version.js'")>=0,'version authority is not bootstrapped')});
test('version observer cannot create a self-triggering textContent mutation loop',function(){ok(version.indexOf('setTextIfNeeded')>=0,'guarded version text update missing');ok(version.indexOf('el&&el.textContent!==value')>=0,'version text is still rewritten even when unchanged')});
test('bootstrap cannot leave the current-workspace loader permanently blocking the app',function(){ok(reg.indexOf('Bootstrap watchdog released shell')>=0,'bootstrap watchdog missing');ok(reg.indexOf('finishBoot()')>=0,'bootstrap fail-open completion missing');ok(reg.indexOf("withTimeout(retire,2000,false,'retirement gate')")>=0,'service-worker retirement is still an unbounded boot gate');ok(reg.indexOf('Required runtime module timed out')>=0,'module load timeout missing')});
global.BRUNO_TEST_RESULTS=out;
})();

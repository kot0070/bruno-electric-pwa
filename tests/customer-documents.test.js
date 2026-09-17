'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
var src=fs.readFileSync(path.join(__dirname,'..','electric-customer-documents.js'),'utf8');
var metrics=fs.readFileSync(path.join(__dirname,'..','electric-journal-customer-metrics.js'),'utf8');
var reg=fs.readFileSync(path.join(__dirname,'..','sw-register.js'),'utf8');
var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
test('customer document runtimes are syntactically valid JavaScript',function(){new Function(src);new Function(metrics)});
test('service invoice carries Texas electrical contractor customer-document fields',function(){['invoiceCompanyName','invoiceAddress','invoicePhone','invoiceLicense','TECL 28137','Texas Department of Licensing and Regulation','www.tdlr.texas.gov/complaints','Invoice #','Service address','AMOUNT DUE'].forEach(function(x){ok(src.indexOf(x)>=0,x+' missing')})});
test('service call defaults expose residential and commercial tax treatment without universal commercial assumption',function(){ok(src.indexOf('commercialTaxPct:8.25')>=0,'editable commercial default missing');ok(src.indexOf("c.callType==='commercial_repair'")>=0,'taxable commercial repair branch missing');ok(src.indexOf('commercial_nontaxable')>=0,'commercial non-taxable branch missing');ok(src.indexOf("c.callType='residential'")>=0,'residential default missing')});
test('materials are reference breakdown inside service price and never added to customer subtotal',function(){ok(src.indexOf("function subtotal(c){return Math.max(0,n(c.price))+tool(c)}")>=0,'customer subtotal is not service price plus optional tool only');ok(src.indexOf('Included materials reference')>=0,'included-material reference missing');ok(src.indexOf('NOT added on top')>=0,'included material UI explanation missing')});
test('service hourly rate and customer PDF download are first-class controls',function(){['serviceHourlyRate:175','Use '+"'",'PDF invoice','Download calculation PDF','application/pdf'].forEach(function(x){ok(src.indexOf(x)>=0,x+' missing')})});
test('journal summary metrics separate earned revenue from sales tax collected',function(){ok(metrics.indexOf('Sales tax collected')>=0,'sales-tax metric label missing');ok(metrics.indexOf("['Business net',money(gross-helper)]")>=0,'business net still subtracts customer sales tax as company expense')});
test('customer document and metric runtimes load immediately and remain in offline shell',function(){['electric-customer-documents.js','electric-journal-customer-metrics.js'].forEach(function(x){ok(reg.indexOf(x)>=0,x+' loader missing');ok(sw.indexOf("'./"+x+"'")>=0,x+' offline cache entry missing')})});
global.BRUNO_TEST_RESULTS=out;
})();
'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
var src=fs.readFileSync(path.join(__dirname,'..','electric-fixed-price-invoice.js'),'utf8');
function load(basis,approved){var w={document:null,BrunoQuoteLifecycle:{invoiceBasis:function(){if(basis instanceof Error)throw basis;return JSON.parse(JSON.stringify(basis))},approved:function(){return approved?JSON.parse(JSON.stringify(approved)):null}},setTimeout:setTimeout,addEventListener:function(){}};var sb={window:w,globalThis:w,console:console,Number:Number,String:String,JSON:JSON,Object:Object,Math:Math,Array:Array};vm.runInNewContext(src,sb,{filename:'electric-fixed-price-invoice.js'});return w.BrunoFixedPriceInvoice}
var B={source:'APPROVED_QUOTE_SNAPSHOT',approvalId:'qa-1',revision:2,amount:12345.67,approvedAt:'2026-09-16T12:00:00Z',quoteMeta:{customer:'Smith',jobNumber:'J-42',proposalNumber:'P-7',quoteDate:'2026-09-16'},appliedCalculation:{calculationId:'rl-1'},costCompleteAtApproval:true,unresolvedMaterialCountAtApproval:0};
test('fixed-price invoice model consumes approved snapshot only',function(){var M=load(B,{priceSource:'MANUAL_ADJUSTMENT',recommendedAtApproval:12000,manualOverride:12345.67}),x=M.buildInvoiceModel();is(x.source,'APPROVED_QUOTE_SNAPSHOT');is(x.amount,12345.67);is(x.approvalId,'qa-1');is(x.revision,2);is(x.quoteMeta.customer,'Smith')});
test('fixed-price invoice document carries approval provenance and frozen amount',function(){var M=load(B,{priceSource:'LIVE_RECOMMENDED'}),html=M.invoiceHtml(M.buildInvoiceModel());ok(html.indexOf('Fixed-Price Invoice')>=0);ok(html.indexOf('$12,345.67')>=0);ok(html.indexOf('qa-1')>=0);ok(html.indexOf('Approval revision:')>=0);ok(html.indexOf('immutable Approved Quote snapshot')>=0)});
test('fixed-price invoice fails closed before approval',function(){var M=load(new Error('Approve a fixed-price Quote before creating its Invoice basis')),threw=false;try{M.buildInvoiceModel()}catch(e){threw=true;ok(e.message.indexOf('Approve')>=0)}ok(threw)});
test('invoice path is explicitly separate from T&M print controls',function(){ok(src.indexOf("['btn-print-tm','Print T&M Invoice']")>=0,'header T&M relabel missing');ok(src.indexOf("['btn-print-tm-2','Print T&M Invoice (PDF)']")>=0,'panel T&M relabel missing');ok(src.indexOf("id='qa-print-fixed'")<0,'unexpected literal form');ok(src.indexOf("b.id='qa-print-fixed'")>=0,'fixed invoice button missing')});
test('fixed invoice amount cannot read current q-total or chip-quote directly',function(){ok(src.indexOf("getElementById('q-total')")<0,'fixed invoice reads live q-total');ok(src.indexOf("getElementById('chip-quote')")<0,'fixed invoice reads live quote chip');ok(src.indexOf('invoiceBasis()')>=0,'approved invoice basis call missing')});
global.BRUNO_TEST_RESULTS=out;
})();

'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var source=fs.readFileSync(path.join(__dirname,'..','document-compliance.js'),'utf8');
var register=fs.readFileSync(path.join(__dirname,'..','sw-register.js'),'utf8');
var audit=fs.readFileSync(path.join(__dirname,'..','docs','TEXAS_CUSTOMER_DOCUMENT_COMPLIANCE_AUDIT.md'),'utf8');
var notice='Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas, 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov/complaints';

test('TDLR published notice is fixed in compliance module',function(){ok(source.indexOf(notice)>=0,'published TDLR notice missing or changed');ok(source.indexOf("data-tdlr-notice")>=0,'TDLR notice marker missing')});
test('customer print compliance requires contractor identity quartet',function(){['contractor name','address','phone number','contractor license number'].forEach(function(label){ok(source.indexOf("label:'"+label+"'")>=0,label+' requirement missing')});ok(source.indexOf('blockNoncompliantPrint')>=0,'print compliance gate missing');ok(source.indexOf('stopImmediatePropagation')>=0,'noncompliant print is not blocked')});
test('TDLR notice is applied to quote proposal and invoice print documents',function(){ok(source.indexOf("['print-quote','print-tm']")>=0,'quote/invoice print targets missing');ok(source.indexOf("beforeprint")>=0,'beforeprint compliance hook missing');ok(source.indexOf('setTimeout(preparePrintDocs,0)')>=0,'post-build print hook missing')});
test('Company screen receives compliance status feedback',function(){ok(source.indexOf('be-document-compliance-status')>=0,'Company compliance status missing');ok(source.indexOf('Customer document compliance incomplete')>=0,'missing-data warning missing')});
test('compliance module is loaded by application bootstrap',function(){ok(register.indexOf("c.src='./document-compliance.js'")>=0,'document compliance loader missing');ok(register.indexOf('loadDocumentCompliance')>=0,'compliance bootstrap missing')});
test('audit records LLC entity number as outside cited TDLR invoice requirements',function(){ok(audit.indexOf('LLC / SOS / EIN numbers')>=0,'LLC/SOS/EIN audit finding missing');ok(audit.indexOf('does not require or print those identifiers')>=0,'identifier conclusion missing')});

global.BRUNO_TEST_RESULTS=out;
})();
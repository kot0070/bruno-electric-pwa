'use strict';
(function(){
var fs=require('fs'),path=require('path'),vm=require('vm');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var source=fs.readFileSync(path.join(__dirname,'..','document-compliance.js'),'utf8');
var register=fs.readFileSync(path.join(__dirname,'..','sw-register.js'),'utf8');
var audit=fs.readFileSync(path.join(__dirname,'..','docs','TEXAS_CUSTOMER_DOCUMENT_COMPLIANCE_AUDIT.md'),'utf8');
var notice='Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov';

function loadModule(){
  var nodes={};
  function makeNode(){
    return {
      id:'',className:'',textContent:'',children:[],parentNode:null,
      setAttribute:function(k,v){this[k]=v},
      appendChild:function(n){n.parentNode=this;this.children.push(n);if(n.id)nodes[n.id]=n;return n},
      insertAdjacentElement:function(_where,n){return this.appendChild(n)},
      querySelector:function(sel){if(sel!=='.be-tdlr-notice')return null;for(var i=0;i<this.children.length;i++)if((' '+this.children[i].className+' ').indexOf(' be-tdlr-notice ')>=0)return this.children[i];return null},
      remove:function(){if(!this.parentNode)return;var a=this.parentNode.children,i=a.indexOf(this);if(i>=0)a.splice(i,1);this.parentNode=null}
    };
  }
  var quote=makeNode(),tm=makeNode();nodes['print-quote']=quote;nodes['print-tm']=tm;
  var document={
    readyState:'complete',
    head:{appendChild:function(n){if(n.id)nodes[n.id]=n}},
    getElementById:function(id){return nodes[id]||null},
    createElement:function(){return makeNode()},
    addEventListener:function(){}
  };
  var window={addEventListener:function(){},alert:function(){}};
  var sandbox={window:window,document:document,setTimeout:function(){return 0},console:console};
  vm.runInNewContext(source,sandbox,{filename:'document-compliance.js'});
  return {api:window.BrunoDocumentCompliance,quote:quote,tm:tm};
}

test('current 16 TAC 73.51(f) notice is fixed in compliance module',function(){ok(source.indexOf(notice)>=0,'current rule notice missing or changed');ok(source.indexOf('www.tdlr.texas.gov/complaints')<0,'Compliance Guide variant remains in production notice');ok(source.indexOf('data-tdlr-notice')>=0,'TDLR notice marker missing')});
test('customer print compliance requires complete contractor identity and address',function(){['contractor name','street address','city','state','ZIP code','phone number','contractor license number'].forEach(function(label){ok(source.indexOf("label:'"+label+"'")>=0,label+' requirement missing')});ok(source.indexOf('blockNoncompliantPrint')>=0,'print compliance gate missing');ok(source.indexOf('stopImmediatePropagation')>=0,'noncompliant print is not blocked')});
test('behavior: complete identity passes and incomplete address components fail',function(){
  var m=loadModule(),base={legalName:'Bruno Electric Services LLC',address1:'123 Main St',city:'Dripping Springs',state:'TX',zip:'78620',phone:'512-555-0100',license:'TECL 28137'};
  ok(m.api.complianceStatus(base).ok,'complete contractor identity should pass');
  [['address1','street address'],['city','city'],['state','state'],['zip','ZIP code']].forEach(function(pair){var c=Object.assign({},base);c[pair[0]]='';var st=m.api.complianceStatus(c);ok(!st.ok,pair[0]+' omission incorrectly passes');ok(st.missing.indexOf(pair[1])>=0,pair[1]+' missing label not reported')});
});
test('behavior: exact rule notice is appended once to quote proposal and invoice',function(){
  var m=loadModule();m.api.preparePrintDocs();m.api.preparePrintDocs();
  [m.quote,m.tm].forEach(function(doc){var notices=doc.children.filter(function(n){return (' '+n.className+' ').indexOf(' be-tdlr-notice ')>=0});ok(notices.length===1,'regulatory notice duplicated or missing');ok(notices[0].textContent===notice,'printed regulatory notice does not match rule text')});
});
test('TDLR notice is applied to quote proposal and invoice print documents',function(){ok(source.indexOf("['print-quote','print-tm']")>=0,'quote/invoice print targets missing');ok(source.indexOf('beforeprint')>=0,'beforeprint compliance hook missing');ok(source.indexOf('setTimeout(preparePrintDocs,0)')>=0,'post-build print hook missing')});
test('Company screen receives compliance status feedback',function(){ok(source.indexOf('be-document-compliance-status')>=0,'Company compliance status missing');ok(source.indexOf('Customer document compliance incomplete')>=0,'missing-data warning missing')});
test('compliance module is loaded by application bootstrap',function(){ok(register.indexOf("c.src='./document-compliance.js'")>=0,'document compliance loader missing');ok(register.indexOf('loadDocumentCompliance')>=0,'compliance bootstrap missing')});
test('audit reconciles rule versus Compliance Guide and excludes LLC entity number',function(){ok(audit.indexOf('Source hierarchy')>=0,'source hierarchy missing');ok(audit.indexOf('Compliance Guide publishes a variant')>=0,'official-source discrepancy not documented');ok(audit.indexOf('LLC / SOS / EIN numbers')>=0,'LLC/SOS/EIN audit finding missing');ok(audit.indexOf('does not require or print those identifiers')>=0,'identifier conclusion missing')});

global.BRUNO_TEST_RESULTS=out;
})();

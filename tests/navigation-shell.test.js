'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var bridge=fs.readFileSync(path.join(__dirname,'..','electric-navigation-bridge.js'),'utf8');
var shell=fs.readFileSync(path.join(__dirname,'..','electrical-tools-shell.js'),'utf8');
var register=fs.readFileSync(path.join(__dirname,'..','sw-register.js'),'utf8');
var html=fs.readFileSync(path.join(__dirname,'..','electrical-tools.html'),'utf8');
test('Electrical section route bypasses legacy iframe user path',function(){ok(bridge.indexOf("location.href='./electrical-tools.html'")>=0,'standalone Electrical route missing');ok(bridge.indexOf('stopImmediatePropagation')>=0,'capture interception missing');ok(register.indexOf('s.onload = loadNavigationBridge')>=0,'bridge not loaded after workspace shell')});
test('Electrical page carries same five-section mobile shell',function(){['Job','Estimate','Electrical','Billing','More'].forEach(function(label){ok(shell.indexOf(label)>=0,label+' missing')});ok(shell.indexOf("classList.add('active')")>=0,'Electrical active state missing');['JOB','ESTIMATE','BILLING','MORE'].forEach(function(k){ok(shell.indexOf('./index.html#be='+k)>=0,k+' return route missing')})});
test('Electrical standalone page makes no ineffective frame-ancestors meta claim',function(){ok(html.indexOf('frame-ancestors')<0,'frame-ancestors meta claim remains')});
global.BRUNO_TEST_RESULTS=out;
})();

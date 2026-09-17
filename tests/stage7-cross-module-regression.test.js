'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function src(name){return fs.readFileSync(path.join(__dirname,name),'utf8')}
function root(name){return fs.readFileSync(path.join(__dirname,'..',name),'utf8')}

var data=src('data-integrity.test.js');
var quote=src('quote-lifecycle.test.js');
var fixed=src('fixed-price-invoice.test.js');
var res=src('residential-apply-job.test.js');
var task=src('electrical-task-archive.test.js');
var custom=src('custom-materials.test.js');
var scope=src('residential-history-job-scope.test.js');
var backup=src('app-backup-dispatch.test.js');
var e2e=src(path.join('e2e','function-capability.spec.js'));
var stage7=src(path.join('e2e','stage7-cross-module.spec.js'));
var sw=root('sw.js');

test('Stage 7 required material and pricing interaction evidence remains executable',function(){
  ok(data.indexOf('BOM recalculation promotes formerly unresolved row when Your Cost becomes known')>=0,'Catalog -> Job Materials promotion evidence missing');
  ok(data.indexOf('BOM replacement preserves manual and other-source rows')>=0,'generated BOM isolation evidence missing');
  ok(custom.indexOf('historical')>=0||custom.indexOf('snapshot')>=0,'Custom Material historical-boundary evidence missing');
});

test('Stage 7 Quote approval and fixed Invoice interaction chain remains executable',function(){
  ok(quote.indexOf('post-approval live price and Job edits cannot mutate approved snapshot')>=0,'live -> approved immutability evidence missing');
  ok(quote.indexOf('invoice basis is sourced only from approved immutable quote snapshot')>=0,'approved -> invoice basis evidence missing');
  ok(fixed.indexOf('APPROVED_QUOTE_SNAPSHOT')>=0,'fixed Invoice approved-source assertion missing');
  ok(e2e.indexOf('E2E-08 Quote approval immutability and fixed-price invoice basis')>=0,'rendered Quote -> Invoice browser evidence missing');
});

test('Stage 7 Job-scoped Residential Task and backup provenance evidence remains executable',function(){
  ok(res.indexOf('preserv')>=0,'Residential Apply preservation evidence missing');
  ok(task.indexOf('history')>=0&&task.indexOf('revision')>=0,'Electrical Task revision/history evidence missing');
  ok(scope.indexOf('Job')>=0||scope.indexOf('job')>=0,'Residential Job-scope evidence missing');
  ok(backup.indexOf('rollback')>=0||backup.indexOf('preserve')>=0,'backup state-preservation evidence missing');
  ok(e2e.indexOf('E2E-02 Job A/B isolation through user import')>=0,'rendered Job isolation evidence missing');
  ok(e2e.indexOf('E2E-05 Electrical Tasks Feeder calculate save reload apply edit update history')>=0,'rendered Task -> Job evidence missing');
});

test('Stage 7 PWA lifecycle boundary has real-browser stored Job preservation evidence',function(){
  ok(stage7.indexOf('STAGE7-XMOD-01')>=0,'Stage 7 PWA browser journey missing');
  ok(stage7.indexOf('localStorage.getItem')>=0&&stage7.indexOf('unregister()')>=0&&stage7.indexOf('caches.delete')>=0,'PWA lifecycle journey does not cross storage/cache/SW boundary');
  ok(stage7.indexOf('expect(after).toEqual(before)')>=0,'PWA lifecycle does not assert exact Job preservation');
  ok(sw.indexOf('localStorage')<0,'service worker unexpectedly references localStorage');
});

global.BRUNO_TEST_RESULTS=out;
})();

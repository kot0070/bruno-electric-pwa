'use strict';
var assert=require('assert');
var api=require('../electric-app-backup-dispatch.js');
var results=global.BRUNO_TEST_RESULTS||(global.BRUNO_TEST_RESULTS={pass:0,fail:0,total:0,results:[]});
function test(name,fn){results.total++;try{fn();results.pass++;results.results.push({name:name,ok:true});}catch(e){results.fail++;results.results.push({name:name,ok:false,error:e&&e.message||String(e)});}}
function storage(seed){var s=Object.assign({},seed||{});return{getItem:function(k){return Object.prototype.hasOwnProperty.call(s,k)?s[k]:null;},setItem:function(k,v){s[k]=String(v);},dump:function(){return s;}};}

test('app backup includes current Dispatch Journal v3 data and settings',function(){
  var st=storage({
    'bruno-electric-dispatch-journal-v2':JSON.stringify({calls:[{id:'c1',price:125}],helpers:[]}),
    'bruno-electric-dispatch-settings-v2':JSON.stringify({jurisdiction:'Dripping Springs, TX',ownerTaxPct:15})
  });
  var out=api.augmentPayload({job:{id:'job1'}},st);
  assert.deepStrictEqual(out.job,{id:'job1'});
  assert.deepStrictEqual(out.dispatchJournalV3.data.calls,[{id:'c1',price:125}]);
  assert.strictEqual(out.dispatchJournalV3.settings.ownerTaxPct,15);
});

test('app backup restore writes current Dispatch Journal v3 keys',function(){
  var st=storage();
  var restored=api.restorePayload({dispatchJournalV3:{data:{calls:[{id:'c2'}],helpers:[]},settings:{jurisdiction:'TX'}}},st);
  assert.strictEqual(restored,true);
  assert.deepStrictEqual(JSON.parse(st.dump()['bruno-electric-dispatch-journal-v2']).calls,[{id:'c2'}]);
  assert.strictEqual(JSON.parse(st.dump()['bruno-electric-dispatch-settings-v2']).jurisdiction,'TX');
});

test('legacy app backup without Dispatch Journal v3 does not erase standalone journal',function(){
  var existing=JSON.stringify({calls:[{id:'keep'}],helpers:[]});
  var st=storage({'bruno-electric-dispatch-journal-v2':existing});
  var restored=api.restorePayload({job:{id:'legacy'}},st);
  assert.strictEqual(restored,false);
  assert.strictEqual(st.dump()['bruno-electric-dispatch-journal-v2'],existing);
});

test('app backup install wraps only full-app export and remains idempotent',function(){
  var st=storage({
    'bruno-electric-dispatch-journal-v2':JSON.stringify({calls:[{id:'install'}]}),
    'bruno-electric-dispatch-settings-v2':JSON.stringify({jurisdiction:'TX'})
  });
  var calls=[];
  var win={
    localStorage:st,
    wrapExport:function(type,payload){calls.push({type:type,payload:payload});return{type:type,payload:payload};},
    applyAppPayload:function(payload){return payload;}
  };
  assert.strictEqual(api.install(win),true);
  assert.strictEqual(api.install(win),false);
  var jobOnly=win.wrapExport('job',{job:{id:'j1'}});
  assert.strictEqual(Object.prototype.hasOwnProperty.call(jobOnly.payload,'dispatchJournalV3'),false);
  var app=win.wrapExport('app',{job:{id:'j1'}});
  assert.deepStrictEqual(app.payload.dispatchJournalV3.data.calls,[{id:'install'}]);
  assert.strictEqual(app.payload.dispatchJournalV3.settings.jurisdiction,'TX');
  assert.strictEqual(calls.length,2);
});

test('installed app payload wrapper restores Dispatch keys, preserves original return, and emits one change event',function(){
  var st=storage(),events=[];
  function CustomEvent(type){this.type=type;}
  var win={
    localStorage:st,
    wrapExport:function(type,payload){return{type:type,payload:payload};},
    applyAppPayload:function(payload){return{original:true,payload:payload};},
    CustomEvent:CustomEvent,
    dispatchEvent:function(ev){events.push(ev&&ev.type);}
  };
  assert.strictEqual(api.install(win),true);
  var payload={dispatchJournalV3:{data:{calls:[{id:'restored'}]},settings:{jurisdiction:'Austin, TX'}}};
  var result=win.applyAppPayload(payload);
  assert.strictEqual(result.original,true);
  assert.deepStrictEqual(JSON.parse(st.dump()['bruno-electric-dispatch-journal-v2']).calls,[{id:'restored'}]);
  assert.strictEqual(JSON.parse(st.dump()['bruno-electric-dispatch-settings-v2']).jurisdiction,'Austin, TX');
  assert.deepStrictEqual(events,['bruno:dispatch-changed']);
});

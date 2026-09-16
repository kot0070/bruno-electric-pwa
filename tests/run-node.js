'use strict';
global.window = global;
global.document = { getElementById: function () { return null; } };
var store={};
global.localStorage={
  getItem:function(k){return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null;},
  setItem:function(k,v){store[k]=String(v);},
  removeItem:function(k){delete store[k];},
  clear:function(){store={};}
};
global.BRUNO_ASYNC_TESTS=[];
require('../electric-reference-data.js');
require('../electric-calculators.js');
require('../electric-catalog-v1.js');
require('../electric-bom.js');
require('../electric-residential-rules.js');
require('../electric-residential.js');
require('../electric-residential-pricing.js');
require('../electric-residential-takeoff.js');
require('../electric-residential-live.js');
require('../electric-residential-live-levels.js');
require('../electric-residential-live-history.js');
require('../electric-phase3-rules.js');
require('../electric-phase3.js');
require('./electrical-calculators.test.js');
require('./data-integrity.test.js');
require('./navigation-shell.test.js');
require('./residential-estimator.test.js');
require('./residential-pricing.test.js');
require('./residential-takeoff.test.js');
require('./residential-live.test.js');
require('./residential-live-levels.test.js');
require('./residential-live-history.test.js');
require('./residential-live-workspace.test.js');
require('./dispatch-journal-v2.test.js');
require('./project-calculator.test.js');
require('./phase3-equipment.test.js');
require('./service-worker.test.js');
require('./residential-catalog-bridge.test.js');
require('./catalog-cost-semantics.test.js');
require('./pricing-margins-semantics.test.js');

Promise.all(global.BRUNO_ASYNC_TESTS).then(function(){
  var r = global.BRUNO_TEST_RESULTS;
  if (!r) { console.error('No test results produced'); process.exit(2); }
  console.log('Bruno Electric deterministic tests: ' + r.pass + '/' + r.total + ' passed');
  if (r.fail) { r.results.filter(function(x){return !x.ok}).forEach(function(x){console.error('FAIL — '+x.name+': '+x.error);}); process.exit(1); }
}).catch(function(err){ console.error(err&&err.stack||err); process.exit(1); });

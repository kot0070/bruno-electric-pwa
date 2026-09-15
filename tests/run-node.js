'use strict';
global.window = global;
global.document = { getElementById: function () { return null; } };
require('../electric-reference-data.js');
require('../electric-calculators.js');
require('./electrical-calculators.test.js');
var r = global.BRUNO_TEST_RESULTS;
if (!r) {
  console.error('No test results produced');
  process.exit(2);
}
console.log('Electrical calculator tests: ' + r.pass + '/' + r.total + ' passed');
if (r.fail) process.exit(1);

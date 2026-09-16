'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
function src(name){return fs.readFileSync(path.join(__dirname,'..',name),'utf8')}
var reg=src('sw-register.js'),sw=src('sw.js'),custom=src('electric-custom-materials.js'),quote=src('electric-quote-lifecycle.js'),apply=src('electric-residential-apply-job.js'),saveUx=src('electric-residential-save-archive-ux.js'),summary=src('electric-job-summary-semantics.js'),catUx=src('electric-catalog-job-ux-semantics.js');
test('final bootstrap loads every new workflow runtime on Job app',function(){['electric-job-summary-semantics.js','electric-quote-lifecycle.js','electric-catalog-job-ux-semantics.js','electric-custom-materials.js','electric-residential-wire-takeoff.js','electric-residential-apply-job.js','electric-residential-save-archive-ux.js'].forEach(function(n){ok(reg.indexOf(n)>=0,n+' missing from bootstrap')})});
test('final PWA v50 core shell mirrors required bootstrap workflow runtimes',function(){ok(sw.indexOf("bruno-electric-v50")>=0,'v50 missing');['electric-job-summary-semantics.js','electric-quote-lifecycle.js','electric-catalog-job-ux-semantics.js','electric-custom-materials.js','electric-residential-wire-takeoff.js','electric-residential-apply-job.js','electric-residential-save-archive-ux.js'].forEach(function(n){ok(sw.indexOf("'./"+n+"'")>=0,n+' missing from PWA shell')})});
test('Custom and Quote lifecycle persist inside active Job state not global registries',function(){ok(custom.indexOf("JOB_KEY='bruno-electric-v1'")>=0,'Custom Job key missing');ok(quote.indexOf("JOB_KEY='bruno-electric-v1'")>=0,'Quote Job key missing');ok(custom.indexOf("CUSTOM_KEY='bruno-electric-custom-materials-v1'")<0,'global Custom registry returned')});
test('Save Apply Quote boundaries are separately represented',function(){ok(saveUx.indexOf('Save Calculation')>=0,'Save boundary missing');ok(apply.indexOf('applyActive')>=0,'Apply boundary missing');ok(quote.indexOf('APPROVED_QUOTE_SNAPSHOT')>=0,'Approved Quote snapshot boundary missing')});
test('unresolved contractor cost remains first-class through Job and Quote layers',function(){ok(summary.indexOf('INCOMPLETE MATERIAL COST')>=0,'Job unresolved disclosure missing');ok(quote.indexOf('unresolvedMaterialCountAtApproval')>=0,'Quote unresolved snapshot missing');ok(custom.indexOf("costState='UNRESOLVED'")>=0,'Custom unresolved state missing')});
test('Catalog and Job Materials UX exposes definition-vs-snapshot semantics',function(){ok(catUx.indexOf('Catalog = reusable definition for this Job')>=0,'Catalog definition semantics missing');ok(catUx.indexOf('Job Materials = historical calculation snapshots')>=0,'Job snapshot semantics missing')});
test('newly introduced workflow controls retain phone-responsive contracts',function(){ok(custom.indexOf('@media(max-width:767.98px)')>=0,'Custom phone CSS missing');ok(catUx.indexOf('@media(max-width:767.98px)')>=0,'Catalog/Job badge phone CSS missing');ok(quote.indexOf('grid grid-2')>=0,'Quote lifecycle responsive grid integration missing')});
global.BRUNO_TEST_RESULTS=out;
})();

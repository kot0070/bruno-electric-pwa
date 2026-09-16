'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};function test(n,f){out.total++;try{f();out.pass++;out.results.push({name:n,ok:true})}catch(e){out.fail++;out.results.push({name:n,ok:false,error:e.message})}}function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
var R=global.BrunoElectricalRules,G=global.BrunoGroundingReference;
test('Stage 9 Texas authority metadata identifies adopted 2026 NEC and effective date',function(){is(R.META.jurisdiction,'Texas');is(R.META.codeFamily,'NEC');is(R.META.edition,'2026');is(R.META.effectiveDate,'2026-09-01');is(R.META.stateRule,'16 TAC §73.100')});
test('Texas provenance points to current TDLR adoption and Texas Register authority',function(){ok(/^https:\/\/www\.tdlr\.texas\.gov\/news\/rulemaking\/2026\/09\/01\//.test(R.META.stateSource));ok(/^https:\/\/www\.sos\.texas\.gov\/texreg\/archive\/August282026\//.test(R.META.stateRegisterSource));ok(R.META.note.indexOf('listed HVAC equipment')>=0);ok(R.META.note.indexOf('without the NFPA expiration date')>=0)});
test('NEC source points to official NFPA document information',function(){is(R.META.codeSource,'https://www.nfpa.org/70');Object.keys(R.REFERENCES).forEach(function(k){ok(/^https:\/\//.test(R.REFERENCES[k].source),k+' missing authoritative source')})});
test('Code requirement and design recommendation remain distinct in reference metadata',function(){is(R.REFERENCES.ampacity.status,'Code Required');is(R.REFERENCES.conduitFill.status,'Code Required');is(R.REFERENCES.voltageDrop.status,'Recommended');ok(R.REFERENCES.voltageDrop.section.indexOf('not a general mandatory')>=0)});
test('Texas HVAC GFCI provenance names the state modification, not a generic NEC exception',function(){is(R.REFERENCES.texasOutdoorHvacGfci.status,'Code Required');ok(R.REFERENCES.texasOutdoorHvacGfci.section.indexOf('16 TAC §73.100')>=0);ok(R.REFERENCES.texasOutdoorHvacGfci.section.indexOf('210.8(F) Exception No. 2')>=0)});
test('Grounding references remain explicitly tied to Article 250 supported scope',function(){ok(G.references.egc.section.indexOf('250.122')>=0);ok(G.references.egcUpsize.section.indexOf('250.122(B)')>=0);ok(G.references.parallelEgcs.section.indexOf('250.122(F)')>=0);is(G.supportedMaxOcpd,1200)});
test('AHJ applicability remains explicit verification item',function(){is(R.META.ahjOverridePossible,true);ok(R.META.note.indexOf('Verify local AHJ amendments')>=0)});
global.BRUNO_TEST_RESULTS=out;
})();

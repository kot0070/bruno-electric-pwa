'use strict';
(function(){
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function is(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+', got '+JSON.stringify(a))}
function ok(v,m){if(!v)throw new Error(m||'assertion failed')}
var L=global.BrunoResidentialLiveLevels,E=global.BrunoResidentialLive;
test('dependency model exposes L0 through L6',function(){is(L.levels.length,7);is(L.levels[0].id,'L0');is(L.levels[6].id,'L6')});
test('project fact changes affect full downstream chain but only L0-L5 recalc live',function(){is(L.levelForInput('squareFeet'),0);is(L.affectedFrom('squareFeet').join('>'),'L0>L1>L2>L3>L4>L5>L6');is(L.liveAffectedFrom('squareFeet').join('>'),'L0>L1>L2>L3>L4>L5');is(L.pendingCommitFrom('squareFeet').join('>'),'L6')});
test('design override starts at L2 and leaves L6 pending confirm',function(){is(L.levelForInput('generalReceptacles'),2);is(L.affectedFrom('generalReceptacles').join('>'),'L2>L3>L4>L5>L6');is(L.liveAffectedFrom('generalReceptacles').join('>'),'L2>L3>L4>L5')});
test('circuit rating starts at L3 and does not invalidate code minimum layer',function(){is(L.levelForInput('generalCircuitAmps'),3);is(L.affectedFrom('generalCircuitAmps').join('>'),'L3>L4>L5>L6');is(L.liveAffectedFrom('generalCircuitAmps').join('>'),'L3>L4>L5')});
test('annotated live result flags layout requirement and general code conflict by level',function(){var r=E.calculate({squareFeet:1500,bedrooms:1,livingRooms:1,kitchens:1,bathrooms:1,qualifyingWallSegmentsFt:'13,13',overrides:{generalReceptacles:2}});L.annotate(r);var code=r.dependencyLevels.filter(function(x){return x.id==='L1'})[0],design=r.dependencyLevels.filter(function(x){return x.id==='L2'})[0],confirmed=r.dependencyLevels.filter(function(x){return x.id==='L6'})[0];is(code.status,'LAYOUT REQUIRED');is(design.status,'NON-COMPLIANT');is(confirmed.status,'CONFIRM TO COMMIT');ok(r.dependencyLevels.length===7)});
global.BRUNO_TEST_RESULTS=out;
})();
/* Bruno Electric — explicit Residential saved-calculation -> Job transaction.
 * Save Calculation and Apply to Job are intentionally separate boundaries.
 */
(function(root){
'use strict';
var JOB_KEY='bruno-electric-v1',SOURCE='residential-saved-calculation',LEGACY_SOURCE='residential-live-takeoff';
function clone(x){return JSON.parse(JSON.stringify(x))}
function read(){try{return JSON.parse(root.localStorage.getItem(JOB_KEY)||'null')}catch(e){return null}}
function write(x){root.localStorage.setItem(JOB_KEY,JSON.stringify(x))}
function now(){return new Date().toISOString()}
function savedActive(){var j=read();return j&&j.residentialLiveActive?clone(j.residentialLiveActive):null}
function rowsFromSnapshot(s){return (s&&Array.isArray(s.bom)?s.bom:[]).map(function(r){return{qty:r.qty,item:r.item,unit:r.unit||r.units,version:'residential-apply-v1',codeSource:r.source||'Residential saved calculation'}})}
function residentialGenerated(x){var src=x&&x.generatedBy&&x.generatedBy.source;return !!(src&&(src===LEGACY_SOURCE||src.indexOf(SOURCE+':')===0))}
function applyActive(){var B=root.BrunoElectricBOM,j=read(),s=j&&j.residentialLiveActive;if(!j)throw new Error('No saved Bruno Electric job found');if(!s||!s.id)throw new Error('Save the Residential calculation before applying it to the Job');if(!Array.isArray(s.bom)||!s.bom.length)throw new Error('Saved Residential calculation has no BOM to apply');if(!B||typeof B.prepareReplacement!=='function')throw new Error('BOM transaction helper unavailable');
 var sourceTag=SOURCE+':'+s.id,base=clone(j);
 /* Migrate/remove only prior Residential generated rows before preparing the new
  * application. Manual and all other generated sources remain untouched. */
 base.materialsUsed=(Array.isArray(base.materialsUsed)?base.materialsUsed:[]).filter(function(x){return !residentialGenerated(x)});
 base.materialsUnresolved=(Array.isArray(base.materialsUnresolved)?base.materialsUnresolved:[]).filter(function(x){return !residentialGenerated(x)});
 var prepared=B.prepareReplacement(base,sourceTag,rowsFromSnapshot(s)),next=prepared.state;
 next.residentialAppliedCalculation={calculationId:s.id,name:s.name||'Residential calculation',savedAt:s.savedAt||'',appliedAt:now(),sourceType:'RESIDENTIAL_LIVE_SAVED',sourceVersion:'residential-apply-v1',sourceTag:sourceTag,wireTakeoff:s.wireTakeoff?clone(s.wireTakeoff):null,bomLineCount:s.bom.length,resolvedMaterialRows:prepared.result.added,unresolvedMaterialRows:prepared.result.unresolved};
 write(next);return{state:next,result:prepared.result,provenance:clone(next.residentialAppliedCalculation)}}
function applied(){var j=read();return j&&j.residentialAppliedCalculation?clone(j.residentialAppliedCalculation):null}
function isActiveApplied(){var a=savedActive(),p=applied();return !!(a&&p&&a.id===p.calculationId)}
root.BrunoResidentialApplyJob=Object.freeze({applyActive:applyActive,applied:applied,savedActive:savedActive,isActiveApplied:isActiveApplied,rowsFromSnapshot:rowsFromSnapshot,sourcePrefix:SOURCE,legacySource:LEGACY_SOURCE,version:'residential-apply-v1'});
})(typeof window!=='undefined'?window:globalThis);

/* Bruno Electric — Residential Live dependency levels.
 * L0-L5 recalculate live. L6 is a commit boundary and changes only on Confirm & Save.
 */
(function(root){
'use strict';
var LEVELS=Object.freeze([
  Object.freeze({id:'L0',key:'FACTS',label:'Project facts',detail:'Floor area, rooms, geometry and major project facts'}),
  Object.freeze({id:'L1',key:'CODE',label:'Code minimums',detail:'Derived NEC minimums and layout-required checks'}),
  Object.freeze({id:'L2',key:'DESIGN',label:'Live design',detail:'Customer/design overrides compared with code minimums'}),
  Object.freeze({id:'L3',key:'CIRCUITS',label:'Circuits & conductors',detail:'Circuit count, breaker rating, conductor/cable and panel spaces'}),
  Object.freeze({id:'L4',key:'BOM',label:'BOM',detail:'Boxes, devices, breakers, cable and consumables'}),
  Object.freeze({id:'L5',key:'PRICING',label:'Pricing',detail:'Catalog customer price, Your Cost and material margin'}),
  Object.freeze({id:'L6',key:'CONFIRMED',label:'Confirmed estimate',detail:'Commit boundary: active job estimate and reusable material archive update only on Confirm & Save'})
]);
var INPUT_LEVEL={
  squareFeet:0,bedrooms:0,bathrooms:0,powderRooms:0,livingRooms:0,diningRooms:0,offices:0,kitchens:0,laundryAreas:0,garageBays:0,outdoorGfci:0,qualifyingWallSegmentsFt:0,
  generalReceptacles:2,bathroomReceptacles:2,kitchenReceptacles:2,outdoorReceptacles:2,lights:2,switches:2,
  generalCircuitAmps:3,receptaclesPerGeneralCircuit:3
};
function levelForInput(key){return Object.prototype.hasOwnProperty.call(INPUT_LEVEL,key)?INPUT_LEVEL[key]:0}
function affectedFrom(key){var n=levelForInput(key);return LEVELS.slice(n,6).map(function(x){return x.id})}
function pendingCommitFrom(key){var n=levelForInput(key);return n<=5?['L6']:[]}
function annotate(result){if(!result)return result;result.dependencyLevels=LEVELS.map(function(l,i){var status='READY';if(i===1&&result.codeMinimums&&((result.codeMinimums.generalReceptacles&&!result.codeMinimums.generalReceptacles.known)||(result.codeMinimums.bathroomReceptacles&&!result.codeMinimums.bathroomReceptacles.known)||(result.codeMinimums.kitchenReceptacles&&!result.codeMinimums.kitchenReceptacles.known)))status='LAYOUT REQUIRED';if(i===2&&result.violations&&result.violations.length)status='NON-COMPLIANT';if(i===6)status='CONFIRM TO COMMIT';return{id:l.id,key:l.key,label:l.label,detail:l.detail,status:status}});return result}
root.BrunoResidentialLiveLevels=Object.freeze({levels:LEVELS,levelForInput:levelForInput,affectedFrom:affectedFrom,pendingCommitFrom:pendingCommitFrom,annotate:annotate});
})(window);

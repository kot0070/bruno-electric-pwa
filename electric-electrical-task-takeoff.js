/* Bruno Electric — Electrical Tasks Stage 5 deterministic material takeoff. */
(function(root){
'use strict';
var F=root.BrunoElectricalTaskEngine,G=root.BrunoGroundingEngine;
if(!F||!G)throw new Error('Feeder and Grounding engines must load before Task Takeoff');
var VERSION='electrical-task-takeoff-v1';
function round(n,p){var m=Math.pow(10,p==null?3:p);return Math.round(n*m)/m}
function sizeLabel(size){return Number(size)>=250?size+' kcmil':size+' AWG'}
function conductorItem(size,material,type,role){var insulation=type==='THHN_THWN2'?'THHN/THWN-2':type;return sizeLabel(size)+' '+material+' '+insulation+' '+role}
function racewayLabel(type){return type==='PVC40'?'PVC Schedule 40':type==='PVC80'?'PVC Schedule 80':type}
function calculate(input,grounding,stage4){var g=stage4||G.calculate(input,grounding);if(!g||g.status!=='PASS')return{engineVersion:VERSION,status:g&&g.status||'NO SUPPORTED CONFIGURATION',rows:[],allowances:[],warnings:['Material takeoff is blocked until Stage 4 has a PASS result. Review-required EGC/raceway candidates are not published as installation material quantities.'].concat(g&&g.warnings||[]),sourceStage4:g||null};var fr=F.calculate(input),n=fr.inputs,x=fr.result,r=g.result,sets=x.sets,phaseCount=n.phase===3?3:2,d=n.distanceFt,rows=[];
 rows.push({key:'PHASE_CONDUCTOR',basis:'CALCULATED',category:'CONDUCTORS',item:conductorItem(x.size,n.material,n.conductorType,'phase conductor'),part:'',units:'FT',qty:round(d*phaseCount*sets,1),formula:d+' ft × '+phaseCount+' phase conductor(s) × '+sets+' set(s)',role:'PHASE',conductorSize:x.size,material:n.material,conductorType:n.conductorType});
 if(r.neutralMode==='FULL_SIZE')rows.push({key:'NEUTRAL',basis:'CALCULATED',category:'CONDUCTORS',item:conductorItem(x.size,n.material,n.conductorType,'neutral conductor'),part:'',units:'FT',qty:round(d*sets,1),formula:d+' ft × '+sets+' set(s)',role:'NEUTRAL',conductorSize:x.size,material:n.material,conductorType:n.conductorType});
 rows.push({key:'EGC',basis:'CALCULATED',category:'GROUNDING',item:conductorItem(r.egcSelectedSize,r.egcMaterial,'THHN_THWN2','equipment grounding conductor'),part:'',units:'FT',qty:round(d*sets,1),formula:d+' ft × '+sets+' raceway(s)',role:'EGC',conductorSize:r.egcSelectedSize,material:r.egcMaterial,conductorType:'THHN_THWN2'});
 rows.push({key:'RACEWAY',basis:'CALCULATED',category:'RACEWAY',item:r.finalRacewayTradeSize+' in '+racewayLabel(r.finalRacewayType),part:'',units:'FT',qty:round(d*sets,1),formula:d+' ft × '+sets+' raceway(s)',role:'RACEWAY',racewayType:r.finalRacewayType,racewaySize:r.finalRacewayTradeSize});
 var allowances=[
  {key:'CONDUCTOR_WASTE',basis:'ALLOWANCE',item:'Conductor pull / termination allowance',units:'%',qty:null,note:'Set by estimator for actual route, pulling and termination conditions; not automatically added to calculated footage.'},
  {key:'COUPLINGS',basis:'FIELD_VERIFY',item:'Raceway couplings',units:'EA',qty:null,note:'Exact count depends on stock lengths and route geometry.'},
  {key:'SWEEPS',basis:'FIELD_VERIFY',item:'Sweeps / bends',units:'EA',qty:null,note:'Do not infer exact bends without field route geometry.'},
  {key:'CONNECTORS',basis:'FIELD_VERIFY',item:'Connectors / adapters / bushings',units:'EA',qty:null,note:'Verify raceway system and equipment entries.'},
  {key:'PULL_POINTS',basis:'FIELD_VERIFY',item:'Pull boxes / pull points',units:'EA',qty:null,note:'Verify bend accumulation, conductor pulling limits, dimensions and field routing.'},
  {key:'TERMINATIONS',basis:'FIELD_VERIFY',item:'Lugs / terminations',units:'EA',qty:null,note:'Verify conductor material, equipment listing, lug range and parallel termination provisions.'},
  {key:'LABELS',basis:'ALLOWANCE',item:'Labels / identification',units:'ALLOW',qty:null,note:'Project allowance; field verify final labeling scope.'}
 ];
 return{engineVersion:VERSION,status:'PASS',taskType:'FEEDER_PANEL_RUN',rows:rows,allowances:allowances,summary:{phaseConductorFt:rows[0].qty,neutralFt:r.neutralMode==='FULL_SIZE'?round(d*sets,1):0,egcFt:round(d*sets,1),racewayFt:round(d*sets,1),racewayCount:sets,oneWayDistanceFt:d},warnings:['Calculated footage is based on entered one-way route length and explicit conductor/raceway count. It does not include automatic waste, vertical/routing changes, coil tails or fitting quantities.','Only CALCULATED rows are eligible for Job Materials. ALLOWANCE and FIELD_VERIFY rows remain non-numeric until explicitly estimated.'],sourceStage4:g,sourceFeeder:fr};}
root.BrunoElectricalTaskTakeoff=Object.freeze({calculate:calculate,version:VERSION,_test:{conductorItem:conductorItem,racewayLabel:racewayLabel}});
})(typeof window!=='undefined'?window:globalThis);

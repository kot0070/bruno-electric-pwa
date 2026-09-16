/* Bruno Electric — Stage 8 deterministic Professional Task Solver. No AI, no Job mutation. */
(function(root){
'use strict';
var VERSION='electrical-task-solver-v1';
var REQUIRED=Object.freeze(['loadAmps','voltage','phase','distanceFt','material','installation','loadBasis','vdTargetPct']);
var WHY=Object.freeze({
 loadAmps:'Design current is required for conductor ampacity and is never inferred from equipment labels or customer pricing.',
 voltage:'System voltage is required for voltage-drop calculations and equipment/system compatibility checks.',
 phase:'Single-phase versus three-phase changes the voltage-drop equation and conductor/system interpretation.',
 distanceFt:'One-way route distance is required for voltage drop and calculated conductor/raceway footage.',
 material:'Copper versus aluminum changes supported ampacity and resistance data.',
 installation:'Installation/raceway type selects the supported deterministic raceway data and affects material planning.',
 loadBasis:'Continuous versus noncontinuous load basis controls whether a 125% design-current factor is applicable in the shared engine.',
 vdTargetPct:'Voltage-drop target is a design constraint, not a universal code requirement, and must be chosen explicitly.'
});
var BASIS=Object.freeze({
 loadAmps:'FIELD / DESIGN FACT — explicit design current.',voltage:'FIELD / SYSTEM FACT — explicit nominal system voltage.',phase:'FIELD / SYSTEM FACT — explicit phase configuration.',distanceFt:'FIELD FACT — one-way route distance.',material:'DESIGN / SPECIFICATION — conductor material selection.',installation:'DESIGN / FIELD FACT — supported installation/raceway type.',loadBasis:'COMPLIANCE FACT — continuous-load treatment must be explicit.',vdTargetPct:'DESIGN ASSUMPTION — voltage-drop target is not silently treated as a code mandate.'
});
function clean(s){return String(s==null?'':s).trim()}
function first(re,s){var m=re.exec(s);return m?m[1]:null}
function extract(text){var s=clean(text),known={};if(!s)return result(s,known);
 var a=first(/(?:^|\b)(\d+(?:\.\d+)?)\s*(?:a|amp|amps|ampere|amperes)\b/i,s);if(a!==null)known.loadAmps=a;
 var d=first(/(?:^|\b)(\d+(?:\.\d+)?)\s*(?:ft|feet|foot)\b/i,s);if(d!==null)known.distanceFt=d;
 var v=first(/(?:^|\b)(120|208|240|277|480|600)\s*(?:v|volt|volts)\b/i,s);if(v!==null)known.voltage=v;
 if(/\b(?:three|3)\s*[- ]?phase\b|\b3\s*[φø]\b/i.test(s))known.phase='3';else if(/\b(?:single|one|1)\s*[- ]?phase\b|\b1\s*[φø]\b/i.test(s))known.phase='1';
 if(/\b(?:copper|cu)\b/i.test(s))known.material='Cu';else if(/\b(?:aluminum|aluminium|al)\b/i.test(s))known.material='Al';
 if(/\bemt\b/i.test(s))known.installation='EMT';else if(/\bpvc\s*(?:(?:schedule|sch\.?)\s*)?80\b/i.test(s))known.installation='PVC_SCH80';else if(/\bpvc\s*(?:(?:schedule|sch\.?)\s*)?40\b/i.test(s))known.installation='PVC_SCH40';
 if(/\bnon\s*[- ]?continuous\b/i.test(s))known.loadBasis='NONCONTINUOUS';else if(/\bcontinuous\b/i.test(s))known.loadBasis='CONTINUOUS';
 var vd=first(/(?:voltage\s*drop|\bvd\b)\s*(?:target)?\s*(?:of|=|:|at|under|≤|<=)?\s*(\d+(?:\.\d+)?)\s*%/i,s);if(vd!==null)known.vdTargetPct=vd;
 return result(s,known)}
function result(text,known){var unresolved=REQUIRED.filter(function(k){return !Object.prototype.hasOwnProperty.call(known,k)});return{text:text,known:known,unresolved:unresolved,complete:unresolved.length===0,assumptions:assumptions(),codeDesignBasis:REQUIRED.map(function(k){return{field:k,basis:BASIS[k]}}),version:VERSION}}
function why(field){return WHY[field]||'This input is required explicitly by the selected deterministic workflow.'}
function assumptions(){return['No compliance-critical fact is inferred from missing text.','Distance is interpreted as one-way route length when explicitly stated.','Voltage drop uses the audited resistance-only K-method supported by the shared engine; power factor/reactance are not inferred.','Raceway fill is not pulling feasibility.','A voltage-drop target is a design constraint unless an authoritative rule for the specific installation is separately established.']}
function fieldMap(){return{loadAmps:'et-load',voltage:'et-voltage',phase:'et-phase',distanceFt:'et-distance',material:'et-material',installation:'et-install',loadBasis:'et-load-basis',vdTargetPct:'et-vd'}}
root.BrunoElectricalTaskSolver=Object.freeze({extract:extract,why:why,assumptions:assumptions,requiredFields:REQUIRED.slice(),fieldMap:fieldMap,version:VERSION,_test:{result:result,basis:BASIS}});
})(typeof window!=='undefined'?window:globalThis);

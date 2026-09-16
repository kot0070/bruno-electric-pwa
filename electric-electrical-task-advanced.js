/* Bruno Electric — Electrical Tasks Stage 7 advanced-template adapters. Reuses audited deterministic engines; no duplicate electrical math. */
(function(root){
'use strict';
var G=root.BrunoGroundingEngine;
if(!G)throw new Error('Grounding engine must load before Advanced Electrical Tasks');
var VERSION='electrical-task-advanced-v1';
function clone(x){return x==null?x:JSON.parse(JSON.stringify(x))}
function warning(result,text){var r=clone(result);r.warnings=Array.isArray(r.warnings)?r.warnings.slice():[];if(r.warnings.indexOf(text)<0)r.warnings.unshift(text);r.taskTemplateEngineVersion=VERSION;return r}
function branch(input,grounding){input=clone(input||{});grounding=clone(grounding||{});var r=G.calculate(input,grounding);return warning(r,'Branch Circuit Run uses the shared deterministic conductor / voltage-drop / raceway / EGC chain from explicit design-current inputs. Branch-specific load, OCPD, equipment and special-occupancy rules are not inferred; unresolved compliance facts require separate verification.')}
function calculate(type,input,grounding){if(type==='BRANCH_CIRCUIT_RUN')return branch(input,grounding);throw new Error('Advanced task template is not enabled by this adapter')}
root.BrunoElectricalTaskAdvanced=Object.freeze({calculate:calculate,branch:branch,version:VERSION});
})(typeof window!=='undefined'?window:globalThis);

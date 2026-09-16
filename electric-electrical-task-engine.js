/* Bruno Electric — Electrical Tasks deterministic feeder/panel engine, Stage 2. */
(function(root){
'use strict';
var R=root.BrunoElectricalRules,C=root.BrunoElectricalCalc;
if(!R||!C)throw new Error('Electrical Rules and Calculator engine must load before Electrical Task engine');
var VERSION='feeder-panel-engine-v1';
var SIZES=['14','12','10','8','6','4','3','2','1','1/0','2/0','3/0','4/0','250','300','350','400','500','600','700','750','800','900','1000'];
var PARALLEL_MIN_INDEX=SIZES.indexOf('1/0');
function req(v,name){if(v==null||String(v).trim()==='')throw new Error(name+' is required');return String(v).trim()}
function num(v,name){var s=req(v,name),n=Number(s);if(!Number.isFinite(n))throw new Error(name+' must be numeric');return n}
function pos(v,name,allowZero){var n=num(v,name);if(allowZero?n<0:n<=0)throw new Error(name+(allowZero?' must be >= 0':' must be > 0'));return n}
function whole(v,name){var n=pos(v,name);if(!Number.isInteger(n))throw new Error(name+' must be a whole number');return n}
function one(v,allowed,name){var x=req(v,name);if(allowed.indexOf(x)<0)throw new Error(name+' is unsupported');return x}
function voltageValue(v){var x=one(v,['120/240','120/208','277/480','240','480'],'system voltage');return x==='120/240'?240:x==='120/208'?208:x==='277/480'?480:Number(x)}
function tempIndex(r){return r===60?0:r===75?1:r===90?2:-1}
function tempFactor(rating,ambient){var rows=R.TEMP_FACTORS[rating];if(!rows)throw new Error('Unsupported conductor insulation rating');if(ambient<rows[0][0]||ambient>rows[rows.length-1][0])throw new Error('Ambient temperature is outside supported correction table range');for(var i=0;i<rows.length;i++)if(ambient<=rows[i][0])return rows[i][1];throw new Error('Ambient temperature has no supported correction factor')}
function cccFactor(count){var hit=R.CCC_FACTORS.find(function(x){return count>=x.min&&count<=x.max});if(!hit)throw new Error('CCC count has no supported adjustment factor');return hit.factor}
function normalize(input){input=input||{};var load=pos(input.loadAmps,'load amps'),voltage=voltageValue(input.voltage),phase=one(input.phase,['1','3'],'phase'),distance=pos(input.distanceFt,'one-way distance'),material=one(input.material,['Cu','Al'],'conductor material'),installation=one(input.installation,['EMT','PVC40','PVC80','OTHER'],'installation / raceway'),conductorType=one(input.conductorType,['THHN_THWN2','XHHW2'],'conductor type'),basis=one(input.loadBasis,['NONCONTINUOUS','CONTINUOUS','MIXED'],'load basis'),target=pos(input.vdTargetPct,'voltage-drop target'),ambient=num(input.ambientC,'ambient temperature'),ccc=whole(input.ccc,'current-carrying conductor count'),terminal=Number(one(input.terminalRating,['60','75','90'],'terminal rating')),parallel=input.parallelAllowed===true;
 if(target>20)throw new Error('voltage-drop target must be <= 20%');
 if(basis==='MIXED')throw new Error('Mixed continuous/noncontinuous load requires a dedicated load breakdown; Stage 2 will not guess the design current');
 var designCurrent=basis==='CONTINUOUS'?load*1.25:load;
 var insulation=90;
 tempFactor(insulation,ambient);cccFactor(ccc);
 var maxSize=input.maxConductorSize==null||String(input.maxConductorSize).trim()===''?null:String(input.maxConductorSize).replace(/\s*kcmil/i,'').trim();
 if(maxSize&&SIZES.indexOf(maxSize)<0)throw new Error('maximum conductor size is unsupported');
 return{loadAmps:load,designCurrent:designCurrent,voltage:voltage,voltageLabel:String(input.voltage),phase:Number(phase),distanceFt:distance,material:material,installation:installation,conductorType:conductorType,loadBasis:basis,vdTargetPct:target,ambientC:ambient,ccc:ccc,terminalRating:terminal,insulationRating:insulation,parallelAllowed:parallel,maxConductorSize:maxSize,racewayStrategy:String(input.racewayStrategy||'')};
}
function ampacityFor(n,size,sets){var row=R.AMPACITY[n.material]&&R.AMPACITY[n.material][size];if(!row)return null;var ti=tempIndex(n.terminalRating),ii=tempIndex(n.insulationRating);if(ti<0||ii<0)return null;var tf=tempFactor(n.insulationRating,n.ambientC),cf=cccFactor(n.ccc),base=row[ii],adjusted=base*tf*cf,terminal=row[ti],per=Math.min(adjusted,terminal);return{baseAmpacity:base,tempFactor:tf,cccFactor:cf,adjustedAmpacity:adjusted,terminalLimit:terminal,allowablePerConductor:per,sets:sets,combinedAmpacity:per*sets,passes:per*sets+1e-9>=n.designCurrent};}
function vdFor(n,size,sets){var cm=R.CMIL[size];if(!cm)return null;var multiplier=n.phase===3?Math.sqrt(3):2,K=n.material==='Al'?21.2:12.9,effective=cm*sets,drop=multiplier*K*n.loadAmps*n.distanceFt/effective,pct=drop/n.voltage*100;return{K:K,multiplier:multiplier,cmilPerConductor:cm,effectiveCmil:effective,voltsDropped:drop,percentDropped:pct,voltageAtLoad:n.voltage-drop,targetPct:n.vdTargetPct,passes:pct<=n.vdTargetPct+1e-9,method:'RESISTANCE_ONLY_K'};}
function candidate(n,size,sets){if(sets>1&&SIZES.indexOf(size)<PARALLEL_MIN_INDEX)return null;var a=ampacityFor(n,size,sets),v=vdFor(n,size,sets);if(!a||!v)return null;return{size:size,sets:sets,material:n.material,conductorType:n.conductorType,ampacity:a,voltageDrop:v,totalCmil:v.effectiveCmil,passesAmpacity:a.passes,passesVoltageDrop:v.passes,passes:a.passes&&v.passes,selectionBasis:'SUPPORTED_CANDIDATE'};}
function maxIndex(n){return n.maxConductorSize?SIZES.indexOf(n.maxConductorSize):SIZES.length-1}
function search(input){var n=normalize(input),all=[],mi=maxIndex(n),maxSets=n.parallelAllowed?6:1;for(var sets=1;sets<=maxSets;sets++){for(var i=0;i<=mi;i++){var c=candidate(n,SIZES[i],sets);if(c)all.push(c)}}var pass=all.filter(function(x){return x.passes});pass.sort(function(a,b){return a.totalCmil-b.totalCmil||a.sets-b.sets||SIZES.indexOf(a.size)-SIZES.indexOf(b.size)});pass.forEach(function(x,i){x.rank=i+1;x.selectionBasis=i===0?'MINIMUM_TOTAL_CIRCULAR_MIL_AREA_MEETING_SELECTED_CONSTRAINTS':'ALTERNATE_SUPPORTED_CONFIGURATION'});return{inputs:n,candidates:pass.slice(0,8),evaluatedCount:all.length,status:pass.length?'PASS':'NO_SUPPORTED_CONFIGURATION'};}
function steps(n,c){var a=c.ampacity,v=c.voltageDrop;return[
 {label:'Entered load current',value:n.loadAmps,unit:'A',status:'User Input'},
 {label:'Load basis',value:n.loadBasis,status:n.loadBasis==='CONTINUOUS'?'Code/Design Input':'User Input'},
 {label:'Required design ampacity',value:Math.round(n.designCurrent*100)/100,unit:'A',formula:n.loadBasis==='CONTINUOUS'?'load × 125%':'entered load',status:'Code/Design Input'},
 {label:'Table ampacity at 90°C adjustment column',value:a.baseAmpacity,unit:'A',status:'Code Required'},
 {label:'Ambient correction factor',value:a.tempFactor,status:'Code Required'},
 {label:'CCC adjustment factor',value:a.cccFactor,status:'Code Required'},
 {label:'Adjusted ampacity before terminal limit',value:Math.round(a.adjustedAmpacity*100)/100,unit:'A',status:'Code Required'},
 {label:'Terminal ampacity limit',value:a.terminalLimit,unit:'A',status:'Code Required'},
 {label:'Allowable ampacity per parallel conductor',value:Math.round(a.allowablePerConductor*100)/100,unit:'A',status:'Code Required'},
 {label:'Combined allowable ampacity',value:Math.round(a.combinedAmpacity*100)/100,unit:'A',formula:c.sets+' parallel set(s)',status:'Code Required'},
 {label:'Voltage-drop method',value:(n.phase===3?'√3':'2')+' × K × I × L ÷ effective CM',status:'Estimating Assumption'},
 {label:'Effective circular-mil area',value:v.effectiveCmil,unit:'cmil',formula:c.sets+' × '+v.cmilPerConductor,status:'Calculated'},
 {label:'Voltage dropped',value:Math.round(v.voltsDropped*100)/100,unit:'V',status:'Recommended'},
 {label:'Voltage drop',value:Math.round(v.percentDropped*100)/100,unit:'%',status:'Recommended'},
 {label:'Voltage at load',value:Math.round(v.voltageAtLoad*100)/100,unit:'V',status:'Recommended'}
];}
function calculate(input){var s=search(input);if(!s.candidates.length)return{engineVersion:VERSION,status:'NO SUPPORTED CONFIGURATION',inputs:s.inputs,result:null,candidates:[],calculationSteps:[],warnings:['No conductor configuration in the supported size/set search meets both selected ampacity and voltage-drop constraints. Change an explicit design constraint or perform engineering review; no answer is invented.'],unresolved:['Raceway sizing is Stage 3.','EGC / neutral / grounding semantics are Stage 4.'],references:{ampacity:R.REFERENCES.ampacity,parallel:R.REFERENCES.parallelConductors,voltageDrop:R.REFERENCES.voltageDrop}};var c=s.candidates[0],desc=(c.sets>1?c.sets+' parallel sets of ':'')+c.size+(Number(c.size)>=250?' kcmil':' AWG')+' '+c.material+' '+s.inputs.conductorType.replace('_','/');return{engineVersion:VERSION,status:'PASS',inputs:s.inputs,result:{description:desc,size:c.size,sets:c.sets,material:c.material,conductorType:c.conductorType,combinedAmpacity:Math.round(c.ampacity.combinedAmpacity*100)/100,requiredAmpacity:Math.round(s.inputs.designCurrent*100)/100,voltageDropPct:Math.round(c.voltageDrop.percentDropped*100)/100,voltageAtLoad:Math.round(c.voltageDrop.voltageAtLoad*100)/100,selectionBasis:c.selectionBasis},candidates:s.candidates,calculationSteps:steps(s.inputs,c),warnings:['Parallel-conductor candidates assume identical conductor material, size, length, insulation/termination conditions and supported parallel arrangement. Verify all 310.10(G) conditions and equipment termination/listing details.','Voltage drop uses a resistance-only K-method estimating approximation; raceway reactance/impedance is not modeled.','Raceway size, neutral treatment and grounding/bonding are intentionally unresolved until later accepted task stages.'],unresolved:['Raceway sizing is Stage 3.','EGC / neutral / grounding semantics are Stage 4.'],references:{ampacity:R.REFERENCES.ampacity,parallel:R.REFERENCES.parallelConductors,voltageDrop:R.REFERENCES.voltageDrop}};}
root.BrunoElectricalTaskEngine=Object.freeze({normalize:normalize,search:search,calculate:calculate,version:VERSION,_test:{ampacityFor:ampacityFor,vdFor:vdFor,candidate:candidate,sizes:SIZES.slice()}});
})(typeof window!=='undefined'?window:globalThis);

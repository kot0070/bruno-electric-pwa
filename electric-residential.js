/* Bruno Electric — Residential Estimator Phase 2 engine. */
(function(root){
'use strict';
const R=root.BrunoResidentialRules;if(!R)throw new Error('BrunoResidentialRules required');
function num(v,n,z){const x=Number(v);if(!Number.isFinite(x)||(z?x<0:x<=0))throw new Error((n||'value')+(z?' must be >= 0':' must be > 0'));return x}
function int(v,n,z){const x=num(v,n,z);if(!Number.isInteger(x))throw new Error((n||'value')+' must be whole');return x}
function demand12045(va){va=num(va,'lighting/appliance subtotal',true);const d=R.lightingDemand;if(va<=d.firstVA)return va;if(va<=d.midLimitVA)return d.firstVA+(va-d.firstVA)*d.midPct;return d.firstVA+(d.midLimitVA-d.firstVA)*d.midPct+(va-d.midLimitVA)*d.overPct}
function serviceCandidate(amps){for(const a of R.serviceRatings)if(amps<=a)return a;return null}
function applianceList(x){return Array.isArray(x)?x:[]}
function calc(input){
 const sqft=num(input.squareFeet,'square feet');
 const sa=Math.max(R.minimum.smallApplianceCircuits,int(input.smallApplianceCircuits==null?2:input.smallApplianceCircuits,'small-appliance circuits'));
 const laundry=Math.max(R.minimum.laundryCircuits,int(input.laundryCircuits==null?1:input.laundryCircuits,'laundry circuits'));
 const general=sqft*R.minimum.generalVAperFt2, saVA=sa*R.minimum.smallApplianceVAperCircuit, laundryVA=laundry*R.minimum.laundryVAperCircuit;
 const baseConnected=general+saVA+laundryVA,baseDemand=demand12045(baseConnected);
 const fixed=applianceList(input.fixedAppliances).map((a,i)=>({name:String(a.name||('Fixed appliance '+(i+1))),va:num(a.va,'fixed appliance VA',true)})).filter(a=>a.va>0);
 const fixedConnected=fixed.reduce((s,a)=>s+a.va,0),fixedFactor=fixed.length>=R.fixedApplianceDemand.minimumCount?R.fixedApplianceDemand.factor:1,fixedDemand=fixedConnected*fixedFactor;
 let dryerDemand=0;if(input.dryer){const np=num(input.dryerVA==null?0:input.dryerVA,'dryer VA',true);dryerDemand=Math.max(R.dryer.fallbackVA,np)}
 let cookingDemand=0;if(input.cooking){const kw=num(input.cookingKW,'cooking kW');if(kw>R.singleCooking.maxAutoNameplateKW)throw new Error('Phase 2 automatic cooking demand supports one household cooking appliance up to 12 kW; larger/combined cooking requires detailed Table 120.55 calculation.');if(kw<=1.75)throw new Error('Phase 2 cooking demand automation starts above 1.75 kW.');cookingDemand=R.singleCooking.columnCDemandVA}
 const heatVA=num(input.heatVA==null?0:input.heatVA,'heating VA',true),coolVA=num(input.coolVA==null?0:input.coolVA,'cooling VA',true);const hvacDemand=Math.max(heatVA,coolVA);
 const motorVA=num(input.largestMotorVA==null?0:input.largestMotorVA,'largest motor VA',true),motorAdder=motorVA*.25;
 const otherVA=num(input.otherVA==null?0:input.otherVA,'other VA',true);
 const totalVA=baseDemand+fixedDemand+dryerDemand+cookingDemand+hvacDemand+motorAdder+otherVA;
 const serviceAmps=totalVA/240,candidate=serviceCandidate(serviceAmps);
 const material=String(input.serviceMaterial||'');if(material!=='Cu'&&material!=='Al')throw new Error('service material must be Cu or Al');
 const conductor=candidate&&R.serviceConductors[candidate]?R.serviceConductors[candidate][material]:null;
 return {module:'residentialLoad',status:candidate?'PASS':'REVIEW',reference:R.references,inputs:Object.assign({},input),result:{squareFeet:sqft,generalVA:general,smallApplianceVA:saVA,laundryVA,baseConnectedVA:baseConnected,baseDemandVA:Math.round(baseDemand),fixedConnectedVA:fixedConnected,fixedDemandFactor:fixedFactor,fixedDemandVA:Math.round(fixedDemand),dryerDemandVA:dryerDemand,cookingDemandVA:cookingDemand,hvacDemandVA:hvacDemand,motorAdderVA:Math.round(motorAdder),otherVA,totalVA:Math.round(totalVA),serviceAmps:Math.round(serviceAmps*10)/10,serviceCandidateA:candidate,serviceMaterial:material,serviceConductor:conductor},warnings:['Service result is a planning candidate, not permit-ready engineering. Verify local AHJ, utility requirements, service equipment rating, conductor conditions, temperature/adjustment factors, neutral, grounding/bonding and equipment-specific articles.','Heating/cooling are treated as noncoincident by using the larger entered load. Enter nameplate/design values; do not infer HVAC electrical load from tonnage.','The 25% motor adder is applied only to the explicit largestMotorVA input. If motor treatment differs for the actual equipment mix, perform a detailed calculation.']};
}
function circuits(input){
 const out=[
  {id:'sa-1',name:'Kitchen small-appliance circuit 1',voltage:120,amps:20,status:'Code Required',reference:'210.11(C)(1)'},
  {id:'sa-2',name:'Kitchen small-appliance circuit 2',voltage:120,amps:20,status:'Code Required',reference:'210.11(C)(1)'},
  {id:'laundry',name:'Laundry circuit',voltage:120,amps:20,status:'Code Required',reference:'210.11(C)(2)'},
  {id:'bath',name:'Bathroom receptacle circuit',voltage:120,amps:20,status:'Code Required',reference:'210.11(C)(3)'}
 ];
 function add(id,name,va,v){va=Number(va)||0;if(va>0)out.push({id,name,voltage:v||240,loadVA:va,loadAmps:Math.round(va/(v||240)*10)/10,status:'Field Verify',reference:'Nameplate + applicable NEC equipment article'});}
 if(input.dryer)add('dryer','Clothes dryer',Math.max(R.dryer.fallbackVA,Number(input.dryerVA)||0),240);
 if(input.cooking)add('cooking','Cooking equipment',(Number(input.cookingKW)||0)*1000,240);
 applianceList(input.fixedAppliances).forEach((a,i)=>add('fixed-'+i,String(a.name||('Fixed appliance '+(i+1))),a.va,Number(a.voltage)||120));
 add('hvac-cool','HVAC cooling equipment',input.coolVA,240);add('hvac-heat','Electric heating equipment',input.heatVA,240);
 return out;
}
function bom(input,calcResult){const run=int(input.estimatedRunFt==null?50:input.estimatedRunFt,'estimated run feet');const rows=[{qty:4*run,unit:'FT',item:'12/2 NM-B with ground',status:'Estimating Assumption',version:'2',codeSource:'210.11(C)(1)-(3)'},{qty:4,unit:'EA',item:'20A 1-pole breaker',status:'Field Verify',version:'2',codeSource:'210.11(C)(1)-(3)'}];const r=calcResult&&calcResult.result;if(r&&r.serviceCandidateA){rows.push({qty:1,unit:'EA',item:r.serviceCandidateA===200?'200A meter/main combo':'Service equipment '+r.serviceCandidateA+'A — field verify',status:'Field Verify',version:'2',codeSource:'310.12'});rows.push({qty:1,unit:'EA',item:r.serviceConductor+' '+r.serviceMaterial+' dwelling service/feeder conductor set — quantity/length field verify',status:'Field Verify',version:'2',codeSource:'310.12'});}circuits(input).filter(x=>x.status==='Field Verify').forEach(x=>rows.push({qty:1,unit:'EA',item:x.name+' circuit conductors/OCPD — size from nameplate/code',status:'Field Verify',version:'2',codeSource:x.reference}));return rows}
root.BrunoResidential=Object.freeze({calculate:calc,circuits,bom,_test:{demand12045,serviceCandidate}});
})(window);

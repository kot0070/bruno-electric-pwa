/* Bruno Electric — Residential Live Code & Takeoff Engine.
 * Code-driven where inputs are sufficient; estimating assumptions are labeled separately.
 */
(function(root){
'use strict';
var R=root.BrunoResidentialRules;
function num(v,name,def){if(v===''||v==null){if(def!==undefined)return def;throw new Error((name||'value')+' is required')}var n=Number(v);if(!Number.isFinite(n)||n<0)throw new Error((name||'value')+' must be a finite number >= 0');return n}
function whole(v,name,def){var n=num(v,name,def);if(!Number.isInteger(n))throw new Error((name||'value')+' must be a whole number');return n}
function ceilDiv(a,b){return a===0?0:Math.ceil(a/b)}
function parseSegments(v){var raw=Array.isArray(v)?v:String(v==null?'':v).trim();if(raw===''||raw==null)return{provided:false,qualifying:[],nonqualifying:[],invalid:[]};var tokens=Array.isArray(raw)?raw:raw.split(','),q=[],nq=[],bad=[];tokens.forEach(function(token,i){var text=String(token).trim();if(text===''){bad.push({index:i+1,token:text,reason:'blank token'});return}var x=Number(text);if(!Number.isFinite(x)||x<0){bad.push({index:i+1,token:text,reason:'must be a finite number >= 0'});return}if(x>=2)q.push(x);else nq.push(x)});return{provided:true,qualifying:q,nonqualifying:nq,invalid:bad}}
function wallMinimum(segments){var p=parseSegments(segments);if(p.invalid.length){var b=p.invalid[0];throw new Error('Invalid wall-space segment #'+b.index+(b.token?(' ("'+b.token+'")'):'')+': '+b.reason+'. Correct the complete list before code minimum can be calculated.')}var count=0;p.qualifying.forEach(function(ft){count+=Math.ceil(ft/12)});return{known:p.provided,count:count,segments:p.qualifying,nonqualifyingSegments:p.nonqualifying,reference:'NEC 2026 210.52(A)(1)-(2)',basis:'Each entered wall-space segment is validated. Segments under 2 ft are valid nonqualifying wall space and are explicitly excluded; malformed/negative tokens fail closed. Openings/doors and actual wall-space boundaries must be entered as separate segments.'}}
function add(map,item,qty,unit,source,note){if(!qty)return;var key=item+'|'+unit;if(!map[key])map[key]={item:item,qty:0,unit:unit,source:source||'Live Takeoff',note:note||''};map[key].qty+=qty}
function circuit(label,count,amps,wire,item,reference,basis,status){if(!count)return null;return{label:label,count:count,amps:amps,voltage:120,wire:wire,cableItem:item,reference:reference,basis:basis,status:status||'DESIGN'}}
function override(input,key,fallback){var o=input.overrides||{};return o[key]===''||o[key]==null?fallback:whole(o[key],key,0)}
function calculate(input){input=input||{};var sqft=num(input.squareFeet,'square feet');if(sqft<=0)throw new Error('square feet must be > 0');
 var bedrooms=whole(input.bedrooms,'bedrooms',0),living=whole(input.livingRooms,'living rooms',0),dining=whole(input.diningRooms,'dining rooms',0),offices=whole(input.offices,'offices',0),baths=whole(input.bathrooms,'bathrooms',0),powder=whole(input.powderRooms,'powder/toilet rooms',0),kitchens=whole(input.kitchens,'kitchens',0),laundry=whole(input.laundryAreas,'laundry areas',0),garage=whole(input.garageBays,'garage bays',0),outdoor=whole(input.outdoorGfci,'outdoor receptacles',0);
 var habitable=bedrooms+living+dining+offices;
 var wall=wallMinimum(input.qualifyingWallSegmentsFt);
 var generalEstimate=habitable*4;
 var generalBase=wall.known?wall.count:generalEstimate;
 var generalRecs=override(input,'generalReceptacles',generalBase);
 var bathEstimate=baths+powder;
 var bathRecs=override(input,'bathroomReceptacles',bathEstimate);
 var kitchenEstimate=kitchens*6;
 var kitchenRecs=override(input,'kitchenReceptacles',kitchenEstimate);
 var lightsDefault=habitable+baths+powder+kitchens+laundry+(garage?1:0);
 var lights=override(input,'lights',lightsDefault);
 var switches=override(input,'switches',lightsDefault);
 var outdoorRecs=override(input,'outdoorReceptacles',outdoor);
 var generalAmps=whole(input.generalCircuitAmps,'general circuit amps',20);if(generalAmps!==15&&generalAmps!==20)throw new Error('general circuit amps must be 15 or 20');
 var grouping=whole(input.receptaclesPerGeneralCircuit,'receptacles per general circuit',5);if(grouping<1)throw new Error('receptacles per general circuit must be >= 1');
 var generalCircuits=ceilDiv(generalRecs,grouping);if(habitable>0&&generalCircuits===0)generalCircuits=1;
 var kitchenCircuits=kitchens>0?2:0,bathCircuits=baths>0?1:0,laundryCircuits=laundry>0?1:0,garageCircuits=garage>0?1:0;
 var totalCircuits=generalCircuits+kitchenCircuits+bathCircuits+laundryCircuits+garageCircuits;
 var wire=generalAmps===20?'#12 Cu / 12/2 NM-B':'#14 Cu / 14/2 NM-B',wireItem=generalAmps===20?'12/2 NM-B with ground':'14/2 NM-B with ground';
 var circuits=[];var c=circuit('General habitable rooms',generalCircuits,generalAmps,wire,wireItem,'NEC 2026 Table 210.24(1); 210.19; 210.20','Circuit count uses Bruno live grouping assumption; device count is code-derived only when a complete validated wall-segment list is supplied.',wall.known?'CODE+DESIGN':'ESTIMATE');if(c)circuits.push(c);
 c=circuit('Kitchen small-appliance',kitchenCircuits,20,'#12 Cu / 12/2 NM-B','12/2 NM-B with ground','NEC 2026 210.11(C)(1); 210.52(B)','At least two 20A small-appliance branch circuits when kitchen/dining/pantry receptacle scope exists; actual receptacle quantity remains layout-driven.','CODE MINIMUM');if(c)circuits.push(c);
 c=circuit('Bathroom receptacles',bathCircuits,20,'#12 Cu / 12/2 NM-B','12/2 NM-B with ground','NEC 2026 210.11(C)(3); 210.52(D)','Bathroom branch-circuit requirement is modeled only from confirmed Bathroom count. Device quantity/location remains sink/layout-driven; ambiguous powder/toilet rooms do not create a code-minimum device count.','CODE CIRCUIT / LAYOUT REQUIRED');if(c)circuits.push(c);
 c=circuit('Laundry',laundryCircuits,20,'#12 Cu / 12/2 NM-B','12/2 NM-B with ground','NEC 2026 210.11(C)(2); 210.52(F)','Code-minimum laundry branch-circuit model when a laundry area exists.','CODE MINIMUM');if(c)circuits.push(c);
 c=circuit('Garage receptacles',garageCircuits,20,'#12 Cu / 12/2 NM-B','12/2 NM-B with ground','NEC 2026 210.11(C)(4); 210.52(G)','Code-minimum garage branch-circuit model; actual receptacle placement/count must follow the project layout.','CODE MINIMUM');if(c)circuits.push(c);
 var violations=[];
 if(wall.known&&generalRecs<wall.count)violations.push({key:'generalReceptacles',status:'NON-COMPLIANT',minimum:wall.count,actual:generalRecs,reference:wall.reference,message:'General receptacles are below the minimum derived from the entered qualifying wall-space segments.'});
 var generalCable=Math.ceil((generalCircuits*35+generalRecs*12+lights*15+switches*6)*1.10);
 var kitchenCable=Math.ceil((kitchenCircuits*40+kitchenRecs*14)*1.10);
 var bathCable=Math.ceil((bathCircuits*35+bathRecs*12)*1.10);
 var laundryCable=Math.ceil((laundryCircuits*45)*1.10);
 var garageCable=Math.ceil((garageCircuits*45+garage*12)*1.10);
 var outdoorCable=Math.ceil((outdoorRecs*18)*1.10);
 var totalCable=generalCable+kitchenCable+bathCable+laundryCable+garageCable+outdoorCable;
 var bom={};
 add(bom,'15A duplex receptacle',generalRecs,'EA',wall.known?'Code/Layout':'Estimate','General-room quantity is code-derived only when a complete validated wall-segment list is entered.');
 add(bom,'20A GFCI receptacle',bathRecs+outdoorRecs,'EA','Design Allowance','Bathroom/powder device quantity is an estimating/design allowance, not a numeric 210.52(D) code minimum. Protection method and actual sink/location remain project dependent.');
 add(bom,'20A duplex receptacle',kitchenRecs+laundry+(garage?garage:0),'EA','Design','Kitchen device quantity is layout-driven; entered/estimated quantity is not a universal NEC count.');
 var deviceCount=generalRecs+bathRecs+kitchenRecs+laundry+(garage?garage:0)+outdoorRecs+switches;
 add(bom,'1-gang new-work device box',deviceCount-outdoorRecs,'EA');add(bom,'1-gang device wall plate allowance',deviceCount-outdoorRecs,'EA');
 add(bom,'1-gang weatherproof box',outdoorRecs,'EA');add(bom,'Extra-duty in-use weatherproof cover',outdoorRecs,'EA');
 add(bom,'Single-pole switch',switches,'EA');add(bom,'4 in LED wafer light allowance',lights,'EA');
 add(bom,wireItem,generalCable,'FT','Live Routing Model','35 ft/circuit + device/light/switch routing factors + 10% allowance; estimating model, not code footage.');
 add(bom,'12/2 NM-B with ground',kitchenCable+bathCable+laundryCable+garageCable+outdoorCable,'FT','Live Routing Model','Special-area routing estimate updates with device/circuit changes.');
 var b20=kitchenCircuits+bathCircuits+laundryCircuits+garageCircuits+(generalAmps===20?generalCircuits:0),b15=generalAmps===15?generalCircuits:0;
 add(bom,'20A 1-pole breaker',b20,'EA','Circuit Schedule','AFCI/GFCI strategy must match final design/AHJ.');add(bom,'15A 1-pole breaker',b15,'EA','Circuit Schedule','AFCI strategy must match final design/AHJ.');
 add(bom,'NM cable staple allowance',Math.ceil(totalCable/4),'EA','Live Routing Model');add(bom,'Small wire connector allowance',Math.ceil((deviceCount+lights)*1.5),'EA','Live Routing Model');
 var rows=Object.keys(bom).map(function(k){return bom[k]});
 var generalLoadVA=sqft*(R&&R.minimum?R.minimum.generalVAperFt2:2),smallApplianceVA=kitchens>0?2*1500:0,laundryVA=laundry>0?1500:0;
 var serviceNote='Changing ordinary receptacle quantity usually changes branch circuits, breakers, wire, panel spaces and BOM, but does not directly add dwelling service-load VA under the floor-area/general-load method. Major fixed loads must be entered in the Residential Load tool for service sizing.';
 var unresolvedLayout=!wall.known||baths>0||powder>0||kitchens>0;
 return{version:'residential-live-v2',inputs:{squareFeet:sqft,bedrooms:bedrooms,livingRooms:living,diningRooms:dining,offices:offices,bathrooms:baths,powderRooms:powder,kitchens:kitchens,laundryAreas:laundry,garageBays:garage},codeMinimums:{generalReceptacles:{known:wall.known,value:wall.known?wall.count:null,reference:wall.reference,basis:wall.basis,nonqualifyingSegments:wall.nonqualifyingSegments},bathroomReceptacles:{known:false,value:null,reference:'NEC 2026 210.52(D)',basis:'Receptacle quantity/location is tied to each sink and actual placement geometry. Bathroom/powder room count alone is insufficient for an exact device minimum.'},kitchenReceptacles:{known:false,value:null,reference:'NEC 2026 210.52(C)',basis:'Countertop/work-surface receptacle quantity is layout-driven and cannot be derived from kitchen count alone.'}},design:{generalReceptacles:generalRecs,bathroomReceptacles:bathRecs,kitchenReceptacles:kitchenRecs,outdoorReceptacles:outdoorRecs,lights:lights,switches:switches},summary:{habitableRooms:habitable,totalCircuits:totalCircuits,generalCircuits:generalCircuits,panelSpaces120V:totalCircuits,totalCableFt:totalCable,generalLoadVA:generalLoadVA,smallApplianceVA:smallApplianceVA,laundryVA:laundryVA,baseConnectedVA:generalLoadVA+smallApplianceVA+laundryVA},circuits:circuits,bom:rows,violations:violations,status:violations.length?'NON-COMPLIANT':(unresolvedLayout?'NO KNOWN CONFLICTS / LAYOUT REQUIRED':'NO KNOWN CONFLICTS / VERIFY'),serviceLoadNote:serviceNote,warnings:['General-room receptacle code minimum cannot be calculated from room count or square footage alone. Enter the complete wall-space segment list (feet) separated by commas; malformed or negative tokens fail closed.','Bathroom/powder receptacle quantity is a design allowance only. NEC 210.52(D) device quantity/location requires actual sink and placement geometry.','Kitchen receptacle quantity remains layout-driven under 210.52(C); kitchen count alone is insufficient for an exact device minimum.','Live cable footage is an estimating routing model, not an NEC minimum. Replace with measured plan takeoff when available.','Circuit grouping for general receptacles is a Bruno estimating/design assumption, not a code maximum device count.','AFCI/GFCI, dedicated equipment circuits, major loads, service/feeder sizing, grounding/bonding and local AHJ requirements remain separate verification layers.']};
}
root.BrunoResidentialLive=Object.freeze({calculate:calculate,wallMinimum:wallMinimum,parseSegments:parseSegments});
})(window);

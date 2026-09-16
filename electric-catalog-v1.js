/* Bruno Electric — editable estimating catalog starter.
 * Customer prices are placeholders only. Missing Your Cost stays unresolved until the user enters it.
 */
(function (root) {
  'use strict';
  const ITEMS = [
    ['svc-meter-main-200','SERVICE / PANELS','200A meter/main combo','EA'],
    ['svc-panel-200-40','SERVICE / PANELS','200A main breaker panel 40-space','EA'],
    ['svc-sub-125','SERVICE / PANELS','125A subpanel','EA'],
    ['br-1p20','SERVICE / PANELS','20A 1-pole breaker','EA'],
    ['br-2p30','SERVICE / PANELS','30A 2-pole breaker','EA'],
    ['br-2p40','SERVICE / PANELS','40A 2-pole breaker','EA'],
    ['br-2p50','SERVICE / PANELS','50A 2-pole breaker','EA'],
    ['br-2p60','SERVICE / PANELS','60A 2-pole breaker','EA'],
    ['disc-60-nf','SERVICE / PANELS','60A non-fused disconnect','EA'],
    ['disc-60-f','SERVICE / PANELS','60A fused disconnect','EA'],
    ['thhn-cu-14','CONDUCTORS','14 AWG Cu THHN/THWN-2','FT'],
    ['thhn-cu-12','CONDUCTORS','12 AWG Cu THHN/THWN-2','FT'],
    ['thhn-cu-10','CONDUCTORS','10 AWG Cu THHN/THWN-2','FT'],
    ['thhn-cu-8','CONDUCTORS','8 AWG Cu THHN/THWN-2','FT'],
    ['thhn-cu-6','CONDUCTORS','6 AWG Cu THHN/THWN-2','FT'],
    ['thhn-cu-4','CONDUCTORS','4 AWG Cu THHN/THWN-2','FT'],
    ['thhn-al-2','CONDUCTORS','2 AWG Al XHHW-2','FT'],
    ['nmb-14-2','CONDUCTORS','14/2 NM-B with ground','FT'],
    ['nmb-12-2','CONDUCTORS','12/2 NM-B with ground','FT'],
    ['nmb-10-2','CONDUCTORS','10/2 NM-B with ground','FT'],
    ['ser-4-0-al','CONDUCTORS','4/0 Al SER cable','FT'],
    ['emt-050','RACEWAY','1/2 in EMT','FT'],
    ['emt-075','RACEWAY','3/4 in EMT','FT'],
    ['emt-100','RACEWAY','1 in EMT','FT'],
    ['pvc40-100','RACEWAY','1 in PVC Schedule 40','FT'],
    ['emt-cpl-075','RACEWAY','3/4 in EMT coupling','EA'],
    ['emt-con-075','RACEWAY','3/4 in EMT connector','EA'],
    ['strap-emt-075','RACEWAY','3/4 in EMT one-hole strap','EA'],
    ['box-1g-old','BOXES','1-gang old-work device box','EA'],
    ['box-1g-new','BOXES','1-gang new-work device box','EA'],
    ['box-4sq-212','BOXES','4 in square box 2-1/8 deep','EA'],
    ['box-wp-1g','BOXES','1-gang weatherproof box','EA'],
    ['cover-wp-inuse','BOXES','Extra-duty in-use weatherproof cover','EA'],
    ['rec-15','DEVICES','15A duplex receptacle','EA'],
    ['rec-20','DEVICES','20A duplex receptacle','EA'],
    ['gfci-20','DEVICES','20A GFCI receptacle','EA'],
    ['sw-sp','DEVICES','Single-pole switch','EA'],
    ['sw-3w','DEVICES','3-way switch','EA'],
    ['dim-led','DEVICES','LED dimmer','EA'],
    ['rec-1450','EV','NEMA 14-50 receptacle allowance','EA'],
    ['evse-allow','EV','EVSE equipment allowance','EA'],
    ['ev-disc','EV','EV local disconnect allowance','EA'],
    ['hvac-disc-nf','HVAC ELECTRICAL','HVAC non-fused disconnect','EA'],
    ['hvac-disc-f','HVAC ELECTRICAL','HVAC fused disconnect','EA'],
    ['hvac-whip-6','HVAC ELECTRICAL','6 ft liquidtight HVAC whip allowance','EA'],
    ['lfmc-075','HVAC ELECTRICAL','3/4 in LFMC/LFNC allowance','FT'],
    ['tstat-18-8','HVAC ELECTRICAL','18/8 thermostat/control cable','FT'],
    ['gr-8cu','GROUNDING','8 AWG bare copper grounding conductor','FT'],
    ['gr-6cu','GROUNDING','6 AWG bare copper grounding conductor','FT'],
    ['ground-rod','GROUNDING','5/8 in x 8 ft grounding electrode rod','EA'],
    ['ground-clamp','GROUNDING','Listed ground rod clamp','EA'],
    ['wafer-4','LIGHTING','4 in LED wafer light allowance','EA'],
    ['wafer-6','LIGHTING','6 in LED wafer light allowance','EA'],
    ['ext-light','LIGHTING','Exterior wall light allowance','EA'],
    ['wirenut-sm','FASTENERS / CONSUMABLES','Small wire connector allowance','EA'],
    ['wirenut-lg','FASTENERS / CONSUMABLES','Large wire connector allowance','EA'],
    ['tape-elec','FASTENERS / CONSUMABLES','Electrical tape roll','EA'],
    ['firestop','FASTENERS / CONSUMABLES','Firestop sealant allowance','EA'],
    ['label-panel','FASTENERS / CONSUMABLES','Panel/circuit labels allowance','EA'],
    ['staple-nm','FASTENERS / CONSUMABLES','NM cable staple allowance','EA']
  ].map(function (r) {
    return {id:'ecat-'+r[0],category:r[1],item:r[2],units:r[3],unitCost:0,yourCost:'',vendor:'',part:'',notes:'Estimating placeholder — customer price and Your Cost require user input',priceStatus:'PLACEHOLDER',catalogVersion:'electric-v2'};
  });

  // Stage 5 Electrical Tasks catalog coverage. These are reusable definitions only;
  // they do not imply a project requirement and they never supply Your Cost automatically.
  const TASK_WIRE_SIZES = ['3','2','1','1/0','2/0','3/0','4/0','250','300','350','400','500','600','700','750','800','900','1000'];
  ['Cu','Al'].forEach(function(material){
    TASK_WIRE_SIZES.forEach(function(size){
      const id='ecat-thhn-'+material.toLowerCase()+'-'+size.replace('/','-');
      if(ITEMS.some(function(x){return x.id===id;}))return;
      ITEMS.push({id:id,category:'CONDUCTORS',item:size+(Number(size)>=250?' kcmil':' AWG')+' '+material+' THHN/THWN-2',units:'FT',unitCost:0,yourCost:'',vendor:'',part:'',notes:'Electrical Tasks standard definition — enter Customer Price and Your Cost before pricing',priceStatus:'PLACEHOLDER',catalogVersion:'electric-v2'});
    });
  });
  const TASK_RACEWAYS = [
    ['emt-125','1-1/4 in EMT'],['emt-150','1-1/2 in EMT'],['emt-200','2 in EMT'],['emt-250','2-1/2 in EMT'],['emt-300','3 in EMT'],['emt-350','3-1/2 in EMT'],['emt-400','4 in EMT'],
    ['pvc40-050','1/2 in PVC Schedule 40'],['pvc40-075','3/4 in PVC Schedule 40'],['pvc40-125','1-1/4 in PVC Schedule 40'],['pvc40-150','1-1/2 in PVC Schedule 40'],['pvc40-200','2 in PVC Schedule 40'],['pvc40-250','2-1/2 in PVC Schedule 40'],['pvc40-300','3 in PVC Schedule 40'],['pvc40-350','3-1/2 in PVC Schedule 40'],['pvc40-400','4 in PVC Schedule 40'],['pvc40-500','5 in PVC Schedule 40'],['pvc40-600','6 in PVC Schedule 40']
  ];
  TASK_RACEWAYS.forEach(function(r){
    const id='ecat-'+r[0];if(ITEMS.some(function(x){return x.id===id;}))return;
    ITEMS.push({id:id,category:'RACEWAY',item:r[1],units:'FT',unitCost:0,yourCost:'',vendor:'',part:'',notes:'Electrical Tasks standard definition — enter Customer Price and Your Cost before pricing',priceStatus:'PLACEHOLDER',catalogVersion:'electric-v2'});
  });

  function norm(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g,' '); }
  function mergeMissing(existing) {
    const out = Array.isArray(existing) ? existing.slice() : [];
    const ids = new Set(out.map(x => x && x.id).filter(Boolean));
    const names = new Set(out.map(x => norm(x && x.item)).filter(Boolean));
    ITEMS.forEach(function (seed) {
      if (ids.has(seed.id) || names.has(norm(seed.item))) return;
      out.push(Object.assign({}, seed));
    });
    return out;
  }

  root.BrunoElectricalCatalogV1 = Object.freeze({items:ITEMS,mergeMissing:mergeMissing,version:'electric-v2',pricePolicy:'Customer-price placeholders may be zero; blank/missing Your Cost is unresolved. User-edited prices/costs persist and are never overwritten by catalog completion.'});
})(window);
/* Bruno Electric — electrical reference/rule data. Phase 1.
 * Code values are isolated here so UI/calculation logic does not bury code constants.
 * Authority: Texas TDLR 16 TAC Ch. 73 §73.100 adoption notice (effective 2026-09-01)
 * and NFPA 70 (NEC) 2026. Local AHJ amendments remain field/AHJ verification items.
 */
(function (root) {
  'use strict';

  const META = Object.freeze({
    trade: 'electrical',
    jurisdiction: 'Texas',
    codeFamily: 'NEC',
    edition: '2026',
    effectiveDate: '2026-09-01',
    stateSource: 'https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/',
    codeSource: 'https://link.nfpa.org/free-access/publications/70/2026',
    ahjOverridePossible: true,
    note: 'Texas adopted the 2026 NEC effective 2026-09-01 with a limited state exception to 210.8(F) for certain outdoor HVAC equipment outlets. Verify local AHJ amendments.'
  });

  // NEC Table 310.16 subset used by Phase 1 calculator (A). Values intentionally centralized.
  const AMPACITY = Object.freeze({
    Cu: {
      '14': [20,20,25], '12': [20,25,30], '10': [30,35,40], '8': [40,50,55],
      '6': [55,65,75], '4': [70,85,95], '3': [85,100,115], '2': [95,115,130],
      '1': [110,130,150], '1/0': [125,150,170], '2/0': [145,175,195], '3/0': [165,200,225], '4/0': [195,230,260]
    },
    Al: {
      '12': [15,20,25], '10': [25,30,35], '8': [30,40,45], '6': [40,50,55],
      '4': [55,65,75], '3': [65,75,85], '2': [75,90,100], '1': [85,100,115],
      '1/0': [100,120,135], '2/0': [115,135,150], '3/0': [130,155,175], '4/0': [150,180,205]
    }
  });

  // NEC 310.15(C)(1), number of current-carrying conductors in raceway/cable.
  const CCC_FACTORS = Object.freeze([
    {min:1,max:3,factor:1.00}, {min:4,max:6,factor:0.80}, {min:7,max:9,factor:0.70},
    {min:10,max:20,factor:0.50}, {min:21,max:30,factor:0.45}, {min:31,max:40,factor:0.40},
    {min:41,max:Infinity,factor:0.35}
  ]);

  // NEC 310.15(B)(1)(1) correction factors, 30°C ambient baseline. Phase-1 supported range 10–80°C.
  const TEMP_FACTORS = Object.freeze({
    60: [[10,1.29],[15,1.22],[20,1.15],[25,1.08],[30,1.00],[35,0.91],[40,0.82],[45,0.71],[50,0.58],[55,0.41]],
    75: [[10,1.20],[15,1.15],[20,1.11],[25,1.05],[30,1.00],[35,0.94],[40,0.88],[45,0.82],[50,0.75],[55,0.67],[60,0.58],[65,0.47],[70,0.33]],
    90: [[10,1.15],[15,1.11],[20,1.08],[25,1.04],[30,1.00],[35,0.96],[40,0.91],[45,0.87],[50,0.82],[55,0.76],[60,0.71],[65,0.65],[70,0.58],[75,0.50],[80,0.41]]
  });

  // Chapter 9 Table 5 — THHN/THWN-2 approximate occupied areas in in², supported subset.
  const THHN_AREA = Object.freeze({
    '14':0.0097,'12':0.0133,'10':0.0211,'8':0.0366,'6':0.0507,'4':0.0824,
    '3':0.0973,'2':0.1158,'1':0.1562,'1/0':0.1855,'2/0':0.2223,'3/0':0.2679,'4/0':0.3237
  });

  // Chapter 9 Table 4 usable internal cross-sectional area in in²; Phase-1 common trade sizes.
  const RACEWAY_AREA = Object.freeze({
    EMT: {'1/2':0.304,'3/4':0.533,'1':0.864,'1-1/4':1.496,'1-1/2':2.036,'2':3.356},
    'PVC40': {'1/2':0.285,'3/4':0.508,'1':0.832,'1-1/4':1.453,'1-1/2':1.986,'2':3.291}
  });

  const BOX_FILL = Object.freeze({'18':1.50,'16':1.75,'14':2.00,'12':2.25,'10':2.50,'8':3.00,'6':5.00});
  const CMIL = Object.freeze({'14':4110,'12':6530,'10':10380,'8':16510,'6':26240,'4':41740,'3':52620,'2':66360,'1':83690,'1/0':105600,'2/0':133100,'3/0':167800,'4/0':211600});

  const REFERENCES = Object.freeze({
    ampacity: {status:'Code Required', section:'310.16; 310.15(B); 310.15(C)(1); 110.14(C)', source:META.codeSource},
    conduitFill: {status:'Code Required', section:'Chapter 9, Tables 1, 4, 5', source:META.codeSource},
    boxFill: {status:'Code Required', section:'314.16(B)', source:META.codeSource},
    voltageDrop: {status:'Recommended', section:'Informational Notes associated with 210.19 and 215.2; not a general mandatory branch-circuit percentage limit', source:META.codeSource},
    continuousLoad: {status:'Code Required', section:'210.20 / applicable equipment article; verify specific circuit rule', source:META.codeSource},
    texasOutdoorHvacGfci: {status:'Code Required', section:'Texas amendment to NEC 210.8(F)', source:META.stateSource}
  });

  root.BrunoElectricalRules = Object.freeze({META, AMPACITY, CCC_FACTORS, TEMP_FACTORS, THHN_AREA, RACEWAY_AREA, BOX_FILL, CMIL, REFERENCES});
})(window);

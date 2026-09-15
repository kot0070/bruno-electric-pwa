/* Bruno Electric — Residential Estimator Phase 2 rule data.
 * Texas NEC 2026 baseline. Keep code constants isolated from UI/engine logic.
 */
(function(root){
'use strict';
const R=Object.freeze({
  version:'residential-phase2-2026',
  references:Object.freeze({
    minimumUnitLoad:'NEC 2026 120.41',
    lightingDemand:'NEC 2026 Table 120.45',
    smallApplianceLaundry:'NEC 2026 120.52; 210.11(C)(1)-(3)',
    fixedAppliances:'NEC 2026 120.53',
    dryer:'NEC 2026 120.54',
    cooking:'NEC 2026 120.55',
    noncoincident:'NEC 2026 120.60',
    serviceConductors:'NEC 2026 310.12'
  }),
  minimum:Object.freeze({
    generalVAperFt2:3,
    smallApplianceCircuits:2,
    smallApplianceVAperCircuit:1500,
    laundryCircuits:1,
    laundryVAperCircuit:1500,
    bathroom20ACircuits:1
  }),
  lightingDemand:Object.freeze({firstVA:3000,firstPct:1,midLimitVA:120000,midPct:.35,overPct:.25}),
  fixedApplianceDemand:Object.freeze({minimumCount:4,factor:.75}),
  dryer:Object.freeze({fallbackVA:5000}),
  singleCooking:Object.freeze({maxAutoNameplateKW:12,columnCDemandVA:8000}),
  serviceRatings:Object.freeze([100,125,150,175,200,225,250,300,350,400]),
  serviceConductors:Object.freeze({
    100:{Cu:'4',Al:'2'},125:{Cu:'2',Al:'1/0'},150:{Cu:'1',Al:'2/0'},175:{Cu:'1/0',Al:'3/0'},
    200:{Cu:'2/0',Al:'4/0'},225:{Cu:'3/0',Al:'250 kcmil'},250:{Cu:'4/0',Al:'300 kcmil'},
    300:{Cu:'250 kcmil',Al:'350 kcmil'},350:{Cu:'350 kcmil',Al:'500 kcmil'},400:{Cu:'400 kcmil',Al:'600 kcmil'}
  })
});
root.BrunoResidentialRules=R;
})(window);

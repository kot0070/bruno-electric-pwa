/* Bruno Electric — Phase 3 electrical rule data. Texas NEC 2026 baseline. */
(function(root){
'use strict';
const R=Object.freeze({
  version:'electrical-phase3-2026',
  references:Object.freeze({
    evse:'NEC 2026 Article 625/627 EV power transfer branch-circuit and continuous-load rules',
    hvac:'NEC 2026 Article 440; equipment nameplate MCA/MOCP',
    motorConductors:'NEC 2026 430.22',
    motorOverload:'NEC 2026 430.32',
    motorScgf:'NEC 2026 430.52(C)(1)',
    motorEgc:'NEC 2026 250.122(F) Motor Circuits',
    egc:'NEC 2026 250.122',
    gec:'NEC 2026 250.66',
    feederContinuous:'NEC 2026 215 / applicable OCPD rules; 125% continuous load treatment'
  }),
  standardOcpd:Object.freeze([10,15,20,25,30,35,40,45,50,60,70,80,90,100,110,125,150,175,200,225,250,300,350,400,450,500,600,700,800,1000,1200,1600,2000,2500,3000,4000,5000,6000]),
  fuseOnlyOcpd:Object.freeze([1,3,6,601]),
  egcTable:Object.freeze([
    {maxA:15,Cu:'14',Al:'12'},{maxA:20,Cu:'12',Al:'10'},{maxA:60,Cu:'10',Al:'8'},{maxA:100,Cu:'8',Al:'6'},
    {maxA:200,Cu:'6',Al:'4'},{maxA:300,Cu:'4',Al:'2'},{maxA:400,Cu:'3',Al:'1'},{maxA:500,Cu:'2',Al:'1/0'},
    {maxA:600,Cu:'1',Al:'2/0'},{maxA:800,Cu:'1/0',Al:'3/0'},{maxA:1000,Cu:'2/0',Al:'4/0'},{maxA:1200,Cu:'3/0',Al:'250 kcmil'},
    {maxA:1600,Cu:'4/0',Al:'350 kcmil'},{maxA:2000,Cu:'250 kcmil',Al:'400 kcmil'},{maxA:2500,Cu:'350 kcmil',Al:'600 kcmil'},
    {maxA:3000,Cu:'400 kcmil',Al:'600 kcmil'},{maxA:4000,Cu:'500 kcmil',Al:'750 kcmil'},{maxA:5000,Cu:'700 kcmil',Al:'1250 kcmil'},
    {maxA:6000,Cu:'800 kcmil',Al:'1250 kcmil'}
  ]),
  gecTable:Object.freeze([
    {cuMax:'2',alMax:'1/0',Cu:'8',Al:'6'},
    {cuMax:'1/0',alMax:'3/0',Cu:'6',Al:'4'},
    {cuMax:'3/0',alMax:'250 kcmil',Cu:'4',Al:'2'},
    {cuMax:'350 kcmil',alMax:'500 kcmil',Cu:'2',Al:'1/0'},
    {cuMax:'600 kcmil',alMax:'900 kcmil',Cu:'1/0',Al:'3/0'},
    {cuMax:'1100 kcmil',alMax:'1750 kcmil',Cu:'2/0',Al:'4/0'},
    {cuMax:'OVER',alMax:'OVER',Cu:'3/0',Al:'250 kcmil'}
  ]),
  motor:Object.freeze({
    conductorFactor:1.25,
    overloadHighSfFactor:1.25,
    overloadOtherFactor:1.15,
    commonAcScgf:Object.freeze({nonTimeDelayFuse:3.00,timeDelayFuse:1.75,inverseTimeBreaker:2.50})
  }),
  evse:Object.freeze({continuousFactor:1.25})
});
root.BrunoPhase3Rules=R;
})(window);

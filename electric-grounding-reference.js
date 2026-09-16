/* Bruno Electric — Stage 4 grounding reference subset. Keep code table values outside UI logic. */
(function(root){
'use strict';
var META=root.BrunoElectricalRules&&root.BrunoElectricalRules.META;
var EGC_250_122=Object.freeze([
  {maxOcpd:15,Cu:'14',Al:'12'},
  {maxOcpd:20,Cu:'12',Al:'10'},
  {maxOcpd:60,Cu:'10',Al:'8'},
  {maxOcpd:100,Cu:'8',Al:'6'},
  {maxOcpd:200,Cu:'6',Al:'4'},
  {maxOcpd:300,Cu:'4',Al:'2'},
  {maxOcpd:400,Cu:'3',Al:'1'},
  {maxOcpd:500,Cu:'2',Al:'1/0'},
  {maxOcpd:600,Cu:'1',Al:'2/0'},
  {maxOcpd:800,Cu:'1/0',Al:'3/0'},
  {maxOcpd:1000,Cu:'2/0',Al:'4/0'},
  {maxOcpd:1200,Cu:'3/0',Al:'250'}
]);
root.BrunoGroundingReference=Object.freeze({
  EGC_250_122:EGC_250_122,
  supportedMaxOcpd:1200,
  references:Object.freeze({
    egc:{status:'Code Required',section:'250.122; supported table subset through 1200 A',source:META&&META.codeSource},
    egcUpsize:{status:'Code Review Required',section:'250.122(B); wire-type EGC increase when ungrounded conductors are increased in size',source:META&&META.codeSource},
    parallelEgcs:{status:'Code Required',section:'250.122(F); parallel conductors / multiple raceways require dedicated review of EGC in each raceway',source:META&&META.codeSource}
  })
});
})(typeof window!=='undefined'?window:globalThis);

/* Bruno Electric — canonical app information architecture shared by all shells. */
(function(){
'use strict';
var groups=[
  {key:'JOB',label:'Journal',icon:'◷',defaultTab:'dispatch',items:[['dispatch','Call Journal']]},
  {key:'ELECTRICAL',label:'Calculator',icon:'⚡',defaultTab:'__tools',items:[['__tools','Project Calculator']]},
  {key:'BILLING',label:'Job',icon:'▣',defaultTab:'quote',items:[['quote','Customer Price / Quote'],['tm','Invoice'],['summary','Summary'],['cos','Change Orders']]},
  {key:'ESTIMATE',label:'Catalog',icon:'≡',defaultTab:'catalog',items:[['catalog','Materials Catalog'],['materials','Job Materials'],['margins','Pricing & Margins']]},
  {key:'MORE',label:'More',icon:'•••',defaultTab:'labor',items:[['labor','Labor & Equipment'],['pnl','Profit & Loss'],['personnel','Workers'],['profiles','Company'],['reference','Reference'],['help','Help']]}
];
function group(key){for(var i=0;i<groups.length;i++)if(groups[i].key===key)return groups[i];return groups[0]}
function groupForTab(tab){for(var i=0;i<groups.length;i++)for(var j=0;j<groups[i].items.length;j++)if(groups[i].items[j][0]===tab)return groups[i];return groups[0]}
function workspaceHref(key,tab){if(key==='ELECTRICAL'||tab==='__tools')return './electrical-tools.html';var h='#be='+encodeURIComponent(key);if(tab)h+='&tab='+encodeURIComponent(tab);return './index.html'+h}
window.BrunoElectricAppNavigation={groups:groups,group:group,groupForTab:groupForTab,workspaceHref:workspaceHref};
})();
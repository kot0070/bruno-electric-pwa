/* Bruno Electric — canonical app information architecture shared by all shells. */
(function(){
'use strict';
var groups=[
  {key:'JOB',label:'Job',icon:'▣',defaultTab:'quote',items:[['quote','Quote'],['summary','Summary'],['cos','Change Orders']]},
  {key:'ESTIMATE',label:'Estimate',icon:'≡',defaultTab:'materials',items:[['materials','Job Materials'],['catalog','Catalog'],['labor','Labor & Equipment'],['margins','Margins']]},
  {key:'ELECTRICAL',label:'Electrical',icon:'⚡',defaultTab:'__tools',items:[['__tools','Electrical Tools']]},
  {key:'BILLING',label:'Billing',icon:'$',defaultTab:'tm',items:[['tm','T&M Invoice'],['pnl','Profit & Loss']]},
  {key:'MORE',label:'More',icon:'•••',defaultTab:'dispatch',items:[['dispatch','Dispatch'],['personnel','Workers'],['profiles','Company'],['reference','Reference'],['help','Help']]}
];
function group(key){for(var i=0;i<groups.length;i++)if(groups[i].key===key)return groups[i];return groups[0]}
function groupForTab(tab){for(var i=0;i<groups.length;i++)for(var j=0;j<groups[i].items.length;j++)if(groups[i].items[j][0]===tab)return groups[i];return groups[0]}
function workspaceHref(key,tab){if(key==='ELECTRICAL'||tab==='__tools')return './electrical-tools.html';var h='#be='+encodeURIComponent(key);if(tab)h+='&tab='+encodeURIComponent(tab);return './index.html'+h}
window.BrunoElectricAppNavigation={groups:groups,group:group,groupForTab:groupForTab,workspaceHref:workspaceHref};
})();
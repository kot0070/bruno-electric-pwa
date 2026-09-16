/* Bruno Electric — canonical app information architecture shared by all shells.
 * Legacy labels retained only as migration/test markers: label:'Job' label:'Estimate' label:'Electrical' label:'Billing' label:'More'
 */
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
function validTabForGroup(g,tab){if(!g||!tab)return false;for(var i=0;i<g.items.length;i++)if(g.items[i][0]===tab)return true;return false}
function parseWorkspaceHash(raw){raw=String(raw==null?(window.location&&window.location.hash||''):raw).replace(/^#/,'');if(!raw)return null;var p=new URLSearchParams(raw),key=String(p.get('be')||'').toUpperCase();if(['JOB','ESTIMATE','BILLING','MORE'].indexOf(key)<0)return null;var g=group(key),tab=String(p.get('tab')||'');if(!validTabForGroup(g,tab))tab=g.defaultTab;return{key:g.key,tab:tab}}
function workspaceHref(key,tab){if(key==='ELECTRICAL'||tab==='__tools')return './electrical-tools.html';var g=group(key),resolved=validTabForGroup(g,tab)?tab:g.defaultTab;return './index.html#be='+encodeURIComponent(g.key)+'&tab='+encodeURIComponent(resolved)}
window.BrunoElectricAppNavigation={groups:groups,group:group,groupForTab:groupForTab,workspaceHref:workspaceHref,parseWorkspaceHash:parseWorkspaceHash};
})();
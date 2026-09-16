/* Bruno Electric — canonical section restore for cross-page navigation. */
(function(){
'use strict';
var NAV=window.BrunoElectricAppNavigation;
function parseHash(){if(NAV&&typeof NAV.parseWorkspaceHash==='function')return NAV.parseWorkspaceHash(location.hash);var raw=String(location.hash||'').replace(/^#/,'');if(!raw)return null;var p=new URLSearchParams(raw);var key=String(p.get('be')||'').toUpperCase();var tab=String(p.get('tab')||'');if(['JOB','ESTIMATE','BILLING','MORE'].indexOf(key)<0)return null;return{key:key,tab:tab}}
function targetElement(target){var el=null;if(target&&target.tab)el=document.querySelector('.be-nav-btn[data-tab="'+target.tab+'"],.be-section-grid [data-tab="'+target.tab+'"]');if(!el&&target)el=document.querySelector('.be-primary-btn[data-group="'+target.key+'"],.be-bottom [data-group="'+target.key+'"]');return el}
function restoreSection(){var target=parseHash();if(!target)return false;var el=targetElement(target);if(!el)return false;el.click();return true}
function restoreWhenReady(){if(restoreSection())return;var tries=0,t=setInterval(function(){if(restoreSection()||++tries>40)clearInterval(t)},25)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreWhenReady,{once:true});else restoreWhenReady();
window.addEventListener('hashchange',restoreWhenReady);
})();
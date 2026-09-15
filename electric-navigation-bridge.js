/* Bruno Electric — canonical section restore for cross-page navigation. */
(function(){
'use strict';
function parseHash(){var raw=String(location.hash||'').replace(/^#/,'');if(!raw)return null;var p=new URLSearchParams(raw);var key=String(p.get('be')||'').toUpperCase();var tab=String(p.get('tab')||'');if(['JOB','ESTIMATE','BILLING','MORE'].indexOf(key)<0)return null;return{key:key,tab:tab}}
function restoreSection(){var target=parseHash();if(!target)return;var tries=0,t=setInterval(function(){var el=null;if(target.tab)el=document.querySelector('.be-nav-btn[data-tab="'+target.tab+'"],.be-section-grid [data-tab="'+target.tab+'"]');if(!el)el=document.querySelector('.be-primary-btn[data-group="'+target.key+'"],.be-bottom [data-group="'+target.key+'"]');if(el){clearInterval(t);history.replaceState(null,'',location.pathname+location.search);el.click();return}if(++tries>50)clearInterval(t)},50)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreSection,{once:true});else restoreSection();
})();
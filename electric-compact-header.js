/* Bruno Electric — compact global header actions + contextual totals visibility. */
(function(){
'use strict';
if(/electrical-tools\.html$/i.test(location.pathname))return;

var RELEVANT_TOTAL_TABS={quote:1,materials:1,margins:1,labor:1,summary:1,cos:1,tm:1,pnl:1};
function q(sel){return document.querySelector(sel)}
function activeTab(){var a=q('#nav-tabs .nav-tab.active');return a&&a.dataset.tab||'quote'}
function syncTotals(){var totals=document.getElementById('live-totals');if(!totals)return;var show=!!RELEVANT_TOTAL_TABS[activeTab()];totals.classList.toggle('be-totals-hidden',!show);totals.setAttribute('aria-hidden',show?'false':'true')}
function clickId(id){var el=document.getElementById(id);if(el)el.click()}
function printCurrent(){if(activeTab()==='tm')clickId('btn-print-tm');else clickId('btn-print-quote')}
function closeMore(menu,btn){if(!menu||!btn)return;menu.hidden=true;btn.setAttribute('aria-expanded','false')}
function install(){
  var actions=q('.header-actions');if(!actions||actions.dataset.beCompact==='1')return;
  actions.dataset.beCompact='1';
  var quote=document.getElementById('btn-print-quote'),invoice=document.getElementById('btn-print-tm'),reset=document.getElementById('btn-reset');
  if(!quote||!invoice||!reset)return;

  var overflow=document.createElement('div');overflow.className='be-header-more';overflow.hidden=true;overflow.setAttribute('role','menu');
  var moveIds=['btn-export','btn-import','btn-export-app','btn-import-app','btn-blank'];
  moveIds.forEach(function(id){var el=document.getElementById(id);if(!el)return;var node=el.tagName==='INPUT'&&el.parentElement&&el.parentElement.tagName==='LABEL'?el.parentElement:el;overflow.appendChild(node)});
  quote.style.display='none';invoice.style.display='none';

  var print=document.createElement('button');print.type='button';print.className='btn btn-sm btn-accent be-head-main';print.id='btn-compact-print';print.textContent='Print';print.title='Print current customer document';print.addEventListener('click',printCurrent);
  reset.textContent='Reset';reset.classList.add('be-head-main');
  var more=document.createElement('button');more.type='button';more.className='btn btn-sm be-head-main';more.id='btn-compact-more';more.textContent='More';more.setAttribute('aria-haspopup','menu');more.setAttribute('aria-expanded','false');
  more.addEventListener('click',function(e){e.stopPropagation();var next=overflow.hidden;overflow.hidden=!next;more.setAttribute('aria-expanded',next?'true':'false')});

  actions.innerHTML='';actions.appendChild(print);actions.appendChild(reset);actions.appendChild(more);actions.appendChild(overflow);
  document.addEventListener('click',function(e){if(!actions.contains(e.target))closeMore(overflow,more)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMore(overflow,more)});

  var style=document.createElement('style');style.textContent='\
.header-actions{position:relative;flex-wrap:nowrap!important;gap:.35rem!important}\
.header-actions .be-head-main{min-height:36px!important;padding:.35rem .65rem!important;font-size:.78rem!important}\
.be-header-more{position:absolute;right:0;top:calc(100% + 6px);z-index:260;min-width:210px;padding:7px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow)}\
.be-header-more[hidden]{display:none!important}.be-header-more>.btn,.be-header-more>label.btn{display:flex!important;width:100%;justify-content:flex-start;margin:0 0 5px!important;min-height:36px!important;font-size:.78rem!important}.be-header-more>.btn:last-child,.be-header-more>label.btn:last-child{margin-bottom:0!important}\
.live-totals.be-totals-hidden{display:none!important}\
@media(max-width:767.98px){.app-header{padding:.55rem .8rem!important;gap:.45rem!important}.brand-mark{width:36px!important;height:36px!important}.brand-text h1{font-size:.92rem!important}.brand-text p{font-size:.66rem!important}.header-actions{width:100%!important;justify-content:flex-start!important}.header-actions .be-head-main{flex:0 0 auto;min-height:34px!important;padding:.28rem .58rem!important;font-size:.74rem!important}.be-header-more{left:0;right:auto;top:calc(100% + 5px);min-width:205px}.live-totals{padding:.4rem .75rem!important;gap:.35rem!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}.total-chip{padding:.26rem .42rem!important;border-radius:7px!important;min-width:0!important}.total-chip .lbl{font-size:.55rem!important;line-height:1.15!important}.total-chip .val{font-size:.78rem!important;line-height:1.15!important}.total-chip.highlight .val{font-size:.86rem!important}}\
@media(min-width:768px){.header-actions .be-head-main{min-width:64px}}';document.head.appendChild(style);

  var tabs=document.getElementById('nav-tabs');if(tabs)tabs.addEventListener('click',function(){setTimeout(syncTotals,0)});
  var observer=new MutationObserver(syncTotals);if(tabs)observer.observe(tabs,{subtree:true,attributes:true,attributeFilter:['class']});
  syncTotals();
  window.BrunoCompactHeader={syncTotals:syncTotals,relevantTabs:Object.keys(RELEVANT_TOTAL_TABS)};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

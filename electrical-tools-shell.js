/* Bruno Electric — Electrical Tools app-section shell.
 * Electrical is a first-class section with the same mobile bottom navigation.
 */
(function(){
'use strict';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function addStyle(css){var s=document.createElement('style');s.textContent=css;document.head.appendChild(s)}
addStyle(`
  .be-tool-picker{display:none}.be-tools-bottom{display:none}
  @media(max-width:900px){
    #tool-nav{display:none!important}
    .top{position:static!important}
    .be-tool-picker{position:sticky;top:0;z-index:16;display:grid;grid-template-columns:minmax(0,1fr);gap:8px;align-items:center;padding:8px 12px;background:#111923;border-bottom:1px solid var(--border)}
    .be-tool-picker label{display:block;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}
    .be-tool-picker select{width:100%;min-height:42px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-weight:700}
    .be-tool-home{display:none!important}
    .work{padding:12px 12px calc(88px + env(safe-area-inset-bottom,0px))!important}
    .be-tools-bottom{position:fixed;left:0;right:0;bottom:0;z-index:190;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:7px max(72px,env(safe-area-inset-right,0px)) calc(7px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));background:#101820;border-top:1px solid var(--border);box-shadow:0 -8px 24px rgba(0,0,0,.32)}
    .be-tools-bottom button{appearance:none;border:0;background:transparent;color:var(--muted);border-radius:10px;min-width:0;padding:7px 2px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:10px;font-weight:750;line-height:1.1}
    .be-tools-bottom button .ico{font-size:18px;line-height:18px;font-weight:800}
    .be-tools-bottom button.active{background:var(--card);color:#ffd07a}
  }
  @media print{.be-tool-picker,.be-tools-bottom{display:none!important}}
`);

var categoryOrder=[
  {label:'Core Calculators',ids:['amp','vd','cf','bf']},
  {label:'Residential',ids:['res','res-takeoff']},
  {label:'Equipment & Distribution',ids:['ev3','hv3','mo3','gr3','fd3']},
  {label:'Catalog & Reference',ids:['cat','ref']}
];

function installPrimaryNav(){
  if(document.getElementById('be-tools-bottom'))return;
  var nav=document.createElement('nav');nav.id='be-tools-bottom';nav.className='be-tools-bottom no-print';nav.setAttribute('aria-label','Primary mobile navigation');
  var items=[
    ['JOB','Job','▣','./index.html#be=JOB'],
    ['ESTIMATE','Estimate','≡','./index.html#be=ESTIMATE'],
    ['ELECTRICAL','Electrical','⚡',''],
    ['BILLING','Billing','$','./index.html#be=BILLING'],
    ['MORE','More','•••','./index.html#be=MORE']
  ];
  items.forEach(function(item){var b=document.createElement('button');b.type='button';b.dataset.group=item[0];b.innerHTML='<span class="ico" aria-hidden="true">'+item[2]+'</span><span>'+item[1]+'</span>';if(item[0]==='ELECTRICAL'){b.classList.add('active');b.setAttribute('aria-current','page')}else b.addEventListener('click',function(){location.href=item[3]});nav.appendChild(b)});
  document.body.appendChild(nav);
}

function install(){
  var nav=document.getElementById('tool-nav');var layout=q('.layout');if(!nav||!layout||document.getElementById('be-tool-picker'))return;
  var picker=document.createElement('div');picker.id='be-tool-picker';picker.className='be-tool-picker no-print';picker.innerHTML='<div><label for="be-tool-select">Electrical workspace</label><select id="be-tool-select" aria-label="Choose electrical calculator"></select></div><a class="be-tool-home" href="./index.html#be=JOB">Job</a>';layout.insertBefore(picker,layout.firstChild);var sel=document.getElementById('be-tool-select');
  function buttons(){return qa('#tool-nav [data-tool]')}
  function labelFor(id){var b=q('#tool-nav [data-tool="'+id+'"]');return b?String(b.textContent||'').trim():id}
  function rebuild(){var current=(q('#tool-nav [data-tool].active')||{}).dataset;var currentId=current&&current.tool||sel.value||'amp';var seen={};sel.innerHTML='';categoryOrder.forEach(function(group){var ids=group.ids.filter(function(id){return !!q('#tool-nav [data-tool="'+id+'"]')});if(!ids.length)return;var og=document.createElement('optgroup');og.label=group.label;ids.forEach(function(id){var o=document.createElement('option');o.value=id;o.textContent=labelFor(id);og.appendChild(o);seen[id]=true});sel.appendChild(og)});var other=buttons().filter(function(b){return !seen[b.dataset.tool]});if(other.length){var og=document.createElement('optgroup');og.label='Other';other.forEach(function(b){var o=document.createElement('option');o.value=b.dataset.tool;o.textContent=String(b.textContent||'').trim();og.appendChild(o)});sel.appendChild(og)}if(q('#tool-nav [data-tool="'+currentId+'"]'))sel.value=currentId}
  function sync(){var active=q('#tool-nav [data-tool].active');if(active)sel.value=active.dataset.tool}
  sel.addEventListener('change',function(){var b=q('#tool-nav [data-tool="'+sel.value+'"]');if(b)b.click()});nav.addEventListener('click',function(){setTimeout(sync,0)});new MutationObserver(function(){rebuild();sync()}).observe(nav,{childList:true,subtree:false});rebuild();sync();installPrimaryNav();
}
window.addEventListener('load',function(){setTimeout(install,90)});
})();
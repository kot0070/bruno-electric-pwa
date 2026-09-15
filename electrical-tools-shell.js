/* Bruno Electric — Electrical Tools information-architecture shell.
 * Desktop keeps the grouped sidebar. Mobile gets a compact categorized picker.
 * When embedded by the main Bruno Electric shell, duplicate app chrome is removed.
 */
(function(){
'use strict';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function addStyle(css){var s=document.createElement('style');s.textContent=css;document.head.appendChild(s)}
var embedded=String(location.hash||'').toLowerCase().indexOf('embedded')>=0;
if(embedded)document.documentElement.classList.add('be-tools-embedded');
addStyle(`
  .be-tool-picker{display:none}
  .be-tools-embedded .top{display:none!important}
  .be-tools-embedded .layout{min-height:0!important}
  @media(max-width:900px){
    #tool-nav{display:none!important}
    .be-tool-picker{position:sticky;top:51px;z-index:16;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 12px;background:#111923;border-bottom:1px solid var(--border)}
    .be-tools-embedded .be-tool-picker{top:0;grid-template-columns:minmax(0,1fr)}
    .be-tool-picker label{display:block;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}
    .be-tool-picker select{width:100%;min-height:42px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-weight:700}
    .be-tool-picker .be-tool-home{display:flex;align-items:center;justify-content:center;min-height:42px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;color:var(--text);text-decoration:none;background:var(--card);font-weight:750;white-space:nowrap}
    .be-tools-embedded .be-tool-home{display:none!important}
    .work{padding-top:12px}.be-tools-embedded .work{padding:12px 0 0!important}
  }
`);

var categoryOrder=[
  {label:'Core Calculators',ids:['amp','vd','cf','bf']},
  {label:'Residential',ids:['res','res-takeoff']},
  {label:'Equipment & Distribution',ids:['ev3','hv3','mo3','gr3','fd3']},
  {label:'Catalog & Reference',ids:['cat','ref']}
];

function install(){
  var nav=document.getElementById('tool-nav');var layout=q('.layout');if(!nav||!layout||document.getElementById('be-tool-picker'))return;
  var picker=document.createElement('div');picker.id='be-tool-picker';picker.className='be-tool-picker no-print';picker.innerHTML='<div><label for="be-tool-select">Electrical workspace</label><select id="be-tool-select" aria-label="Choose electrical calculator"></select></div><a class="be-tool-home" href="./index.html">Job</a>';layout.insertBefore(picker,layout.firstChild);var sel=document.getElementById('be-tool-select');
  function buttons(){return qa('#tool-nav [data-tool]')}
  function labelFor(id){var b=q('#tool-nav [data-tool="'+id+'"]');return b?String(b.textContent||'').trim():id}
  function rebuild(){var current=(q('#tool-nav [data-tool].active')||{}).dataset;var currentId=current&&current.tool||sel.value||'amp';var seen={};sel.innerHTML='';categoryOrder.forEach(function(group){var ids=group.ids.filter(function(id){return !!q('#tool-nav [data-tool="'+id+'"]')});if(!ids.length)return;var og=document.createElement('optgroup');og.label=group.label;ids.forEach(function(id){var o=document.createElement('option');o.value=id;o.textContent=labelFor(id);og.appendChild(o);seen[id]=true});sel.appendChild(og)});var other=buttons().filter(function(b){return !seen[b.dataset.tool]});if(other.length){var og=document.createElement('optgroup');og.label='Other';other.forEach(function(b){var o=document.createElement('option');o.value=b.dataset.tool;o.textContent=String(b.textContent||'').trim();og.appendChild(o)});sel.appendChild(og)}if(q('#tool-nav [data-tool="'+currentId+'"]'))sel.value=currentId}
  function sync(){var active=q('#tool-nav [data-tool].active');if(active)sel.value=active.dataset.tool}
  sel.addEventListener('change',function(){var b=q('#tool-nav [data-tool="'+sel.value+'"]');if(b)b.click()});nav.addEventListener('click',function(){setTimeout(sync,0)});new MutationObserver(function(){rebuild();sync()}).observe(nav,{childList:true,subtree:false});rebuild();sync();
}
window.addEventListener('load',function(){setTimeout(install,90)});
})();

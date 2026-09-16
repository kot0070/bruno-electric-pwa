/* Bruno Electric — universal Electrical Tools app shell.
 * Same canonical primary navigation across phone/tablet/desktop.
 */
(function(){
'use strict';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function addStyle(css){var s=document.createElement('style');s.textContent=css;document.head.appendChild(s)}
var NAV=window.BrunoElectricAppNavigation;
var groups=NAV&&NAV.groups||[];
addStyle(`
  .be-tool-picker,.be-tools-bottom,.be-app-side{font-family:inherit}.be-tool-picker,.be-tools-bottom{display:none}
  .be-app-side{position:fixed;left:0;top:0;bottom:0;z-index:140;background:#111923;border-right:1px solid var(--border);overflow:auto}
  .be-app-brand{font-weight:850;color:var(--text)}.be-app-brand small{display:block;color:var(--muted);font-weight:600}
  .be-app-primary,.be-app-sub{appearance:none;border:0;background:transparent;color:var(--muted);text-decoration:none;cursor:pointer}
  .be-app-primary.active,.be-app-primary:hover,.be-app-sub:hover{background:var(--card);color:var(--text)}.be-app-primary.tools,.be-app-sub.tools{color:#ffd07a}
  body.be-tools-app .top a{display:none!important}
  @media(max-width:767.98px){
    .be-app-side{display:none!important}#tool-nav{display:none!important}.top{position:static!important}
    .be-tool-picker{position:sticky;top:0;z-index:16;display:grid;grid-template-columns:minmax(0,1fr);gap:8px;align-items:center;padding:8px 12px;background:#111923;border-bottom:1px solid var(--border)}
    .be-tool-picker label{display:block;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}.be-tool-picker select{width:100%;min-height:42px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-weight:700}.be-tool-home{display:none!important}
    .layout{display:block!important;min-height:0!important}.work{padding:12px 12px calc(88px + env(safe-area-inset-bottom,0px))!important;max-width:none!important}
    .be-tools-bottom{position:fixed;left:0;right:0;bottom:0;z-index:190;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:7px max(72px,env(safe-area-inset-right,0px)) calc(7px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));background:#101820;border-top:1px solid var(--border);box-shadow:0 -8px 24px rgba(0,0,0,.32)}
    .be-tools-bottom button{appearance:none;border:0;background:transparent;color:var(--muted);border-radius:10px;min-width:0;padding:7px 2px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:10px;font-weight:750;line-height:1.1}.be-tools-bottom button .ico{font-size:18px;line-height:18px;font-weight:800}.be-tools-bottom button.active{background:var(--card);color:#ffd07a}
  }
  @media(min-width:768px) and (max-width:1199.98px){
    body.be-tools-app{padding-left:92px}.be-app-side{display:block;width:92px;padding:10px 8px 18px}.be-app-brand{font-size:17px;text-align:center;padding:7px 2px 14px}.be-app-brand .full,.be-app-brand small{display:none}
    .be-app-group{margin:4px 0}.be-app-subs{display:none!important}.be-app-primary{width:100%;min-height:64px;border-radius:10px;padding:7px 3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:10px;font-weight:750;text-align:center}.be-app-primary .ico{font-size:19px;line-height:20px}
    #tool-nav{display:none!important}.layout{display:block!important;min-height:calc(100vh - 52px)!important}.be-tool-picker{position:sticky;top:0;z-index:16;display:grid;grid-template-columns:minmax(0,1fr);padding:9px 14px;background:#111923;border-bottom:1px solid var(--border)}.be-tool-picker label{display:block;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}.be-tool-picker select{width:100%;min-height:42px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-weight:700}.be-tool-home{display:none!important}
    .work{padding:16px 18px!important;max-width:1500px!important}.be-tools-bottom{display:none!important}
  }
  @media(min-width:1200px){
    body.be-tools-app{padding-left:244px}.be-app-side{display:block;width:244px;padding:12px 10px 22px}.be-app-brand{font-size:14px;padding:8px 10px 12px}.be-app-brand .short{display:none}.be-app-brand small{margin-top:3px}
    .be-app-group{margin:7px 0 12px}.be-app-primary{display:flex;width:100%;align-items:center;gap:8px;border-radius:8px;padding:7px 10px;text-align:left;font-size:12px;font-weight:800}.be-app-primary .ico{width:18px;text-align:center;font-size:15px}.be-app-subs{padding:3px 0 0 22px}.be-app-sub{display:block;width:100%;border-radius:7px;padding:6px 9px;text-align:left;font-size:12px;font-weight:650}.be-app-sub.active{background:var(--card);color:#ffd07a}
    .be-tool-picker,.be-tools-bottom{display:none!important}.layout{grid-template-columns:220px minmax(0,1fr)!important}.work{max-width:1500px!important}
  }
  @media print{.be-tool-picker,.be-tools-bottom,.be-app-side{display:none!important}body.be-tools-app{padding-left:0!important}}
`);
var categoryOrder=[
  {label:'Project',ids:['project','res-live','res','res-takeoff']},
  {label:'Core Calculators',ids:['amp','vd','cf','bf']},
  {label:'Equipment & Distribution',ids:['ev3','hv3','mo3','gr3','fd3']},
  {label:'Catalog & Reference',ids:['cat','ref']}
];
function hrefFor(key,tab){return NAV&&NAV.workspaceHref?NAV.workspaceHref(key,tab):(key==='ELECTRICAL'?'./electrical-tools.html':'./index.html#be='+key+(tab?'&tab='+tab:''))}
function installAppSide(){if(document.getElementById('be-app-side'))return;var side=document.createElement('aside');side.id='be-app-side';side.className='be-app-side no-print';side.setAttribute('aria-label','Primary application navigation');side.innerHTML='<div class="be-app-brand"><span class="full">BRUNO ELECTRIC</span><span class="short">BE</span><small>Professional Estimating</small></div>';groups.forEach(function(g){var box=document.createElement('div');box.className='be-app-group';var p=document.createElement('a');p.className='be-app-primary'+(g.key==='ELECTRICAL'?' tools active':'');p.href=hrefFor(g.key);p.innerHTML='<span class="ico" aria-hidden="true">'+g.icon+'</span><span>'+g.label+'</span>';if(g.key==='ELECTRICAL')p.setAttribute('aria-current','page');box.appendChild(p);var subs=document.createElement('div');subs.className='be-app-subs';g.items.forEach(function(item){var a=document.createElement('a');a.className='be-app-sub'+(item[0]==='__tools'?' tools active':'');a.href=hrefFor(g.key,item[0]);a.textContent=item[1];subs.appendChild(a)});box.appendChild(subs);side.appendChild(box)});document.body.appendChild(side)}
function installPrimaryBottom(){if(document.getElementById('be-tools-bottom'))return;var nav=document.createElement('nav');nav.id='be-tools-bottom';nav.className='be-tools-bottom no-print';nav.setAttribute('aria-label','Primary mobile navigation');groups.forEach(function(g){var b=document.createElement('button');b.type='button';b.dataset.group=g.key;b.innerHTML='<span class="ico" aria-hidden="true">'+g.icon+'</span><span>'+g.label+'</span>';if(g.key==='ELECTRICAL'){b.classList.add('active');b.setAttribute('aria-current','page')}else b.addEventListener('click',function(){location.href=hrefFor(g.key)});nav.appendChild(b)});document.body.appendChild(nav)}
function installPicker(){var nav=document.getElementById('tool-nav'),layout=q('.layout');if(!nav||!layout||document.getElementById('be-tool-picker'))return;var picker=document.createElement('div');picker.id='be-tool-picker';picker.className='be-tool-picker no-print';picker.innerHTML='<div><label for="be-tool-select">Electrical workspace</label><select id="be-tool-select" aria-label="Choose electrical calculator"></select></div>';layout.insertBefore(picker,layout.firstChild);var sel=document.getElementById('be-tool-select');function buttons(){return qa('#tool-nav [data-tool]')}function labelFor(id){var b=q('#tool-nav [data-tool="'+id+'"]');return b?String(b.textContent||'').trim():id}function rebuild(){var current=(q('#tool-nav [data-tool].active')||{}).dataset,currentId=current&&current.tool||sel.value||'project',seen={};sel.innerHTML='';categoryOrder.forEach(function(group){var ids=group.ids.filter(function(id){return !!q('#tool-nav [data-tool="'+id+'"]')});if(!ids.length)return;var og=document.createElement('optgroup');og.label=group.label;ids.forEach(function(id){var o=document.createElement('option');o.value=id;o.textContent=labelFor(id);og.appendChild(o);seen[id]=true});sel.appendChild(og)});var other=buttons().filter(function(b){return !seen[b.dataset.tool]});if(other.length){var og=document.createElement('optgroup');og.label='Other';other.forEach(function(b){var o=document.createElement('option');o.value=b.dataset.tool;o.textContent=String(b.textContent||'').trim();og.appendChild(o)});sel.appendChild(og)}if(q('#tool-nav [data-tool="'+currentId+'"]'))sel.value=currentId}function sync(){var active=q('#tool-nav [data-tool].active');if(active)sel.value=active.dataset.tool}sel.addEventListener('change',function(){var b=q('#tool-nav [data-tool="'+sel.value+'"]');if(b)b.click()});nav.addEventListener('click',function(){setTimeout(sync,0)});new MutationObserver(function(){rebuild();sync()}).observe(nav,{childList:true,subtree:false});rebuild();sync()}
function install(){if(!groups.length)return;document.body.classList.add('be-tools-app');installAppSide();installPicker();installPrimaryBottom()}
window.addEventListener('load',function(){setTimeout(install,90)});
})();
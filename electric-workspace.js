/* Bruno Electric — universal responsive workspace shell.
 * One IA across phone/tablet/desktop; presentation changes by viewport only.
 */
(function () {
  'use strict';
  if (document.documentElement.dataset.beWorkspace === '1') return;

  var NAV=window.BrunoElectricAppNavigation;
  if(!NAV||!Array.isArray(NAV.groups)||NAV.groups.length!==5||typeof NAV.group!=='function'||typeof NAV.groupForTab!=='function')return;
  var groups=NAV.groups;
  document.documentElement.dataset.beWorkspace = '1';

  function addStyle(css){var s=document.createElement('style');s.textContent=css;document.head.appendChild(s)}
  addStyle(`
    body.be-workspace #nav-tabs{display:none!important}
    .be-side,.be-bottom,.be-section-nav{font-family:inherit}
    .be-side{position:fixed;left:0;top:0;bottom:0;z-index:140;background:#111923;border-right:1px solid var(--border);overflow:auto}
    .be-side-brand{font-weight:850;color:var(--text)}
    .be-side-brand small{display:block;color:var(--text-muted);font-weight:600}
    .be-primary-btn,.be-nav-btn{appearance:none;border:0;background:transparent;color:var(--text-muted);cursor:pointer}
    .be-primary-btn.active,.be-nav-btn.active,.be-primary-btn:hover,.be-nav-btn:hover{background:var(--bg-card);color:var(--text)}
    .be-primary-btn.tools,.be-nav-btn.tools{color:#ffd07a}
    .be-section-nav{margin:0 0 12px;padding:10px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px}
    .be-section-title{font-size:11px;font-weight:850;letter-spacing:.08em;color:var(--text-dim);text-transform:uppercase;margin:0 0 8px}
    .be-section-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
    .be-section-grid button{appearance:none;min-height:44px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);border-radius:9px;padding:9px 10px;text-align:left;font-size:13px;font-weight:700}
    .be-section-grid button.active{border-color:var(--accent);box-shadow:inset 3px 0 0 var(--accent)}
    .be-workbar{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:0 0 12px;padding:9px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px}
    .be-workbar b{font-size:11px;color:var(--text-muted)}
    .be-workbar button{appearance:none;min-height:38px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);padding:7px 9px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer}
    .be-workbar button:focus-visible,.be-section-grid button:focus-visible,.be-primary-btn:focus-visible,.be-nav-btn:focus-visible{outline:2px solid var(--accent);outline-offset:1px}

    @media (max-width:767.98px){
      .be-side{display:none!important}
      body.be-workspace{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px))}
      .be-section-nav{display:block}
      .be-workbar b{display:block;flex:1 0 100%;margin:0 0 1px}
      .be-bottom{position:fixed;left:0;right:0;bottom:0;z-index:190;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:7px max(8px,env(safe-area-inset-right,0px)) calc(7px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));background:#101820;border-top:1px solid var(--border);box-shadow:0 -8px 24px rgba(0,0,0,.32)}
      .be-bottom button{appearance:none;border:0;background:transparent;color:var(--text-muted);border-radius:10px;min-width:0;padding:7px 2px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:10px;font-weight:750;line-height:1.1}
      .be-bottom button .ico{font-size:18px;line-height:18px;font-weight:800}.be-bottom button.active{background:var(--bg-card);color:var(--text)}.be-bottom button.tools{color:#ffd07a}
      body.be-browser-mode .be-bottom{padding-right:calc(72px + env(safe-area-inset-right,0px))}
    }

    @media (min-width:768px) and (max-width:1199.98px){
      body.be-workspace{padding-left:92px}
      .be-side{display:block;width:92px;padding:10px 8px 18px}
      .be-side-brand{font-size:17px;text-align:center;padding:7px 2px 14px}.be-side-brand .full,.be-side-brand small{display:none}
      .be-nav-group{margin:4px 0}.be-group-items{display:none!important}
      .be-primary-btn{width:100%;min-height:64px;border-radius:10px;padding:7px 3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:10px;font-weight:750;text-align:center}
      .be-primary-btn .ico{font-size:19px;line-height:20px}.be-primary-btn.active{color:var(--text)}
      .be-section-nav{display:block;margin:0 0 14px}
      .be-section-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
      .be-bottom{display:none!important}
      body.be-workspace main{max-width:1600px;padding-left:20px;padding-right:20px}
    }

    @media (min-width:1200px){
      body.be-workspace{padding-left:244px}
      .be-side{display:block;width:244px;padding:12px 10px 22px}
      .be-side-brand{font-size:14px;padding:8px 10px 12px}.be-side-brand .short{display:none}.be-side-brand small{margin-top:3px}
      .be-nav-group{margin:7px 0 12px}.be-primary-btn{display:flex;width:100%;align-items:center;gap:8px;border-radius:8px;padding:7px 10px;text-align:left;font-size:12px;font-weight:800}
      .be-primary-btn .ico{width:18px;text-align:center;font-size:15px}.be-primary-btn.active{color:var(--text)}
      .be-group-items{padding:3px 0 0 22px}.be-nav-btn{display:flex;width:100%;align-items:center;border-radius:7px;padding:6px 9px;text-align:left;font-size:12px;font-weight:650}
      .be-section-nav{display:none!important}.be-bottom{display:none!important}
      body.be-workspace .app-header,body.be-workspace .live-totals,body.be-workspace .job-banner{max-width:none}
      body.be-workspace main{max-width:1600px;padding-left:22px;padding-right:22px}
      .be-workbar{margin:-3px 0 12px;padding:8px 10px}.be-workbar b{font-size:12px;margin-right:4px}
    }
    @media print{.be-side,.be-bottom,.be-section-nav{display:none!important}}
  `);

  var currentGroup='JOB';
  function groupByKey(key){return NAV.group(key)}
  function groupForTab(tab){return NAV.groupForTab(tab)}
  function existingTab(tab){return document.querySelector('#nav-tabs .nav-tab[data-tab="'+tab+'"]')}
  function activeSourceTab(){var a=document.querySelector('#nav-tabs .nav-tab.active');return a&&a.dataset.tab||'quote'}
  function syncNav(tab){
    document.querySelectorAll('.be-primary-btn[data-group],.be-bottom button[data-group]').forEach(function(b){var on=b.dataset.group===currentGroup;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    document.querySelectorAll('.be-nav-btn[data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===tab)});
  }
  function goElectrical(){location.href='./electrical-tools.html'}

  var main=document.querySelector('main');
  var sectionNav=document.createElement('nav');sectionNav.className='be-section-nav no-print';sectionNav.setAttribute('aria-label','Current section options');if(main)main.insertBefore(sectionNav,main.firstChild);
  function renderSection(){var g=groupByKey(currentGroup);sectionNav.innerHTML='<div class="be-section-title">'+g.label+'</div><div class="be-section-grid"></div>';var grid=sectionNav.querySelector('.be-section-grid');var active=activeSourceTab();g.items.forEach(function(item){var b=document.createElement('button');b.type='button';b.dataset.tab=item[0];b.textContent=item[1];b.classList.toggle('active',item[0]===active);b.addEventListener('click',function(){openTab(item[0])});grid.appendChild(b)})}
  function openTab(tab){if(tab==='__tools'){goElectrical();return}var el=existingTab(tab);if(!el)return;el.click();currentGroup=groupForTab(tab).key;syncNav(tab);renderSection();window.scrollTo({top:0,behavior:'auto'})}
  function openGroup(key){var g=groupByKey(key);currentGroup=g.key;if(g.key==='ELECTRICAL'){goElectrical();return}openTab(g.defaultTab)}

  var aside=document.createElement('aside');aside.className='be-side no-print';aside.setAttribute('aria-label','Primary application navigation');aside.innerHTML='<div class="be-side-brand"><span class="full">BRUNO ELECTRIC</span><span class="short">BE</span><small>Professional Estimating</small></div>';
  groups.forEach(function(g){var box=document.createElement('div');box.className='be-nav-group';var primary=document.createElement('button');primary.type='button';primary.className='be-primary-btn'+(g.key==='ELECTRICAL'?' tools':'');primary.dataset.group=g.key;primary.innerHTML='<span class="ico" aria-hidden="true">'+g.icon+'</span><span>'+g.label+'</span>';primary.addEventListener('click',function(){openGroup(g.key)});box.appendChild(primary);var items=document.createElement('div');items.className='be-group-items';g.items.forEach(function(item){var b=document.createElement('button');b.type='button';b.className='be-nav-btn'+(item[0]==='__tools'?' tools':'');b.textContent=item[1];b.dataset.tab=item[0];b.addEventListener('click',function(){openTab(item[0])});items.appendChild(b)});box.appendChild(items);aside.appendChild(box)});document.body.appendChild(aside);

  document.body.classList.add('be-workspace');var standalone=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;if(!standalone)document.body.classList.add('be-browser-mode');
  var bottom=document.createElement('nav');bottom.className='be-bottom no-print';bottom.setAttribute('aria-label','Primary mobile navigation');groups.forEach(function(g){var b=document.createElement('button');b.type='button';b.className=(g.key==='ELECTRICAL'?'tools':'');b.dataset.group=g.key;b.setAttribute('aria-label',g.label);b.innerHTML='<span class="ico" aria-hidden="true">'+g.icon+'</span><span>'+g.label+'</span>';b.addEventListener('click',function(){openGroup(g.key)});bottom.appendChild(b)});document.body.appendChild(bottom);

  document.querySelectorAll('#nav-tabs .nav-tab').forEach(function(b){b.addEventListener('click',function(){currentGroup=groupForTab(b.dataset.tab).key;syncNav(b.dataset.tab);renderSection()})});
  currentGroup=groupForTab(activeSourceTab()).key;syncNav(activeSourceTab());renderSection();

  function workbar(panelId,label){var p=document.getElementById(panelId);if(!p||p.querySelector('.be-workbar'))return;var head=p.querySelector('.panel-head');if(!head)return;var bar=document.createElement('div');bar.className='be-workbar no-print';bar.innerHTML='<b>'+label+' workspace</b><button type="button" data-go="materials">Materials</button><button type="button" data-go="catalog">Catalog</button><button type="button" data-go="summary">Summary</button><button type="button" data-go="__tools">Electrical Tools → BOM</button>';bar.querySelectorAll('[data-go]').forEach(function(x){x.addEventListener('click',function(){openTab(x.dataset.go)})});head.insertAdjacentElement('afterend',bar)}
  workbar('panel-materials','Materials');workbar('panel-catalog','Catalog');workbar('panel-summary','Summary');
})();
/* Bruno Electric — unified workspace/navigation shell.
 * Mobile: bottom navigation opens a section; section options live in-page.
 * Electrical Tools are embedded in the same app shell instead of navigating away.
 */
(function () {
  'use strict';
  if (document.documentElement.dataset.beWorkspace === '1') return;
  document.documentElement.dataset.beWorkspace = '1';

  function addStyle(css){var s=document.createElement('style');s.textContent=css;document.head.appendChild(s)}
  addStyle(`
    @media (min-width:768px){
      body.be-workspace{padding-left:244px}
      body.be-workspace #nav-tabs{display:none!important}
      .be-side{position:fixed;left:0;top:0;bottom:0;width:244px;z-index:140;background:#111923;border-right:1px solid var(--border);overflow:auto;padding:12px 10px 22px}
      .be-side-brand{font-weight:800;font-size:14px;padding:8px 10px 12px;color:var(--text)}
      .be-side-brand small{display:block;color:var(--text-muted);font-weight:600;margin-top:3px}
      .be-nav-group{margin:8px 0 12px}.be-nav-title{font-size:10px;letter-spacing:.09em;color:var(--text-dim);font-weight:800;padding:5px 10px;text-transform:uppercase}
      .be-nav-btn{display:flex;width:100%;align-items:center;gap:8px;border:0;background:transparent;color:var(--text-muted);border-radius:7px;padding:7px 10px;text-align:left;cursor:pointer;font-size:13px;font-weight:650}
      .be-nav-btn:hover,.be-nav-btn.active{background:var(--bg-card);color:var(--text)}
      .be-nav-btn.tools{color:#ffd07a;border:1px solid rgba(240,165,0,.25);margin-top:4px}
      body.be-workspace .app-header,body.be-workspace .live-totals,body.be-workspace .job-banner{max-width:none}
      body.be-workspace main{max-width:1600px;padding-left:22px;padding-right:22px}
      .be-workbar{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:-3px 0 12px;padding:8px 10px;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px}
      .be-workbar b{font-size:12px;margin-right:4px}.be-workbar button{border:1px solid var(--border);background:var(--bg-card);color:var(--text);padding:5px 8px;border-radius:6px;font-size:12px;font-weight:650;cursor:pointer}
      .be-mobile-bottom,.be-mobile-section-nav{display:none!important}
    }
    @media (max-width:767.98px){
      .be-side{display:none!important}
      body.be-workspace{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px))}
      body.be-workspace #nav-tabs{display:none!important}
      .be-mobile-section-nav{display:block;margin:0 0 12px;padding:10px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px}
      .be-mobile-section-title{font-size:11px;font-weight:850;letter-spacing:.08em;color:var(--text-dim);text-transform:uppercase;margin:0 0 8px}
      .be-mobile-section-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .be-mobile-section-grid button{min-height:44px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);border-radius:9px;padding:9px 10px;text-align:left;font-size:13px;font-weight:700}
      .be-mobile-section-grid button.active{border-color:var(--accent);box-shadow:inset 3px 0 0 var(--accent)}
      .be-mobile-section-note{color:var(--text-muted);font-size:12px;margin:2px 0 0}
      .be-mobile-bottom{position:fixed;left:0;right:0;bottom:0;z-index:190;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:7px max(8px,env(safe-area-inset-right,0px)) calc(7px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));background:#101820;border-top:1px solid var(--border);box-shadow:0 -8px 24px rgba(0,0,0,.32)}
      .be-mobile-main{border:0;background:transparent;color:var(--text-muted);border-radius:10px;min-width:0;padding:7px 2px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:10px;font-weight:750;line-height:1.1}
      .be-mobile-main .ico{font-size:18px;line-height:18px;font-weight:800}
      .be-mobile-main.active{background:var(--bg-card);color:var(--text)}
      .be-mobile-main.tools{color:#ffd07a}
      body.be-browser-mode .be-mobile-bottom{padding-right:calc(72px + env(safe-area-inset-right,0px))}
      .be-electrical-panel{padding:0!important}
      .be-electrical-frame{display:block;width:100%;min-height:760px;border:0;background:transparent}
    }
    @media print{.be-side,.be-mobile-bottom,.be-mobile-section-nav,.be-electrical-panel{display:none!important}}
  `);

  var groups=[
    {key:'JOB',label:'Job',icon:'▣',defaultTab:'quote',items:[['quote','Quote'],['summary','Summary'],['cos','Change Orders']]},
    {key:'ESTIMATE',label:'Estimate',icon:'≡',defaultTab:'materials',items:[['materials','Job Materials'],['catalog','Catalog'],['labor','Labor & Equipment'],['margins','Margins']]},
    {key:'ELECTRICAL',label:'Electrical',icon:'⚡',defaultTab:'__tools',items:[['__tools','Electrical Tools']]},
    {key:'BILLING',label:'Billing',icon:'$',defaultTab:'tm',items:[['tm','T&M Invoice'],['pnl','Profit & Loss']]},
    {key:'MORE',label:'More',icon:'•••',defaultTab:'dispatch',items:[['dispatch','Dispatch'],['personnel','Workers'],['profiles','Company'],['reference','Reference'],['help','Help']]}
  ];
  var currentGroup='JOB',electricalPanel=null,electricalFrame=null,electricalResizeObserver=null;

  function groupByKey(key){return groups.filter(function(g){return g.key===key})[0]||groups[0]}
  function groupForTab(tab){for(var i=0;i<groups.length;i++)for(var j=0;j<groups[i].items.length;j++)if(groups[i].items[j][0]===tab)return groups[i];return groups[0]}
  function existingTab(tab){return document.querySelector('#nav-tabs .nav-tab[data-tab="'+tab+'"]')}
  function activeSourceTab(){var a=document.querySelector('#nav-tabs .nav-tab.active');return a&&a.dataset.tab||'quote'}
  function hideElectrical(){if(electricalPanel)electricalPanel.classList.remove('active')}
  function syncBottom(){document.querySelectorAll('.be-mobile-main[data-group]').forEach(function(b){var on=b.dataset.group===currentGroup;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
  function syncSide(tab){document.querySelectorAll('.be-nav-btn[data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===tab)})}

  var main=document.querySelector('main');
  var sectionNav=document.createElement('nav');sectionNav.className='be-mobile-section-nav no-print';sectionNav.setAttribute('aria-label','Current section options');
  if(main)main.insertBefore(sectionNav,main.firstChild);

  function renderSection(){
    var g=groupByKey(currentGroup);
    if(g.key==='ELECTRICAL'){
      sectionNav.innerHTML='<div class="be-mobile-section-title">Electrical</div><div class="be-mobile-section-note">Choose the calculator or electrical workspace below. You stay inside Bruno Electric.</div>';
      return;
    }
    sectionNav.innerHTML='<div class="be-mobile-section-title">'+g.label+'</div><div class="be-mobile-section-grid"></div>';
    var grid=sectionNav.querySelector('.be-mobile-section-grid');var active=activeSourceTab();
    g.items.forEach(function(item){var b=document.createElement('button');b.type='button';b.dataset.tab=item[0];b.textContent=item[1];b.classList.toggle('active',item[0]===active);b.addEventListener('click',function(){openTab(item[0])});grid.appendChild(b)});
  }

  function fitElectricalFrame(){if(!electricalFrame)return;try{var doc=electricalFrame.contentDocument;if(!doc)return;var h=Math.max(760,Math.ceil(doc.documentElement.scrollHeight||doc.body.scrollHeight||760));electricalFrame.style.height=h+'px'}catch(e){}}
  function prepareElectricalFrame(){
    if(!electricalFrame)return;
    try{
      var doc=electricalFrame.contentDocument;if(!doc)return;doc.documentElement.classList.add('be-embedded-tools');
      var old=doc.getElementById('be-parent-embed-style');if(old)old.remove();
      var s=doc.createElement('style');s.id='be-parent-embed-style';s.textContent='.be-embedded-tools body{background:transparent!important}.be-embedded-tools .top{display:none!important}.be-embedded-tools .layout{min-height:0!important}.be-embedded-tools .work{max-width:none!important}';doc.head.appendChild(s);
      if(electricalResizeObserver)try{electricalResizeObserver.disconnect()}catch(x){}
      if('ResizeObserver' in window){electricalResizeObserver=new ResizeObserver(function(){requestAnimationFrame(fitElectricalFrame)});electricalResizeObserver.observe(doc.body)}
      requestAnimationFrame(fitElectricalFrame);setTimeout(fitElectricalFrame,150);setTimeout(fitElectricalFrame,600);
    }catch(e){}
  }
  function ensureElectricalPanel(){
    if(electricalPanel)return electricalPanel;if(!main)return null;
    electricalPanel=document.createElement('section');electricalPanel.id='panel-electrical-workspace';electricalPanel.className='panel be-electrical-panel';electricalPanel.setAttribute('aria-label','Electrical workspace');
    electricalPanel.innerHTML='<iframe class="be-electrical-frame" title="Bruno Electric electrical workspace" src="./electrical-tools.html#embedded"></iframe>';
    main.appendChild(electricalPanel);electricalFrame=electricalPanel.querySelector('iframe');electricalFrame.addEventListener('load',prepareElectricalFrame);return electricalPanel;
  }
  function showElectrical(){
    var p=ensureElectricalPanel();if(!p)return;document.querySelectorAll('main .panel').forEach(function(x){x.classList.remove('active')});p.classList.add('active');currentGroup='ELECTRICAL';syncSide('__tools');syncBottom();renderSection();window.scrollTo({top:0,behavior:'auto'});requestAnimationFrame(fitElectricalFrame);
  }
  function openTab(tab){
    if(tab==='__tools'){showElectrical();return}
    hideElectrical();var el=existingTab(tab);if(!el)return;el.click();currentGroup=groupForTab(tab).key;syncSide(tab);syncBottom();renderSection();window.scrollTo({top:0,behavior:'auto'});
  }
  function openGroup(key){var g=groupByKey(key);currentGroup=g.key;if(g.key==='ELECTRICAL')showElectrical();else openTab(g.defaultTab)}

  var aside=document.createElement('aside');aside.className='be-side no-print';aside.innerHTML='<div class="be-side-brand">BRUNO ELECTRIC<small>Professional Estimating</small></div>';
  groups.forEach(function(g){var box=document.createElement('div');box.className='be-nav-group';var title=document.createElement('div');title.className='be-nav-title';title.textContent=g.label;box.appendChild(title);g.items.forEach(function(item){var b=document.createElement('button');b.type='button';b.className='be-nav-btn'+(item[0]==='__tools'?' tools':'');b.textContent=item[1];b.dataset.tab=item[0];b.addEventListener('click',function(){openTab(item[0])});box.appendChild(b)});aside.appendChild(box)});document.body.appendChild(aside);
  document.body.classList.add('be-workspace');var standalone=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;if(!standalone)document.body.classList.add('be-browser-mode');

  var bottom=document.createElement('nav');bottom.className='be-mobile-bottom no-print';bottom.setAttribute('aria-label','Primary mobile navigation');groups.forEach(function(g){var b=document.createElement('button');b.type='button';b.className='be-mobile-main'+(g.key==='ELECTRICAL'?' tools':'');b.dataset.group=g.key;b.setAttribute('aria-label',g.label);b.innerHTML='<span class="ico" aria-hidden="true">'+g.icon+'</span><span>'+g.label+'</span>';b.addEventListener('click',function(){openGroup(g.key)});bottom.appendChild(b)});document.body.appendChild(bottom);

  document.querySelectorAll('#nav-tabs .nav-tab').forEach(function(b){b.addEventListener('click',function(){hideElectrical();currentGroup=groupForTab(b.dataset.tab).key;syncSide(b.dataset.tab);syncBottom();renderSection()})});
  currentGroup=groupForTab(activeSourceTab()).key;syncSide(activeSourceTab());syncBottom();renderSection();

  function workbar(panelId,label){var p=document.getElementById(panelId);if(!p||p.querySelector('.be-workbar'))return;var head=p.querySelector('.panel-head');if(!head)return;var bar=document.createElement('div');bar.className='be-workbar no-print';bar.innerHTML='<b>'+label+' workspace</b><button type="button" data-go="materials">Materials</button><button type="button" data-go="catalog">Catalog</button><button type="button" data-go="summary">Summary</button><button type="button" data-go="__tools">Electrical Tools → BOM</button>';bar.querySelectorAll('[data-go]').forEach(function(x){x.addEventListener('click',function(){openTab(x.dataset.go)})});head.insertAdjacentElement('afterend',bar)}
  workbar('panel-materials','Materials');workbar('panel-catalog','Catalog');workbar('panel-summary','Summary');
})();

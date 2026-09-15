/* Bruno Electric — responsive workspace/navigation enhancement.
 * Desktop/tablet: grouped sidebar. Mobile: compact AC-style bottom navigation.
 */
(function () {
  'use strict';
  if (document.documentElement.dataset.beWorkspace === '1') return;
  document.documentElement.dataset.beWorkspace = '1';

  function addStyle(css) {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  }
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
      .be-workbar b{font-size:12px;margin-right:4px}.be-workbar button,.be-workbar a{border:1px solid var(--border);background:var(--bg-card);color:var(--text);padding:5px 8px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:650;cursor:pointer}
      .be-mobile-bottom,.be-mobile-sheet,.be-mobile-backdrop{display:none!important}
    }
    @media (max-width:767.98px){
      .be-side{display:none!important}
      body.be-workspace{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px))}
      body.be-workspace #nav-tabs{display:none!important}
      .be-mobile-bottom{position:fixed;left:0;right:0;bottom:0;z-index:190;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:7px max(8px,env(safe-area-inset-right,0px)) calc(7px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px));background:#101820;border-top:1px solid var(--border);box-shadow:0 -8px 24px rgba(0,0,0,.32)}
      .be-mobile-main{border:0;background:transparent;color:var(--text-muted);border-radius:10px;min-width:0;padding:7px 2px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:10px;font-weight:750;line-height:1.1}
      .be-mobile-main .ico{font-size:18px;line-height:18px;font-weight:800}
      .be-mobile-main.active{background:var(--bg-card);color:var(--text)}
      .be-mobile-main.tools{color:#ffd07a}
      .be-mobile-backdrop{position:fixed;inset:0;z-index:181;background:rgba(0,0,0,.5);display:none}
      .be-mobile-backdrop.open{display:block}
      .be-mobile-sheet{position:fixed;left:10px;right:10px;bottom:calc(72px + env(safe-area-inset-bottom,0px));z-index:185;display:none;padding:10px;background:#17212c;border:1px solid var(--border);border-radius:14px;box-shadow:0 14px 38px rgba(0,0,0,.5)}
      .be-mobile-sheet.open{display:block}
      .be-mobile-sheet-title{font-size:11px;font-weight:800;letter-spacing:.08em;color:var(--text-dim);padding:2px 4px 8px;text-transform:uppercase}
      .be-mobile-sheet-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .be-mobile-sheet button,.be-mobile-sheet a{display:flex;align-items:center;min-height:44px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);border-radius:9px;padding:9px 10px;text-decoration:none;text-align:left;font-size:13px;font-weight:650}
      .be-mobile-sheet button.active{border-color:var(--accent);box-shadow:inset 3px 0 0 var(--accent)}
      body.be-browser-mode .be-mobile-bottom{padding-right:calc(72px + env(safe-area-inset-right,0px))}
      body.be-browser-mode .be-mobile-sheet{right:calc(72px + env(safe-area-inset-right,0px))}
    }
  `);

  var groups = [
    ['JOB',[['quote','Quote'],['summary','Summary'],['cos','Change Orders']]],
    ['ESTIMATE',[['materials','Job Materials'],['catalog','Catalog'],['labor','Labor & Equipment'],['margins','Margins']]],
    ['ELECTRICAL',[['__tools','Electrical Tools']]],
    ['BILLING',[['tm','T&M Invoice'],['pnl','Profit & Loss']]],
    ['MORE',[['dispatch','Dispatch'],['personnel','Workers'],['profiles','Company'],['reference','Reference'],['help','Help']]]
  ];
  var mobileMeta = [
    {key:'JOB',label:'Job',icon:'▣'},
    {key:'ESTIMATE',label:'Estimate',icon:'≡'},
    {key:'ELECTRICAL',label:'Electrical',icon:'⚡',tools:true},
    {key:'BILLING',label:'Billing',icon:'$'},
    {key:'MORE',label:'More',icon:'•••'}
  ];

  function existingTab(tab) { return document.querySelector('#nav-tabs .nav-tab[data-tab="'+tab+'"]'); }
  function groupForTab(tab){
    for(var i=0;i<groups.length;i++) for(var j=0;j<groups[i][1].length;j++) if(groups[i][1][j][0]===tab) return groups[i][0];
    return 'JOB';
  }
  function activeTab(){var a=document.querySelector('#nav-tabs .nav-tab.active');return a&&a.dataset.tab||'quote';}
  function closeMobileMenu(){sheet.classList.remove('open');backdrop.classList.remove('open');sheet.innerHTML='';}
  function openTab(tab) {
    var el = existingTab(tab);
    if (el) { el.click(); syncActive(tab); closeMobileMenu(); window.scrollTo({top:0,behavior:'auto'}); }
  }
  function syncActive(tab) {
    document.querySelectorAll('.be-nav-btn[data-tab]').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
    var group=groupForTab(tab);
    document.querySelectorAll('.be-mobile-main[data-group]').forEach(function(b){var on=b.dataset.group===group;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    document.querySelectorAll('.be-mobile-sheet [data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===tab)});
  }

  var aside = document.createElement('aside'); aside.className='be-side no-print';
  aside.innerHTML='<div class="be-side-brand">BRUNO ELECTRIC<small>Professional Estimating</small></div>';
  groups.forEach(function (g) {
    var box=document.createElement('div'); box.className='be-nav-group';
    var title=document.createElement('div'); title.className='be-nav-title'; title.textContent=g[0]; box.appendChild(title);
    g[1].forEach(function (item) {
      var b=document.createElement('button'); b.type='button'; b.className='be-nav-btn'+(item[0]==='__tools'?' tools':''); b.textContent=item[1]; b.dataset.tab=item[0];
      b.addEventListener('click',function(){ if(item[0]==='__tools') location.href='./electrical-tools.html'; else openTab(item[0]); }); box.appendChild(b);
    }); aside.appendChild(box);
  });
  document.body.appendChild(aside); document.body.classList.add('be-workspace');
  var standalone=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;
  if(!standalone)document.body.classList.add('be-browser-mode');

  var backdrop=document.createElement('div');backdrop.className='be-mobile-backdrop no-print';backdrop.addEventListener('click',closeMobileMenu);document.body.appendChild(backdrop);
  var sheet=document.createElement('div');sheet.className='be-mobile-sheet no-print';document.body.appendChild(sheet);
  var bottom=document.createElement('nav');bottom.className='be-mobile-bottom no-print';bottom.setAttribute('aria-label','Primary mobile navigation');
  mobileMeta.forEach(function(meta){
    var b=document.createElement('button');b.type='button';b.className='be-mobile-main'+(meta.tools?' tools':'');b.dataset.group=meta.key;b.setAttribute('aria-label',meta.label);b.innerHTML='<span class="ico" aria-hidden="true">'+meta.icon+'</span><span>'+meta.label+'</span>';
    b.addEventListener('click',function(){
      if(meta.tools){location.href='./electrical-tools.html';return;}
      var g=groups.find(function(x){return x[0]===meta.key});if(!g)return;
      if(sheet.classList.contains('open')&&sheet.dataset.group===meta.key){closeMobileMenu();return;}
      sheet.dataset.group=meta.key;sheet.innerHTML='<div class="be-mobile-sheet-title">'+meta.label+'</div><div class="be-mobile-sheet-grid"></div>';
      var grid=sheet.querySelector('.be-mobile-sheet-grid');g[1].forEach(function(item){var x=document.createElement('button');x.type='button';x.dataset.tab=item[0];x.textContent=item[1];x.addEventListener('click',function(){openTab(item[0])});grid.appendChild(x)});
      sheet.classList.add('open');backdrop.classList.add('open');syncActive(activeTab());
    });bottom.appendChild(b);
  });
  document.body.appendChild(bottom);

  var active=document.querySelector('#nav-tabs .nav-tab.active'); if(active) syncActive(active.dataset.tab);
  document.querySelectorAll('#nav-tabs .nav-tab').forEach(function (b) { b.addEventListener('click',function(){syncActive(b.dataset.tab);}); });

  function workbar(panelId,label){
    var p=document.getElementById(panelId); if(!p || p.querySelector('.be-workbar')) return;
    var head=p.querySelector('.panel-head'); if(!head) return;
    var bar=document.createElement('div');bar.className='be-workbar no-print';
    bar.innerHTML='<b>'+label+' workspace</b>'+
      '<button type="button" data-go="materials">Materials</button><button type="button" data-go="catalog">Catalog</button><button type="button" data-go="summary">Summary</button>'+
      '<a href="./electrical-tools.html">Electrical Tools → BOM</a>';
    bar.querySelectorAll('[data-go]').forEach(function(x){x.addEventListener('click',function(){openTab(x.dataset.go);});});
    head.insertAdjacentElement('afterend',bar);
  }
  workbar('panel-materials','Materials'); workbar('panel-catalog','Catalog'); workbar('panel-summary','Summary');
})();

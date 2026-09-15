/* Bruno Electric — non-destructive workspace/navigation enhancement.
 * Loaded by sw-register.js so giant index.html remains untouched in Phase 1.
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
    }
    @media (max-width:767.98px){.be-side{display:none}.be-tools-mobile{display:inline-flex!important}}
  `);

  var groups = [
    ['JOB',[['quote','Quote'],['summary','Summary'],['cos','Change Orders']]],
    ['ESTIMATE',[['materials','Materials'],['catalog','Catalog'],['labor','Labor & Equipment'],['margins','Margins']]],
    ['ELECTRICAL TOOLS',[['__tools','Electrical Tools']]],
    ['BILLING',[['tm','T&M Invoice'],['pnl','Profit & Loss']]],
    ['MORE',[['dispatch','Dispatch'],['personnel','Workers'],['profiles','Company'],['reference','Reference'],['help','Help']]]
  ];

  function existingTab(tab) { return document.querySelector('#nav-tabs .nav-tab[data-tab="'+tab+'"]'); }
  function openTab(tab) {
    var el = existingTab(tab);
    if (el) { el.click(); syncActive(tab); window.scrollTo({top:0,behavior:'auto'}); }
  }
  function syncActive(tab) {
    document.querySelectorAll('.be-nav-btn[data-tab]').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
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

  var active=document.querySelector('#nav-tabs .nav-tab.active'); if(active) syncActive(active.dataset.tab);
  document.querySelectorAll('#nav-tabs .nav-tab').forEach(function (b) { b.addEventListener('click',function(){syncActive(b.dataset.tab);}); });

  // Mobile keeps legacy navigation; add a single fail-open Tools entry without duplicating desktop nav.
  var nav=document.getElementById('nav-tabs');
  if(nav && !nav.querySelector('.be-tools-mobile')){
    var a=document.createElement('button'); a.type='button'; a.className='nav-tab be-tools-mobile'; a.style.display='none'; a.textContent='Electrical Tools'; a.addEventListener('click',function(){location.href='./electrical-tools.html';}); nav.appendChild(a);
  }

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

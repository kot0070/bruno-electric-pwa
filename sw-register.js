(function () {
  'use strict';

  /* The legacy inline Pricing & Margins renderer models blank Your Cost as
   * Customer Price. Disable that runtime synchronously, before DOMContentLoaded
   * starts the inline app, and give the strict module a dedicated tbody.
   */
  function prepareStrictMarginsRuntime() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    var strict=document.getElementById('margins-body-strict');
    if (strict) return;
    var legacy=document.getElementById('margins-body');
    if (!legacy || !legacy.parentNode) return;
    strict=document.createElement('tbody');
    strict.id='margins-body-strict';
    strict.setAttribute('data-pricing-margins-runtime','strict-v2');
    legacy.parentNode.insertBefore(strict,legacy);
    legacy.parentNode.removeChild(legacy);
    var panel=document.getElementById('panel-margins');
    if (panel) {
      panel.setAttribute('data-pricing-margins-runtime','strict-v2');
      panel.setAttribute('data-legacy-margins-disabled','1');
    }
  }

  function loadCatalogCostSemantics() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoCatalogCostSemantics || document.querySelector('script[data-be-catalog-cost-semantics]')) return;
    var c=document.createElement('script');
    c.src='./electric-catalog-cost-semantics.js';
    c.defer=true;
    c.dataset.beCatalogCostSemantics='1';
    c.onerror=function(){};
    document.head.appendChild(c);
  }

  function loadPricingMarginsSemantics() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoPricingMarginsSemantics || document.querySelector('script[data-be-pricing-margins-semantics]')) return;
    var m=document.createElement('script');
    m.src='./electric-pricing-margins-semantics.js';
    m.defer=true;
    m.dataset.bePricingMarginsSemantics='1';
    m.onerror=function(){};
    document.head.appendChild(m);
  }

  function loadJobMaterialCostSemantics() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoJobMaterialCostSemantics || document.querySelector('script[data-be-job-material-cost-semantics]')) return;
    var j=document.createElement('script');
    j.src='./electric-job-material-cost-semantics.js';
    j.defer=true;
    j.dataset.beJobMaterialCostSemantics='1';
    j.onerror=function(){};
    document.head.appendChild(j);
  }

  function loadCustomMaterials() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoCustomMaterials || document.querySelector('script[data-be-custom-materials]')) return;
    var c=document.createElement('script');
    c.src='./electric-custom-materials.js';
    c.defer=true;
    c.dataset.beCustomMaterials='1';
    c.onerror=function(){};
    document.head.appendChild(c);
  }

  function loadDispatchJournal() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoDispatchJournalV2 || document.querySelector('script[data-be-dispatch-v2]')) return;
    var d=document.createElement('script');
    d.src='./electric-dispatch-journal-v2.js';
    d.defer=true;
    d.dataset.beDispatchV2='1';
    d.onerror=function(){};
    document.head.appendChild(d);
  }

  function loadCompactHeader() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoCompactHeader || document.querySelector('script[data-be-compact-header]')) return;
    var h=document.createElement('script');
    h.src='./electric-compact-header.js';
    h.defer=true;
    h.dataset.beCompactHeader='1';
    h.onerror=function(){};
    document.head.appendChild(h);
  }

  function loadResidentialWorkspaceModule() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoResidentialLiveWorkspace || document.querySelector('script[data-be-res-live-workspace]')) return;
    var r=document.createElement('script');
    r.src='./electric-residential-live-workspace.js';
    r.defer=true;
    r.dataset.beResLiveWorkspace='1';
    r.onerror=function(){};
    document.head.appendChild(r);
  }

  function loadResidentialWorkspaceBridge() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoResidentialPricing) { loadResidentialWorkspaceModule(); return; }
    var existing=document.querySelector('script[data-be-res-pricing]');
    if (existing) return;
    var p=document.createElement('script');
    p.src='./electric-residential-pricing.js';
    p.defer=true;
    p.dataset.beResPricing='1';
    p.onload=loadResidentialWorkspaceModule;
    p.onerror=loadResidentialWorkspaceModule;
    document.head.appendChild(p);
  }

  function loadNavigationBridge() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (document.querySelector('script[data-be-nav-bridge]')) return;
    var b = document.createElement('script');
    b.src = './electric-navigation-bridge.js';
    b.defer = true;
    b.dataset.beNavBridge = '1';
    b.onerror = function () {};
    document.head.appendChild(b);
  }

  function loadWorkspaceEnhancement() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (document.querySelector('script[data-be-workspace]')) return;
    var s = document.createElement('script');
    s.src = './electric-workspace.js';
    s.defer = true;
    s.dataset.beWorkspace = '1';
    s.onload = loadNavigationBridge;
    s.onerror = function () { /* fail-open: legacy navigation remains usable */ };
    document.head.appendChild(s);
  }

  function loadAppNavigation() {
    prepareStrictMarginsRuntime();
    loadCatalogCostSemantics();
    loadPricingMarginsSemantics();
    loadJobMaterialCostSemantics();
    loadCustomMaterials();
    loadCompactHeader();
    loadDispatchJournal();
    loadResidentialWorkspaceBridge();
    if (window.BrunoElectricAppNavigation) { loadWorkspaceEnhancement(); return; }
    if (document.querySelector('script[data-be-app-nav]')) return;
    var n=document.createElement('script');
    n.src='./electric-app-navigation.js';
    n.defer=true;
    n.dataset.beAppNav='1';
    n.onload=loadWorkspaceEnhancement;
    n.onerror=loadWorkspaceEnhancement;
    document.head.appendChild(n);
  }

  /* Critical ordering: execute before the inline app's DOMContentLoaded init. */
  prepareStrictMarginsRuntime();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAppNavigation, { once: true });
  else loadAppNavigation();

  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js').catch(function () {}); });
})();

(function () {
  'use strict';

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAppNavigation, { once: true });
  } else {
    loadAppNavigation();
  }

  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  });
})();

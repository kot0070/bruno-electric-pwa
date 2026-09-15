(function () {
  'use strict';

  function loadDocumentCompliance() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoDocumentCompliance || document.querySelector('script[data-be-doc-compliance]')) return;
    var c=document.createElement('script');
    c.src='./document-compliance.js';
    c.defer=true;
    c.dataset.beDocCompliance='1';
    c.onerror=function(){};
    document.head.appendChild(c);
  }

  function loadNavigationBridge() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (document.querySelector('script[data-be-nav-bridge]')) { loadDocumentCompliance(); return; }
    var b = document.createElement('script');
    b.src = './electric-navigation-bridge.js';
    b.defer = true;
    b.dataset.beNavBridge = '1';
    b.onload = loadDocumentCompliance;
    b.onerror = loadDocumentCompliance;
    document.head.appendChild(b);
  }

  function loadWorkspaceEnhancement() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (document.querySelector('script[data-be-workspace]')) { loadNavigationBridge(); return; }
    var s = document.createElement('script');
    s.src = './electric-workspace.js';
    s.defer = true;
    s.dataset.beWorkspace = '1';
    s.onload = loadNavigationBridge;
    s.onerror = loadNavigationBridge; /* fail-open: legacy navigation remains usable */
    document.head.appendChild(s);
  }

  function loadAppNavigation() {
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
(function () {
  'use strict';

  var PRINT_SELECTOR='#btn-print-quote,#btn-print-quote-2,#btn-print-tm,#btn-print-tm-2';

  function printTarget(e) {
    return e && e.target && e.target.closest ? e.target.closest(PRINT_SELECTOR) : null;
  }

  function blockUntilComplianceReady(e) {
    if (!printTarget(e)) return;
    if (window.BrunoDocumentCompliance && typeof window.BrunoDocumentCompliance.complianceStatus === 'function') return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    var msg='Customer-document compliance guard is not ready. Printing is blocked until required Texas contractor information can be verified.';
    try { if (typeof window.toast === 'function') window.toast(msg); else window.alert(msg); } catch (_) {}
  }

  /* Fail closed immediately. This listener exists before any async enhancement chain. */
  document.addEventListener('click', blockUntilComplianceReady, true);

  function loadDocumentCompliance() {
    if (/electrical-tools\.html$/i.test(location.pathname)) return;
    if (window.BrunoDocumentCompliance || document.querySelector('script[data-be-doc-compliance]')) return;
    var c=document.createElement('script');
    c.src='./document-compliance.js';
    c.defer=true;
    c.dataset.beDocCompliance='1';
    c.onerror=function(){ document.documentElement.dataset.beDocCompliance='error'; };
    c.onload=function(){ document.documentElement.dataset.beDocCompliance='ready'; };
    document.head.appendChild(c);
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
    s.onerror = loadNavigationBridge; /* legacy navigation remains usable */
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

  /* Compliance is independent of navigation and starts first. */
  loadDocumentCompliance();

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

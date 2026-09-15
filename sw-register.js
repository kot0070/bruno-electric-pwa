(function () {
  'use strict';

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
    // Electrical Tools owns its own shell; only enhance the legacy estimating workspace.
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWorkspaceEnhancement, { once: true });
  } else {
    loadWorkspaceEnhancement();
  }

  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  });
})();
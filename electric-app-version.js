/* Bruno Electric — single runtime app version source. */
(function(){
'use strict';
var VERSION='v1.16';
window.BRUNO_APP_VERSION=VERSION;
document.documentElement.setAttribute('data-be-app-version',VERSION);
function sync(){
  var badge=document.querySelector('.ver-badge');
  if(badge)badge.textContent=VERSION;
  document.querySelectorAll('[data-be-app-version-label]').forEach(function(el){el.textContent=VERSION});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
var obs=new MutationObserver(sync);
if(document.documentElement)obs.observe(document.documentElement,{subtree:true,childList:true});
window.BrunoAppVersion={version:VERSION,sync:sync};
})();

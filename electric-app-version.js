/* Bruno Electric — single runtime app version source. */
(function(){
'use strict';
var VERSION='v1.18';
window.BRUNO_APP_VERSION=VERSION;
document.documentElement.setAttribute('data-be-app-version',VERSION);
function setTextIfNeeded(el,value){
  if(el&&el.textContent!==value)el.textContent=value;
}
function sync(){
  setTextIfNeeded(document.querySelector('.ver-badge'),VERSION);
  document.querySelectorAll('[data-be-app-version-label]').forEach(function(el){setTextIfNeeded(el,VERSION)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
var obs=new MutationObserver(function(){sync()});
if(document.documentElement)obs.observe(document.documentElement,{subtree:true,childList:true});
window.BrunoAppVersion={version:VERSION,sync:sync};
})();

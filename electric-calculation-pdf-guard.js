/* Bruno Electric — calculator report action presentation guard.
 * The customer-document layer owns preview/download behavior; this guard only
 * guarantees a readable, explicit preview-first action on every viewport.
 */
(function(){
'use strict';
function install(){
  if(!/electrical-tools\.html$/i.test(location.pathname))return true;
  var b=document.getElementById('be-download-calc');
  if(!b)return false;
  if(b.dataset.bePdfGuard==='2')return true;
  b.dataset.bePdfGuard='2';
  b.className='actions';
  b.textContent='Calculation PDF';
  b.title='Preview the current calculator report before download';
  b.setAttribute('aria-label','Calculation PDF — preview before download');
  b.style.margin='8px';
  return true;
}
function start(){if(install())return;var tries=0,t=setInterval(function(){tries++;if(install()||tries>80)clearInterval(t)},50)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('load',start);
})();

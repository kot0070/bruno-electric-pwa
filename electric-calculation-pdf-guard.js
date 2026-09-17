/* Bruno Electric — calculator PDF action guard.
 * Makes the report action explicit on every viewport and requires confirmation
 * before any file download begins.
 */
(function(){
'use strict';
function install(){
  if(!/electrical-tools\.html$/i.test(location.pathname))return true;
  var b=document.getElementById('be-download-calc');
  if(!b)return false;
  if(b.dataset.bePdfGuard==='1')return true;
  var original=b.onclick;
  b.dataset.bePdfGuard='1';
  b.className='actions';
  b.textContent='Calculation PDF';
  b.title='Create a PDF report from the current calculator inputs and visible result';
  b.setAttribute('aria-label','Calculation PDF — review before download');
  b.style.margin='8px';
  b.onclick=function(e){
    if(e){e.preventDefault();e.stopPropagation();}
    var ok=window.confirm('Calculation PDF\n\nThis creates a report from the CURRENT calculator inputs and visible result.\n\nNothing is saved or downloaded until you confirm.\n\nCreate and download the PDF now?');
    if(!ok)return false;
    if(typeof original==='function')return original.call(b,e);
    return false;
  };
  return true;
}
function start(){
  if(install())return;
  var tries=0,t=setInterval(function(){tries++;if(install()||tries>80)clearInterval(t)},50);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.addEventListener('load',start);
})();

/* Bruno Electric — navigation bridge between estimating workspace and Electrical Tools.
 * Electrical Tools are a first-class app section, not an iframe.
 */
(function(){
'use strict';
function electricalTarget(el){
  return el && (el.closest('.be-mobile-main[data-group="ELECTRICAL"]') || el.closest('.be-nav-btn[data-tab="__tools"]') || el.closest('.be-workbar [data-go="__tools"]'));
}
document.addEventListener('click',function(e){
  if(!electricalTarget(e.target))return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  location.href='./electrical-tools.html';
},true);
function restoreSection(){
  var m=String(location.hash||'').match(/^#be=(JOB|ESTIMATE|BILLING|MORE)$/i);if(!m)return;
  var key=m[1].toUpperCase();
  var tries=0,t=setInterval(function(){
    var b=document.querySelector('.be-mobile-main[data-group="'+key+'"]');
    if(b){clearInterval(t);history.replaceState(null,'',location.pathname+location.search);b.click();return}
    if(++tries>40)clearInterval(t);
  },50);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreSection,{once:true});else restoreSection();
})();